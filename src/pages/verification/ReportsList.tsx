import Icon from '@/components/ui/icon';
import { ReportRow, STATUS_CLS, STATUS_LABELS, formatRub } from './types';

interface ReportsListProps {
  reports: ReportRow[];
  loading: boolean;
  selectedId: number | null;
  setSelectedId: (id: number) => void;
}

export default function ReportsList({ reports, loading, selectedId, setSelectedId }: ReportsListProps) {
  return (
    <div className="lg:col-span-2">
      <h2 className="text-sm font-bold text-gov-navy mb-3">Очередь проверки</h2>
      {loading && <div className="text-sm text-muted-foreground p-4 text-center">Загрузка...</div>}
      {!loading && reports.length === 0 && (
        <div className="bg-white border border-gov-line rounded p-8 text-center">
          <Icon name="Inbox" size={32} className="mx-auto text-muted-foreground/40 mb-2" />
          <div className="text-sm text-muted-foreground mb-1">Отчёты не найдены</div>
          <div className="text-xs text-muted-foreground">База пуста или фильтры не пропускают записи</div>
        </div>
      )}
      <div className="space-y-2 max-h-[calc(100vh-100px)] overflow-y-auto pr-1">
        {reports.map((r) => (
          <div
            key={r.id}
            onClick={() => setSelectedId(r.id)}
            className={`border rounded p-3 cursor-pointer transition-all ${selectedId === r.id ? 'border-gov-navy bg-blue-50/40 shadow-sm' : 'border-gov-line bg-white hover:border-gov-navy/40'}`}
          >
            <div className="flex items-start justify-between gap-2 mb-1">
              <div className="font-mono text-xs font-semibold text-gov-navy">{r.number}</div>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-sm ${STATUS_CLS[r.status] || 'badge-gray'}`}>
                {STATUS_LABELS[r.status] || r.status}
              </span>
            </div>
            <div className="text-sm font-semibold text-foreground leading-tight">{r.org_name}</div>
            <div className="text-xs text-muted-foreground mt-0.5">
              ИНН {r.producer_inn} · {r.district_name || '—'}
            </div>
            <div className="text-xs text-muted-foreground mt-1 flex items-center justify-between">
              <span>{r.grant_type_name}</span>
              <span className="font-semibold text-foreground">{formatRub(r.total_amount)}</span>
            </div>
            {r.auto_check_status && (
              <div className="mt-2 pt-2 border-t border-gov-line flex items-center gap-1.5">
                {r.auto_check_status === 'ok' && <><Icon name="CheckCircle" size={12} className="text-green-600" /><span className="text-xs text-green-700">Автопроверка OK</span></>}
                {r.auto_check_status === 'warning' && <><Icon name="AlertCircle" size={12} className="text-amber-600" /><span className="text-xs text-amber-700">Предупреждения</span></>}
                {r.auto_check_status === 'error' && <><Icon name="XCircle" size={12} className="text-red-600" /><span className="text-xs text-red-700">Найдены ошибки</span></>}
                {r.auto_check_score !== null && <span className="text-xs text-muted-foreground ml-auto">{r.auto_check_score}/100</span>}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
