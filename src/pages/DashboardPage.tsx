import { useState, useEffect } from 'react';
import Icon from '@/components/ui/icon';

const API_ANALYTICS = 'https://functions.poehali.dev/4463947b-5c46-4600-a3ef-a7916a7aa771';

interface KPI {
  total_amount: number; total_used: number; remainder: number;
  used_pct: number; grants_count: number; producers_count: number;
}

interface DistrictRow {
  name: string; type: string; grants_count: number;
  producers_count: number; total_amount: number;
}

interface GrantTypeRow {
  name: string; code: string; grants_count: number;
  total_amount: number; total_used: number;
}

interface CategoryRow {
  name: string; code: string; items_count: number;
  quantity: string | number; total_price: number; avg_price: number;
}

interface AnalyticsData {
  kpi: KPI;
  by_status: Record<string, number>;
  by_grant_type: GrantTypeRow[];
  by_district: DistrictRow[];
  by_category: CategoryRow[];
  by_month: Array<{ month: string; reports_count: number; total_amount: number }>;
  check_summary: Record<string, number>;
}

const formatRub = (n: number) => {
  if (n >= 1_000_000_000) return `₽ ${(n / 1_000_000_000).toFixed(1)} млрд`;
  if (n >= 1_000_000) return `₽ ${(n / 1_000_000).toFixed(1)} млн`;
  if (n >= 1_000) return `₽ ${(n / 1_000).toFixed(0)} тыс.`;
  return `₽ ${n.toLocaleString('ru-RU')}`;
};

const formatRubFull = (n: number) => `₽ ${n.toLocaleString('ru-RU')}`;

