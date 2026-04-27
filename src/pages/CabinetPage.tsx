import Icon from '@/components/ui/icon';

interface CabinetPageProps {
  onNavigate: (section: string) => void;
  role: 'producer' | 'officer' | 'admin';
  onRoleChange: (role: 'producer' | 'officer' | 'admin') => void;
}

const roleLabels = {
  producer: 'Сельхозпроизводитель',
  officer: 'Сотрудник министерства',
  admin: 'Администратор системы',
};

const roleIcons = {
  producer: 'Tractor',
  officer: 'Shield',
  admin: 'Settings',
};

const producerGrants: { id: string; name: string; amount: string; status: string; progress: number; nextReport: string }[] = [];

const officerTasks: { id: number; type: string; subject: string; grant: string; deadline: string; priority: string }[] = [];

const statusLabel: Record<string, string> = {
  approved: 'Одобрен',
  review: 'На рассмотрении',
  rejected: 'Отказ',
  completed: 'Завершён',
  new: 'Новая',
};
const statusClass: Record<string, string> = {
  approved: 'badge-status-approved',
  review: 'badge-status-review',
  rejected: 'badge-status-rejected',
  completed: 'badge-status-completed',
  new: 'badge-status-new',
};

export default function CabinetPage({ onNavigate, role, onRoleChange }: CabinetPageProps) {
  return (
    <div className="animate-fade-in max-w-5xl px-8 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Icon name={roleIcons[role]} size={18} className="text-gov-navy" />
            <h1 className="text-xl font-bold text-gov-navy">Личный кабинет</h1>
          </div>
          <div className="text-sm text-muted-foreground">{roleLabels[role]}</div>
        </div>

        {/* Role switcher — демо */}
        <div className="bg-secondary rounded p-1 flex gap-1 text-xs">
          {(['producer', 'officer', 'admin'] as const).map((r) => (
            <button
              key={r}
              onClick={() => onRoleChange(r)}
              className={`px-3 py-1.5 rounded font-semibold transition-colors ${role === r ? 'bg-gov-navy text-white' : 'text-muted-foreground hover:text-foreground'}`}
            >
              {r === 'producer' ? 'Производитель' : r === 'officer' ? 'Сотрудник' : 'Администратор'}
            </button>
          ))}
        </div>
      </div>

      {/* Profile card */}
      <div className="bg-white border border-gov-line rounded p-5 mb-6 flex flex-col md:flex-row items-start gap-5">
        <div className="w-14 h-14 rounded-full bg-gov-navy flex items-center justify-center shrink-0">
          <Icon name={roleIcons[role]} size={22} className="text-white" />
        </div>
        <div className="flex-1">
          <div className="font-bold text-gov-navy text-base mb-0.5">
            {roleLabels[role]}
          </div>
          <div className="text-xs text-muted-foreground mb-3">
            {role === 'producer'
              ? 'Войдите через ЕСИА — данные подтянутся из Госуслуг'
              : role === 'officer'
                ? 'Министерство сельского хозяйства и продовольствия Самарской области'
                : 'Управление информационных систем'}
          </div>
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-1.5 text-xs text-green-700 bg-green-50 border border-green-200 rounded px-2.5 py-1.5">
              <Icon name="CheckCircle" size={13} />
              Аккаунт верифицирован через ЕСИА
            </div>
            <div className="flex items-center gap-1.5 text-xs text-blue-700 bg-blue-50 border border-blue-200 rounded px-2.5 py-1.5">
              <Icon name="Key" size={13} />
              ЭЦП подключена
            </div>
          </div>
        </div>
        <button className="text-xs text-gov-navy border border-gov-line rounded px-3 py-1.5 hover:bg-secondary transition-colors flex items-center gap-1.5">
          <Icon name="Edit" size={13} />
          Редактировать
        </button>
      </div>

      {/* Content by role */}
      {role === 'producer' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-gov-navy flex items-center gap-2">
              <Icon name="Award" size={16} />
              Мои гранты
            </h2>
            <button
              onClick={() => onNavigate('grants')}
              className="text-xs bg-gov-navy text-white px-3 py-1.5 rounded hover:bg-gov-navy-light transition-colors flex items-center gap-1.5"
            >
              <Icon name="Plus" size={13} />
              Подать заявку
            </button>
          </div>

          {producerGrants.length === 0 && (
            <div className="bg-white border border-gov-line rounded p-8 text-center">
              <Icon name="Award" size={32} className="mx-auto text-muted-foreground/40 mb-2" />
              <div className="text-sm text-muted-foreground mb-1">У вас пока нет грантов</div>
              <div className="text-xs text-muted-foreground mb-4">Подайте заявку, чтобы получить государственную поддержку</div>
              <button onClick={() => onNavigate('grants')}
                className="text-xs bg-gov-navy text-white px-4 py-2 rounded hover:bg-gov-navy-light transition-colors">
                Перейти к подаче заявки
              </button>
            </div>
          )}
          {producerGrants.map((g, i) => (
            <div key={g.id} className="bg-white border border-gov-line rounded p-5 animate-slide-up" style={{ animationDelay: `${i * 0.08}s` }}>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
                <div>
                  <div className="font-semibold text-gov-navy">{g.name}</div>
                  <div className="text-xs text-muted-foreground font-mono mt-0.5">{g.id}</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-gov-navy">{g.amount}</span>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-sm ${statusClass[g.status]}`}>
                    {statusLabel[g.status]}
                  </span>
                </div>
              </div>
              {g.status === 'approved' && (
                <div>
                  <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                    <span>Освоение средств</span>
                    <span className="font-semibold">{g.progress}%</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${g.progress}%` }} />
                  </div>
                  <div className="flex justify-between mt-3">
                    <div className="text-xs text-muted-foreground">
                      Следующий отчёт: <span className="text-foreground font-semibold">{g.nextReport}</span>
                    </div>
                    <button
                      onClick={() => onNavigate('reports')}
                      className="text-xs text-blue-700 hover:underline flex items-center gap-1"
                    >
                      <Icon name="FileText" size={12} />
                      Сдать отчёт
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {role === 'officer' && (
        <div>
          <h2 className="text-base font-bold text-gov-navy flex items-center gap-2 mb-4">
            <Icon name="ClipboardList" size={16} />
            Задачи на проверку
          </h2>
          <div className="space-y-3">
            {officerTasks.length === 0 && (
              <div className="bg-white border border-gov-line rounded p-8 text-center">
                <Icon name="Inbox" size={32} className="mx-auto text-muted-foreground/40 mb-2" />
                <div className="text-sm text-muted-foreground mb-1">Нет задач на проверке</div>
                <div className="text-xs text-muted-foreground mb-4">Откройте раздел «Проверка отчётов» для работы с входящими отчётами</div>
                <button onClick={() => onNavigate('verification')}
                  className="text-xs bg-gov-navy text-white px-4 py-2 rounded hover:bg-gov-navy-light transition-colors">
                  Перейти к проверке
                </button>
              </div>
            )}
            {officerTasks.map((t, i) => (
              <div key={t.id} className="bg-white border border-gov-line rounded p-4 flex items-center gap-4 animate-slide-up hover:border-blue-300 transition-colors cursor-pointer" style={{ animationDelay: `${i * 0.07}s` }}>
                <div className={`w-2 h-2 rounded-full shrink-0 ${t.priority === 'high' ? 'bg-red-500' : t.priority === 'medium' ? 'bg-amber-500' : 'bg-green-500'}`} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-gov-navy">{t.type}</div>
                  <div className="text-xs text-muted-foreground">{t.subject} · <span className="font-mono">{t.grant}</span></div>
                </div>
                <div className="text-xs text-muted-foreground shrink-0">до {t.deadline}</div>
                <button
                  onClick={() => onNavigate('verification')}
                  className="text-xs bg-secondary text-gov-navy px-3 py-1.5 rounded hover:bg-gov-navy hover:text-white transition-colors shrink-0"
                >
                  Открыть
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {role === 'admin' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { label: 'Управление пользователями', icon: 'Users', desc: 'Роли, доступы, блокировки', section: 'admin', color: 'text-blue-700 bg-blue-50 border-blue-200' },
            { label: 'Настройки системы', icon: 'Settings', desc: 'Параметры, интеграции, ЭДО', section: 'admin', color: 'text-purple-700 bg-purple-50 border-purple-200' },
            { label: 'Журнал событий', icon: 'Activity', desc: 'Аудит действий пользователей', section: 'admin', color: 'text-amber-700 bg-amber-50 border-amber-200' },
            { label: 'Резервные копии', icon: 'Database', desc: 'Экспорт и архив данных', section: 'admin', color: 'text-green-700 bg-green-50 border-green-200' },
          ].map((item) => (
            <button
              key={item.label}
              onClick={() => onNavigate(item.section)}
              className={`border rounded p-5 text-left hover:shadow-sm transition-all ${item.color}`}
            >
              <Icon name={item.icon} size={22} className="mb-3" />
              <div className="font-semibold mb-1">{item.label}</div>
              <div className="text-xs opacity-70">{item.desc}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}