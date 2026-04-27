'''
Регистрация и вход пользователей АГРОГРАНТ.
Поддерживает: register, login, me (проверка токена).
JWT-токен передаётся через X-Auth-Token (или Authorization: Bearer).
'''
import json
import os
import hashlib
import hmac
import base64
import time
from typing import Any, Dict, Optional, Tuple
import psycopg2
from psycopg2.extras import RealDictCursor


def cors() -> Dict[str, str]:
    return {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token, X-Authorization',
        'Content-Type': 'application/json'
    }


def hash_password(password: str, salt: Optional[str] = None) -> str:
    if salt is None:
        salt = base64.urlsafe_b64encode(os.urandom(16)).decode('ascii')
    h = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt.encode('utf-8'), 100_000)
    return f"{salt}${base64.urlsafe_b64encode(h).decode('ascii')}"


def verify_password(password: str, stored: str) -> bool:
    try:
        salt, _ = stored.split('$', 1)
        return hmac.compare_digest(stored, hash_password(password, salt))
    except Exception:
        return False


def b64url(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b'=').decode('ascii')


def b64url_decode(s: str) -> bytes:
    pad = 4 - (len(s) % 4)
    return base64.urlsafe_b64decode(s + ('=' * pad))


def jwt_encode(payload: Dict[str, Any], secret: str) -> str:
    header = b64url(json.dumps({'alg': 'HS256', 'typ': 'JWT'}, separators=(',', ':')).encode())
    body = b64url(json.dumps(payload, separators=(',', ':')).encode())
    sig_input = f"{header}.{body}".encode()
    sig = hmac.new(secret.encode(), sig_input, hashlib.sha256).digest()
    return f"{header}.{body}.{b64url(sig)}"


def jwt_decode(token: str, secret: str) -> Optional[Dict[str, Any]]:
    try:
        h, b, s = token.split('.')
        sig_input = f"{h}.{b}".encode()
        expected = b64url(hmac.new(secret.encode(), sig_input, hashlib.sha256).digest())
        if not hmac.compare_digest(s, expected):
            return None
        payload = json.loads(b64url_decode(b))
        if payload.get('exp', 0) < int(time.time()):
            return None
        return payload
    except Exception:
        return None


def get_token(event: Dict[str, Any]) -> Optional[str]:
    headers = event.get('headers') or {}
    for key in ('X-Auth-Token', 'x-auth-token', 'X-Authorization', 'x-authorization', 'Authorization', 'authorization'):
        v = headers.get(key)
        if v:
            return v.replace('Bearer ', '').strip()
    return None


def serialize_user(u: Dict[str, Any]) -> Dict[str, Any]:
    return {
        'id': u['id'],
        'email': u['email'],
        'full_name': u['full_name'],
        'phone': u.get('phone'),
        'org_name': u.get('org_name'),
        'inn': u.get('inn'),
        'role': u['role'],
        'producer_id': u.get('producer_id'),
    }


def register(conn, body: Dict[str, Any]) -> Tuple[int, Dict[str, Any]]:
    email = (body.get('email') or '').strip().lower()
    password = body.get('password') or ''
    full_name = (body.get('full_name') or '').strip()
    phone = (body.get('phone') or '').strip() or None
    org_name = (body.get('org_name') or '').strip() or None
    inn = (body.get('inn') or '').strip() or None
    role = body.get('role') or 'producer'

    if not email or '@' not in email:
        return 400, {'error': 'Некорректный email'}
    if len(password) < 6:
        return 400, {'error': 'Пароль должен быть от 6 символов'}
    if not full_name:
        return 400, {'error': 'Укажите ФИО'}
    if role not in ('producer', 'officer', 'admin'):
        role = 'producer'

    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute('SELECT id FROM app_users WHERE email = %s', (email,))
        if cur.fetchone():
            return 409, {'error': 'Пользователь с таким email уже зарегистрирован'}

        ph = hash_password(password)
        cur.execute('''
            INSERT INTO app_users (email, password_hash, full_name, phone, org_name, inn, role)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            RETURNING id, email, full_name, phone, org_name, inn, role, producer_id
        ''', (email, ph, full_name, phone, org_name, inn, role))
        user = dict(cur.fetchone())
    conn.commit()

    secret = os.environ.get('JWT_SECRET', 'agrogrant-default-secret')
    token = jwt_encode({'uid': user['id'], 'role': user['role'], 'exp': int(time.time()) + 60 * 60 * 24 * 30}, secret)
    return 200, {'token': token, 'user': serialize_user(user)}


def login(conn, body: Dict[str, Any]) -> Tuple[int, Dict[str, Any]]:
    email = (body.get('email') or '').strip().lower()
    password = body.get('password') or ''

    if not email or not password:
        return 400, {'error': 'Введите email и пароль'}

    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute('SELECT * FROM app_users WHERE email = %s AND is_active = TRUE', (email,))
        user = cur.fetchone()
        if not user or not verify_password(password, user['password_hash']):
            return 401, {'error': 'Неверный email или пароль'}

        cur.execute('UPDATE app_users SET last_login = CURRENT_TIMESTAMP WHERE id = %s', (user['id'],))
    conn.commit()

    secret = os.environ.get('JWT_SECRET', 'agrogrant-default-secret')
    token = jwt_encode({'uid': user['id'], 'role': user['role'], 'exp': int(time.time()) + 60 * 60 * 24 * 30}, secret)
    return 200, {'token': token, 'user': serialize_user(dict(user))}


def me(conn, event: Dict[str, Any]) -> Tuple[int, Dict[str, Any]]:
    token = get_token(event)
    if not token:
        return 401, {'error': 'Нет токена'}
    secret = os.environ.get('JWT_SECRET', 'agrogrant-default-secret')
    payload = jwt_decode(token, secret)
    if not payload:
        return 401, {'error': 'Токен недействителен'}

    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute('SELECT * FROM app_users WHERE id = %s AND is_active = TRUE', (payload['uid'],))
        user = cur.fetchone()
        if not user:
            return 401, {'error': 'Пользователь не найден'}

    return 200, {'user': serialize_user(dict(user))}


def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''Регистрация, вход и проверка токена пользователя.'''
    method = event.get('httpMethod', 'GET')
    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': cors(), 'body': ''}

    try:
        params = event.get('queryStringParameters') or {}
        action = params.get('action', 'me')
        conn = psycopg2.connect(os.environ['DATABASE_URL'])
        try:
            if method == 'POST':
                body = json.loads(event.get('body') or '{}')
                if action == 'register':
                    code, data = register(conn, body)
                elif action == 'login':
                    code, data = login(conn, body)
                else:
                    code, data = 400, {'error': 'Unknown action'}
            else:
                code, data = me(conn, event)

            return {'statusCode': code, 'headers': cors(),
                    'body': json.dumps(data, ensure_ascii=False)}
        finally:
            conn.close()
    except Exception as e:
        return {'statusCode': 500, 'headers': cors(),
                'body': json.dumps({'error': str(e)}, ensure_ascii=False)}