export default function DashboardPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(API_ANALYTICS)
      .then((r) => r.json())
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="animate-fade-in max-w-6xl mx-auto px-8 py-12 text-center text-muted-foreground">
        <Icon name="Loader2" size={28} className="animate-spin mx-auto mb-3 opacity-50" />
        Загрузка аналитики...
      </div>
    );
  }

  if (!data) {
    return (
      <div className="animate-fade-in max-w-6xl mx-auto px-8 py-12 text-center text-muted-foreground">
        <Icon name="AlertCircle" size={28} className="mx-auto mb-3 opacity-50" />
        Не удалось загрузить данные
      </div>
    );
  }

  const { kpi, by_grant_type, by_district, by_category, check_summary } = data;
  const maxDistrict = Math.max(1, ...by_district.map((d) => d.total_amount));
  const maxCategory = Math.max(1, ...by_category.map((c) => c.total_price));

  return (
    <div className="animate-fade-in max-w-6xl mx-auto px-6 lg:px-10 py-6">
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-gov-navy flex items-center gap-2">
            <Icon name="BarChart2" size={20} />
            Аналитика расходования грантов
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Реальные данные из системы — обновляются автоматически
          </p>
        </div>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        {[
          { label: 'Сумма выделенных грантов', value: formatRub(kpi.total_amount), icon: 'Target', color: 'text-blue-700' },
          { label: 'Освоено',                  value: formatRub(kpi.total_used),   sub: `${kpi.used_pct}%`, icon: 'TrendingUp', color: 'text-green-700' },
          { label: 'Остаток',                  value: formatRub(kpi.remainder),    icon: 'Wallet', color: 'text-amber-700' },
          { label: 'Получателей',              value: kpi.producers_count.toString(), sub: `${kpi.grants_count} грантов`, icon: 'Users', color: 'text-purple-700' },
        ].map((k) => (
          <div key={k.label} className="bg-white border border-gov-line rounded p-4 stat-card">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground leading-snug">{k.label}</span>
              <Icon name={k.icon} size={16} className={k.color} />
            </div>
            <div className="text-xl font-bold text-gov-navy">{k.value}</div>
            {k.sub && <div className="text-xs text-gov-green font-semibold mt-0.5">{k.sub}</div>}
          </div>
        ))}
      </div>

      {/* Прогресс */}
      <div className="bg-white border border-gov-line rounded p-5 mb-5">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-bold text-gov-navy">Освоение бюджета</h3>
          <span className="text-sm font-bold text-gov-navy">{kpi.used_pct}%</span>
        </div>
        <div className="progress-bar mb-2"><div className="progress-fill" style={{ width: `${kpi.used_pct}%` }} /></div>
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Освоено: {formatRubFull(kpi.total_used)}</span>
          <span>План: {formatRubFull(kpi.total_amount)}</span>
        </div>
      </div>

      {/* Автопроверки */}
      {Object.keys(check_summary).length > 0 && (
        <div className="bg-white border border-gov-line rounded p-5 mb-5">
          <h3 className="text-sm font-bold text-gov-navy mb-3 flex items-center gap-2">
            <Icon name="ShieldCheck" size={15} />
            Результаты автопроверок отчётов
          </h3>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-green-50 border border-green-200 rounded p-3 text-center">
              <div className="text-2xl font-bold text-green-700">{check_summary.ok || 0}</div>
              <div className="text-xs text-green-700">Без замечаний</div>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded p-3 text-center">
              <div className="text-2xl font-bold text-amber-700">{check_summary.warning || 0}</div>
              <div className="text-xs text-amber-700">С предупреждениями</div>
            </div>
            <div className="bg-red-50 border border-red-200 rounded p-3 text-center">
              <div className="text-2xl font-bold text-red-700">{check_summary.error || 0}</div>
              <div className="text-xs text-red-700">С ошибками</div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
        {/* По видам грантов */}
        <div className="bg-white border border-gov-line rounded p-5">
          <h3 className="text-sm font-bold text-gov-navy mb-3">По видам грантов</h3>
          {by_grant_type.length === 0 ? (
            <div className="text-xs text-muted-foreground py-4 text-center">Нет данных</div>
          ) : (
            <div className="space-y-3">
              {by_grant_type.map((g) => {
                const usedPct = g.total_amount ? Math.round((g.total_used / g.total_amount) * 100) : 0;
                return (
                  <div key={g.code}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold">{g.name}</span>
                      <span className="text-xs text-muted-foreground">{g.grants_count} грантов · {formatRub(g.total_amount)}</span>
                    </div>
                    <div className="progress-bar"><div className="progress-fill" style={{ width: `${usedPct}%` }} /></div>
                    <div className="text-xs text-muted-foreground mt-0.5">Освоено: {formatRub(g.total_used)} ({usedPct}%)</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Топ районов */}
        <div className="bg-white border border-gov-line rounded p-5">
          <h3 className="text-sm font-bold text-gov-navy mb-3">Топ районов по объёму</h3>
          {by_district.length === 0 ? (
            <div className="text-xs text-muted-foreground py-4 text-center">Нет данных</div>
          ) : (
            <div className="space-y-2.5">
              {by_district.map((d) => (
                <div key={d.name}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold truncate pr-2">{d.name}</span>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {d.producers_count} · {formatRub(d.total_amount)}
                    </span>
                  </div>
                  <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-gov-navy" style={{ width: `${(d.total_amount / maxDistrict) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* По категориям техники */}
      <div className="bg-white border border-gov-line rounded p-5 mb-5">
        <h3 className="text-sm font-bold text-gov-navy mb-3 flex items-center gap-2">
          <Icon name="Tractor" size={15} />
          Закупленная техника по категориям
        </h3>
        {by_category.length === 0 ? (
          <div className="text-xs text-muted-foreground py-6 text-center">
            Пока нет данных о закупленной технике
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="text-muted-foreground uppercase tracking-wide">
                <tr className="border-b border-gov-line">
                  <th className="text-left py-2 font-semibold">Категория</th>
                  <th className="text-right py-2 font-semibold">Кол-во позиций</th>
                  <th className="text-right py-2 font-semibold">Общая стоимость</th>
                  <th className="text-right py-2 font-semibold">Средняя цена</th>
                  <th className="text-left py-2 font-semibold pl-3">Доля</th>
                </tr>
              </thead>
              <tbody>
                {by_category.map((c) => (
                  <tr key={c.code} className="border-b border-gov-line/50">
                    <td className="py-2 font-semibold text-foreground">{c.name}</td>
                    <td className="py-2 text-right">{c.items_count}</td>
                    <td className="py-2 text-right font-semibold text-gov-navy">{formatRub(c.total_price)}</td>
                    <td className="py-2 text-right text-muted-foreground">{formatRub(c.avg_price)}</td>
                    <td className="py-2 pl-3">
                      <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                        <div className="h-full bg-blue-700" style={{ width: `${(c.total_price / maxCategory) * 100}%` }} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
