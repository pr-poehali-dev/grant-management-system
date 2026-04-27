import Icon from '@/components/ui/icon';

interface HomePageProps {
  onNavigate: (section: string) => void;
}

/* ── Данные ──────────────────────────────────────────────── */

const stats = [
  { label: 'Объём господдержки АПК 2026', value: '₽ 3,8 млрд', icon: 'Landmark' },
  { label: 'Получателей поддержки',        value: '2 340',       icon: 'Users'    },
  { label: 'Заявок на рассмотрении',       value: '187',         icon: 'FileText' },
  { label: 'Мер господдержки в 2026',      value: '42',          icon: 'Award'    },
];

// Карточки сервисов — по стандарту госсайта
const services = [
  {
    title:   'Подать заявку на грант',
    desc:    'Агростартап, Семейная ферма, Грант СПСК — оформление через ЕСИА',
    icon:    'FilePlus',
    section: 'grants',
    accent:  'border-l-blue-700',
    badge:   { label: 'До 30 мая', cls: 'bg-red-50 text-red-700' },
  },
  {
    title:   'Сдать отчётность',
    desc:    'Промежуточные и итоговые отчёты о расходовании грантовых средств',
    icon:    'FileCheck',
    section: 'reports',
    accent:  'border-l-green-700',
    badge:   { label: 'Доступно', cls: 'bg-green-50 text-green-700' },
  },
  {
    title:   'Проверить статус заявки',
    desc:    'Отслеживание хода рассмотрения, история решений, комментарии',
    icon:    'Search',
    section: 'grants',
    accent:  'border-l-indigo-600',
    badge:   { label: 'Доступно', cls: 'bg-green-50 text-green-700' },
  },
  {
    title:   'Аналитика расходов',
    desc:    'Дашборд с графиками расходования средств и KPI-показателями',
    icon:    'BarChart2',
    section: 'dashboard',
    accent:  'border-l-cyan-600',
    badge:   { label: 'Доступно', cls: 'bg-green-50 text-green-700' },
  },
  {
    title:   'Документы и шаблоны',
    desc:    'Нормативные акты, шаблоны форм, статистические сборники',
    icon:    'FolderOpen',
    section: 'documents',
    accent:  'border-l-amber-600',
    badge:   { label: 'Апрель 2026', cls: 'bg-gray-100 text-gray-600' },
  },
  {
    title:   'Личный кабинет',
    desc:    'Управление профилем, история заявок, уведомления о сроках',
    icon:    'User',
    section: 'cabinet',
    accent:  'border-l-purple-600',
    badge:   { label: 'ЕСИА', cls: 'bg-blue-50 text-blue-700' },
  },
];

const news = [
  {
    date:   '26 апр 2026',
    tag:    'Важно',
    tagCls: 'bg-red-50 text-red-700',
    title:  'Открыт приём заявок на гранты «Агростартап» и «Семейная ферма» 2026 года',
    text:   'Минсельхозпрод Самарской области объявляет о начале конкурсного отбора. Заявки принимаются до 30 мая 2026 года.',
    url:    'https://mcx.samregion.ru/category/gospodderzhka/mery-gospodderzhki-2026/',
    section: 'news',
  },
  {
    date:   '20 апр 2026',
    tag:    'Субсидии',
    tagCls: 'bg-blue-50 text-blue-700',
    title:  'Открыт приём заявок на несвязанную поддержку растениеводства',
    text:   'Субсидия на возмещение затрат на агротехнические работы. Ставки дифференцированы по районам области.',
    url:    'https://mcx.samregion.ru/category/gospodderzhka/mery-gospodderzhki-2026/',
    section: 'news',
  },
  {
    date:   '15 апр 2026',
    tag:    'Кредиты',
    tagCls: 'bg-blue-50 text-blue-700',
    title:  'Расширен перечень банков для льготных кредитов АПК до 5% годовых',
    text:   'Кредиты доступны для производителей зерна, масличных, сахарной свёклы и животноводческой продукции.',
    url:    'https://mcx.samregion.ru/category/gospodderzhka/mery-gospodderzhki-2026/',
    section: 'news',
  },
];

const measures = [
  { title: 'Агростартап',                  amount: 'до ₽ 7 млн',       cat: 'Грант',    icon: 'Sprout'    },
  { title: 'Семейная ферма',               amount: 'до ₽ 30 млн',      cat: 'Грант',    icon: 'Home'      },
  { title: 'Грант СПСК',                   amount: 'до ₽ 70 млн',      cat: 'Грант',    icon: 'Tractor'   },
  { title: 'Несвязанная поддержка',        amount: 'ставка по районам', cat: 'Субсидия', icon: 'Wheat'     },
  { title: 'Компенсация CAPEX',            amount: 'до 25% затрат',     cat: 'Субсидия', icon: 'Building2' },
  { title: 'Льготный кредит АПК',          amount: 'до 5% годовых',     cat: 'Кредит',   icon: 'CreditCard'},
];

