import Icon from '@/components/ui/icon';

const monthlyData = [
  { month: 'Янв', amount: 280, count: 12 },
  { month: 'Фев', amount: 420, count: 18 },
  { month: 'Мар', amount: 350, count: 15 },
  { month: 'Апр', amount: 610, count: 24 },
  { month: 'Май', amount: 540, count: 21 },
  { month: 'Июн', amount: 720, count: 28 },
  { month: 'Июл', amount: 680, count: 26 },
  { month: 'Авг', amount: 890, count: 34 },
  { month: 'Сен', amount: 760, count: 29 },
  { month: 'Окт', amount: 950, count: 38 },
  { month: 'Ноя', amount: 820, count: 32 },
  { month: 'Дек', amount: 1050, count: 42 },
];

const maxAmount = Math.max(...monthlyData.map((d) => d.amount));

const byType = [
  { name: 'Агростартап', value: 42, color: '#1e3a8a', amount: '₽ 1,8 млрд' },
  { name: 'Семейная ферма', value: 35, color: '#15803d', amount: '₽ 1,5 млрд' },
  { name: 'Развитие МТБ', value: 23, color: '#b45309', amount: '₽ 0,9 млрд' },
];

const topRegions = [
  { name: 'Краснодарский край', amount: '₽ 480 млн', count: 94, progress: 92 },
  { name: 'Ставропольский край', amount: '₽ 340 млн', count: 67, progress: 65 },
  { name: 'Ростовская область', amount: '₽ 290 млн', count: 58, progress: 56 },
  { name: 'Республика Татарстан', amount: '₽ 240 млн', count: 47, progress: 46 },
  { name: 'Воронежская область', amount: '₽ 195 млн', count: 39, progress: 38 },
];

const kpis = [
  { label: 'Бюджет 2026, план', value: '₽ 8,5 млрд', icon: 'Target', color: 'text-blue-700' },
  { label: 'Освоено', value: '₽ 4,2 млрд', sub: '49%', icon: 'TrendingUp', color: 'text-green-700' },
  { label: 'Остаток', value: '₽ 4,3 млрд', icon: 'Wallet', color: 'text-amber-700' },
  { label: 'Получателей', value: '1 847', sub: '+8% к 2025', icon: 'Users', color: 'text-purple-700' },
];

export default function DashboardPage() {
  return (
    <div className="animate-fade-in max-w-5xl px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gov-navy flex items-center gap-2">
            <Icon name="BarChart2" size={20} />
            Дашборд расходования грантов
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">Актуальные данные по состоянию на 27 апреля 2026</p>
        </div>
        <div className="flex gap-2">
          <select className="text-xs border border-gov-line rounded px-3 py-1.5 bg-white focus:outline-none">
            <option>2026 год</option>
            <option>2025 год</option>
            <option>2024 год</option>
          </select>
          <button className="text-xs bg-secondary text-gov-navy px-3 py-1.5 rounded border border-gov-line hover:bg-gov-navy hover:text-white transition-colors flex items-center gap-1.5">
            <Icon name="Download" size={13} />
            Экспорт
          </button>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {kpis.map((k, i) => (
          <div key={k.label} className="bg-white border border-gov-line rounded p-4 stat-card animate-slide-up" style={{ animationDelay: `${i * 0.07}s` }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground leading-snug">{k.label}</span>
              <Icon name={k.icon} size={16} className={k.color} />
            </div>
            <div className="text-xl font-black text-gov-navy">{k.value}</div>
            {k.sub && <div className="text-xs text-gov-green font-semibold mt-0.5">{k.sub}</div>}
          </div>
        ))}
      </div>

      {/* Overall progress */}
      <div className="bg-white border border-gov-line rounded p-5 mb-5">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-semibold text-gov-navy">Общее освоение бюджета 2026</span>
          <span className="text-sm font-black text-gov-navy">49%</span>
        </div>
        <div className="progress-bar mb-1">
          <div className="progress-fill" style={{ width: '49%' }} />
        </div>
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>₽ 4,2 млрд освоено</span>
          <span>₽ 8,5 млрд план</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
        {/* Bar chart */}
        <div className="lg:col-span-2 bg-white border border-gov-line rounded p-5">
          <h3 className="text-sm font-bold text-gov-navy mb-4 flex items-center gap-2">
            <Icon name="BarChart" size={15} />
            Ежемесячное расходование, млн ₽
          </h3>
          <div className="flex items-end gap-1.5 h-36">
            {monthlyData.map((d, i) => (
              <div key={d.month} className="flex-1 flex flex-col items-center gap-1 group">
                <div
                  className="w-full bg-gov-navy rounded-t transition-all hover:bg-amber-500 cursor-pointer"
                  style={{ height: `${(d.amount / maxAmount) * 100}%`, animationDelay: `${i * 0.04}s` }}
                  title={`${d.month}: ₽${d.amount} млн`}
                />
                <span className="text-xs text-muted-foreground">{d.month}</span>
              </div>
            ))}
          </div>
        </div>

        {/* By type */}
        <div className="bg-white border border-gov-line rounded p-5">
          <h3 className="text-sm font-bold text-gov-navy mb-4 flex items-center gap-2">
            <Icon name="PieChart" size={15} />
            По видам грантов
          </h3>
          <div className="space-y-4">
            {byType.map((t) => (
              <div key={t.name}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium text-foreground">{t.name}</span>
                  <span className="text-muted-foreground">{t.value}%</span>
                </div>
                <div className="progress-bar mb-1">
                  <div className="h-full rounded-full transition-all" style={{ width: `${t.value}%`, background: t.color }} />
                </div>
                <div className="text-xs text-muted-foreground">{t.amount}</div>
              </div>
            ))}
          </div>

          {/* Pie visual */}
          <div className="mt-4 flex justify-center">
            <svg width="100" height="100" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="15.9" fill="#f8fafc" />
              {(() => {
                let offset = 0;
                const circumference = 99.9;
                return byType.map((t) => {
                  const dash = (t.value / 100) * circumference;
                  const gap = circumference - dash;
                  const el = (
                    <circle
                      key={t.name}
                      cx="18" cy="18" r="15.9"
                      fill="none"
                      stroke={t.color}
                      strokeWidth="3.5"
                      strokeDasharray={`${dash} ${gap}`}
                      strokeDashoffset={-offset}
                      transform="rotate(-90 18 18)"
                    />
                  );
                  offset += dash;
                  return el;
                });
              })()}
              <text x="18" y="20" textAnchor="middle" fontSize="5" fontWeight="bold" fill="#1e3a8a">100%</text>
            </svg>
          </div>
        </div>
      </div>

      {/* Regions */}
      <div className="bg-white border border-gov-line rounded p-5">
        <h3 className="text-sm font-bold text-gov-navy mb-4 flex items-center gap-2">
          <Icon name="MapPin" size={15} />
          Топ регионов по объёму грантов
        </h3>
        <div className="space-y-3">
          {topRegions.map((r, i) => (
            <div key={r.name} className="flex items-center gap-4 animate-slide-up" style={{ animationDelay: `${i * 0.06}s` }}>
              <div className="w-5 text-xs font-bold text-muted-foreground text-right">{i + 1}</div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium text-foreground truncate">{r.name}</span>
                  <span className="font-semibold text-gov-navy ml-2 shrink-0">{r.amount}</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${r.progress}%` }} />
                </div>
              </div>
              <div className="text-xs text-muted-foreground w-16 text-right">{r.count} грантов</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
