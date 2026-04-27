import Icon from '@/components/ui/icon';

const leadership = [
  {
    name: 'Министр',
    role: 'Министр сельского хозяйства и продовольствия Самарской области',
    phone: '8 (846) 332-10-04',
    email: 'mcx@samregion.ru',
    initials: 'МИН',
  },
  {
    name: 'Первый заместитель министра',
    role: 'Курирует направления растениеводства и государственной поддержки',
    phone: '8 (846) 332-10-04',
    email: 'mcx@samregion.ru',
    initials: 'ЗМ',
  },
  {
    name: 'Заместитель министра',
    role: 'Животноводство, переработка, развитие сельских территорий',
    phone: '8 (846) 332-10-04',
    email: 'mcx@samregion.ru',
    initials: 'ЗМ',
  },
];

const departments = [
  { name: 'Отдел государственной поддержки', icon: 'Award', desc: 'Гранты, субсидии, льготное кредитование' },
  { name: 'Отдел растениеводства', icon: 'Wheat', desc: 'Производство зерновых, масличных, технических культур' },
  { name: 'Отдел животноводства', icon: 'Tractor', desc: 'Поддержка и развитие животноводческой отрасли' },
  { name: 'Отдел сельских территорий', icon: 'Home', desc: 'Комплексное развитие сельских территорий' },
  { name: 'Отдел цифровизации АПК', icon: 'Monitor', desc: 'ИТ-сопровождение, АСУГ СХ СО, интеграции' },
  { name: 'Финансово-правовой отдел', icon: 'Scale', desc: 'Правовое сопровождение, бюджет, отчётность' },
];

const facts = [
  { value: '3,9 млн', label: 'Жителей Самарской области' },
  { value: '37', label: 'Муниципалитетов в зоне поддержки' },
  { value: '6', label: 'Видов государственных грантов' },
  { value: '10', label: 'Правил автопроверки отчётов' },
];

