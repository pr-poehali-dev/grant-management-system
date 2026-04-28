import { useState } from 'react';
import Icon from '@/components/ui/icon';
import NewsAdmin from '@/components/admin/NewsAdmin';
import DocumentsAdmin from '@/components/admin/DocumentsAdmin';
import SecurityAudit from '@/components/admin/SecurityAudit';

const users: { id: number; name: string; org: string; role: string; inn: string; status: string; lastLogin: string }[] = [];

const roleLabel: Record<string, string> = {
  producer: 'Производитель',
  officer: 'Сотрудник',
  admin: 'Администратор',
};
const roleBadge: Record<string, string> = {
  producer: 'bg-blue-50 text-blue-700',
  officer: 'bg-purple-50 text-purple-700',
  admin: 'bg-amber-50 text-amber-700',
};

const tabs = ['Контент: Новости', 'Контент: Документы', 'Безопасность', 'Пользователи', 'Интеграции', 'Журнал событий', 'Настройки'];
const integrations = [
  { name: 'ЕСИА (Госуслуги)', status: 'connected', lastSync: '27 апр 2026, 08:15', icon: 'Shield' },
  { name: 'ФГИС «Меркурий»', status: 'connected', lastSync: '27 апр 2026, 06:00', icon: 'Database' },
  { name: 'ЭДО «Диадок»', status: 'connected', lastSync: '26 апр 2026, 22:30', icon: 'FileText' },
  { name: 'ФНС — Реестр МСП', status: 'connected', lastSync: '27 апр 2026, 05:00', icon: 'Building' },
  { name: 'ЦБ РФ — Курсы валют', status: 'connected', lastSync: '27 апр 2026, 09:00', icon: 'TrendingUp' },
  { name: 'Росстат — API данных', status: 'error', lastSync: '25 апр 2026, 14:30', icon: 'AlertCircle' },
];

