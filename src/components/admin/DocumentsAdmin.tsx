import { useState, useEffect } from 'react';
import Icon from '@/components/ui/icon';
import { useAuth } from '@/lib/auth';
import { API_PUBLIC_DOCS } from '@/lib/api';
import { toast } from '@/hooks/use-toast';

interface DocItem {
  id: number;
  title: string;
  description: string;
  section: 'normative' | 'template' | 'statistics';
  type: string;
  format: string;
  size: string;
  date: string;
  icon: string;
  fileUrl: string;
  isPublished: boolean;
  sortOrder: number;
}

const SECTIONS = [
  { key: 'normative', label: 'Нормативные акты' },
  { key: 'template', label: 'Шаблоны' },
  { key: 'statistics', label: 'Отчёты' },
] as const;

const empty: Omit<DocItem, 'id'> & { fileBase64?: string; fileName?: string } = {
  title: '',
  description: '',
  section: 'normative',
  type: '',
  format: 'PDF',
  size: '',
  date: '',
  icon: 'FileText',
  fileUrl: '',
  isPublished: true,
  sortOrder: 0,
};

const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => {
      const res = (r.result as string).split(',')[1];
      resolve(res);
    };
    r.onerror = reject;
    r.readAsDataURL(file);
  });

export default function DocumentsAdmin() {
  const { token } = useAuth();
  const [items, setItems] = useState<DocItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'normative' | 'template' | 'statistics'>('all');
  const [editingId, setEditingId] = useState<number | 'new' | null>(null);
  const [form, setForm] = useState(empty);
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    fetch(`${API_PUBLIC_DOCS}?all=1`, { headers: { 'X-Auth-Token': token || '' } })
      .then((r) => r.json())
      .then((d) => setItems(d.items || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => { if (token) load(); }, [token]);

  const startEdit = (it: DocItem) => {
    setEditingId(it.id);
    setForm({ ...it });
    setFile(null);
  };

  const startNew = () => { setEditingId('new'); setForm(empty); setFile(null); };
  const cancel = () => { setEditingId(null); setForm(empty); setFile(null); };

  const save = async () => {
    if (!form.title.trim()) {
      toast({ title: 'Укажите название', variant: 'destructive' });
      return;
    }
    setSaving(true);
    try {
      const body: Record<string, unknown> = { ...form };
      if (file) {
        body.fileBase64 = await fileToBase64(file);
        body.fileName = file.name;
      }
      const url = editingId === 'new' ? API_PUBLIC_DOCS : `${API_PUBLIC_DOCS}?id=${editingId}`;
      const method = editingId === 'new' ? 'POST' : 'PUT';
      const r = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'X-Auth-Token': token || '' },
        body: JSON.stringify(body),
      });
      if (!r.ok) throw new Error((await r.json()).error || 'Ошибка');
      toast({ title: editingId === 'new' ? 'Документ добавлен' : 'Документ обновлён' });
      cancel();
      load();
    } catch (e) {
      toast({ title: 'Ошибка', description: String(e), variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    if (!confirm('Удалить документ?')) return;
    const r = await fetch(`${API_PUBLIC_DOCS}?id=${id}`, {
      method: 'DELETE',
      headers: { 'X-Auth-Token': token || '' },
    });
    if (r.ok) { toast({ title: 'Удалено' }); load(); }
  };

  const togglePublish = async (it: DocItem) => {
    const r = await fetch(`${API_PUBLIC_DOCS}?id=${it.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'X-Auth-Token': token || '' },
      body: JSON.stringify({ isPublished: !it.isPublished }),
    });
    if (r.ok) load();
  };

  const filtered = filter === 'all' ? items : items.filter((i) => i.section === filter);

  if (editingId !== null) {
    return (
      <div className="bg-white border border-gov-line rounded p-5 max-w-3xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-gov-navy">
            {editingId === 'new' ? 'Новый документ' : 'Редактирование документа'}
          </h3>
          <button onClick={cancel}>
            <Icon name="X" size={16} />
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1 block">Название *</label>
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full px-3 py-2 border border-gov-line rounded text-sm"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1 block">Описание</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gov-line rounded text-sm resize-y"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1 block">Раздел</label>
              <select
                value={form.section}
                onChange={(e) => setForm({ ...form, section: e.target.value as DocItem['section'] })}
                className="w-full px-3 py-2 border border-gov-line rounded text-sm bg-white"
              >
                {SECTIONS.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1 block">Тип</label>
              <input
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                placeholder="Постановление / Приказ / Порядок"
                className="w-full px-3 py-2 border border-gov-line rounded text-sm"
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1 block">Формат</label>
              <select
                value={form.format}
                onChange={(e) => setForm({ ...form, format: e.target.value })}
                className="w-full px-3 py-2 border border-gov-line rounded text-sm bg-white"
              >
                <option value="PDF">PDF</option>
                <option value="DOCX">DOCX</option>
                <option value="XLSX">XLSX</option>
                <option value="ZIP">ZIP</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1 block">Размер</label>
              <input
                value={form.size}
                onChange={(e) => setForm({ ...form, size: e.target.value })}
                placeholder="284 КБ"
                className="w-full px-3 py-2 border border-gov-line rounded text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1 block">Дата</label>
              <input
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                placeholder="14 дек 2021"
                className="w-full px-3 py-2 border border-gov-line rounded text-sm"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1 block">Файл (загрузить)</label>
            <input
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="w-full text-sm"
              accept=".pdf,.doc,.docx,.xls,.xlsx,.zip,.png,.jpg,.jpeg"
            />
            {form.fileUrl && !file && (
              <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                <Icon name="Paperclip" size={11} />
                <a href={form.fileUrl} target="_blank" rel="noreferrer" className="text-gov-navy hover:underline truncate">
                  Текущий файл
                </a>
              </div>
            )}
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1 block">Или ссылка на файл (внешняя)</label>
            <input
              value={form.fileUrl}
              onChange={(e) => setForm({ ...form, fileUrl: e.target.value })}
              placeholder="https://..."
              className="w-full px-3 py-2 border border-gov-line rounded text-sm"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1 block">Иконка</label>
              <select
                value={form.icon}
                onChange={(e) => setForm({ ...form, icon: e.target.value })}
                className="w-full px-3 py-2 border border-gov-line rounded text-sm bg-white"
              >
                <option value="FileText">FileText</option>
                <option value="FileSpreadsheet">FileSpreadsheet</option>
                <option value="FileCheck">FileCheck</option>
                <option value="FileLock">FileLock</option>
                <option value="FileBarChart">FileBarChart</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1 block">Порядок сортировки</label>
              <input
                type="number"
                value={form.sortOrder}
                onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gov-line rounded text-sm"
              />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.isPublished}
              onChange={(e) => setForm({ ...form, isPublished: e.target.checked })}
            />
            Опубликовано
          </label>
        </div>

        <div className="flex gap-2 mt-5">
          <button
            onClick={save}
            disabled={saving}
            className="bg-gov-navy text-white text-sm px-4 py-2 rounded hover:opacity-90 disabled:opacity-50 flex items-center gap-1.5"
          >
            <Icon name="Check" size={14} />
            {saving ? 'Сохранение...' : 'Сохранить'}
          </button>
          <button onClick={cancel} className="text-sm border border-gov-line rounded px-4 py-2 hover:bg-secondary">
            Отмена
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div className="flex gap-1.5 flex-wrap">
          <button
            onClick={() => setFilter('all')}
            className={`text-xs px-3 py-1.5 rounded border ${filter === 'all' ? 'bg-gov-navy text-white border-gov-navy' : 'bg-white border-gov-line text-muted-foreground'}`}
          >
            Все ({items.length})
          </button>
          {SECTIONS.map((s) => (
            <button
              key={s.key}
              onClick={() => setFilter(s.key)}
              className={`text-xs px-3 py-1.5 rounded border ${filter === s.key ? 'bg-gov-navy text-white border-gov-navy' : 'bg-white border-gov-line text-muted-foreground'}`}
            >
              {s.label} ({items.filter((i) => i.section === s.key).length})
            </button>
          ))}
        </div>
        <button
          onClick={startNew}
          className="text-xs bg-gov-navy text-white px-3 py-1.5 rounded flex items-center gap-1.5 hover:opacity-90"
        >
          <Icon name="Plus" size={13} />
          Добавить документ
        </button>
      </div>

      {loading ? (
        <div className="text-center py-8 text-muted-foreground text-sm">Загрузка...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground text-sm">Документов пока нет</div>
      ) : (
        <div className="bg-white border border-gov-line rounded overflow-hidden">
          {filtered.map((it) => (
            <div key={it.id} className="border-b border-gov-line last:border-b-0 p-4 flex items-start gap-3 hover:bg-secondary/30">
              <div className="w-9 h-9 rounded bg-secondary flex items-center justify-center shrink-0">
                <Icon name={it.icon} size={16} className="text-gov-navy" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="text-xs bg-secondary text-muted-foreground px-2 py-0.5 rounded">
                    {SECTIONS.find((s) => s.key === it.section)?.label}
                  </span>
                  {it.format && <span className="text-xs text-muted-foreground">{it.format}</span>}
                  {it.size && <span className="text-xs text-muted-foreground">· {it.size}</span>}
                  {!it.isPublished && (
                    <span className="text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded">Черновик</span>
                  )}
                </div>
                <div className="text-sm font-semibold text-gov-navy">{it.title}</div>
                {it.description && <div className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{it.description}</div>}
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => togglePublish(it)}
                  className="p-1.5 hover:bg-secondary rounded text-muted-foreground hover:text-gov-navy"
                  title={it.isPublished ? 'Снять с публикации' : 'Опубликовать'}
                >
                  <Icon name={it.isPublished ? 'Eye' : 'EyeOff'} size={14} />
                </button>
                <button onClick={() => startEdit(it)} className="p-1.5 hover:bg-secondary rounded text-muted-foreground hover:text-gov-navy">
                  <Icon name="Pencil" size={14} />
                </button>
                <button onClick={() => remove(it.id)} className="p-1.5 hover:bg-red-50 rounded text-muted-foreground hover:text-red-600">
                  <Icon name="Trash2" size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}