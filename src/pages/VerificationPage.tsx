import { useState, useEffect, useCallback } from 'react';
import Icon from '@/components/ui/icon';

const API_REPORTS = 'https://functions.poehali.dev/c01991df-d80f-4791-9733-5b2f58fb5b48';
const API_CHECK   = 'https://functions.poehali.dev/1eb59000-6e96-4eca-a1de-e9f44987eb38';
const API_DICT    = 'https://functions.poehali.dev/1e3274cd-661e-4b3a-a018-21550182a9cb';

interface ReportRow {
  id: number;
  number: string;
  org_name: string;
  producer_inn: string;
  district_name: string | null;
  total_amount: number;
  status: string;
  auto_check_status: string | null;
  auto_check_score: number | null;
  grant_number: string;
  grant_type_name: string;
  submitted_at: string | null;
  created_at: string;
}

interface ReportItem {
  id: number; item_name: string; manufacturer: string | null; model: string | null;
  serial_number: string | null; quantity: number; unit: string; unit_price: number;
  total_price: number; supplier_name: string | null; supplier_inn: string | null;
  contract_number: string | null; contract_date: string | null; payment_date: string | null;
  delivery_date: string | null; category_name: string | null;
}

interface CheckResult {
  id: number; rule_code: string; rule_name: string; status: string;
  message: string; details: Record<string, unknown>; checked_at: string;
}

interface DocumentRow {
  id: number; doc_type: string; file_name: string; file_url: string;
}

type ReportField = string | number | null;

interface ReportDetail {
  report: Record<string, ReportField>;
  items: ReportItem[];
  documents: DocumentRow[];
  checks: CheckResult[];
}

interface District { id: number; name: string; type: string; }
interface GrantType { id: number; code: string; name: string; }

const STATUS_LABELS: Record<string, string> = {
  draft: 'Черновик', submitted: 'Подан', review: 'На проверке',
  approved: 'Одобрен', rejected: 'Отклонён', returned: 'Возвращён',
};

const STATUS_CLS: Record<string, string> = {
  draft: 'badge-gray', submitted: 'badge-blue', review: 'badge-blue',
  approved: 'bg-green-50 text-green-700 border border-green-200',
  rejected: 'bg-red-50 text-red-700 border border-red-200',
  returned: 'bg-amber-50 text-amber-700 border border-amber-200',
};

const formatRub = (n: number | null | undefined) => {
  if (n === null || n === undefined) return '—';
  return '₽ ' + Number(n).toLocaleString('ru-RU');
};

const formatDate = (s: string | null) => {
  if (!s) return '—';
  return new Date(s).toLocaleDateString('ru-RU');
};

