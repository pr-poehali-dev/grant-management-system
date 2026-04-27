'''
Бизнес-логика: автоматическая проверка отчёта о расходовании гранта.
Запускает все активные правила check_rules для отчёта и сохраняет результаты.
Главная функция системы — автоматизирует рутину проверки отчётности.
'''
import json
import os
from datetime import date, datetime
from typing import Any, Dict, List
import psycopg2
from psycopg2.extras import RealDictCursor


def cors_headers() -> Dict[str, str]:
    return {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token',
        'Content-Type': 'application/json'
    }


def validate_inn(inn: str) -> bool:
    '''Проверка ИНН по контрольной сумме (10 или 12 знаков).'''
    if not inn or not inn.isdigit():
        return False
    if len(inn) == 10:
        coef = [2, 4, 10, 3, 5, 9, 4, 6, 8, 0]
        s = sum(int(inn[i]) * coef[i] for i in range(10)) % 11 % 10
        return s == int(inn[9])
    if len(inn) == 12:
        c1 = [7, 2, 4, 10, 3, 5, 9, 4, 6, 8, 0]
        c2 = [3, 7, 2, 4, 10, 3, 5, 9, 4, 6, 8, 0]
        n11 = sum(int(inn[i]) * c1[i] for i in range(11)) % 11 % 10
        n12 = sum(int(inn[i]) * c2[i] for i in range(12)) % 11 % 10
        return n11 == int(inn[10]) and n12 == int(inn[11])
    return False


