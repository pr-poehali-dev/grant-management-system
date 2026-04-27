'''
ИИ-агент-менеджер проекта АГРОГРАНТ.
Отвечает на вопросы посетителей о грантах, отчётности, сопровождает по сайту.
Использует OpenAI GPT и хранит историю диалога в БД.
'''
import json
import os
import urllib.request
import urllib.error
from typing import Any, Dict, List
import psycopg2
from psycopg2.extras import RealDictCursor


def cors() -> Dict[str, str]:
    return {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token, X-Session-Id',
        'Content-Type': 'application/json'
    }


SYSTEM_PROMPT = '''Ты — Юра, дружелюбный персональный менеджер платформы АГРОГРАНТ — государственной системы поддержки агропромышленного комплекса Самарской области.

Твоя задача — сопровождать посетителя сайта от первого вопроса до получения гранта или сдачи отчёта. Ты помогаешь:

• Подобрать подходящий вид гранта (Агростартап, Семейная ферма, Грант СПСК, CAPEX, льготный кредит)
• Объяснить условия, сроки, перечень документов
• Провести по шагам: регистрация → личный кабинет → подача заявки → отчёт → проверка
• Подсказать как сдать отчётность и пройти автопроверку из 10 правил (соответствие суммы, целевое использование, наличие документов, корректность ИНН поставщика, контроль рыночной цены, дубликаты, хронология дат)
• Помочь с навигацией по разделам: Главная, О министерстве, Новости, Документы, Заявки и гранты, Отчётность, Аналитика, Личный кабинет, Проверка отчётов

Контакты Минсельхозпрода Самарской области:
• Адрес: 443006, Самара, ул. Молодогвардейская, 210
• Телефон: 8 (846) 332-10-04
• Email: mcx@samregion.ru
• Сайт: mcx.samregion.ru

Виды грантов и максимальные суммы:
• Агростартап — до 7 млн ₽ (КФХ и ИП-фермеры до 2 лет с момента регистрации)
• Семейная ферма — до 30 млн ₽ (семейные животноводческие фермы)
• Грант СПСК — до 70 млн ₽ (сельскохозяйственные потребительские кооперативы)
• Компенсация CAPEX — возмещение затрат на создание объектов АПК
• Несвязанная поддержка растениеводства — субсидия на 1 га
• Льготный кредит АПК — субсидирование процентной ставки

Стиль общения:
- Отвечай кратко и по делу (2-4 предложения)
- На «вы», по-деловому, но тепло
- Если посетитель не зарегистрирован и спрашивает о подаче заявки — мягко предложи зарегистрироваться через кнопку «Войти / Регистрация» в шапке
- Если вопрос вне темы АГРОГРАНТ/АПК/Самарской области — вежливо верни к теме
- Не выдумывай номера документов, ФИО, телефоны, цифры. Если не знаешь — скажи «уточните по телефону 8 (846) 332-10-04»
- Используй маркированные списки для перечислений
- Не используй эмодзи

Сегодня 27 апреля 2026 года.'''


def call_openai(messages: List[Dict[str, str]], api_key: str) -> str:
    payload = {
        'model': 'gpt-4o-mini',
        'messages': messages,
        'temperature': 0.4,
        'max_tokens': 600,
    }
    req = urllib.request.Request(
        'https://api.openai.com/v1/chat/completions',
        data=json.dumps(payload).encode('utf-8'),
        headers={
            'Authorization': f'Bearer {api_key}',
            'Content-Type': 'application/json',
        },
        method='POST'
    )
    try:
        with urllib.request.urlopen(req, timeout=25) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            return data['choices'][0]['message']['content']
    except urllib.error.HTTPError as e:
        err = e.read().decode('utf-8', errors='ignore')
        raise RuntimeError(f'OpenAI {e.code}: {err[:200]}')


def get_history(conn, session_id: str, limit: int = 10) -> List[Dict[str, str]]:
    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute('''
            SELECT role, content FROM ai_chat_messages
            WHERE session_id = %s
            ORDER BY id DESC LIMIT %s
        ''', (session_id, limit))
        rows = cur.fetchall()
    return [{'role': r['role'], 'content': r['content']} for r in reversed(rows)]


def save_message(conn, session_id: str, user_id: Any, role: str, content: str) -> None:
    with conn.cursor() as cur:
        cur.execute('''
            INSERT INTO ai_chat_messages (session_id, user_id, role, content)
            VALUES (%s, %s, %s, %s)
        ''', (session_id, user_id, role, content))
    conn.commit()


def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''Чат с ИИ-менеджером АГРОГРАНТ.'''
    method = event.get('httpMethod', 'GET')
    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': cors(), 'body': ''}

    try:
        if method != 'POST':
            return {'statusCode': 405, 'headers': cors(),
                    'body': json.dumps({'error': 'Method not allowed'})}

        body = json.loads(event.get('body') or '{}')
        message = (body.get('message') or '').strip()
        session_id = body.get('session_id') or 'anon'
        user_id = body.get('user_id')
        page_context = body.get('page') or ''

        if not message:
            return {'statusCode': 400, 'headers': cors(),
                    'body': json.dumps({'error': 'Пустое сообщение'})}

        if len(message) > 2000:
            message = message[:2000]

        api_key = os.environ.get('OPENAI_API_KEY', '').strip()
        if not api_key:
            return {'statusCode': 200, 'headers': cors(),
                    'body': json.dumps({
                        'reply': 'Помощник временно недоступен — администратор настраивает ИИ-модуль. Пока вы можете обратиться напрямую: 8 (846) 332-10-04 или mcx@samregion.ru.',
                        'session_id': session_id
                    }, ensure_ascii=False)}

        conn = psycopg2.connect(os.environ['DATABASE_URL'])
        try:
            history = get_history(conn, session_id, limit=10)

            sys_prompt = SYSTEM_PROMPT
            if page_context:
                sys_prompt += f'\n\nПосетитель сейчас находится на странице: {page_context}'

            messages = [{'role': 'system', 'content': sys_prompt}] + history + \
                       [{'role': 'user', 'content': message}]

            reply = call_openai(messages, api_key)

            save_message(conn, session_id, user_id, 'user', message)
            save_message(conn, session_id, user_id, 'assistant', reply)

            return {'statusCode': 200, 'headers': cors(),
                    'body': json.dumps({'reply': reply, 'session_id': session_id},
                                       ensure_ascii=False)}
        finally:
            conn.close()
    except Exception as e:
        return {'statusCode': 500, 'headers': cors(),
                'body': json.dumps({
                    'reply': f'Помощник на минутку отошёл. Попробуйте позже или позвоните 8 (846) 332-10-04. ({str(e)[:100]})',
                    'error': str(e)
                }, ensure_ascii=False)}
