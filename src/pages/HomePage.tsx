import Icon from '@/components/ui/icon';

interface HomePageProps {
  onNavigate: (section: string) => void;
}

const stats = [
  { label: 'Выдано грантов в 2024', value: '₽ 4,2 млрд', icon: 'Landmark', trend: '+12%' },
  { label: 'Активных получателей', value: '1 847', icon: 'Users', trend: '+8%' },
  { label: 'Заявок на рассмотрении', value: '342', icon: 'FileText', trend: null },
  { label: 'Отчётов проверено', value: '2 109', icon: 'CheckSquare', trend: '+23%' },
];

const news = [
  {
    date: '24 апр 2026',
    tag: 'Важно',
    title: 'Открыт приём заявок на гранты по направлению «Агростартап» 2026',
    text: 'Министерство сельского хозяйства объявляет о начале приёма заявок на конкурс грантов. Срок подачи — до 30 мая 2026 года.',
  },
  {
    date: '18 апр 2026',
    tag: 'Отчётность',
    title: 'Обновлены формы промежуточной отчётности за I квартал 2026',
    text: 'В систему добавлены актуальные шаблоны отчётных документов согласно приказу №147 Минсельхоза РФ.',
  },
  {
    date: '10 апр 2026',
    tag: 'Интеграция',
    title: 'Запущена интеграция с ФГИС «Меркурий» для верификации данных',
    text: 'Теперь данные о поголовье и объёмах производства автоматически проверяются через федеральную систему.',
  },
];

const grantTypes = [
  {
    title: 'Агростартап',
    amount: 'до ₽ 6 млн',
    desc: 'Для начинающих фермеров, ранее не осуществлявших сельскохозяйственную деятельность',
    color: 'border-blue-600',
    icon: 'Sprout',
  },
  {
    title: 'Семейная ферма',
    amount: 'до ₽ 30 млн',
    desc: 'Поддержка семейных животноводческих ферм для развития производства',
    color: 'border-green-600',
    icon: 'Home',
  },
  {
    title: 'Развитие МТБ',
    amount: 'до ₽ 500 млн',
    desc: 'Для кооперативов на приобретение материально-технической базы',
    color: 'border-amber-600',
    icon: 'Tractor',
  },
];

