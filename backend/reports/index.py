'''
CRUD по отчётам: список с фильтрами, детали отчёта, создание, обновление статуса.
Используется и личным кабинетом, и сотрудниками министерства.
'''
import json
import os
from datetime import datetime
from typing import Any, Dict
import psycopg2
from psycopg2.extras import RealDictCursor


def cors() -> Dict[str, str]:
    return {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token, X-User-Id',
        'Content-Type': 'application/json'
    }


def serialize(row: Dict[str, Any]) -> Dict[str, Any]:
    out = {}
    for k, v in row.items():
        if isinstance(v, (datetime,)):
            out[k] = v.isoformat()
        elif hasattr(v, 'isoformat'):
            out[k] = v.isoformat()
        else:
            out[k] = v
    return out


def list_reports(conn, params: Dict[str, Any]) -> Dict[str, Any]:
    '''Список отчётов с фильтрами: status, district_id, date_from, date_to, q (поиск).'''
    where = []
    args = []

    status = params.get('status')
    if status and status != 'all':
        where.append('r.status = %s')
        args.append(status)

    district_id = params.get('district_id')
    if district_id:
        where.append('p.district_id = %s')
        args.append(int(district_id))

    grant_type = params.get('grant_type_id')
    if grant_type:
        where.append('g.grant_type_id = %s')
        args.append(int(grant_type))

    date_from = params.get('date_from')
    if date_from:
        where.append('r.created_at >= %s')
        args.append(date_from)

    date_to = params.get('date_to')
    if date_to:
        where.append('r.created_at <= %s')
        args.append(date_to)

    sum_min = params.get('sum_min')
    if sum_min:
        where.append('r.total_amount >= %s')
        args.append(int(sum_min))

    sum_max = params.get('sum_max')
    if sum_max:
        where.append('r.total_amount <= %s')
        args.append(int(sum_max))

    q = params.get('q')
    if q:
        where.append('(p.org_name ILIKE %s OR r.number ILIKE %s OR p.inn ILIKE %s)')
        like = f'%{q}%'
        args.extend([like, like, like])

    auto_check = params.get('auto_check')
    if auto_check:
        where.append('r.auto_check_status = %s')
        args.append(auto_check)

    where_sql = ('WHERE ' + ' AND '.join(where)) if where else ''
    sql = f'''
        SELECT r.id, r.number, r.report_type, r.period_start, r.period_end,
               r.total_amount, r.status, r.auto_check_status, r.auto_check_score,
               r.submitted_at, r.created_at, r.reviewed_at,
               g.number AS grant_number, gt.name AS grant_type_name, gt.code AS grant_type_code,
               p.org_name, p.inn AS producer_inn, p.id AS producer_id,
               d.name AS district_name
        FROM reports r
        JOIN grants g ON g.id = r.grant_id
        JOIN grant_types gt ON gt.id = g.grant_type_id
        JOIN producers p ON p.id = r.producer_id
        LEFT JOIN districts d ON d.id = p.district_id
        {where_sql}
        ORDER BY r.created_at DESC
        LIMIT 200
    '''
    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute(sql, args)
        rows = [serialize(dict(r)) for r in cur.fetchall()]

        cur.execute(f'''
            SELECT
              COUNT(*) FILTER (WHERE r.status = 'submitted') AS new,
              COUNT(*) FILTER (WHERE r.status = 'review')    AS in_review,
              COUNT(*) FILTER (WHERE r.status = 'approved')  AS approved,
              COUNT(*) FILTER (WHERE r.status = 'rejected')  AS rejected,
              COUNT(*) FILTER (WHERE r.status = 'returned')  AS returned,
              COUNT(*) AS total
            FROM reports r
            JOIN grants g ON g.id = r.grant_id
            JOIN producers p ON p.id = r.producer_id
            {where_sql}
        ''', args)
        stats = dict(cur.fetchone())

    return {'items': rows, 'stats': stats}


