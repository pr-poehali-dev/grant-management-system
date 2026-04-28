'''
Управление публичными документами сайта АГРОГРАНТ.
GET без токена — публичный список (только опубликованные).
POST/PUT/DELETE — только для администратора.
POST с base64-файлом загружает файл в S3 и сохраняет CDN-ссылку.
'''
import json
import os
import time
import hmac
import hashlib
import base64
import urllib.request
import urllib.parse
import uuid
from typing import Any, Dict, Optional, Tuple
import psycopg2
from psycopg2.extras import RealDictCursor
import boto3


SITE_URL = 'https://xn--80aaagjbcbfcdgu0ay9c.xn--p1ai'

EXT_MIME = {
    'pdf': 'application/pdf',
    'doc': 'application/msword',
    'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'xls': 'application/vnd.ms-excel',
    'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'zip': 'application/zip',
    'png': 'image/png',
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
}


def cors() -> Dict[str, str]:
    return {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token, X-Authorization',
        'Content-Type': 'application/json',
        'X-Content-Type-Options': 'nosniff',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
    }


def get_ip(event: Dict[str, Any]) -> str:
    rc = event.get('requestContext') or {}
    ident = rc.get('identity') or {}
    return ident.get('sourceIp') or ''


def rate_limit_check(conn, ip: str, endpoint: str, limit: int = 60, window_sec: int = 60) -> bool:
    if not ip:
        return True
    try:
        with conn.cursor() as cur:
            cur.execute(
                "INSERT INTO api_rate_limits (ip, endpoint, hits, window_start) "
                "VALUES (%s, %s, 1, CURRENT_TIMESTAMP) "
                "ON CONFLICT (ip, endpoint) DO UPDATE SET "
                "hits = CASE WHEN api_rate_limits.window_start < NOW() - (INTERVAL '1 second' * %s) THEN 1 "
                "ELSE api_rate_limits.hits + 1 END, "
                "window_start = CASE WHEN api_rate_limits.window_start < NOW() - (INTERVAL '1 second' * %s) THEN CURRENT_TIMESTAMP "
                "ELSE api_rate_limits.window_start END "
                "RETURNING hits",
                (ip[:64], endpoint[:80], window_sec, window_sec)
            )
            row = cur.fetchone()
        conn.commit()
        return row[0] <= limit if row else True
    except Exception:
        try: conn.rollback()
        except Exception: pass
        return True


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


def upload_to_s3(file_b64: str, file_name: str) -> Tuple[str, int, str]:
    raw = base64.b64decode(file_b64)
    safe_name = ''.join(c for c in file_name if c.isalnum() or c in '._-') or 'file'
    ext = safe_name.rsplit('.', 1)[-1].lower() if '.' in safe_name else 'bin'
    mime = EXT_MIME.get(ext, 'application/octet-stream')
    key = f'public-docs/{uuid.uuid4().hex}_{safe_name}'

    s3 = boto3.client(
        's3',
        endpoint_url='https://bucket.poehali.dev',
        aws_access_key_id=os.environ['AWS_ACCESS_KEY_ID'],
        aws_secret_access_key=os.environ['AWS_SECRET_ACCESS_KEY'],
    )
    s3.put_object(Bucket='files', Key=key, Body=raw, ContentType=mime)
    cdn = f"https://cdn.poehali.dev/projects/{os.environ['AWS_ACCESS_KEY_ID']}/bucket/{key}"
    return cdn, len(raw), ext.upper()


def human_size(num_bytes: int) -> str:
    if num_bytes < 1024:
        return f'{num_bytes} Б'
    if num_bytes < 1024 * 1024:
        return f'{num_bytes / 1024:.0f} КБ'
    return f'{num_bytes / 1024 / 1024:.1f} МБ'


def serialize(row: Dict[str, Any]) -> Dict[str, Any]:
    return {
        'id': row['id'],
        'title': row['title'],
        'description': row['description'],
        'section': row['doc_section'],
        'type': row['doc_type'],
        'format': row['doc_format'],
        'size': row['doc_size'],
        'date': row['doc_date'],
        'icon': row['icon'],
        'fileUrl': row['file_url'],
        'isPublished': row['is_published'],
        'sortOrder': row['sort_order'],
    }


def list_docs(conn, only_published: bool, section: Optional[str]) -> Tuple[int, Dict[str, Any]]:
    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        where = []
        params = []
        if only_published:
            where.append('is_published = TRUE')
        if section:
            where.append('doc_section = %s')
            params.append(section)
        where_sql = ('WHERE ' + ' AND '.join(where)) if where else ''
        cur.execute(f'SELECT * FROM public_documents {where_sql} ORDER BY doc_section, sort_order, id', tuple(params))
        rows = cur.fetchall()
    return 200, {'items': [serialize(dict(r)) for r in rows]}


