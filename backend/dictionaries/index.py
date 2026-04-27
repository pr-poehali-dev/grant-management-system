'''
Справочники: районы, категории техники, виды грантов, правила автопроверки.
Используются формами отчётов, фильтрами и админкой.
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
    '''Получить справочники одним запросом или по отдельности (?type=districts).'''
    method = event.get('httpMethod', 'GET')
    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': cors(), 'body': ''}

    params = event.get('queryStringParameters') or {}
    requested = params.get('type', 'all')

    try:
        conn = psycopg2.connect(os.environ['DATABASE_URL'])
        try:
            data: Dict[str, Any] = {}
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                if requested in ('all', 'districts'):
                    cur.execute('SELECT id, name, type FROM districts ORDER BY type DESC, name')
                    data['districts'] = [dict(r) for r in cur.fetchall()]

                if requested in ('all', 'equipment'):
                    cur.execute('''
                        SELECT id, code, name, okof_code, description
                        FROM equipment_categories WHERE is_active = TRUE ORDER BY name
                    ''')
                    data['equipment_categories'] = [dict(r) for r in cur.fetchall()]

                if requested in ('all', 'grant_types'):
                    cur.execute('''
                        SELECT id, code, name, max_amount, description
                        FROM grant_types WHERE is_active = TRUE ORDER BY name
                    ''')
                    data['grant_types'] = [dict(r) for r in cur.fetchall()]

                if requested in ('all', 'check_rules'):
                    cur.execute('''
                        SELECT id, code, name, description, severity, is_active
                        FROM check_rules ORDER BY severity DESC, name
                    ''')
                    data['check_rules'] = [dict(r) for r in cur.fetchall()]

            return {'statusCode': 200, 'headers': cors(),
                    'body': json.dumps(data, ensure_ascii=False, default=str)}
        finally:
            conn.close()
    except Exception as e:
        return {'statusCode': 500, 'headers': cors(),
                'body': json.dumps({'error': str(e)}, ensure_ascii=False)}