def run_checks(conn, report_id: int) -> List[Dict[str, Any]]:
    '''Выполнить все автопроверки и записать результаты.'''
    results: List[Dict[str, Any]] = []

    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute('''
            SELECT r.*, g.amount AS grant_amount, g.amount_used AS grant_used,
                   g.report_deadline, g.status AS grant_status,
                   gt.code AS grant_code, gt.name AS grant_name,
                   p.is_blocked, p.org_name, p.inn AS producer_inn
            FROM reports r
            JOIN grants g ON g.id = r.grant_id
            JOIN grant_types gt ON gt.id = g.grant_type_id
            JOIN producers p ON p.id = r.producer_id
            WHERE r.id = %s
        ''', (report_id,))
        report = cur.fetchone()

        if not report:
            return [{'rule_code': 'NOT_FOUND', 'status': 'error', 'message': 'Отчёт не найден'}]

        cur.execute('''
            SELECT ri.*, ec.code AS cat_code, ec.name AS cat_name
            FROM report_items ri
            LEFT JOIN equipment_categories ec ON ec.id = ri.category_id
            WHERE ri.report_id = %s
        ''', (report_id,))
        items = cur.fetchall()

        cur.execute('SELECT * FROM check_rules WHERE is_active = TRUE')
        rules = cur.fetchall()

        cur.execute('''
            SELECT report_id, file_name, doc_type, report_item_id 
            FROM documents WHERE report_id = %s
        ''', (report_id,))
        docs = cur.fetchall()

    for rule in rules:
        code = rule['code']
        name = rule['name']
        status = 'ok'
        message = ''
        details: Dict[str, Any] = {}

        if code == 'SUM_MATCH':
            total = sum(int(i['total_price']) for i in items)
            available = int(report['grant_amount']) - int(report['grant_used'] or 0)
            if total > available:
                status = 'error'
                message = f'Превышение остатка гранта: ₽{total:,} > ₽{available:,}'.replace(',', ' ')
                details = {'total': total, 'available': available, 'overrun': total - available}
            elif total == 0:
                status = 'warning'
                message = 'В отчёте нет ни одной позиции'
            else:
                message = f'Сумма ₽{total:,} в пределах остатка ₽{available:,}'.replace(',', ' ')
                details = {'total': total, 'available': available}

        elif code == 'PURPOSE_MATCH':
            grant_code = report['grant_code']
            allowed_map = {
                'AGROSTART': ['TRACTOR', 'COMBINE_GRAIN', 'PLOW', 'SEEDER', 'CULTIVATOR',
                              'SPRAYER', 'LIVESTOCK_EQUIP', 'IRRIGATION', 'OTHER'],
                'FAMILY_FARM': ['LIVESTOCK_EQUIP', 'STORAGE', 'GREENHOUSE', 'TRUCK',
                                'TRACTOR', 'PROCESSING', 'OTHER'],
                'SPSK': ['STORAGE', 'PROCESSING', 'TRUCK', 'GREENHOUSE', 'OTHER'],
            }
            allowed = allowed_map.get(grant_code, [c['code'] for c in items if c.get('cat_code')])
            wrong = [i for i in items if i.get('cat_code') and i['cat_code'] not in allowed]
            if wrong:
                status = 'error'
                names = ', '.join(f'«{w["item_name"]}»' for w in wrong[:3])
                message = f'Нецелевое использование: {names}'
                details = {'wrong_items': [{'id': w['id'], 'name': w['item_name'], 'cat': w.get('cat_name')} for w in wrong]}
            else:
                message = 'Все позиции соответствуют целям гранта'

        elif code == 'DOCS_PRESENT':
            required = {'contract', 'act', 'payment'}
            missing_items = []
            for item in items:
                item_docs = {d['doc_type'] for d in docs if d.get('report_item_id') == item['id']}
                missing = required - item_docs
                if missing:
                    missing_items.append({'id': item['id'], 'name': item['item_name'], 'missing': list(missing)})
            if missing_items:
                status = 'error'
                message = f'Не приложены документы у {len(missing_items)} позиций'
                details = {'items': missing_items}
            else:
                message = f'Все документы на месте ({len(items)} позиций)'

        elif code == 'DEADLINE':
            deadline = report['report_deadline']
            submitted = report['submitted_at']
            today = date.today()
            if deadline:
                if submitted:
                    sub_date = submitted.date() if hasattr(submitted, 'date') else submitted
                    if sub_date > deadline:
                        status = 'warning'
                        delta = (sub_date - deadline).days
                        message = f'Просрочка подачи: {delta} дн.'
                        details = {'deadline': str(deadline), 'submitted': str(sub_date), 'overdue_days': delta}
                    else:
                        message = f'Срок соблюдён (до {deadline})'
                else:
                    if today > deadline:
                        status = 'error'
                        message = f'Срок подачи истёк {deadline}, отчёт не подан'
                    else:
                        message = f'До дедлайна {(deadline - today).days} дн.'
            else:
                message = 'Срок не задан'

        elif code == 'SUPPLIER_INN':
            invalid = [i for i in items if i.get('supplier_inn') and not validate_inn(i['supplier_inn'])]
            if invalid:
                status = 'error'
                names = ', '.join(f'{i["supplier_name"]} (ИНН {i["supplier_inn"]})' for i in invalid[:2])
                message = f'Некорректный ИНН: {names}'
                details = {'invalid': [{'id': i['id'], 'inn': i['supplier_inn']} for i in invalid]}
            else:
                message = f'ИНН всех поставщиков валидны'

        elif code == 'PRICE_LIMIT':
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute('''
                    SELECT category_id, AVG(unit_price) AS avg_price, COUNT(*) AS cnt
                    FROM report_items
                    WHERE report_id != %s
                    GROUP BY category_id
                    HAVING COUNT(*) >= 3
                ''', (report_id,))
                avg_prices = {r['category_id']: float(r['avg_price']) for r in cur.fetchall()}
            overpriced = []
            for item in items:
                cat_id = item.get('category_id')
                if cat_id and cat_id in avg_prices:
                    avg = avg_prices[cat_id]
                    if avg > 0 and float(item['unit_price']) > avg * 1.2:
                        overpriced.append({
                            'name': item['item_name'],
                            'price': int(item['unit_price']),
                            'avg': int(avg),
                            'overrun_pct': round((float(item['unit_price']) / avg - 1) * 100, 1)
                        })
            if overpriced:
                status = 'warning'
                message = f'Завышенные цены у {len(overpriced)} позиций (>20% от средней)'
                details = {'items': overpriced}
            else:
                message = 'Цены в пределах среднерыночных'

        elif code == 'DUPLICATE':
            duplicates = []
            for item in items:
                sn = item.get('serial_number')
                if sn:
                    with conn.cursor(cursor_factory=RealDictCursor) as cur:
                        cur.execute('''
                            SELECT ri.id, r.number FROM report_items ri
                            JOIN reports r ON r.id = ri.report_id
                            WHERE ri.serial_number = %s AND ri.report_id != %s
                        ''', (sn, report_id))
                        dupes = cur.fetchall()
                        if dupes:
                            duplicates.append({
                                'name': item['item_name'],
                                'serial': sn,
                                'in_reports': [d['number'] for d in dupes]
                            })
            if duplicates:
                status = 'error'
                message = f'Найдены дубликаты по серийным номерам: {len(duplicates)}'
                details = {'duplicates': duplicates}
            else:
                message = 'Дубликатов по серийным номерам не найдено'

        elif code == 'PAYMENT_DATE':
            issues = []
            for item in items:
                cd, pd, dd = item.get('contract_date'), item.get('payment_date'), item.get('delivery_date')
                if cd and pd and pd < cd:
                    issues.append(f'«{item["item_name"]}»: оплата раньше договора')
                if pd and dd and dd < pd:
                    issues.append(f'«{item["item_name"]}»: поставка раньше оплаты')
            if issues:
                status = 'warning'
                message = '; '.join(issues[:3])
                details = {'all_issues': issues}
            else:
                message = 'Хронология дат корректна'

        elif code == 'PRODUCER_ACTIVE':
            if report['is_blocked']:
                status = 'error'
                message = f'Заявитель «{report["org_name"]}» заблокирован'
            else:
                message = f'Заявитель активен (ИНН {report["producer_inn"]})'

        elif code == 'AGREEMENT_VALID':
            gs = report['grant_status']
            if gs in ('terminated', 'cancelled'):
                status = 'error'
                message = f'Соглашение по гранту расторгнуто (статус «{gs}»)'
            else:
                message = 'Соглашение действует'

        results.append({
            'rule_code': code,
            'rule_name': name,
            'severity': rule['severity'],
            'status': status,
            'message': message,
            'details': details
        })

    with conn.cursor() as cur:
        cur.execute('DELETE FROM check_results WHERE report_id = %s', (report_id,))
        for r in results:
            cur.execute('''
                INSERT INTO check_results (report_id, rule_code, rule_name, status, message, details)
                VALUES (%s, %s, %s, %s, %s, %s::jsonb)
            ''', (report_id, r['rule_code'], r['rule_name'], r['status'], r['message'], json.dumps(r['details'])))

        errors = sum(1 for r in results if r['status'] == 'error')
        warnings = sum(1 for r in results if r['status'] == 'warning')
        oks = sum(1 for r in results if r['status'] == 'ok')
        total = len(results)
        score = int((oks / total) * 100) if total > 0 else 0
        overall = 'error' if errors > 0 else ('warning' if warnings > 0 else 'ok')

        cur.execute('''
            UPDATE reports SET auto_check_status = %s, auto_check_score = %s,
                   auto_check_data = %s::jsonb, updated_at = CURRENT_TIMESTAMP
            WHERE id = %s
        ''', (overall, score, json.dumps({'errors': errors, 'warnings': warnings, 'ok': oks, 'total': total}), report_id))

    conn.commit()
    return results