const auditLog: { time: string; user: string; action: string; type: string }[] = [];

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('Контент: Новости');

  return (
    <div className="animate-fade-in max-w-5xl px-8 py-8">
      <h1 className="text-xl font-bold text-gov-navy flex items-center gap-2 mb-1">
        <Icon name="Settings" size={20} />
        Администрирование
      </h1>
      <p className="text-sm text-muted-foreground mb-6">Управление пользователями, интеграциями и настройками системы</p>

      {/* Tabs */}
      <div className="flex border-b border-gov-line mb-6 gap-0">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${activeTab === t ? 'border-gov-navy text-gov-navy' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
          >
            {t}
          </button>
        ))}
      </div>

      {activeTab === 'Контент: Новости' && <NewsAdmin />}
      {activeTab === 'Контент: Документы' && <DocumentsAdmin />}
      {activeTab === 'Безопасность' && <SecurityAudit />}

      {activeTab === 'Пользователи' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="text-xs text-muted-foreground">{users.length} пользователей в системе</div>
            <div className="flex gap-2">
              <div className="relative">
                <Icon name="Search" size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input className="pl-8 pr-3 py-1.5 text-xs border border-gov-line rounded bg-white focus:outline-none focus:border-gov-navy w-44" placeholder="Поиск..." />
              </div>
              <button className="text-xs bg-gov-navy text-white px-3 py-1.5 rounded flex items-center gap-1.5">
                <Icon name="UserPlus" size={13} />
                Добавить
              </button>
            </div>
          </div>
          <div className="bg-white border border-gov-line rounded overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-secondary border-b border-gov-line text-left">
                  <th className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Пользователь</th>
                  <th className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Роль</th>
                  <th className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">ИНН</th>
                  <th className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Статус</th>
                  <th className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Вход</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gov-line">
                {users.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-xs text-muted-foreground">
                      Список пользователей загружается из системы. Реальные данные будут доступны после подключения модуля управления учётными записями.
                    </td>
                  </tr>
                )}
                {users.map((u, i) => (
                  <tr key={u.id} className="hover:bg-secondary/40 transition-colors animate-slide-up" style={{ animationDelay: `${i * 0.05}s` }}>
                    <td className="px-4 py-3">
                      <div className="text-xs font-semibold text-gov-navy">{u.name}</div>
                      <div className="text-xs text-muted-foreground">{u.org}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-sm ${roleBadge[u.role]}`}>{roleLabel[u.role]}</span>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{u.inn}</td>
                    <td className="px-4 py-3">
                      <span className={`flex items-center gap-1.5 text-xs font-semibold ${u.status === 'active' ? 'text-green-700' : 'text-red-600'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${u.status === 'active' ? 'bg-green-500' : 'bg-red-500'}`} />
                        {u.status === 'active' ? 'Активен' : 'Заблокирован'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{u.lastLogin}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button className="text-xs text-gov-navy hover:underline">Изменить</button>
                        <button className={`text-xs ${u.status === 'active' ? 'text-red-600 hover:underline' : 'text-green-700 hover:underline'}`}>
                          {u.status === 'active' ? 'Блокировать' : 'Разблокировать'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'Интеграции' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {integrations.map((int, i) => (
            <div key={int.name} className="bg-white border border-gov-line rounded p-4 flex items-center gap-4 animate-slide-up" style={{ animationDelay: `${i * 0.06}s` }}>
              <div className={`w-10 h-10 rounded flex items-center justify-center shrink-0 ${int.status === 'connected' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                <Icon name={int.icon} size={18} className={int.status === 'connected' ? 'text-green-700' : 'text-red-600'} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-gov-navy">{int.name}</div>
                <div className="text-xs text-muted-foreground">Синхр.: {int.lastSync}</div>
              </div>
              <div className={`flex items-center gap-1.5 text-xs font-semibold shrink-0 ${int.status === 'connected' ? 'text-green-700' : 'text-red-600'}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${int.status === 'connected' ? 'bg-green-500' : 'bg-red-500'}`} />
                {int.status === 'connected' ? 'Подключено' : 'Ошибка'}
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'Журнал событий' && (
        <div className="bg-white border border-gov-line rounded overflow-hidden">
          <div className="px-4 py-3 border-b border-gov-line bg-secondary/50 flex items-center justify-between">
            <span className="text-xs font-semibold text-gov-navy">27 апреля 2026</span>
            <button className="text-xs text-muted-foreground hover:text-gov-navy flex items-center gap-1">
              <Icon name="Download" size={12} />
              Экспорт журнала
            </button>
          </div>
          <div className="divide-y divide-gov-line">
            {auditLog.length === 0 && (
              <div className="px-4 py-8 text-center text-xs text-muted-foreground">
                Журнал событий пуст. Записи появятся после действий пользователей в системе.
              </div>
            )}
            {auditLog.map((e, i) => (
              <div key={i} className="px-4 py-3 flex items-center gap-4 animate-slide-up text-sm" style={{ animationDelay: `${i * 0.05}s` }}>
                <span className="font-mono text-xs text-muted-foreground w-10 shrink-0">{e.time}</span>
                <Icon name={e.type === 'approve' ? 'CheckCircle' : e.type === 'create' ? 'Plus' : e.type === 'system' ? 'Cpu' : 'Bell'} size={14} className="text-muted-foreground shrink-0" />
                <span className="text-xs font-semibold text-gov-navy w-32 shrink-0">{e.user}</span>
                <span className="text-xs text-foreground">{e.action}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'Настройки' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {[
            { section: 'Сроки приёма заявок', fields: [{ label: 'Начало приёма', value: '01.03.2026' }, { label: 'Окончание приёма', value: '30.05.2026' }] },
            { section: 'Лимиты грантов', fields: [{ label: 'Агростартап (макс.), руб.', value: '6 000 000' }, { label: 'Семейная ферма (макс.), руб.', value: '30 000 000' }] },
          ].map((block) => (
            <div key={block.section} className="bg-white border border-gov-line rounded p-5">
              <h3 className="text-sm font-bold text-gov-navy mb-4">{block.section}</h3>
              <div className="space-y-3">
                {block.fields.map((f) => (
                  <div key={f.label}>
                    <label className="block text-xs font-semibold mb-1">{f.label}</label>
                    <input defaultValue={f.value} className="w-full border border-gov-line rounded px-3 py-2 text-sm focus:outline-none focus:border-gov-navy" />
                  </div>
                ))}
              </div>
              <button className="mt-4 text-xs bg-gov-navy text-white px-4 py-1.5 rounded hover:bg-gov-navy-light transition-colors">Сохранить</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}