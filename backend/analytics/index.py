'''
Аналитика: реальные KPI из БД — гранты, отчёты, расходование, по районам и категориям техники.
'''
import json
import os
from typing import Any, Dict
import psycopg2
from psycopg2.extras import RealDictCursor


def cors() -> Dict[str, str]:
    return {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json'
    }


def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''KPI и аналитика расходования грантов.'''
    method = event.get('httpMethod', 'GET')
    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': cors(), 'body': ''}

    try:
        conn = psycopg2.connect(os.environ['DATABASE_URL'])
        try:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                # KPI: гранты и освоение
                cur.execute('''
                    SELECT
                        COALESCE(SUM(amount), 0)::bigint AS total_amount,
                        COALESCE(SUM(amount_used), 0)::bigint AS total_used,
                        COUNT(*) AS grants_count,
                        COUNT(DISTINCT producer_id) AS producers_count
                    FROM grants WHERE status = 'active'
                ''')
                kpi = dict(cur.fetchone())

                # Отчёты по статусам
                cur.execute('''
                    SELECT status, COUNT(*) AS cnt FROM reports GROUP BY status
                ''')
                by_status = {r['status']: r['cnt'] for r in cur.fetchall()}

                # По видам грантов
                cur.execute('''
                    SELECT gt.name, gt.code,
                           COUNT(g.id) AS grants_count,
                           COALESCE(SUM(g.amount), 0)::bigint AS total_amount,
                           COALESCE(SUM(g.amount_used), 0)::bigint AS total_used
                    FROM grant_types gt
                    LEFT JOIN grants g ON g.grant_type_id = gt.id AND g.status = 'active'
                    GROUP BY gt.id, gt.name, gt.code
                    HAVING COUNT(g.id) > 0
                    ORDER BY total_amount DESC
                ''')
                by_grant_type = [dict(r) for r in cur.fetchall()]

                # По районам
                cur.execute('''
                    SELECT d.name, d.type,
                           COUNT(DISTINCT g.id) AS grants_count,
                           COUNT(DISTINCT g.producer_id) AS producers_count,
                           COALESCE(SUM(g.amount), 0)::bigint AS total_amount
                    FROM districts d
                    JOIN producers p ON p.district_id = d.id
                    JOIN grants g ON g.producer_id = p.id
                    GROUP BY d.id, d.name, d.type
                    ORDER BY total_amount DESC
                    LIMIT 10
                ''')
                by_district = [dict(r) for r in cur.fetchall()]

                # По категориям техники (закупленной)
                cur.execute('''
                    SELECT ec.name, ec.code,
                           COUNT(ri.id) AS items_count,
                           COALESCE(SUM(ri.quantity), 0)::numeric AS quantity,
                           COALESCE(SUM(ri.total_price), 0)::bigint AS total_price,
                           COALESCE(AVG(ri.unit_price), 0)::bigint AS avg_price
                    FROM equipment_categories ec
                    LEFT JOIN report_items ri ON ri.category_id = ec.id
                    GROUP BY ec.id, ec.name, ec.code
                    HAVING COUNT(ri.id) > 0
                    ORDER BY total_price DESC
                ''')
                by_category = [dict(r) for r in cur.fetchall()]

                # Динамика по месяцам (текущий год)
                cur.execute('''
                    SELECT TO_CHAR(submitted_at, 'YYYY-MM') AS month,
                           COUNT(*) AS reports_count,
                           COALESCE(SUM(total_amount), 0)::bigint AS total_amount
                    FROM reports
                    WHERE submitted_at IS NOT NULL
                    GROUP BY TO_CHAR(submitted_at, 'YYYY-MM')
                    ORDER BY month
                ''')
                by_month = [dict(r) for r in cur.fetchall()]

                # Автопроверки сводно
                cur.execute('''
                    SELECT auto_check_status, COUNT(*) AS cnt
                    FROM reports
                    WHERE auto_check_status IS NOT NULL
                    GROUP BY auto_check_status
                ''')
                check_summary = {r['auto_check_status']: r['cnt'] for r in cur.fetchall()}

            data = {
                'kpi': {
                    'total_amount': int(kpi['total_amount'] or 0),
                    'total_used':   int(kpi['total_used']   or 0),
                    'remainder':    int((kpi['total_amount'] or 0) - (kpi['total_used'] or 0)),
                    'used_pct':     round(((kpi['total_used'] or 0) / kpi['total_amount']) * 100, 1) if kpi['total_amount'] else 0,
                    'grants_count': kpi['grants_count'],
                    'producers_count': kpi['producers_count']
                },
                'by_status': by_status,
                'by_grant_type': by_grant_type,
                'by_district': by_district,
                'by_category': by_category,
                'by_month': by_month,
                'check_summary': check_summary
            }

            return {'statusCode': 200, 'headers': cors(),
                    'body': json.dumps(data, ensure_ascii=False, default=str)}
        finally:
            conn.close()
    except Exception as e:
        return {'statusCode': 500, 'headers': cors(),
                'body': json.dumps({'error': str(e)}, ensure_ascii=False)}