def get_report(conn, report_id: int) -> Dict[str, Any]:
    '''Детали отчёта: позиции, документы, результаты автопроверок.'''
    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute('''
            SELECT r.*, g.number AS grant_number, g.amount AS grant_amount,
                   g.amount_used AS grant_used, g.report_deadline,
                   gt.name AS grant_type_name, gt.code AS grant_type_code,
                   p.org_name, p.inn AS producer_inn, p.address, p.email, p.phone,
                   p.contact_person, d.name AS district_name
            FROM reports r
            JOIN grants g ON g.id = r.grant_id
            JOIN grant_types gt ON gt.id = g.grant_type_id
            JOIN producers p ON p.id = r.producer_id
            LEFT JOIN districts d ON d.id = p.district_id
            WHERE r.id = %s
        ''', (report_id,))
        report = cur.fetchone()
        if not report:
            return None

        cur.execute('''
            SELECT ri.*, ec.name AS category_name, ec.code AS category_code
            FROM report_items ri
            LEFT JOIN equipment_categories ec ON ec.id = ri.category_id
            WHERE ri.report_id = %s
            ORDER BY ri.id
        ''', (report_id,))
        items = [serialize(dict(r)) for r in cur.fetchall()]

        cur.execute('''
            SELECT * FROM documents WHERE report_id = %s ORDER BY uploaded_at DESC
        ''', (report_id,))
        docs = [serialize(dict(r)) for r in cur.fetchall()]

        cur.execute('''
            SELECT * FROM check_results WHERE report_id = %s ORDER BY checked_at DESC
        ''', (report_id,))
        checks = [serialize(dict(r)) for r in cur.fetchall()]

    return {
        'report': serialize(dict(report)),
        'items': items,
        'documents': docs,
        'checks': checks
    }


def update_status(conn, report_id: int, body: Dict[str, Any]) -> Dict[str, Any]:
    '''Изменить статус отчёта (одобрить/отклонить/вернуть).'''
    new_status = body.get('status')
    comment = body.get('comment', '')
    reviewer_name = body.get('reviewer_name', 'Сотрудник МСХ')

    if new_status not in ('approved', 'rejected', 'returned', 'review'):
        raise ValueError('Недопустимый статус')

    with conn.cursor() as cur:
        cur.execute('''
            UPDATE reports
            SET status = %s, reviewer_comment = %s,
                reviewed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
            WHERE id = %s
        ''', (new_status, comment, report_id))

        cur.execute('''
            INSERT INTO audit_log (user_role, user_name, action, entity_type, entity_id, details)
            VALUES (%s, %s, %s, %s, %s, %s::jsonb)
        ''', ('officer', reviewer_name, f'report_{new_status}', 'report', report_id,
              json.dumps({'comment': comment, 'status': new_status})))

        if new_status == 'approved':
            cur.execute('''
                UPDATE grants SET amount_used = amount_used +
                  (SELECT COALESCE(total_amount, 0) FROM reports WHERE id = %s),
                  updated_at = CURRENT_TIMESTAMP
                WHERE id = (SELECT grant_id FROM reports WHERE id = %s)
            ''', (report_id, report_id))

        cur.execute('''
            INSERT INTO notifications (producer_id, type, title, message, link)
            SELECT producer_id, 'report_status',
                   CASE %s
                     WHEN 'approved' THEN 'Отчёт одобрен'
                     WHEN 'rejected' THEN 'Отчёт отклонён'
                     WHEN 'returned' THEN 'Отчёт возвращён на доработку'
                     ELSE 'Изменён статус отчёта'
                   END,
                   %s, %s
            FROM reports WHERE id = %s
        ''', (new_status, comment, f'/reports/{report_id}', report_id))

    conn.commit()
    return {'success': True, 'status': new_status}


def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''Управление отчётами: список, детали, изменение статуса.'''
    method = event.get('httpMethod', 'GET')
    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': cors(), 'body': ''}

    try:
        conn = psycopg2.connect(os.environ['DATABASE_URL'])
        try:
            params = event.get('queryStringParameters') or {}
            action = params.get('action', 'list')
            report_id = int(params.get('id', 0)) if params.get('id') else 0

            if method == 'GET':
                if action == 'detail' and report_id > 0:
                    data = get_report(conn, report_id)
                    if not data:
                        return {'statusCode': 404, 'headers': cors(),
                                'body': json.dumps({'error': 'not found'})}
                    return {'statusCode': 200, 'headers': cors(),
                            'body': json.dumps(data, ensure_ascii=False, default=str)}

                data = list_reports(conn, params)
                return {'statusCode': 200, 'headers': cors(),
                        'body': json.dumps(data, ensure_ascii=False, default=str)}

            if method in ('POST', 'PUT'):
                body = json.loads(event.get('body') or '{}')
                if action == 'status' and report_id > 0:
                    res = update_status(conn, report_id, body)
                    return {'statusCode': 200, 'headers': cors(),
                            'body': json.dumps(res, ensure_ascii=False)}

            return {'statusCode': 400, 'headers': cors(),
                    'body': json.dumps({'error': 'Unknown action'})}
        finally:
            conn.close()
    except Exception as e:
        return {'statusCode': 500, 'headers': cors(),
                'body': json.dumps({'error': str(e)}, ensure_ascii=False)}