export default function HomePage({ onNavigate }: HomePageProps) {
  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <section className="bg-gov-navy text-white px-8 py-16 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5"
          style={{ backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 39px,rgba(255,255,255,.3) 39px,rgba(255,255,255,.3) 40px),repeating-linear-gradient(90deg,transparent,transparent 39px,rgba(255,255,255,.3) 39px,rgba(255,255,255,.3) 40px)' }} />
        <div className="relative max-w-5xl">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xs font-mono uppercase tracking-widest text-amber-400 border border-amber-400/40 px-2 py-0.5 rounded-sm">
              Официальная система
            </span>
            <span className="text-xs text-white/40 font-mono">v2.4.1</span>
          </div>
          <h1 className="text-4xl font-black leading-tight mb-4 tracking-tight">
            Государственная система<br />
            управления грантами АПК
          </h1>
          <p className="text-white/70 text-lg mb-8 max-w-2xl leading-relaxed">
            Единая платформа для подачи заявок, управления грантами и контроля отчётности
            сельскохозяйственных производителей Российской Федерации.
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => onNavigate('grants')}
              className="bg-amber-500 hover:bg-amber-400 text-white font-semibold px-6 py-3 rounded transition-colors flex items-center gap-2"
            >
              <Icon name="FilePlus" size={18} />
              Подать заявку на грант
            </button>
            <button
              onClick={() => onNavigate('cabinet')}
              className="bg-white/10 hover:bg-white/20 text-white font-semibold px-6 py-3 rounded transition-colors border border-white/20 flex items-center gap-2"
            >
              <Icon name="User" size={18} />
              Личный кабинет
            </button>
          </div>
        </div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/3 rounded-full translate-x-24 translate-y-24" />
      </section>

      {/* Stats */}
      <section className="bg-white border-b border-gov-line px-8 py-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl">
          {stats.map((s) => (
            <div key={s.label} className="stat-card pl-4 py-3">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-2xl font-black text-gov-navy">{s.value}</div>
                  <div className="text-xs text-muted-foreground mt-0.5 leading-snug">{s.label}</div>
                </div>
                <div className="w-9 h-9 rounded bg-secondary flex items-center justify-center">
                  <Icon name={s.icon} size={18} className="text-gov-navy" />
                </div>
              </div>
              {s.trend && (
                <div className="text-xs text-gov-green font-semibold mt-2 flex items-center gap-1">
                  <Icon name="TrendingUp" size={12} />
                  {s.trend} к прошлому году
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Main content */}
      <div className="max-w-5xl px-8 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* News */}
        <div className="lg:col-span-2">
          <h2 className="text-base font-bold text-gov-navy mb-4 flex items-center gap-2">
            <Icon name="Newspaper" size={16} />
            Новости и объявления
          </h2>
          <div className="space-y-3">
            {news.map((item, i) => (
              <div key={i} className="bg-white border border-gov-line rounded p-4 hover:border-blue-300 transition-colors cursor-pointer animate-slide-up" style={{ animationDelay: `${i * 0.08}s` }}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-mono text-muted-foreground">{item.date}</span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-sm bg-blue-50 text-blue-700">{item.tag}</span>
                </div>
                <h3 className="text-sm font-semibold text-gov-navy mb-1 leading-snug">{item.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{item.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Grant types */}
        <div>
          <h2 className="text-base font-bold text-gov-navy mb-4 flex items-center gap-2">
            <Icon name="Award" size={16} />
            Виды грантов
          </h2>
          <div className="space-y-3">
            {grantTypes.map((g, i) => (
              <div
                key={i}
                onClick={() => onNavigate('grants')}
                className={`bg-white border-l-4 ${g.color} border border-gov-line rounded p-4 cursor-pointer hover:shadow-sm transition-all animate-slide-up`}
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Icon name={g.icon} size={15} className="text-gov-navy" />
                  <span className="text-sm font-bold text-gov-navy">{g.title}</span>
                </div>
                <div className="text-sm font-semibold text-gov-gold mb-1">{g.amount}</div>
                <p className="text-xs text-muted-foreground leading-relaxed">{g.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-4 bg-amber-50 border border-amber-200 rounded p-4">
            <div className="flex items-start gap-2">
              <Icon name="Info" size={15} className="text-amber-600 mt-0.5 shrink-0" />
              <div>
                <div className="text-xs font-semibold text-amber-800 mb-1">Приём заявок открыт</div>
                <div className="text-xs text-amber-700 leading-relaxed">
                  До 30 мая 2026 года. Для подачи заявки необходима авторизация через Госуслуги (ЕСИА).
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick access */}
      <section className="bg-white border-t border-gov-line px-8 py-6">
        <h2 className="text-base font-bold text-gov-navy mb-4 max-w-5xl">Быстрый доступ</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-5xl">
          {[
            { label: 'Подать заявку', icon: 'FilePlus', section: 'grants', color: 'text-blue-600 bg-blue-50 border-blue-200' },
            { label: 'Сдать отчёт', icon: 'FileCheck', section: 'reports', color: 'text-green-700 bg-green-50 border-green-200' },
            { label: 'Проверка статуса', icon: 'Search', section: 'grants', color: 'text-amber-700 bg-amber-50 border-amber-200' },
            { label: 'Документация', icon: 'BookOpen', section: 'help', color: 'text-purple-700 bg-purple-50 border-purple-200' },
          ].map((item) => (
            <button
              key={item.label}
              onClick={() => onNavigate(item.section)}
              className={`border rounded p-4 text-left hover:shadow-sm transition-all ${item.color}`}
            >
              <Icon name={item.icon} size={20} className="mb-2" />
              <div className="text-sm font-semibold">{item.label}</div>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}