def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''Запуск автоматической проверки отчёта по правилам.'''
    method = event.get('httpMethod', 'GET')

    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': cors_headers(), 'body': ''}

    try:
        if method == 'POST':
            body = json.loads(event.get('body') or '{}')
            report_id = int(body.get('report_id', 0))
        else:
            params = event.get('queryStringParameters') or {}
            report_id = int(params.get('report_id', 0))

        if report_id <= 0:
            return {'statusCode': 400, 'headers': cors_headers(),
                    'body': json.dumps({'error': 'report_id обязателен'})}

        conn = psycopg2.connect(os.environ['DATABASE_URL'])
        try:
            results = run_checks(conn, report_id)
            errors = sum(1 for r in results if r['status'] == 'error')
            warnings = sum(1 for r in results if r['status'] == 'warning')
            oks = sum(1 for r in results if r['status'] == 'ok')

            return {
                'statusCode': 200,
                'headers': cors_headers(),
                'body': json.dumps({
                    'report_id': report_id,
                    'summary': {
                        'total': len(results),
                        'ok': oks,
                        'warnings': warnings,
                        'errors': errors,
                        'overall': 'error' if errors > 0 else ('warning' if warnings > 0 else 'ok')
                    },
                    'checks': results
                }, ensure_ascii=False)
            }
        finally:
            conn.close()

    except Exception as e:
        return {'statusCode': 500, 'headers': cors_headers(),
                'body': json.dumps({'error': str(e)}, ensure_ascii=False)}