const catCls: Record<string, string> = {
  Грант:    'bg-green-50 text-green-700 border border-green-200',
  Субсидия: 'bg-blue-50 text-blue-700 border border-blue-200',
  Кредит:   'bg-purple-50 text-purple-700 border border-purple-200',
};

/* ── Компонент ───────────────────────────────────────────── */

export default function HomePage({ onNavigate }: HomePageProps) {
  return (
    <div className="animate-fade-in">

      {/* ══ Hero ══════════════════════════════════════════ */}
      <section className="bg-gov-navy text-white px-6 lg:px-12 py-12 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 39px,rgba(255,255,255,1) 39px,rgba(255,255,255,1) 40px),repeating-linear-gradient(90deg,transparent,transparent 79px,rgba(255,255,255,1) 79px,rgba(255,255,255,1) 80px)' }}
        />
        <div className="relative max-w-5xl mx-auto">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xs font-mono uppercase tracking-widest text-amber-400 border border-amber-400/30 px-2 py-0.5 rounded-sm">
              Официальный государственный сервис
            </span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold leading-snug mb-3 max-w-3xl">
            Автоматизированная система учёта<br className="hidden sm:block" />
            и контроля расходования грантов<br className="hidden sm:block" />
            в сельском хозяйстве Самарской области
          </h1>
          <p className="text-white/60 text-sm mb-8 max-w-2xl">
            Министерство сельского хозяйства и продовольствия Самарской области
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => onNavigate('grants')}
              className="bg-white text-gov-navy font-semibold px-5 py-2.5 rounded text-sm hover:bg-gray-100 transition-colors flex items-center gap-2"
            >
              <Icon name="FilePlus" size={16} />
              Подать заявку
            </button>
            <button
              onClick={() => onNavigate('cabinet')}
              className="bg-white/10 hover:bg-white/20 border border-white/25 text-white font-medium px-5 py-2.5 rounded text-sm transition-colors flex items-center gap-2"
            >
              <Icon name="User" size={16} />
              Личный кабинет
            </button>
            <button
              onClick={() => onNavigate('news')}
              className="bg-white/10 hover:bg-white/20 border border-white/25 text-white font-medium px-5 py-2.5 rounded text-sm transition-colors flex items-center gap-2"
            >
              <Icon name="Newspaper" size={16} />
              Новости
            </button>
          </div>
        </div>
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-white/[0.03] rounded-full translate-x-16 translate-y-16 pointer-events-none" />
      </section>

      {/* ══ Статистика ════════════════════════════════════ */}
      <section className="bg-white border-b border-gov-line">
        <div className="max-w-5xl mx-auto px-6 lg:px-12 py-5 grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s) => (
            <div key={s.label} className="stat-card pl-4 py-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="text-xl font-bold text-gov-navy">{s.value}</div>
                  <div className="text-xs text-muted-foreground mt-0.5 leading-snug">{s.label}</div>
                </div>
                <div className="w-8 h-8 rounded bg-secondary flex items-center justify-center shrink-0">
                  <Icon name={s.icon} size={16} className="text-gov-navy" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ══ Карточки сервисов ═════════════════════════════ */}
      <section className="bg-secondary/40 border-b border-gov-line px-6 lg:px-12 py-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-bold text-gov-navy flex items-center gap-2">
              <Icon name="LayoutGrid" size={17} className="text-gov-navy" />
              Услуги и сервисы
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {services.map((s, i) => (
              <button
                key={s.title}
                onClick={() => onNavigate(s.section)}
                className={`bg-white border border-gov-line border-l-4 ${s.accent} rounded text-left p-4 hover:shadow-md transition-all group animate-slide-up`}
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-9 h-9 rounded bg-secondary flex items-center justify-center group-hover:bg-gov-navy group-hover:text-white transition-colors">
                    <Icon name={s.icon} size={17} className="text-gov-navy group-hover:text-white transition-colors" />
                  </div>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-sm shrink-0 ${s.badge.cls}`}>
                    {s.badge.label}
                  </span>
                </div>
                <div className="text-sm font-semibold text-gov-navy mb-1 leading-snug">{s.title}</div>
                <p className="text-xs text-muted-foreground leading-relaxed">{s.desc}</p>
                <div className="flex items-center gap-1 mt-3 text-xs font-medium text-gov-navy opacity-0 group-hover:opacity-100 transition-opacity">
                  Перейти <Icon name="ArrowRight" size={12} />
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ══ Новости + боковая колонка ═════════════════════ */}
      <section className="max-w-5xl mx-auto px-6 lg:px-12 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Новости */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-gov-navy flex items-center gap-2">
              <Icon name="Newspaper" size={16} className="text-gov-navy" />
              Новости и объявления
            </h2>
            <button
              onClick={() => onNavigate('news')}
              className="text-xs text-gov-navy hover:underline flex items-center gap-1"
            >
              Все новости <Icon name="ArrowRight" size={12} />
            </button>
          </div>

          <div className="space-y-3">
            {news.map((item, i) => (
              <div
                key={i}
                onClick={() => onNavigate(item.section)}
                className="bg-white border border-gov-line rounded p-4 hover:shadow-sm hover:border-gov-navy/30 transition-all cursor-pointer animate-slide-up"
                style={{ animationDelay: `${i * 0.07}s` }}
              >
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className="text-xs text-muted-foreground">{item.date}</span>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-sm ${item.tagCls}`}>{item.tag}</span>
                </div>
                <h3 className="text-sm font-semibold text-gov-navy mb-1 leading-snug">{item.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{item.text}</p>
                <div className="flex items-center gap-1 mt-2 text-xs text-gov-navy">
                  <Icon name="ArrowRight" size={11} />
                  Подробнее
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Боковая колонка */}
        <div className="space-y-4">

          {/* Срок */}
          <div className="bg-red-50 border border-red-200 rounded p-4">
            <div className="flex items-start gap-2">
              <Icon name="AlertTriangle" size={15} className="text-red-600 mt-0.5 shrink-0" />
              <div>
                <div className="text-sm font-semibold text-red-700 mb-1">Срок подачи заявок</div>
                <div className="text-xs text-red-700 leading-relaxed">
                  Агростартап, Семейная ферма, СПСК — <strong>до 30 мая 2026</strong>.<br />
                  Авторизация через Госуслуги (ЕСИА).
                </div>
                <button
                  onClick={() => onNavigate('grants')}
                  className="mt-2 text-xs bg-red-600 text-white px-3 py-1.5 rounded hover:bg-red-700 transition-colors flex items-center gap-1"
                >
                  <Icon name="FilePlus" size={12} />
                  Подать заявку
                </button>
              </div>
            </div>
          </div>

          {/* Меры господдержки */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-gov-navy flex items-center gap-2">
                <Icon name="Award" size={15} className="text-gov-navy" />
                Меры господдержки 2026
              </h2>
              <a
                href="https://mcx.samregion.ru/category/gospodderzhka/mery-gospodderzhki-2026/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-gov-navy hover:underline flex items-center gap-1"
              >
                Все <Icon name="ExternalLink" size={11} />
              </a>
            </div>
            <div className="space-y-1.5">
              {measures.map((m, i) => (
                <button
                  key={m.title}
                  onClick={() => onNavigate('grants')}
                  className="w-full bg-white border border-gov-line rounded p-3 text-left hover:border-gov-navy/50 transition-colors flex items-center gap-3 animate-slide-up"
                  style={{ animationDelay: `${i * 0.05}s` }}
                >
                  <Icon name={m.icon} size={15} className="text-gov-navy shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-gov-navy truncate">{m.title}</div>
                    <div className="text-xs text-muted-foreground">{m.amount}</div>
                  </div>
                  <span className={`text-xs px-1.5 py-0.5 rounded-sm shrink-0 ${catCls[m.cat]}`}>{m.cat}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Контакт */}
          <div className="bg-gov-navy rounded p-4">
            <div className="text-xs font-semibold text-amber-400 mb-1 uppercase tracking-wide">Минсельхозпрод СО</div>
            <a href="tel:88463321004" className="block text-base font-bold text-white hover:text-amber-300 transition-colors mb-0.5">
              8 (846) 332-10-04
            </a>
            <div className="text-xs text-white/50 mb-3">Пн–Пт, 9:00–18:00</div>
            <div className="flex gap-2">
              <button
                onClick={() => onNavigate('contacts')}
                className="text-xs bg-white/10 hover:bg-white/20 border border-white/20 text-white px-3 py-1.5 rounded transition-colors"
              >
                Контакты
              </button>
              <button
                onClick={() => onNavigate('about')}
                className="text-xs bg-white/10 hover:bg-white/20 border border-white/20 text-white px-3 py-1.5 rounded transition-colors"
              >
                О министерстве
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