export default function AboutPage() {
  return (
    <div className="animate-fade-in max-w-5xl mx-auto px-6 lg:px-12 py-8">

      {/* Заголовок */}
      <h1 className="text-2xl font-bold text-gov-navy mb-1">О министерстве</h1>
      <p className="text-muted-foreground mb-8">Министерство сельского хозяйства и продовольствия Самарской области</p>

      {/* Миссия */}
      <div className="bg-white border border-gov-line rounded p-6 mb-6 flex flex-col lg:flex-row gap-6">
        <div className="flex-1">
          <h2 className="text-lg font-bold text-gov-navy mb-3 flex items-center gap-2">
            <Icon name="Target" size={18} className="text-gov-navy" />
            Миссия и цели
          </h2>
          <p className="text-sm text-foreground leading-relaxed mb-3">
            Министерство сельского хозяйства и продовольствия Самарской области является исполнительным органом государственной власти, осуществляющим государственное управление в сфере агропромышленного комплекса региона.
          </p>
          <p className="text-sm text-foreground leading-relaxed mb-3">
            Приоритетные направления работы — обеспечение продовольственной безопасности, повышение конкурентоспособности регионального АПК, поддержка малых форм хозяйствования, развитие сельских территорий и цифровизация отрасли.
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            АСУГ СХ СО — автоматизированная система учёта и контроля расходования грантов — разработана в рамках программы цифровой трансформации государственного управления.
          </p>
        </div>
        <div className="lg:w-64 grid grid-cols-2 gap-3 content-start">
          {facts.map((f) => (
            <div key={f.label} className="bg-secondary rounded p-3 text-center">
              <div className="text-xl font-black text-gov-navy">{f.value}</div>
              <div className="text-xs text-muted-foreground leading-snug mt-0.5">{f.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* История */}
      <div className="bg-white border border-gov-line rounded p-6 mb-6">
        <h2 className="text-lg font-bold text-gov-navy mb-4 flex items-center gap-2">
          <Icon name="History" size={18} className="text-gov-navy" />
          История
        </h2>
        <div className="relative border-l-2 border-gov-line pl-6 space-y-5">
          {[
            { year: '1991', text: 'Образование Министерства сельского хозяйства и продовольствия Самарской области как самостоятельного органа государственной власти.' },
            { year: '2006', text: 'Переход к программному методу государственной поддержки АПК — утверждена первая областная целевая программа развития сельского хозяйства.' },
            { year: '2013', text: 'Запуск механизмов грантовой поддержки фермерских хозяйств: «Начинающий фермер» и «Семейная животноводческая ферма».' },
            { year: '2021', text: 'Начало работы по цифровой трансформации государственного управления в АПК. Разработка технического задания на АСУГ СХ СО.' },
            { year: '2024', text: 'Запуск пилотной версии АСУГ СХ СО. Перевод приёма заявок на гранты в электронный формат через портал Госуслуги.' },
            { year: '2026', text: 'Полноценный запуск АСУГ СХ СО. Интеграция с ЕСИА, ФГИС «Меркурий», ЭДО «Диадок» и реестром ФНС.' },
          ].map((e, i) => (
            <div key={i} className="relative">
              <div className="absolute -left-8 w-4 h-4 rounded-full bg-gov-navy border-2 border-white" />
              <div className="text-xs font-bold text-gov-navy mb-0.5">{e.year}</div>
              <div className="text-sm text-foreground leading-relaxed">{e.text}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Структура управления */}
      <div className="mb-6">
        <h2 className="text-lg font-bold text-gov-navy mb-4 flex items-center gap-2">
          <Icon name="Sitemap" size={18} className="text-gov-navy" />
          Структура управления
        </h2>

        {/* Руководство */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {leadership.map((l, i) => (
            <div key={i} className="bg-white border border-gov-line rounded p-4 animate-slide-up" style={{ animationDelay: `${i * 0.07}s` }}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-full bg-gov-navy flex items-center justify-center text-white font-bold text-sm shrink-0">
                  {l.initials}
                </div>
                <div>
                  <div className="text-sm font-bold text-gov-navy leading-snug">{l.name}</div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed mb-3">{l.role}</p>
              <div className="space-y-1">
                <a href={`tel:${l.phone}`} className="flex items-center gap-1.5 text-xs text-gov-navy hover:underline">
                  <Icon name="Phone" size={12} />
                  {l.phone}
                </a>
                <a href={`mailto:${l.email}`} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-gov-navy">
                  <Icon name="Mail" size={12} />
                  {l.email}
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Отделы */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {departments.map((d, i) => (
            <div key={d.name} className="bg-white border border-gov-line rounded p-4 flex items-start gap-3 animate-slide-up" style={{ animationDelay: `${i * 0.06}s` }}>
              <div className="w-8 h-8 rounded bg-secondary flex items-center justify-center shrink-0">
                <Icon name={d.icon} size={16} className="text-gov-navy" />
              </div>
              <div>
                <div className="text-sm font-semibold text-gov-navy leading-snug">{d.name}</div>
                <div className="text-xs text-muted-foreground mt-0.5 leading-snug">{d.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Контакты */}
      <div className="bg-gov-navy text-white rounded p-6">
        <h2 className="text-base font-bold mb-4 flex items-center gap-2">
          <Icon name="MapPin" size={16} />
          Реквизиты и контакты
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          <div className="space-y-2">
            <div className="flex items-start gap-2 text-white/80">
              <Icon name="MapPin" size={14} className="mt-0.5 shrink-0 text-amber-400" />
              <span>443006, Самара, ул. Молодогвардейская, 210</span>
            </div>
            <div className="flex items-center gap-2 text-white/80">
              <Icon name="Phone" size={14} className="text-amber-400" />
              <a href="tel:88463321004" className="hover:text-white">8 (846) 332-10-04</a>
            </div>
            <div className="flex items-center gap-2 text-white/80">
              <Icon name="Mail" size={14} className="text-amber-400" />
              <a href="mailto:mcx@samregion.ru" className="hover:text-white">mcx@samregion.ru</a>
            </div>
            <div className="flex items-center gap-2 text-white/80">
              <Icon name="Globe" size={14} className="text-amber-400" />
              <a href="https://mcx.samregion.ru" target="_blank" rel="noopener noreferrer" className="hover:text-white">mcx.samregion.ru</a>
            </div>
          </div>
          <div className="space-y-2 text-white/70 text-xs">
            <div><span className="text-white/50">Режим работы:</span> Пн–Пт, 9:00–18:00, обед 13:00–14:00</div>
            <div><span className="text-white/50">Приёмная:</span> Пн–Чт 10:00–17:00, Пт 10:00–16:00</div>
            <div><span className="text-white/50">ИНН:</span> 6316067908</div>
            <div><span className="text-white/50">ОГРН:</span> 1026300968038</div>
          </div>
        </div>
      </div>
    </div>
  );
}