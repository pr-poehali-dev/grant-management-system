import { useState, useEffect } from 'react';
import Icon from '@/components/ui/icon';
import { useAuth } from '@/lib/auth';

const API_AUTH = 'https://functions.poehali.dev/f25bf775-a0f9-4d9c-8dea-ba003ffeed1b';

interface AuditEntry {
  id: number;
  email: string;
  action: string;
  details: string;
  ip: string;
  severity: 'info' | 'warn' | 'error' | string;
  created_at: string;
}

const SEVERITY_STYLES: Record<string, string> = {
  info: 'bg-blue-50 text-blue-700 border-blue-200',
  warn: 'bg-amber-50 text-amber-700 border-amber-200',
  error: 'bg-red-50 text-red-700 border-red-200',
};

const ACTION_LABELS: Record<string, string> = {
  login_success: 'Успешный вход',
  login_failed: 'Неудачный вход',
  login_blocked: 'Блокировка по брутфорсу',
  register_success: 'Регистрация',
  register_captcha_failed: 'Капча не пройдена',
  '2fa_issued': 'Запрошен код 2FA',
  '2fa_failed': 'Неверный код 2FA',
};

const fmtDate = (iso: string) => {
  try {
    const d = new Date(iso);
    return d.toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' });
  } catch {
    return iso;
  }
};

export default function SecurityAudit() {
  const { token } = useAuth();
  const [items, setItems] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'warn' | 'error'>('all');

  const load = () => {
    if (!token) return;
    setLoading(true);
    fetch(`${API_AUTH}?action=audit`, { headers: { 'X-Auth-Token': token } })
      .then((r) => r.json())
      .then((d) => setItems(d.items || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [token]);

  const filtered = filter === 'all'
    ? items
    : items.filter((i) => i.severity === filter || (filter === 'error' && i.severity === 'error'));

  const stats = {
    total: items.length,
    fails: items.filter((i) => i.action === 'login_failed').length,
    blocks: items.filter((i) => i.action === 'login_blocked').length,
    success: items.filter((i) => i.action === 'login_success').length,
  };

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        <div className="bg-white border border-gov-line rounded p-3">
          <div className="text-xs text-muted-foreground">Всего событий</div>
          <div className="text-lg font-bold text-gov-navy">{stats.total}</div>
        </div>
        <div className="bg-white border border-gov-line rounded p-3">
          <div className="text-xs text-muted-foreground">Успешных входов</div>
          <div className="text-lg font-bold text-green-700">{stats.success}</div>
        </div>
        <div className="bg-white border border-gov-line rounded p-3">
          <div className="text-xs text-muted-foreground">Неудачных попыток</div>
          <div className="text-lg font-bold text-amber-700">{stats.fails}</div>
        </div>
        <div className="bg-white border border-gov-line rounded p-3">
          <div className="text-xs text-muted-foreground">Заблокировано</div>
          <div className="text-lg font-bold text-red-600">{stats.blocks}</div>
        </div>
      </div>

      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <div className="flex gap-1.5">
          {(['all', 'warn', 'error'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`text-xs px-3 py-1.5 rounded border ${filter === f ? 'bg-gov-navy text-white border-gov-navy' : 'bg-white border-gov-line text-muted-foreground'}`}
            >
              {f === 'all' ? 'Все' : f === 'warn' ? 'Предупреждения' : 'Ошибки'}
            </button>
          ))}
        </div>
        <button onClick={load} className="text-xs flex items-center gap-1 border border-gov-line rounded px-3 py-1.5 hover:bg-secondary">
          <Icon name="RefreshCw" size={12} />
          Обновить
        </button>
      </div>

      {loading ? (
        <div className="text-center py-8 text-muted-foreground text-sm">Загрузка...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground text-sm">Событий нет</div>
      ) : (
        <div className="bg-white border border-gov-line rounded overflow-hidden">
          <table className="w-full text-xs">
            <thead className="bg-secondary border-b border-gov-line">
              <tr>
                <th className="text-left px-3 py-2 font-semibold text-muted-foreground">Время</th>
                <th className="text-left px-3 py-2 font-semibold text-muted-foreground">Событие</th>
                <th className="text-left px-3 py-2 font-semibold text-muted-foreground">Email</th>
                <th className="text-left px-3 py-2 font-semibold text-muted-foreground">IP</th>
                <th className="text-left px-3 py-2 font-semibold text-muted-foreground">Детали</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gov-line">
              {filtered.map((it) => (
                <tr key={it.id} className="hover:bg-secondary/40">
                  <td className="px-3 py-2 text-muted-foreground whitespace-nowrap">{fmtDate(it.created_at)}</td>
                  <td className="px-3 py-2">
                    <span className={`inline-block text-xs px-2 py-0.5 rounded border ${SEVERITY_STYLES[it.severity] || SEVERITY_STYLES.info}`}>
                      {ACTION_LABELS[it.action] || it.action}
                    </span>
                  </td>
                  <td className="px-3 py-2 font-mono text-xs text-gov-navy">{it.email || '—'}</td>
                  <td className="px-3 py-2 font-mono text-xs text-muted-foreground">{it.ip || '—'}</td>
                  <td className="px-3 py-2 text-muted-foreground">{it.details || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
