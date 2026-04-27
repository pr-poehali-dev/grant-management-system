import { useState } from 'react';
import Icon from '@/components/ui/icon';

const allNews = [
  {
    id: 1,
    date: '26 апр 2026',
    category: 'Гранты',
    catCls: 'badge-status-approved',
    title: 'Открыт приём заявок на гранты «Агростартап» и «Семейная ферма» 2026 года',
    text: 'Минсельхозпрод Самарской области объявляет о начале конкурсного отбора на получение грантов в рамках федерального проекта «Создание системы поддержки фермеров и развитие сельской кооперации». Срок подачи заявок — до 30 мая 2026 года включительно.',
    tags: ['Агростартап', 'Семейная ферма', '2026'],
    url: 'https://mcx.samregion.ru/category/gospodderzhka/mery-gospodderzhki-2026/',
    important: true,
  },
  {
    id: 2,
    date: '22 апр 2026',
    category: 'Субсидии',
    catCls: 'badge-status-new',
    title: 'Открыт приём заявок на несвязанную поддержку растениеводства',
    text: 'Субсидия предоставляется на возмещение части затрат на проведение агротехнологических работ на посевах сельскохозяйственных культур. Ставки дифференцированы по природно-климатическим зонам Самарской области.',
    tags: ['Растениеводство', 'Субсидия'],
    url: 'https://mcx.samregion.ru/category/gospodderzhka/mery-gospodderzhki-2026/',
    important: false,
  },
  {
    id: 3,
    date: '18 апр 2026',
    category: 'Кооперация',
    catCls: 'badge-status-approved',
    title: 'Расширены критерии отбора для грантов сельскохозяйственным кооперативам (СПСК)',
    text: 'В 2026 году к конкурсу на грант для СПСК допускаются кооперативы с минимальным числом членов — не менее 10. Размер гранта увеличен до ₽ 70 млн. Приоритет отдаётся кооперативам, реализующим продукцию через торговые сети и рынки сбыта.',
    tags: ['СПСК', 'Кооператив', 'Грант'],
    url: 'https://mcx.samregion.ru/category/gospodderzhka/mery-gospodderzhki-2026/',
    important: false,
  },
  {
    id: 4,
    date: '15 апр 2026',
    category: 'Кредиты',
    catCls: 'badge-status-new',
    title: 'Расширен перечень банков — участников программы льготного кредитования АПК',
    text: 'В программу льготного кредитования по ставке до 5% годовых включены новые банки-партнёры. Краткосрочные кредиты доступны для производителей зерновых, масличных культур, сахарной свёклы, а также предприятий молочного и мясного животноводства.',
    tags: ['Кредиты', 'Банки', 'АПК'],
    url: 'https://mcx.samregion.ru/category/gospodderzhka/mery-gospodderzhki-2026/',
    important: false,
  },
  {
    id: 5,
    date: '10 апр 2026',
    category: 'Компенсация CAPEX',
    catCls: 'badge-status-review',
    title: 'Приём заявок на возмещение затрат на создание объектов АПК (CAPEX)',
    text: 'Компенсация прямых понесённых затрат на создание и модернизацию объектов АПК — тепличные комплексы, картофеле- и овощехранилища, животноводческие объекты. Возмещение — до 25% фактических затрат.',
    tags: ['CAPEX', 'Строительство', 'Субсидия'],
    url: 'https://mcx.samregion.ru/category/gospodderzhka/mery-gospodderzhki-2026/',
    important: false,
  },
  {
    id: 6,
    date: '05 апр 2026',
    category: 'Цифровизация',
    catCls: 'badge-status-completed',
    title: 'АСУГ СХ СО: завершена интеграция с ФГИС «Меркурий» и ЭДО «Диадок»',
    text: 'Автоматизированная система учёта и контроля расходования грантов прошла полную интеграцию с федеральными информационными системами. Данные о поголовье скота и объёмах производства теперь автоматически верифицируются при проверке отчётности.',
    tags: ['АСУГ', 'Интеграция', 'Цифровизация'],
    url: '#',
    important: false,
  },
];

