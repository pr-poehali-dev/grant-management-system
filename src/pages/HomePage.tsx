import { useState } from 'react';
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

// Услуги и сервисы — нейтральный гос-стиль (белый/серый, акценты — синий/красный)
const services = [
  {
    title:    'Подать заявку на грант',
    desc:     'Агростартап, Семейная ферма, Грант СПСК — оформление через ЕСИА',
    icon:     'FilePlus',
    section:  'grants',
    badge:    'До 30 мая',
    badgeCls: 'badge-red',
  },
  {
    title:    'Сдать отчётность',
    desc:     'Промежуточные и итоговые отчёты о расходовании грантовых средств',
    icon:     'FileCheck',
    section:  'reports',
    badge:    'Доступно',
    badgeCls: 'badge-blue',
  },
  {
    title:    'Проверить статус заявки',
    desc:     'Отслеживание хода рассмотрения, история решений, комментарии',
    icon:     'Search',
    section:  'grants',
    badge:    'Доступно',
    badgeCls: 'badge-blue',
  },
  {
    title:    'Аналитика расходов',
    desc:     'Дашборд с графиками расходования средств и KPI-показателями',
    icon:     'BarChart2',
    section:  'dashboard',
    badge:    'Доступно',
    badgeCls: 'badge-blue',
  },
  {
    title:    'Документы и шаблоны',
    desc:     'Нормативные акты, шаблоны форм, статистические сборники',
    icon:     'FolderOpen',
    section:  'documents',
    badge:    'Апрель 2026',
    badgeCls: 'badge-gray',
  },
  {
    title:    'Личный кабинет',
    desc:     'Управление профилем, история заявок, уведомления о сроках',
    icon:     'User',
    section:  'cabinet',
    badge:    'ЕСИА',
    badgeCls: 'badge-blue',
  },
];

const news = [
  {
    date:    '26 апр 2026',
    tag:     'Важно',
    tagCls:  'badge-red',
    title:   'Открыт приём заявок на гранты «Агростартап» и «Семейная ферма» 2026 года',
    text:    'Минсельхозпрод Самарской области объявляет о начале конкурсного отбора. Заявки принимаются до 30 мая 2026 года.',
    section: 'news',
  },
  {
    date:    '20 апр 2026',
    tag:     'Субсидии',
    tagCls:  'badge-blue',
    title:   'Открыт приём заявок на несвязанную поддержку растениеводства',
    text:    'Субсидия на возмещение затрат на агротехнические работы. Ставки дифференцированы по районам области.',
    section: 'news',
  },
  {
    date:    '15 апр 2026',
    tag:     'Кредиты',
    tagCls:  'badge-blue',
    title:   'Расширен перечень банков для льготных кредитов АПК до 5% годовых',
    text:    'Кредиты доступны для производителей зерна, масличных, сахарной свёклы и животноводческой продукции.',
    section: 'news',
  },
];

const measures = [
  { title: 'Агростартап',           amount: 'до ₽ 7 млн',        cat: 'Грант',    icon: 'Sprout'    },
  { title: 'Семейная ферма',        amount: 'до ₽ 30 млн',       cat: 'Грант',    icon: 'Home'      },
  { title: 'Грант СПСК',            amount: 'до ₽ 70 млн',       cat: 'Грант',    icon: 'Tractor'   },
  { title: 'Несвязанная поддержка', amount: 'ставка по районам', cat: 'Субсидия', icon: 'Wheat'     },
  { title: 'Компенсация CAPEX',     amount: 'до 25% затрат',     cat: 'Субсидия', icon: 'Building2' },
  { title: 'Льготный кредит АПК',   amount: 'до 5% годовых',     cat: 'Кредит',   icon: 'CreditCard'},
];

const RED  = '#D52B1E';
const BLUE = '#003791';

/* ── Компонент ───────────────────────────────────────────── */

