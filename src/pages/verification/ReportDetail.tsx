import Icon from '@/components/ui/icon';
import { ReportDetail as ReportDetailType, STATUS_CLS, STATUS_LABELS, formatRub, formatDate } from './types';

interface ReportDetailProps {
  selectedId: number | null;
  detail: ReportDetailType | null;
  detailLoading: boolean;
  comment: string;
  setComment: (v: string) => void;
  running: boolean;
  actionLoading: boolean;
  runAutoCheck: () => void;
  submitDecision: (newStatus: 'approved' | 'rejected' | 'returned') => void;
  checksByStatus: (s: string) => ReportDetailType['checks'];
}

export default function ReportDetail(props: ReportDetailProps) {
  const {
    selectedId, detail, detailLoading, comment, setComment,
    running, actionLoading, runAutoCheck, submitDecision, checksByStatus
  } = props;

  return (
    <div className="lg:col-span-3">
      {!selectedId && (
        <div className="bg-white border border-gov-line rounded p-12 text-center text-muted-foreground h-full flex flex-col items-center justify-center min-h-[400px]">
          <Icon name="MousePointerClick" size={36} className="mb-3 opacity-30" />
          <div className="text-sm">Выберите отчёт из очереди</div>
        </div>
      )}

      {selectedId && detailLoading && (
        <div className="bg-white border border-gov-line rounded p-12 text-center text-muted-foreground">Загрузка...</div>
      )}

      {selectedId && !detailLoading && detail && (
        <div className="bg-white border border-gov-line rounded overflow-hidden">
          {/* Header */}
          <div className="px-5 py-4 border-b border-gov-line bg-secondary/50">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="font-bold text-gov-navy">{detail.report.org_name}</div>
                <div className="text-xs text-muted-foreground font-mono mt-0.5">
                  {detail.report.number} · ИНН {detail.report.producer_inn} · {detail.report.district_name || '—'}
                </div>
              </div>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-sm shrink-0 ${STATUS_CLS[detail.report.status as string] || 'badge-gray'}`}>
                {STATUS_LABELS[detail.report.status as string]}
              </span>
            </div>
          </div>

          {/* Сводка по гранту */}
          <div className="px-5 py-3 border-b border-gov-line grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div><div className="text-muted-foreground mb-0.5">Грант</div><div className="font-semibold">{detail.report.grant_number}</div></div>
            <div><div className="text-muted-foreground mb-0.5">Тип</div><div className="font-semibold">{detail.report.grant_type_name}</div></div>
            <div><div className="text-muted-foreground mb-0.5">Сумма отчёта</div><div className="font-semibold text-gov-navy">{formatRub(detail.report.total_amount as number)}</div></div>
            <div><div className="text-muted-foreground mb-0.5">Подан</div><div className="font-semibold">{formatDate(detail.report.submitted_at as string | null)}</div></div>
          </div>

          {/* Автопроверки */}
          <div className="px-5 py-4 border-b border-gov-line">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-gov-navy uppercase tracking-wide">
                Автопроверка ({detail.checks.length}/10)
              </h3>
              <button onClick={runAutoCheck} disabled={running}
                className="text-xs bg-gov-navy text-white px-3 py-1.5 rounded hover:opacity-90 disabled:opacity-50 flex items-center gap-1.5">
                <Icon name={running ? 'Loader2' : 'Play'} size={11} className={running ? 'animate-spin' : ''} />
                {running ? 'Проверяем...' : 'Запустить проверку'}
              </button>
            </div>

            {detail.checks.length === 0 ? (
              <div className="text-xs text-muted-foreground text-center py-4 bg-secondary/30 rounded">
                Автопроверка не запускалась. Нажмите «Запустить проверку».
              </div>
            ) : (
              <>
                <div className="grid grid-cols-3 gap-2 mb-3 text-center">
                  <div className="bg-green-50 border border-green-200 rounded p-2">
                    <div className="text-lg font-bold text-green-700">{checksByStatus('ok').length}</div>
                    <div className="text-xs text-green-700">Без замечаний</div>
                  </div>
                  <div className="bg-amber-50 border border-amber-200 rounded p-2">
                    <div className="text-lg font-bold text-amber-700">{checksByStatus('warning').length}</div>
                    <div className="text-xs text-amber-700">Предупреждения</div>
                  </div>
                  <div className="bg-red-50 border border-red-200 rounded p-2">
                    <div className="text-lg font-bold text-red-700">{checksByStatus('error').length}</div>
                    <div className="text-xs text-red-700">Ошибки</div>
                  </div>
                </div>
                <div className="space-y-1.5">
                  {detail.checks.map((c) => (
                    <div key={c.id} className="flex items-start gap-2 text-xs p-2 rounded border border-gov-line">
                      {c.status === 'ok' && <Icon name="CheckCircle" size={14} className="text-green-600 shrink-0 mt-0.5" />}
                      {c.status === 'warning' && <Icon name="AlertCircle" size={14} className="text-amber-500 shrink-0 mt-0.5" />}
                      {c.status === 'error' && <Icon name="XCircle" size={14} className="text-red-600 shrink-0 mt-0.5" />}
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-foreground">{c.rule_name}</div>
                        <div className="text-muted-foreground mt-0.5">{c.message}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Позиции отчёта */}
          <div className="px-5 py-4 border-b border-gov-line">
            <h3 className="text-xs font-bold text-gov-navy uppercase tracking-wide mb-3">
              Закупленная техника ({detail.items.length})
            </h3>
            {detail.items.length === 0 ? (
              <div className="text-xs text-muted-foreground py-3">Позиций не указано</div>
            ) : (
              <div className="space-y-2">
                {detail.items.map((item) => (
                  <div key={item.id} className="border border-gov-line rounded p-3 text-xs">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="font-semibold text-foreground">{item.item_name}</div>
                      <div className="font-bold text-gov-navy whitespace-nowrap">{formatRub(item.total_price)}</div>
                    </div>
                    <div className="text-muted-foreground">
                      {item.category_name && <span>{item.category_name} · </span>}
                      {item.manufacturer && <span>{item.manufacturer} </span>}
                      {item.model && <span>{item.model}</span>}
                      {item.serial_number && <span> · S/N {item.serial_number}</span>}
                    </div>
                    <div className="text-muted-foreground mt-1">
                      {item.quantity} {item.unit} × {formatRub(item.unit_price)}
                      {item.supplier_name && <span> · {item.supplier_name} (ИНН {item.supplier_inn})</span>}
                    </div>
                    {(item.contract_date || item.payment_date) && (
                      <div className="text-muted-foreground mt-1 flex gap-3">
                        {item.contract_date && <span>Договор: {formatDate(item.contract_date)}</span>}
                        {item.payment_date && <span>Оплата: {formatDate(item.payment_date)}</span>}
                        {item.delivery_date && <span>Поставка: {formatDate(item.delivery_date)}</span>}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Документы */}
          <div className="px-5 py-4 border-b border-gov-line">
            <h3 className="text-xs font-bold text-gov-navy uppercase tracking-wide mb-3">
              Первичные документы ({detail.documents.length})
            </h3>
            {detail.documents.length === 0 ? (
              <div className="text-xs text-muted-foreground py-3">Документы не загружены</div>
            ) : (
              <div className="space-y-1">
                {detail.documents.map((d) => (
                  <a key={d.id} href={d.file_url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center justify-between text-xs py-1.5 px-2 hover:bg-secondary rounded">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <Icon name="FileText" size={13} className="text-muted-foreground shrink-0" />
                      <span className="truncate">{d.file_name}</span>
                      <span className="text-muted-foreground shrink-0">({d.doc_type})</span>
                    </div>
                    <Icon name="ExternalLink" size={11} className="text-blue-700 shrink-0" />
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Решение */}
          <div className="px-5 py-4 border-b border-gov-line">
            <label className="block text-xs font-semibold mb-1.5">Комментарий проверяющего</label>
            <textarea value={comment} onChange={(e) => setComment(e.target.value)}
              className="w-full border border-gov-line rounded px-3 py-2 text-sm focus:outline-none focus:border-gov-navy resize-none"
              rows={3} placeholder="Замечания, требования к доработке..." />
            {detail.report.reviewer_comment && (
              <div className="mt-2 p-2 bg-secondary rounded text-xs text-muted-foreground">
                <strong>Предыдущий комментарий:</strong> {detail.report.reviewer_comment}
              </div>
            )}
          </div>

          <div className="px-5 py-4 flex gap-2 flex-wrap">
            <button onClick={() => submitDecision('approved')} disabled={actionLoading}
              className="flex-1 min-w-[150px] bg-green-700 text-white text-sm font-semibold py-2.5 rounded hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2">
              <Icon name="CheckCircle" size={15} />
              Одобрить
            </button>
            <button onClick={() => submitDecision('returned')} disabled={actionLoading || !comment}
              className="flex-1 min-w-[150px] bg-amber-500 text-white text-sm font-semibold py-2.5 rounded hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2">
              <Icon name="RotateCcw" size={15} />
              На доработку
            </button>
            <button onClick={() => submitDecision('rejected')} disabled={actionLoading || !comment}
              className="px-4 bg-red-600 text-white text-sm font-semibold py-2.5 rounded hover:opacity-90 disabled:opacity-50 flex items-center gap-2">
              <Icon name="XCircle" size={15} />
              Отклонить
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
