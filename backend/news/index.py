'''
Управление новостями сайта АГРОГРАНТ.
GET без токена — публичный список (только опубликованные).
POST/PUT/DELETE — только для администратора (X-Auth-Token).
При создании/обновлении публикуемой новости — пинг Яндекса с sitemap.
'''
import json
import os
import time
import hmac
import hashlib
import base64
import urllib.request
import urllib.parse
from typing import Any, Dict, Optional, Tuple
import psycopg2
from psycopg2.extras import RealDictCursor


SITE_URL = 'https://xn--80aaagjbcbfcdgu0ay9c.xn--p1ai'  # агрогрант.рф в punycode


def cors() -> Dict[str, str]:
    return {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token, X-Authorization',
        'Content-Type': 'application/json',
    }


def b64url_decode(s: str) -> bytes:
    pad = 4 - (len(s) % 4)
    return base64.urlsafe_b64decode(s + ('=' * pad))


def b64url(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b'=').decode('ascii')


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


def require_admin(conn, event: Dict[str, Any]) -> Tuple[bool, Optional[Dict[str, Any]]]:
    token = get_token(event)
    if not token:
        return False, {'error': 'Требуется авторизация'}
    secret = os.environ.get('JWT_SECRET', 'agrogrant-default-secret')
    payload = jwt_decode(token, secret)
    if not payload:
        return False, {'error': 'Токен недействителен'}
    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute('SELECT role FROM app_users WHERE id = %s AND is_active = TRUE', (payload['uid'],))
        row = cur.fetchone()
        if not row or row['role'] != 'admin':
            return False, {'error': 'Доступ только для администратора'}
    return True, None


def ping_yandex() -> None:
    try:
        sitemap = f'{SITE_URL}/sitemap.xml'
        url = 'https://webmaster.yandex.ru/ping?' + urllib.parse.urlencode({'sitemap': sitemap})
        req = urllib.request.Request(url, headers={'User-Agent': 'AGROGRANT/1.0'})
        urllib.request.urlopen(req, timeout=5).read()
    except Exception:
        pass


def serialize(row: Dict[str, Any]) -> Dict[str, Any]:
    tags_str = row.get('tags') or ''
    return {
        'id': row['id'],
        'title': row['title'],
        'text': row['text'],
        'category': row['category'],
        'catCls': row['cat_cls'],
        'tags': [t.strip() for t in tags_str.split(',') if t.strip()],
        'url': row['url'],
        'important': row['important'],
        'isPublished': row['is_published'],
        'publishedAt': row['published_at'].isoformat() if row.get('published_at') else None,
        'date': row['published_at'].strftime('%d.%m.%Y') if row.get('published_at') else '',
    }


def list_news(conn, only_published: bool) -> Tuple[int, Dict[str, Any]]:
    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        if only_published:
            cur.execute('SELECT * FROM news WHERE is_published = TRUE ORDER BY published_at DESC, id DESC')
        else:
            cur.execute('SELECT * FROM news ORDER BY published_at DESC, id DESC')
        rows = cur.fetchall()
    return 200, {'items': [serialize(dict(r)) for r in rows]}


def create_news(conn, body: Dict[str, Any]) -> Tuple[int, Dict[str, Any]]:
    title = (body.get('title') or '').strip()
    text = (body.get('text') or '').strip()
    category = (body.get('category') or 'Новости').strip()
    cat_cls = (body.get('catCls') or 'badge-status-new').strip()
    tags_in = body.get('tags') or []
    tags = ','.join([str(t).strip() for t in tags_in if str(t).strip()]) if isinstance(tags_in, list) else str(tags_in)
    url = (body.get('url') or '#').strip() or '#'
    important = bool(body.get('important'))
    is_published = body.get('isPublished')
    is_published = True if is_published is None else bool(is_published)

    if not title or not text:
        return 400, {'error': 'Укажите заголовок и текст новости'}

    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute('''
            INSERT INTO news (title, text, category, cat_cls, tags, url, important, is_published)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING *
        ''', (title, text, category, cat_cls, tags, url, important, is_published))
        row = dict(cur.fetchone())
    conn.commit()

    if is_published:
        ping_yandex()

    return 200, {'item': serialize(row)}


def update_news(conn, item_id: int, body: Dict[str, Any]) -> Tuple[int, Dict[str, Any]]:
    fields = []
    values = []

    mapping = {
        'title': 'title', 'text': 'text', 'category': 'category',
        'catCls': 'cat_cls', 'url': 'url', 'important': 'important',
        'isPublished': 'is_published',
    }
    for k_in, k_db in mapping.items():
        if k_in in body:
            fields.append(f'{k_db} = %s')
            values.append(body[k_in])

    if 'tags' in body:
        tags_in = body['tags']
        tags = ','.join([str(t).strip() for t in tags_in if str(t).strip()]) if isinstance(tags_in, list) else str(tags_in)
        fields.append('tags = %s')
        values.append(tags)

    if not fields:
        return 400, {'error': 'Нет данных для обновления'}

    fields.append('updated_at = CURRENT_TIMESTAMP')
    values.append(item_id)

    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute(f'UPDATE news SET {", ".join(fields)} WHERE id = %s RETURNING *', tuple(values))
        row = cur.fetchone()
        if not row:
            return 404, {'error': 'Новость не найдена'}
    conn.commit()

    row_d = dict(row)
    if row_d['is_published']:
        ping_yandex()

    return 200, {'item': serialize(row_d)}


def delete_news(conn, item_id: int) -> Tuple[int, Dict[str, Any]]:
    with conn.cursor() as cur:
        cur.execute('DELETE FROM news WHERE id = %s', (item_id,))
        if cur.rowcount == 0:
            return 404, {'error': 'Новость не найдена'}
    conn.commit()
    return 200, {'ok': True}


def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''CRUD для новостей. GET — публично, POST/PUT/DELETE — только админ.'''
    method = event.get('httpMethod', 'GET')
    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': cors(), 'body': ''}

    try:
        conn = psycopg2.connect(os.environ['DATABASE_URL'])
        try:
            params = event.get('queryStringParameters') or {}

            if method == 'GET':
                only_published = params.get('all') != '1'
                if not only_published:
                    ok, err = require_admin(conn, event)
                    if not ok:
                        return {'statusCode': 401, 'headers': cors(),
                                'body': json.dumps(err, ensure_ascii=False)}
                code, data = list_news(conn, only_published)
                return {'statusCode': code, 'headers': cors(),
                        'body': json.dumps(data, ensure_ascii=False)}

            ok, err = require_admin(conn, event)
            if not ok:
                return {'statusCode': 403, 'headers': cors(),
                        'body': json.dumps(err, ensure_ascii=False)}

            body = json.loads(event.get('body') or '{}')

            if method == 'POST':
                code, data = create_news(conn, body)
            elif method == 'PUT':
                item_id = int(params.get('id') or body.get('id') or 0)
                if not item_id:
                    code, data = 400, {'error': 'Укажите id'}
                else:
                    code, data = update_news(conn, item_id, body)
            elif method == 'DELETE':
                item_id = int(params.get('id') or body.get('id') or 0)
                if not item_id:
                    code, data = 400, {'error': 'Укажите id'}
                else:
                    code, data = delete_news(conn, item_id)
            else:
                code, data = 405, {'error': 'Method not allowed'}

            return {'statusCode': code, 'headers': cors(),
                    'body': json.dumps(data, ensure_ascii=False)}
        finally:
            conn.close()
    except Exception as e:
        return {'statusCode': 500, 'headers': cors(),
                'body': json.dumps({'error': str(e)}, ensure_ascii=False)}
