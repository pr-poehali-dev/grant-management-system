import Icon from '@/components/ui/icon';

interface HomePageProps {
  onNavigate: (section: string) => void;
}

const stats = [
  { label: 'Объём господдержки АПК 2026', value: '₽ 3,8 млрд', icon: 'Landmark', trend: '+7%' },
  { label: 'Получателей поддержки', value: '2 340', icon: 'Users', trend: '+5%' },
  { label: 'Заявок на рассмотрении', value: '187', icon: 'FileText', trend: null },
  { label: 'Мер господдержки в 2026', value: '42', icon: 'CheckSquare', trend: null },
];

const news = [
  {
    date: '26 апр 2026',
    tag: 'Важно',
    title: 'Открыт приём заявок на гранты «Агростартап» и «Семейная ферма» 2026 года',
    text: 'Минсельхозпрод Самарской области объявляет о начале конкурсного отбора. Заявки принимаются до 30 мая 2026 года через портал Госуслуги.',
    url: 'https://mcx.samregion.ru/category/gospodderzhka/mery-gospodderzhki-2026/',
  },
  {
    date: '20 апр 2026',
    tag: 'Субсидии',
    title: 'Открыт приём заявок на субсидии по несвязанной поддержке растениеводства',
    text: 'Субсидия предоставляется на возмещение части затрат на проведение агротехнических работ. Ставки дифференцированы по районам области.',
    url: 'https://mcx.samregion.ru/category/gospodderzhka/mery-gospodderzhki-2026/',
  },
  {
    date: '15 апр 2026',
    tag: 'Льготные кредиты',
    title: 'Расширен перечень банков для получения льготных краткосрочных кредитов АПК',
    text: 'Кредиты по ставке до 5% годовых доступны для производителей зерна, масличных, сахарной свёклы и животноводческой продукции.',
    url: 'https://mcx.samregion.ru/category/gospodderzhka/mery-gospodderzhki-2026/',
  },
  {
    date: '08 апр 2026',
    tag: 'Кооперация',
    title: 'Приём заявок на гранты сельскохозяйственным кооперативам',
    text: 'Гранты на развитие материально-технической базы СПСК — до ₽ 70 млн. Требование: не менее 10 членов кооператива.',
    url: 'https://mcx.samregion.ru/category/gospodderzhka/mery-gospodderzhki-2026/',
  },
];

const supportMeasures = [
  {
    title: 'Агростартап',
    amount: 'до ₽ 7 млн',
    desc: 'Для начинающих фермеров (КФХ и ИП), зарегистрированных не ранее чем за 2 года до подачи заявки. Направление: растениеводство, животноводство.',
    color: 'border-blue-600',
    icon: 'Sprout',
    category: 'Грант',
  },
  {
    title: 'Семейная ферма',
    amount: 'до ₽ 30 млн',
    desc: 'Поддержка семейных животноводческих ферм. Не менее 30% собственных средств или кредита. Создание рабочих мест — обязательное условие.',
    color: 'border-green-600',
    icon: 'Home',
    category: 'Грант',
  },
  {
    title: 'Грант СПСК',
    amount: 'до ₽ 70 млн',
    desc: 'Для сельскохозяйственных потребительских кооперативов на развитие МТБ: холодильники, фасовочные линии, транспорт, торговые объекты.',
    color: 'border-amber-600',
    icon: 'Tractor',
    category: 'Грант',
  },
  {
    title: 'Несвязанная поддержка растениеводства',
    amount: 'ставка по районам',
    desc: 'Субсидия на 1 га посевной площади зерновых, масличных, кормовых культур. Дифференцированная ставка в зависимости от зоны области.',
    color: 'border-cyan-600',
    icon: 'Wheat',
    category: 'Субсидия',
  },
  {
    title: 'Льготные кредиты АПК',
    amount: 'до 5% годовых',
    desc: 'Краткосрочные (до 1 года) и инвестиционные кредиты через уполномоченные банки. Субсидирование процентной ставки из федерального и областного бюджетов.',
    color: 'border-purple-600',
    icon: 'CreditCard',
    category: 'Кредит',
  },
  {
    title: 'Компенсация CAPEX',
    amount: 'до 25% затрат',
    desc: 'Возмещение части прямых понесённых затрат на создание и модернизацию объектов АПК. Тепличные комплексы, хранилища, животноводческие объекты.',
    color: 'border-rose-600',
    icon: 'Building2',
    category: 'Субсидия',
  },
];

const categoryColors: Record<string, string> = {
  'Грант': 'bg-green-50 text-green-700',
  'Субсидия': 'bg-blue-50 text-blue-700',
  'Кредит': 'bg-purple-50 text-purple-700',
};

