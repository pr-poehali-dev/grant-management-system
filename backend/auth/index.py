'''
Регистрация и вход пользователей АГРОГРАНТ.
Поддерживает: register, login, me, captcha, audit.
- Лимит попыток входа (брутфорс): 5 ошибок за 15 минут блокируют email/IP
- Капча проверяется по подписанному токену
- 2FA: для пользователей с ролью admin требуется 6-значный код
- Аудит: каждое событие пишется в security_audit
JWT-токен передаётся через X-Auth-Token (или Authorization: Bearer).
'''
import json
import os
import hashlib
import hmac
import base64
import time
import random
from typing import Any, Dict, Optional, Tuple
import psycopg2
from psycopg2.extras import RealDictCursor


MAX_FAILS = 5
FAIL_WINDOW_MIN = 15
TWO_FA_TTL_SEC = 300


def cors() -> Dict[str, str]:
    return {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token, X-Authorization',
        'Content-Type': 'application/json',
        'X-Content-Type-Options': 'nosniff',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
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


def get_ip(event: Dict[str, Any]) -> str:
    rc = event.get('requestContext') or {}
    ident = rc.get('identity') or {}
    return ident.get('sourceIp') or ''


def get_ua(event: Dict[str, Any]) -> str:
    headers = event.get('headers') or {}
    for k in ('User-Agent', 'user-agent'):
        v = headers.get(k)
        if v:
            return v[:500]
    return ''


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


def audit(conn, user_id: Optional[int], email: str, action: str, details: str,
          event: Dict[str, Any], severity: str = 'info') -> None:
    try:
        with conn.cursor() as cur:
            cur.execute(
                'INSERT INTO security_audit (user_id, email, action, details, ip, user_agent, severity) '
                'VALUES (%s, %s, %s, %s, %s, %s, %s)',
                (user_id, (email or '')[:150], action[:80], (details or '')[:1000],
                 get_ip(event)[:64], get_ua(event), severity[:20])
            )
        conn.commit()
    except Exception:
        try: conn.rollback()
        except Exception: pass


def count_recent_fails(conn, email: str, ip: str) -> int:
    try:
        with conn.cursor() as cur:
            cur.execute(
                "SELECT COUNT(*) FROM login_attempts "
                "WHERE success = FALSE AND attempted_at > NOW() - INTERVAL '15 minutes' "
                "AND (email = %s OR ip = %s)",
                (email, ip)
            )
            row = cur.fetchone()
            return int(row[0]) if row else 0
    except Exception:
        return 0


def record_attempt(conn, email: str, ip: str, ua: str, success: bool) -> None:
    try:
        with conn.cursor() as cur:
            cur.execute(
                'INSERT INTO login_attempts (email, ip, success, user_agent) VALUES (%s, %s, %s, %s)',
                (email[:150], ip[:64], success, ua[:500])
            )
        conn.commit()
    except Exception:
        try: conn.rollback()
        except Exception: pass


def issue_captcha(secret: str) -> Dict[str, Any]:
    a = random.randint(2, 9)
    b = random.randint(2, 9)
    payload = {'sum': a + b, 'exp': int(time.time()) + 600,
               'n': base64.urlsafe_b64encode(os.urandom(8)).decode('ascii')}
    body_b64 = b64url(json.dumps(payload, separators=(',', ':')).encode())
    sig = b64url(hmac.new(secret.encode(), body_b64.encode(), hashlib.sha256).digest())
    return {'question': f'Сколько будет {a} + {b}?', 'token': f'{body_b64}.{sig}'}


def verify_captcha_with_answer(token: str, answer: str, secret: str) -> bool:
    if not token or answer is None or answer == '':
        return False
    try:
        body_b64, sig = token.split('.', 1)
        expected = b64url(hmac.new(secret.encode(), body_b64.encode(), hashlib.sha256).digest())
        if not hmac.compare_digest(sig, expected):
            return False
        body = json.loads(b64url_decode(body_b64))
        if body.get('exp', 0) < int(time.time()):
            return False
        return str(body.get('sum')) == str(answer).strip()
    except Exception:
        return False


def gen_2fa_code() -> str:
    return ''.join(str(random.randint(0, 9)) for _ in range(6))


def issue_2fa(conn, user_id: int, ip: str) -> str:
    code = gen_2fa_code()
    code_hash = hash_password(code)
    expires = int(time.time()) + TWO_FA_TTL_SEC
    with conn.cursor() as cur:
        cur.execute('UPDATE two_fa_codes SET used = TRUE WHERE user_id = %s AND used = FALSE', (user_id,))
        cur.execute(
            "INSERT INTO two_fa_codes (user_id, code_hash, purpose, expires_at, ip) "
            "VALUES (%s, %s, 'login', to_timestamp(%s), %s)",
            (user_id, code_hash, expires, ip[:64])
        )
    conn.commit()
    return code


def verify_2fa(conn, user_id: int, code: str) -> bool:
    if not code:
        return False
    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute(
            "SELECT id, code_hash FROM two_fa_codes "
            "WHERE user_id = %s AND used = FALSE AND expires_at > NOW() "
            "ORDER BY id DESC LIMIT 1",
            (user_id,)
        )
        row = cur.fetchone()
        if not row:
            return False
        if not verify_password(code, row['code_hash']):
            return False
        cur.execute('UPDATE two_fa_codes SET used = TRUE WHERE id = %s', (row['id'],))
    conn.commit()
    return True


def password_strength_error(password: str) -> Optional[str]:
    if len(password) < 8:
        return 'Пароль должен быть от 8 символов'
    has_letter = any(c.isalpha() for c in password)
    has_digit = any(c.isdigit() for c in password)
    if not (has_letter and has_digit):
        return 'Пароль должен содержать буквы и цифры'
    return None


def register(conn, body: Dict[str, Any], event: Dict[str, Any]) -> Tuple[int, Dict[str, Any]]:
    captcha_secret = os.environ.get('CAPTCHA_SECRET', os.environ.get('JWT_SECRET', 'agrogrant-default-secret'))
    if not verify_captcha_with_answer(body.get('captchaToken') or '', body.get('captchaAnswer') or '', captcha_secret):
        audit(conn, None, body.get('email') or '', 'register_captcha_failed', '', event, 'warn')
        return 400, {'error': 'Проверка «я не робот» не пройдена', 'needCaptcha': True}

    email = (body.get('email') or '').strip().lower()
    password = body.get('password') or ''
    full_name = (body.get('full_name') or '').strip()
    phone = (body.get('phone') or '').strip() or None
    org_name = (body.get('org_name') or '').strip() or None
    inn = (body.get('inn') or '').strip() or None
    role = body.get('role') or 'producer'

    if not email or '@' not in email:
        return 400, {'error': 'Некорректный email'}
    pwd_err = password_strength_error(password)
    if pwd_err:
        return 400, {'error': pwd_err}
    if not full_name:
        return 400, {'error': 'Укажите ФИО'}
    if role not in ('producer', 'officer'):
        role = 'producer'

    # Главный администратор системы — авто-назначение роли при регистрации
    MAIN_ADMINS = {'atyurin2@yandex.ru'}
    if email in MAIN_ADMINS:
        role = 'admin'

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

    audit(conn, user['id'], email, 'register_success', f"role={role}", event)

    secret = os.environ.get('JWT_SECRET', 'agrogrant-default-secret')
    token = jwt_encode({'uid': user['id'], 'role': user['role'], 'exp': int(time.time()) + 60 * 60 * 24 * 30}, secret)
    return 200, {'token': token, 'user': serialize_user(user)}


def login(conn, body: Dict[str, Any], event: Dict[str, Any]) -> Tuple[int, Dict[str, Any]]:
    email = (body.get('email') or '').strip().lower()
    password = body.get('password') or ''
    ip = get_ip(event)
    ua = get_ua(event)

    if not email or not password:
        return 400, {'error': 'Введите email и пароль'}

    fails = count_recent_fails(conn, email, ip)
    if fails >= MAX_FAILS:
        audit(conn, None, email, 'login_blocked', f'fails={fails}', event, 'warn')
        return 429, {'error': f'Слишком много неудачных попыток. Попробуйте через {FAIL_WINDOW_MIN} минут.', 'locked': True}

    captcha_required = fails >= 2
    if captcha_required:
        captcha_secret = os.environ.get('CAPTCHA_SECRET', os.environ.get('JWT_SECRET', 'agrogrant-default-secret'))
        if not verify_captcha_with_answer(body.get('captchaToken') or '', body.get('captchaAnswer') or '', captcha_secret):
            return 400, {'error': 'Проверка «я не робот» не пройдена', 'needCaptcha': True}

    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute('SELECT * FROM app_users WHERE email = %s AND is_active = TRUE', (email,))
        user = cur.fetchone()
        if not user or not verify_password(password, user['password_hash']):
            record_attempt(conn, email, ip, ua, False)
            audit(conn, user['id'] if user else None, email, 'login_failed',
                  f'fails_now={fails+1}', event, 'warn')
            return 401, {'error': 'Неверный email или пароль', 'needCaptcha': fails + 1 >= 2}

        if user['role'] == 'admin' and not body.get('twoFactorCode'):
            code = issue_2fa(conn, user['id'], ip)
            audit(conn, user['id'], email, '2fa_issued', '', event)
            resp = {'twoFactorRequired': True, 'message': 'Введите 6-значный код подтверждения'}
            if os.environ.get('TWO_FA_DEV_RETURN') == '1':
                resp['devCode'] = code
            return 202, resp

        if user['role'] == 'admin':
            if not verify_2fa(conn, user['id'], str(body.get('twoFactorCode') or '')):
                record_attempt(conn, email, ip, ua, False)
                audit(conn, user['id'], email, '2fa_failed', '', event, 'warn')
                return 401, {'error': 'Неверный или просроченный код подтверждения', 'twoFactorRequired': True}

        cur.execute('UPDATE app_users SET last_login = CURRENT_TIMESTAMP WHERE id = %s', (user['id'],))
    conn.commit()

    record_attempt(conn, email, ip, ua, True)
    audit(conn, user['id'], email, 'login_success', f"role={user['role']}", event)

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


def get_audit(conn, event: Dict[str, Any]) -> Tuple[int, Dict[str, Any]]:
    token = get_token(event)
    if not token:
        return 401, {'error': 'Нет токена'}
    secret = os.environ.get('JWT_SECRET', 'agrogrant-default-secret')
    payload = jwt_decode(token, secret)
    if not payload:
        return 401, {'error': 'Токен недействителен'}

    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute('SELECT role FROM app_users WHERE id = %s AND is_active = TRUE', (payload['uid'],))
        u = cur.fetchone()
        if not u or u['role'] != 'admin':
            return 403, {'error': 'Только для администратора'}

        cur.execute(
            'SELECT id, email, action, details, ip, severity, created_at '
            'FROM security_audit ORDER BY id DESC LIMIT 200'
        )
        rows = [dict(r) for r in cur.fetchall()]
        for r in rows:
            r['created_at'] = r['created_at'].isoformat() if r['created_at'] else None

    return 200, {'items': rows}


def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''Регистрация, вход (с 2FA для админа), проверка токена, капча и аудит-лог.'''
    method = event.get('httpMethod', 'GET')
    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': cors(), 'body': ''}

    try:
        params = event.get('queryStringParameters') or {}
        action = params.get('action', 'me')
        captcha_secret = os.environ.get('CAPTCHA_SECRET', os.environ.get('JWT_SECRET', 'agrogrant-default-secret'))

        if action == 'captcha' and method == 'GET':
            return {'statusCode': 200, 'headers': cors(),
                    'body': json.dumps(issue_captcha(captcha_secret), ensure_ascii=False)}

        conn = psycopg2.connect(os.environ['DATABASE_URL'])
        try:
            if method == 'POST':
                body = json.loads(event.get('body') or '{}')
                if action == 'register':
                    code, data = register(conn, body, event)
                elif action == 'login':
                    code, data = login(conn, body, event)
                else:
                    code, data = 400, {'error': 'Unknown action'}
            else:
                if action == 'audit':
                    code, data = get_audit(conn, event)
                else:
                    code, data = me(conn, event)

            return {'statusCode': code, 'headers': cors(),
                    'body': json.dumps(data, ensure_ascii=False, default=str)}
        finally:
            conn.close()
    except Exception as e:
        return {'statusCode': 500, 'headers': cors(),
                'body': json.dumps({'error': str(e)}, ensure_ascii=False)}