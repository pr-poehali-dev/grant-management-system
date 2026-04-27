export const API_REPORTS = 'https://functions.poehali.dev/c01991df-d80f-4791-9733-5b2f58fb5b48';
export const API_CHECK   = 'https://functions.poehali.dev/1eb59000-6e96-4eca-a1de-e9f44987eb38';
export const API_DICT    = 'https://functions.poehali.dev/1e3274cd-661e-4b3a-a018-21550182a9cb';

export interface ReportRow {
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

export interface ReportItem {
  id: number; item_name: string; manufacturer: string | null; model: string | null;
  serial_number: string | null; quantity: number; unit: string; unit_price: number;
  total_price: number; supplier_name: string | null; supplier_inn: string | null;
  contract_number: string | null; contract_date: string | null; payment_date: string | null;
  delivery_date: string | null; category_name: string | null;
}

export interface CheckResult {
  id: number; rule_code: string; rule_name: string; status: string;
  message: string; details: Record<string, unknown>; checked_at: string;
}

export interface DocumentRow {
  id: number; doc_type: string; file_name: string; file_url: string;
}

export type ReportField = string | number | null;

export interface ReportDetail {
  report: Record<string, ReportField>;
  items: ReportItem[];
  documents: DocumentRow[];
  checks: CheckResult[];
}

export interface District { id: number; name: string; type: string; }
export interface GrantType { id: number; code: string; name: string; }

export const STATUS_LABELS: Record<string, string> = {
  draft: 'Черновик', submitted: 'Подан', review: 'На проверке',
  approved: 'Одобрен', rejected: 'Отклонён', returned: 'Возвращён',
};

export const STATUS_CLS: Record<string, string> = {
  draft: 'badge-gray', submitted: 'badge-blue', review: 'badge-blue',
  approved: 'bg-green-50 text-green-700 border border-green-200',
  rejected: 'bg-red-50 text-red-700 border border-red-200',
  returned: 'bg-amber-50 text-amber-700 border border-amber-200',
};

export const formatRub = (n: number | null | undefined) => {
  if (n === null || n === undefined) return '—';
  return '₽ ' + Number(n).toLocaleString('ru-RU');
};

export const formatDate = (s: string | null) => {
  if (!s) return '—';
  return new Date(s).toLocaleDateString('ru-RU');
};