const categories = ['Все', 'Гранты', 'Субсидии', 'Кооперация', 'Кредиты', 'Компенсация CAPEX', 'Цифровизация'];

export default function NewsPage() {
  const [active, setActive] = useState('Все');
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<number | null>(null);

  const filtered = allNews.filter((n) => {
    const matchCat = active === 'Все' || n.category === active;
    const matchSearch = !search || n.title.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="animate-fade-in max-w-5xl mx-auto px-6 lg:px-12 py-8">
      <h1 className="text-2xl font-bold text-gov-navy mb-1">Новости и публикации</h1>
      <p className="text-muted-foreground mb-6">Пресс-релизы, анонсы и официальные объявления Минсельхозпрода Самарской области</p>

      {/* Поиск + фильтры */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Icon name="Search" size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-gov-line rounded text-sm bg-white focus:outline-none focus:border-gov-navy"
            placeholder="Поиск по новостям..."
          />
        </div>
        <a
          href="https://mcx.samregion.ru/category/gospodderzhka/mery-gospodderzhki-2026/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm bg-gov-navy text-white px-4 py-2 rounded hover:opacity-90 transition-opacity flex items-center gap-1.5 whitespace-nowrap"
        >
          <Icon name="ExternalLink" size={14} />
          Все новости МСХ
        </a>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setActive(c)}
            className={`text-xs px-3 py-1.5 rounded border font-medium transition-colors ${active === c ? 'bg-gov-navy text-white border-gov-navy' : 'bg-white text-muted-foreground border-gov-line hover:border-gov-navy hover:text-gov-navy'}`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Важное объявление */}
      {filtered.some(n => n.important) && (
        <div className="bg-red-50 border border-red-200 rounded p-4 mb-5 flex items-start gap-3">
          <Icon name="Megaphone" size={18} className="text-red-600 shrink-0 mt-0.5" />
          <div>
            <div className="text-sm font-bold text-red-700 mb-0.5">Важное объявление</div>
            <div className="text-sm text-red-700">{filtered.find(n => n.important)?.title}</div>
            <div className="text-xs text-red-500 mt-1">Срок подачи заявок — до 30 мая 2026 года</div>
          </div>
        </div>
      )}

      {/* Список новостей */}
      <div className="space-y-3">
        {filtered.map((item, i) => (
          <div
            key={item.id}
            className="bg-white border border-gov-line rounded overflow-hidden animate-slide-up"
            style={{ animationDelay: `${i * 0.06}s` }}
          >
            <button
              onClick={() => setExpanded(expanded === item.id ? null : item.id)}
              className="w-full text-left p-5 hover:bg-secondary/30 transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="text-xs text-muted-foreground">{item.date}</span>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-sm ${item.catCls}`}>{item.category}</span>
                    {item.important && (
                      <span className="text-xs font-bold text-red-600 flex items-center gap-0.5">
                        <Icon name="AlertCircle" size={11} />
                        Важно
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm font-semibold text-gov-navy leading-snug">{item.title}</h3>
                </div>
                <Icon name={expanded === item.id ? 'ChevronUp' : 'ChevronDown'} size={16} className="text-muted-foreground shrink-0 mt-1" />
              </div>
            </button>

            {expanded === item.id && (
              <div className="px-5 pb-5 border-t border-gov-line animate-fade-in">
                <p className="text-sm text-foreground leading-relaxed mt-3 mb-3">{item.text}</p>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex flex-wrap gap-1.5">
                    {item.tags.map((t) => (
                      <span key={t} className="text-xs bg-secondary px-2 py-0.5 rounded text-muted-foreground">{t}</span>
                    ))}
                  </div>
                  {item.url !== '#' && (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-auto text-xs text-gov-navy hover:underline flex items-center gap-1"
                    >
                      <Icon name="ExternalLink" size={12} />
                      Источник: mcx.samregion.ru
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <Icon name="Search" size={36} className="mx-auto mb-2 opacity-30" />
          <div className="text-sm">Ничего не найдено</div>
        </div>
      )}
    </div>
  );
}