export default function HomePage({ onNavigate }: HomePageProps) {
  const [search, setSearch] = useState('');

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) onNavigate('news');
  };

  return (
    <div className="animate-fade-in">

      {/* ══ HERO ════════════════════════════════════════════ */}
      <section className="bg-gov-navy text-white px-6 lg:px-12 py-10 relative overflow-hidden">
        <div className="relative max-w-5xl mx-auto">
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <span className="text-xs text-white/55">Самарская область · 2026</span>
          </div>

          <h1 className="text-2xl lg:text-3xl font-bold leading-snug mb-3 max-w-3xl">
            Автоматизированная система учёта и контроля<br className="hidden sm:block" />
            расходования грантов в сельском хозяйстве
          </h1>

          <p className="text-white/65 text-base mb-6 max-w-2xl">
            Министерство сельского хозяйства и продовольствия Самарской области
          </p>

          {/* Виджет поиска */}
          <form onSubmit={onSearch} className="flex max-w-xl mb-6 bg-white rounded overflow-hidden">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Поиск по сервисам, документам, новостям..."
              className="flex-1 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
            <button
              type="submit"
              className="px-5 text-white font-semibold text-sm flex items-center gap-2 hover:opacity-90 transition-opacity"
              style={{ backgroundColor: RED }}
            >
              <Icon name="Search" size={16} />
              <span className="hidden sm:inline">Найти</span>
            </button>
          </form>

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
      </section>

      {/* ══ Статистика ════════════════════════════════════ */}
      <section className="bg-white border-b border-gov-line">
        <div className="max-w-5xl mx-auto px-6 lg:px-12 py-5 grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s) => (
            <div key={s.label} className="stat-card pl-4 py-2">
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

      {/* ══ Услуги и сервисы (нейтральный гос-стиль) ══════ */}
      <section className="bg-white border-b border-gov-line px-6 lg:px-12 py-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-gov-navy flex items-center gap-2">
              <span className="w-1 h-5 rounded-sm" style={{ backgroundColor: RED }} />
              Услуги и сервисы
            </h2>
            <button onClick={() => onNavigate('help')} className="text-xs text-gov-navy hover:underline flex items-center gap-1">
              Инструкции <Icon name="ArrowRight" size={12} />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-0 border border-gov-line rounded overflow-hidden">
            {services.map((s, i) => (
              <button
                key={s.title}
                onClick={() => onNavigate(s.section)}
                className="bg-white text-left p-5 border-b lg:border-b border-gov-line border-r-0 lg:border-r hover:bg-secondary/40 transition-colors group animate-slide-up relative"
                style={{ animationDelay: `${i * 0.04}s` }}
              >
                {/* Hover-индикатор слева — синяя полоска */}
                <span
                  className="absolute left-0 top-0 bottom-0 w-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ backgroundColor: BLUE }}
                />
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded border border-gov-line bg-secondary/50 flex items-center justify-center">
                    <Icon name={s.icon} size={18} className="text-gov-navy" />
                  </div>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-sm shrink-0 ${s.badgeCls}`}>{s.badge}</span>
                </div>
                <div className="text-sm font-bold text-foreground mb-1 leading-snug">{s.title}</div>
                <p className="text-xs text-muted-foreground leading-relaxed mb-3">{s.desc}</p>
                <div className="flex items-center gap-1 text-xs font-semibold" style={{ color: BLUE }}>
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
            <h2 className="text-lg font-bold text-gov-navy flex items-center gap-2">
              <span className="w-1 h-5 rounded-sm" style={{ backgroundColor: RED }} />
              Новости и объявления
            </h2>
            <button
              onClick={() => onNavigate('news')}
              className="text-xs text-gov-navy hover:underline flex items-center gap-1"
            >
              Все новости <Icon name="ArrowRight" size={12} />
            </button>
          </div>

          <div className="space-y-2 border border-gov-line rounded overflow-hidden">
            {news.map((item, i) => (
              <div
                key={i}
                onClick={() => onNavigate(item.section)}
                className="bg-white p-4 hover:bg-secondary/40 transition-colors cursor-pointer animate-slide-up border-b border-gov-line last:border-b-0"
                style={{ animationDelay: `${i * 0.07}s` }}
              >
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className="text-xs text-muted-foreground font-mono">{item.date}</span>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-sm ${item.tagCls}`}>{item.tag}</span>
                </div>
                <h3 className="text-sm font-bold text-foreground mb-1 leading-snug">{item.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{item.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Боковая колонка */}
        <div className="space-y-4">

          {/* Уведомление — красный акцент (предупреждение) */}
          <div className="bg-white border border-gov-line rounded overflow-hidden">
            <div className="px-4 py-2 text-white text-xs font-bold flex items-center gap-2" style={{ backgroundColor: RED }}>
              <Icon name="AlertTriangle" size={14} />
              Срок подачи заявок
            </div>
            <div className="p-4">
              <div className="text-sm text-foreground leading-relaxed mb-3">
                Агростартап, Семейная ферма, СПСК — <strong>до 30 мая 2026</strong>.
                Авторизация через Госуслуги (ЕСИА).
              </div>
              <button
                onClick={() => onNavigate('grants')}
                className="w-full text-sm text-white font-semibold py-2 rounded hover:opacity-90 transition-opacity flex items-center justify-center gap-1.5"
                style={{ backgroundColor: BLUE }}
              >
                <Icon name="FilePlus" size={13} />
                Подать заявку
              </button>
            </div>
          </div>

          {/* Меры господдержки */}
          <div className="bg-white border border-gov-line rounded overflow-hidden">
            <div className="px-4 py-2 bg-secondary border-b border-gov-line text-xs font-bold text-gov-navy flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Icon name="Award" size={13} />
                Меры господдержки 2026
              </span>
              <a
                href="https://mcx.samregion.ru/category/gospodderzhka/mery-gospodderzhki-2026/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gov-navy hover:underline flex items-center gap-1 font-normal"
              >
                Все <Icon name="ExternalLink" size={11} />
              </a>
            </div>
            <div>
              {measures.map((m, i) => (
                <button
                  key={m.title}
                  onClick={() => onNavigate('grants')}
                  className="w-full p-3 text-left hover:bg-secondary/40 transition-colors flex items-center gap-3 animate-slide-up border-b border-gov-line last:border-b-0"
                  style={{ animationDelay: `${i * 0.04}s` }}
                >
                  <Icon name={m.icon} size={15} className="text-gov-navy shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-foreground truncate">{m.title}</div>
                    <div className="text-xs text-muted-foreground">{m.amount}</div>
                  </div>
                  <span className="text-xs px-1.5 py-0.5 rounded-sm shrink-0 badge-blue">{m.cat}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Контакт */}
          <div className="bg-gov-navy text-white rounded p-4">
            <div className="text-xs font-semibold text-white/55 mb-1 uppercase tracking-wide">Минсельхозпрод СО</div>
            <a href="tel:88463321004" className="block text-base font-bold text-white hover:text-white/80 transition-colors mb-0.5">
              8 (846) 332-10-04
            </a>
            <div className="text-xs text-white/55 mb-3">Пн–Пт, 9:00–18:00</div>
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