def create_doc(conn, body: Dict[str, Any]) -> Tuple[int, Dict[str, Any]]:
    title = (body.get('title') or '').strip()
    if not title:
        return 400, {'error': 'Укажите название документа'}

    description = (body.get('description') or '').strip()
    section = (body.get('section') or 'normative').strip()
    if section not in ('normative', 'template', 'statistics'):
        section = 'normative'
    doc_type = (body.get('type') or '').strip()
    doc_format = (body.get('format') or 'PDF').strip().upper()
    doc_size = (body.get('size') or '').strip()
    doc_date = (body.get('date') or '').strip()
    icon = (body.get('icon') or 'FileText').strip()
    file_url = (body.get('fileUrl') or '').strip()
    sort_order = int(body.get('sortOrder') or 0)
    is_published = body.get('isPublished')
    is_published = True if is_published is None else bool(is_published)

    file_b64 = body.get('fileBase64')
    file_name = body.get('fileName')
    if file_b64 and file_name:
        try:
            cdn, size_bytes, ext = upload_to_s3(file_b64, file_name)
            file_url = cdn
            if not doc_size:
                doc_size = human_size(size_bytes)
            if not doc_format or doc_format == 'PDF':
                doc_format = ext
        except Exception as e:
            return 500, {'error': f'Ошибка загрузки файла: {e}'}

    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute('''
            INSERT INTO public_documents
              (title, description, doc_section, doc_type, doc_format, doc_size, doc_date, icon, file_url, sort_order, is_published)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING *
        ''', (title, description, section, doc_type, doc_format, doc_size, doc_date, icon, file_url, sort_order, is_published))
        row = dict(cur.fetchone())
    conn.commit()

    if is_published:
        ping_yandex()

    return 200, {'item': serialize(row)}


def update_doc(conn, item_id: int, body: Dict[str, Any]) -> Tuple[int, Dict[str, Any]]:
    fields = []
    values = []

    mapping = {
        'title': 'title', 'description': 'description',
        'section': 'doc_section', 'type': 'doc_type',
        'format': 'doc_format', 'size': 'doc_size',
        'date': 'doc_date', 'icon': 'icon',
        'fileUrl': 'file_url', 'sortOrder': 'sort_order',
        'isPublished': 'is_published',
    }

    file_b64 = body.get('fileBase64')
    file_name = body.get('fileName')
    if file_b64 and file_name:
        try:
            cdn, size_bytes, ext = upload_to_s3(file_b64, file_name)
            body['fileUrl'] = cdn
            if not body.get('size'):
                body['size'] = human_size(size_bytes)
            if not body.get('format'):
                body['format'] = ext
        except Exception as e:
            return 500, {'error': f'Ошибка загрузки файла: {e}'}

    for k_in, k_db in mapping.items():
        if k_in in body:
            fields.append(f'{k_db} = %s')
            values.append(body[k_in])

    if not fields:
        return 400, {'error': 'Нет данных для обновления'}

    fields.append('updated_at = CURRENT_TIMESTAMP')
    values.append(item_id)

    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute(f'UPDATE public_documents SET {", ".join(fields)} WHERE id = %s RETURNING *', tuple(values))
        row = cur.fetchone()
        if not row:
            return 404, {'error': 'Документ не найден'}
    conn.commit()

    row_d = dict(row)
    if row_d['is_published']:
        ping_yandex()

    return 200, {'item': serialize(row_d)}


def delete_doc(conn, item_id: int) -> Tuple[int, Dict[str, Any]]:
    with conn.cursor() as cur:
        cur.execute('DELETE FROM public_documents WHERE id = %s', (item_id,))
        if cur.rowcount == 0:
            return 404, {'error': 'Документ не найден'}
    conn.commit()
    return 200, {'ok': True}


def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''CRUD для публичных документов. GET — публично, остальное — только админ.'''
    method = event.get('httpMethod', 'GET')
    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': cors(), 'body': ''}

    try:
        conn = psycopg2.connect(os.environ['DATABASE_URL'])
        try:
            params = event.get('queryStringParameters') or {}
            ip = get_ip(event)

            limit = 30 if method != 'GET' else 120
            if not rate_limit_check(conn, ip, 'public-documents', limit=limit, window_sec=60):
                return {'statusCode': 429, 'headers': cors(),
                        'body': json.dumps({'error': 'Слишком много запросов, подождите минуту'}, ensure_ascii=False)}

            if method == 'GET':
                only_published = params.get('all') != '1'
                section = params.get('section')
                if not only_published:
                    ok, err = require_admin(conn, event)
                    if not ok:
                        return {'statusCode': 401, 'headers': cors(),
                                'body': json.dumps(err, ensure_ascii=False)}
                code, data = list_docs(conn, only_published, section)
                return {'statusCode': code, 'headers': cors(),
                        'body': json.dumps(data, ensure_ascii=False)}

            ok, err = require_admin(conn, event)
            if not ok:
                return {'statusCode': 403, 'headers': cors(),
                        'body': json.dumps(err, ensure_ascii=False)}

            body = json.loads(event.get('body') or '{}')

            if method == 'POST':
                code, data = create_doc(conn, body)
            elif method == 'PUT':
                item_id = int(params.get('id') or body.get('id') or 0)
                if not item_id:
                    code, data = 400, {'error': 'Укажите id'}
                else:
                    code, data = update_doc(conn, item_id, body)
            elif method == 'DELETE':
                item_id = int(params.get('id') or body.get('id') or 0)
                if not item_id:
                    code, data = 400, {'error': 'Укажите id'}
                else:
                    code, data = delete_doc(conn, item_id)
            else:
                code, data = 405, {'error': 'Method not allowed'}

            return {'statusCode': code, 'headers': cors(),
                    'body': json.dumps(data, ensure_ascii=False)}
        finally:
            conn.close()
    except Exception as e:
        return {'statusCode': 500, 'headers': cors(),
                'body': json.dumps({'error': str(e)}, ensure_ascii=False)}