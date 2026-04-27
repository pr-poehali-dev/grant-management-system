import Icon from '@/components/ui/icon';
import type { District, GrantType } from './types';

interface VerificationFiltersProps {
  stats: Record<string, number>;
  q: string; setQ: (v: string) => void;
  status: string; setStatus: (v: string) => void;
  districtId: string; setDistrictId: (v: string) => void;
  grantTypeId: string; setGrantTypeId: (v: string) => void;
  dateFrom: string; setDateFrom: (v: string) => void;
  dateTo: string; setDateTo: (v: string) => void;
  sumMin: string; setSumMin: (v: string) => void;
  sumMax: string; setSumMax: (v: string) => void;
  autoCheck: string; setAutoCheck: (v: string) => void;
  districts: District[];
  grantTypes: GrantType[];
  resetFilters: () => void;
  reportsCount: number;
}

export default function VerificationFilters(props: VerificationFiltersProps) {
  const {
    stats, q, setQ, status, setStatus, districtId, setDistrictId,
    grantTypeId, setGrantTypeId, dateFrom, setDateFrom, dateTo, setDateTo,
    sumMin, setSumMin, sumMax, setSumMax, autoCheck, setAutoCheck,
    districts, grantTypes, resetFilters, reportsCount
  } = props;

  return (
    <>
      {/* Сводка */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-2 mb-5">
        {[
          { label: 'Всего',         value: stats.total,     color: 'text-gov-navy' },
          { label: 'Новых',         value: stats.new,       color: 'text-blue-700' },
          { label: 'На проверке',   value: stats.in_review, color: 'text-blue-600' },
          { label: 'Одобрено',      value: stats.approved,  color: 'text-green-700' },
          { label: 'Возврат',       value: stats.returned,  color: 'text-amber-700' },
          { label: 'Отклонено',     value: stats.rejected,  color: 'text-red-700' },
        ].map((s) => (
          <div key={s.label} className="bg-white border border-gov-line rounded p-3 text-center">
            <div className={`text-xl font-bold ${s.color}`}>{s.value ?? 0}</div>
            <div className="text-xs text-muted-foreground">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Фильтры */}
      <div className="bg-white border border-gov-line rounded p-4 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="md:col-span-2">
            <label className="text-xs text-muted-foreground mb-1 block">Поиск (ИНН / название / номер)</label>
            <div className="relative">
              <Icon name="Search" size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-gov-line rounded text-sm focus:outline-none focus:border-gov-navy"
                placeholder="Например: 6316067908 или КФХ Солнечное"
              />
            </div>
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Статус</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gov-line rounded text-sm bg-white">
              <option value="all">Все</option>
              <option value="submitted">Поданные</option>
              <option value="review">На проверке</option>
              <option value="approved">Одобренные</option>
              <option value="rejected">Отклонённые</option>
              <option value="returned">Возвращённые</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Автопроверка</label>
            <select value={autoCheck} onChange={(e) => setAutoCheck(e.target.value)}
              className="w-full px-3 py-2 border border-gov-line rounded text-sm bg-white">
              <option value="">Любая</option>
              <option value="ok">Без замечаний</option>
              <option value="warning">Есть предупреждения</option>
              <option value="error">Есть ошибки</option>
            </select>
          </div>

          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Район</label>
            <select value={districtId} onChange={(e) => setDistrictId(e.target.value)}
              className="w-full px-3 py-2 border border-gov-line rounded text-sm bg-white">
              <option value="">Все районы</option>
              {districts.map((d) => (
                <option key={d.id} value={d.id}>{d.name} ({d.type})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Вид гранта</label>
            <select value={grantTypeId} onChange={(e) => setGrantTypeId(e.target.value)}
              className="w-full px-3 py-2 border border-gov-line rounded text-sm bg-white">
              <option value="">Все виды</option>
              {grantTypes.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Период подачи</label>
            <div className="flex gap-1.5">
              <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)}
                className="flex-1 px-2 py-2 border border-gov-line rounded text-xs bg-white" />
              <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)}
                className="flex-1 px-2 py-2 border border-gov-line rounded text-xs bg-white" />
            </div>
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Сумма, ₽</label>
            <div className="flex gap-1.5">
              <input type="number" value={sumMin} onChange={(e) => setSumMin(e.target.value)}
                placeholder="от" className="flex-1 px-2 py-2 border border-gov-line rounded text-xs bg-white" />
              <input type="number" value={sumMax} onChange={(e) => setSumMax(e.target.value)}
                placeholder="до" className="flex-1 px-2 py-2 border border-gov-line rounded text-xs bg-white" />
            </div>
          </div>
        </div>
        <div className="flex gap-2 mt-3 pt-3 border-t border-gov-line">
          <button onClick={resetFilters} className="text-xs px-3 py-1.5 border border-gov-line rounded text-muted-foreground hover:bg-secondary">
            Сбросить фильтры
          </button>
          <span className="text-xs text-muted-foreground self-center ml-auto">Найдено: {reportsCount}</span>
        </div>
      </div>
    </>
  );
}