export default function HomePage({ onNavigate }: HomePageProps) {
  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <section className="bg-gov-navy text-white px-8 py-14 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5"
          style={{ backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 39px,rgba(255,255,255,.3) 39px,rgba(255,255,255,.3) 40px),repeating-linear-gradient(90deg,transparent,transparent 39px,rgba(255,255,255,.3) 39px,rgba(255,255,255,.3) 40px)' }} />
        <div className="relative max-w-5xl">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xs font-mono uppercase tracking-widest text-amber-400 border border-amber-400/40 px-2 py-0.5 rounded-sm">
              АСУГ СХ СО
            </span>
            <span className="text-xs text-white/40 font-mono">Самарская область · 2026</span>
          </div>
          <h1 className="text-4xl font-black leading-tight mb-3 tracking-tight">
            Автоматизированная система<br />
            учёта и контроля расходования<br />
            грантов в сельском хозяйстве
          </h1>
          <p className="text-white/70 text-base mb-2 max-w-2xl leading-relaxed">
            Министерство сельского хозяйства и продовольствия Самарской области
          </p>
          <p className="text-white/55 text-sm mb-8 max-w-2xl leading-relaxed">
            Единая цифровая платформа для подачи заявок на гранты и субсидии, автоматизированного учёта расходования средств и контроля отчётности сельхозпроизводителей региона.
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => onNavigate('grants')}
              className="bg-amber-500 hover:bg-amber-400 text-white font-semibold px-6 py-3 rounded transition-colors flex items-center gap-2"
            >
              <Icon name="FilePlus" size={18} />
              Подать заявку
            </button>
            <button
              onClick={() => onNavigate('cabinet')}
              className="bg-white/10 hover:bg-white/20 text-white font-semibold px-6 py-3 rounded transition-colors border border-white/20 flex items-center gap-2"
            >
              <Icon name="User" size={18} />
              Личный кабинет
            </button>
            <a
              href="https://mcx.samregion.ru/category/gospodderzhka/mery-gospodderzhki-2026/"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white/10 hover:bg-white/20 text-white font-semibold px-6 py-3 rounded transition-colors border border-white/20 flex items-center gap-2"
            >
              <Icon name="ExternalLink" size={18} />
              Сайт МСХ Самарской области
            </a>
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
                  {s.trend} к 2025 году
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
              <a
                key={i}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block bg-white border border-gov-line rounded p-4 hover:border-blue-300 transition-colors animate-slide-up"
                style={{ animationDelay: `${i * 0.08}s` }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-mono text-muted-foreground">{item.date}</span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-sm bg-blue-50 text-blue-700">{item.tag}</span>
                </div>
                <h3 className="text-sm font-semibold text-gov-navy mb-1 leading-snug">{item.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{item.text}</p>
                <div className="flex items-center gap-1 mt-2 text-xs text-blue-600">
                  <Icon name="ExternalLink" size={11} />
                  mcx.samregion.ru
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Quick access + alert */}
        <div>
          <h2 className="text-base font-bold text-gov-navy mb-4 flex items-center gap-2">
            <Icon name="Zap" size={16} />
            Быстрый доступ
          </h2>
          <div className="space-y-2 mb-4">
            {[
              { label: 'Подать заявку на грант', icon: 'FilePlus', section: 'grants', color: 'text-blue-700 bg-blue-50 border-blue-200' },
              { label: 'Сдать отчёт', icon: 'FileCheck', section: 'reports', color: 'text-green-700 bg-green-50 border-green-200' },
              { label: 'Аналитика расходов', icon: 'BarChart2', section: 'dashboard', color: 'text-amber-700 bg-amber-50 border-amber-200' },
              { label: 'Документация', icon: 'BookOpen', section: 'help', color: 'text-purple-700 bg-purple-50 border-purple-200' },
            ].map((item) => (
              <button
                key={item.label}
                onClick={() => onNavigate(item.section)}
                className={`w-full border rounded p-3 text-left hover:shadow-sm transition-all ${item.color} flex items-center gap-3`}
              >
                <Icon name={item.icon} size={16} />
                <span className="text-sm font-semibold">{item.label}</span>
              </button>
            ))}
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded p-4 mb-4">
            <div className="flex items-start gap-2">
              <Icon name="Clock" size={15} className="text-amber-600 mt-0.5 shrink-0" />
              <div>
                <div className="text-xs font-semibold text-amber-800 mb-1">Приём заявок до 30 мая 2026</div>
                <div className="text-xs text-amber-700 leading-relaxed">
                  Агростартап, Семейная ферма, Грант СПСК. Авторизация через Госуслуги (ЕСИА).
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gov-navy text-white rounded p-4">
            <div className="text-xs font-semibold mb-1 text-amber-400">Контакт МСХ</div>
            <div className="text-sm font-bold mb-0.5">8 (846) 332-10-04</div>
            <div className="text-xs text-white/60">Пн–Пт, 9:00–18:00</div>
            <a href="https://mcx.samregion.ru" target="_blank" rel="noopener noreferrer" className="text-xs text-white/70 hover:text-white flex items-center gap-1 mt-2">
              <Icon name="ExternalLink" size={11} />
              mcx.samregion.ru
            </a>
          </div>
        </div>
      </div>

      {/* Support measures grid */}
      <section className="bg-white border-t border-gov-line px-8 py-8">
        <div className="max-w-5xl">
          <h2 className="text-base font-bold text-gov-navy mb-5 flex items-center gap-2">
            <Icon name="Award" size={16} />
            Меры государственной поддержки АПК 2026
            <a
              href="https://mcx.samregion.ru/category/gospodderzhka/mery-gospodderzhki-2026/"
              target="_blank"
              rel="noopener noreferrer"
              className="ml-auto text-xs text-blue-600 hover:underline flex items-center gap-1 font-normal"
            >
              Все меры на сайте МСХ
              <Icon name="ExternalLink" size={12} />
            </a>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {supportMeasures.map((m, i) => (
              <div
                key={i}
                onClick={() => onNavigate('grants')}
                className={`bg-white border-l-4 ${m.color} border border-gov-line rounded p-4 cursor-pointer hover:shadow-sm transition-all animate-slide-up`}
                style={{ animationDelay: `${i * 0.07}s` }}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Icon name={m.icon} size={15} className="text-gov-navy" />
                    <span className="text-sm font-bold text-gov-navy leading-snug">{m.title}</span>
                  </div>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-sm shrink-0 ml-2 ${categoryColors[m.category]}`}>
                    {m.category}
                  </span>
                </div>
                <div className="text-sm font-bold text-gov-gold mb-2">{m.amount}</div>
                <p className="text-xs text-muted-foreground leading-relaxed">{m.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}