export default function VerificationPage() {
  const [reports, setReports] = useState<ReportRow[]>([]);
  const [stats, setStats] = useState<Record<string, number>>({ total: 0, new: 0, in_review: 0, approved: 0, rejected: 0, returned: 0 });
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [detail, setDetail] = useState<ReportDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const [districts, setDistricts] = useState<District[]>([]);
  const [grantTypes, setGrantTypes] = useState<GrantType[]>([]);

  // Фильтры
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('all');
  const [districtId, setDistrictId] = useState('');
  const [grantTypeId, setGrantTypeId] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [sumMin, setSumMin] = useState('');
  const [sumMax, setSumMax] = useState('');
  const [autoCheck, setAutoCheck] = useState('');

  // Действия
  const [comment, setComment] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [running, setRunning] = useState(false);

  // Загрузка справочников
  useEffect(() => {
    fetch(API_DICT)
      .then((r) => r.json())
      .then((d) => {
        setDistricts(d.districts || []);
        setGrantTypes(d.grant_types || []);
      })
      .catch(() => { /* ignore */ });
  }, []);

  // Загрузка списка
  const loadList = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (status !== 'all') params.set('status', status);
    if (districtId) params.set('district_id', districtId);
    if (grantTypeId) params.set('grant_type_id', grantTypeId);
    if (dateFrom) params.set('date_from', dateFrom);
    if (dateTo) params.set('date_to', dateTo);
    if (sumMin) params.set('sum_min', sumMin);
    if (sumMax) params.set('sum_max', sumMax);
    if (autoCheck) params.set('auto_check', autoCheck);

    fetch(`${API_REPORTS}?${params.toString()}`)
      .then((r) => r.json())
      .then((d) => {
        setReports(d.items || []);
        setStats(d.stats || {});
      })
      .catch(() => { /* ignore */ })
      .finally(() => setLoading(false));
  }, [q, status, districtId, grantTypeId, dateFrom, dateTo, sumMin, sumMax, autoCheck]);

  useEffect(() => {
    loadList();
  }, [loadList]);

  // Загрузка деталей
  useEffect(() => {
    if (selectedId === null) { setDetail(null); return; }
    setDetailLoading(true);
    fetch(`${API_REPORTS}?action=detail&id=${selectedId}`)
      .then((r) => r.json())
      .then((d) => setDetail(d))
      .catch(() => setDetail(null))
      .finally(() => setDetailLoading(false));
  }, [selectedId]);

  const runAutoCheck = async () => {
    if (!selectedId) return;
    setRunning(true);
    try {
      await fetch(API_CHECK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ report_id: selectedId }),
      });
      const r = await fetch(`${API_REPORTS}?action=detail&id=${selectedId}`);
      setDetail(await r.json());
      loadList();
    } finally {
      setRunning(false);
    }
  };

  const submitDecision = async (newStatus: 'approved' | 'rejected' | 'returned') => {
    if (!selectedId) return;
    setActionLoading(true);
    try {
      await fetch(`${API_REPORTS}?action=status&id=${selectedId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, comment, reviewer_name: 'Сотрудник МСХ' }),
      });
      setComment('');
      const r = await fetch(`${API_REPORTS}?action=detail&id=${selectedId}`);
      setDetail(await r.json());
      loadList();
    } finally {
      setActionLoading(false);
    }
  };

  const resetFilters = () => {
    setQ(''); setStatus('all'); setDistrictId(''); setGrantTypeId('');
    setDateFrom(''); setDateTo(''); setSumMin(''); setSumMax(''); setAutoCheck('');
  };

  const checksByStatus = (s: string) => detail?.checks.filter((c) => c.status === s) || [];

  return (
    <div className="animate-fade-in max-w-7xl mx-auto px-6 lg:px-10 py-6">
      <h1 className="text-xl font-bold text-gov-navy flex items-center gap-2 mb-1">
        <Icon name="ShieldCheck" size={20} />
        Проверка отчётности
      </h1>
      <p className="text-sm text-muted-foreground mb-5">
        Автоматическая проверка целевого использования грантов. 10 правил: проверка ИНН, сумм, документов, дубликатов, цен.
      </p>

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
          <span className="text-xs text-muted-foreground self-center ml-auto">Найдено: {reports.length}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Список */}
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

        {/* Детали */}
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
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-sm shrink-0 ${STATUS_CLS[detail.report.status] || 'badge-gray'}`}>
                    {STATUS_LABELS[detail.report.status]}
                  </span>
                </div>
              </div>

              {/* Сводка по гранту */}
              <div className="px-5 py-3 border-b border-gov-line grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                <div><div className="text-muted-foreground mb-0.5">Грант</div><div className="font-semibold">{detail.report.grant_number}</div></div>
                <div><div className="text-muted-foreground mb-0.5">Тип</div><div className="font-semibold">{detail.report.grant_type_name}</div></div>
                <div><div className="text-muted-foreground mb-0.5">Сумма отчёта</div><div className="font-semibold text-gov-navy">{formatRub(detail.report.total_amount)}</div></div>
                <div><div className="text-muted-foreground mb-0.5">Подан</div><div className="font-semibold">{formatDate(detail.report.submitted_at)}</div></div>
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
      </div>
    </div>
  );
}