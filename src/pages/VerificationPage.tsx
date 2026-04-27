import { useState, useEffect, useCallback } from 'react';
import Icon from '@/components/ui/icon';
import VerificationFilters from './verification/VerificationFilters';
import ReportsList from './verification/ReportsList';
import ReportDetail from './verification/ReportDetail';
import {
  API_REPORTS, API_CHECK, API_DICT,
  ReportRow, ReportDetail as ReportDetailType, District, GrantType,
} from './verification/types';

export default function VerificationPage() {
  const [reports, setReports] = useState<ReportRow[]>([]);
  const [stats, setStats] = useState<Record<string, number>>({ total: 0, new: 0, in_review: 0, approved: 0, rejected: 0, returned: 0 });
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [detail, setDetail] = useState<ReportDetailType | null>(null);
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

      <VerificationFilters
        stats={stats}
        q={q} setQ={setQ}
        status={status} setStatus={setStatus}
        districtId={districtId} setDistrictId={setDistrictId}
        grantTypeId={grantTypeId} setGrantTypeId={setGrantTypeId}
        dateFrom={dateFrom} setDateFrom={setDateFrom}
        dateTo={dateTo} setDateTo={setDateTo}
        sumMin={sumMin} setSumMin={setSumMin}
        sumMax={sumMax} setSumMax={setSumMax}
        autoCheck={autoCheck} setAutoCheck={setAutoCheck}
        districts={districts}
        grantTypes={grantTypes}
        resetFilters={resetFilters}
        reportsCount={reports.length}
      />

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        <ReportsList
          reports={reports}
          loading={loading}
          selectedId={selectedId}
          setSelectedId={setSelectedId}
        />

        <ReportDetail
          selectedId={selectedId}
          detail={detail}
          detailLoading={detailLoading}
          comment={comment}
          setComment={setComment}
          running={running}
          actionLoading={actionLoading}
          runAutoCheck={runAutoCheck}
          submitDecision={submitDecision}
          checksByStatus={checksByStatus}
        />
      </div>
    </div>
  );
}
