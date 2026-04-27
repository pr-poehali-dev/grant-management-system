import { useState, useRef, useEffect } from 'react';
import Icon from '@/components/ui/icon';
import { useAuth } from '@/lib/auth';

const API_AI = 'https://functions.poehali.dev/b3b5476d-e7a7-4695-a679-c389b5664d11';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  ts: number;
}

interface AiAssistantProps {
  currentPage?: string;
}

const SUGGESTIONS = [
  'Какой грант мне подойдёт?',
  'Как подать отчёт?',
  'Какие документы нужны?',
  'Сроки подачи заявок',
];

const getSessionId = (): string => {
  let id = localStorage.getItem('agrogrant_chat_session');
  if (!id) {
    id = 'sess-' + Math.random().toString(36).slice(2) + '-' + Date.now();
    localStorage.setItem('agrogrant_chat_session', id);
  }
  return id;
};

export default function AiAssistant({ currentPage }: AiAssistantProps) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Здравствуйте! Я Юра, ваш персональный менеджер по программам поддержки АПК Самарской области. Помогу подобрать грант, разобраться с подачей заявки или сдачей отчёта. С чего начнём?',
      ts: Date.now(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [unread, setUnread] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, open]);

  const send = async (text?: string) => {
    const message = (text ?? input).trim();
    if (!message || loading) return;

    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: message, ts: Date.now() }]);
    setLoading(true);

    try {
      const r = await fetch(API_AI, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          session_id: getSessionId(),
          user_id: user?.id || null,
          page: currentPage || '',
        }),
      });
      const d = await r.json();
      const reply = d.reply || 'Не удалось получить ответ. Попробуйте ещё раз или позвоните 8 (846) 332-10-04.';
      setMessages((prev) => [...prev, { role: 'assistant', content: reply, ts: Date.now() }]);
      if (!open) setUnread(true);
    } catch {
      setMessages((prev) => [...prev, {
        role: 'assistant',
        content: 'Связь с помощником прервалась. Проверьте интернет или позвоните 8 (846) 332-10-04.',
        ts: Date.now()
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = () => {
    setOpen(true);
    setUnread(false);
  };

  return (
    <>
      {/* Кнопка */}
      {!open && (
        <button
          onClick={handleOpen}
          className="fixed bottom-5 right-5 z-40 bg-gov-navy text-white rounded-full shadow-2xl hover:bg-gov-navy-light transition-all hover:scale-105 flex items-center gap-2 pl-3 pr-4 py-3 group"
          aria-label="Открыть чат с ИИ-менеджером"
        >
          <div className="relative">
            <div className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center">
              <Icon name="Bot" size={20} />
            </div>
            {unread && <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-red-500 rounded-full border-2 border-gov-navy" />}
          </div>
          <div className="text-left hidden sm:block">
            <div className="text-xs opacity-70 leading-tight">Менеджер</div>
            <div className="text-sm font-bold leading-tight">Спросить Юру</div>
          </div>
        </button>
      )}

      {/* Окно чата */}
      {open && (
        <div className="fixed bottom-5 right-5 z-40 w-[calc(100vw-40px)] sm:w-96 max-w-md h-[600px] max-h-[85vh] bg-white rounded-lg shadow-2xl flex flex-col border border-gov-line animate-slide-up">
          {/* Header */}
          <div className="bg-gov-navy text-white px-4 py-3 rounded-t-lg flex items-center gap-3">
            <div className="relative">
              <div className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center">
                <Icon name="Bot" size={18} />
              </div>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-gov-navy" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-sm">Юра — менеджер АГРОГРАНТ</div>
              <div className="text-xs text-white/60">На связи · Отвечает за минуту</div>
            </div>
            <button onClick={() => setOpen(false)} className="text-white/70 hover:text-white">
              <Icon name="X" size={18} />
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-secondary/30">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] px-3 py-2 rounded-lg text-sm whitespace-pre-wrap ${
                  m.role === 'user'
                    ? 'bg-gov-navy text-white rounded-br-sm'
                    : 'bg-white border border-gov-line text-foreground rounded-bl-sm shadow-sm'
                }`}>
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white border border-gov-line text-muted-foreground rounded-lg rounded-bl-sm px-3 py-2 text-sm flex items-center gap-2">
                  <Icon name="Loader2" size={14} className="animate-spin" />
                  Юра печатает...
                </div>
              </div>
            )}
          </div>

          {/* Подсказки (только если 1 сообщение) */}
          {messages.length === 1 && !loading && (
            <div className="px-4 pb-2 flex flex-wrap gap-1.5 bg-white border-t border-gov-line pt-2">
              {SUGGESTIONS.map((s) => (
                <button key={s} onClick={() => send(s)}
                  className="text-xs px-2.5 py-1.5 bg-secondary border border-gov-line rounded-full hover:bg-gov-navy hover:text-white hover:border-gov-navy transition-colors">
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <form onSubmit={(e) => { e.preventDefault(); send(); }}
            className="border-t border-gov-line p-3 flex gap-2 bg-white rounded-b-lg">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
              className="flex-1 px-3 py-2 border border-gov-line rounded text-sm focus:outline-none focus:border-gov-navy disabled:opacity-50"
              placeholder="Задайте вопрос..."
              maxLength={1000}
            />
            <button type="submit" disabled={loading || !input.trim()}
              className="bg-gov-navy text-white w-10 h-10 rounded flex items-center justify-center hover:bg-gov-navy-light disabled:opacity-50 transition-colors">
              <Icon name="Send" size={16} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
