import { useState, useEffect } from 'react';
import Icon from '@/components/ui/icon';
import { useAuth } from '@/lib/auth';
import { API_NEWS } from '@/lib/api';
import { toast } from '@/hooks/use-toast';

interface NewsItem {
  id: number;
  title: string;
  text: string;
  category: string;
  catCls: string;
  tags: string[];
  url: string;
  important: boolean;
  isPublished: boolean;
  date: string;
  publishedAt: string | null;
}

const CAT_CLASSES = [
  { value: 'badge-status-new', label: 'Синий' },
  { value: 'badge-status-approved', label: 'Зелёный' },
  { value: 'badge-status-review', label: 'Жёлтый' },
  { value: 'badge-status-completed', label: 'Серый' },
];

const empty = {
  title: '',
  text: '',
  category: 'Гранты',
  catCls: 'badge-status-new',
  tags: '',
  url: '',
  important: false,
  isPublished: true,
};

export default function NewsAdmin() {
  const { token } = useAuth();
  const [items, setItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | 'new' | null>(null);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    fetch(`${API_NEWS}?all=1`, { headers: { 'X-Auth-Token': token || '' } })
      .then((r) => r.json())
      .then((d) => setItems(d.items || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => { if (token) load(); }, [token]);

  const startEdit = (item: NewsItem) => {
    setEditingId(item.id);
    setForm({
      title: item.title,
      text: item.text,
      category: item.category,
      catCls: item.catCls,
      tags: item.tags.join(', '),
      url: item.url,
      important: item.important,
      isPublished: item.isPublished,
    });
  };

  const startNew = () => { setEditingId('new'); setForm(empty); };
  const cancel = () => { setEditingId(null); setForm(empty); };

  const save = async () => {
    if (!form.title.trim() || !form.text.trim()) {
      toast({ title: 'Заполните заголовок и текст', variant: 'destructive' });
      return;
    }
    setSaving(true);
    const body = {
      ...form,
      tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
    };
    try {
      if (editingId === 'new') {
        const r = await fetch(API_NEWS, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-Auth-Token': token || '' },
          body: JSON.stringify(body),
        });
        if (!r.ok) throw new Error((await r.json()).error || 'Ошибка');
        toast({ title: 'Новость опубликована' });
      } else {
        const r = await fetch(`${API_NEWS}?id=${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'X-Auth-Token': token || '' },
          body: JSON.stringify(body),
        });
        if (!r.ok) throw new Error((await r.json()).error || 'Ошибка');
        toast({ title: 'Новость обновлена' });
      }
      cancel();
      load();
    } catch (e) {
      toast({ title: 'Ошибка', description: String(e), variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    if (!confirm('Удалить новость?')) return;
    const r = await fetch(`${API_NEWS}?id=${id}`, {
      method: 'DELETE',
      headers: { 'X-Auth-Token': token || '' },
    });
    if (r.ok) {
      toast({ title: 'Удалено' });
      load();
    }
  };

  const togglePublish = async (item: NewsItem) => {
    const r = await fetch(`${API_NEWS}?id=${item.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'X-Auth-Token': token || '' },
      body: JSON.stringify({ isPublished: !item.isPublished }),
    });
    if (r.ok) load();
  };

  if (editingId !== null) {
    return (
      <div className="bg-white border border-gov-line rounded p-5 max-w-3xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-gov-navy">
            {editingId === 'new' ? 'Новая новость' : 'Редактирование новости'}
          </h3>
          <button onClick={cancel} className="text-xs text-muted-foreground hover:text-foreground">
            <Icon name="X" size={16} />
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1 block">Заголовок *</label>
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full px-3 py-2 border border-gov-line rounded text-sm focus:outline-none focus:border-gov-navy"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1 block">Текст *</label>
            <textarea
              value={form.text}
              onChange={(e) => setForm({ ...form, text: e.target.value })}
              rows={5}
              className="w-full px-3 py-2 border border-gov-line rounded text-sm focus:outline-none focus:border-gov-navy resize-y"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1 block">Категория</label>
              <input
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full px-3 py-2 border border-gov-line rounded text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1 block">Цвет ярлыка</label>
              <select
                value={form.catCls}
                onChange={(e) => setForm({ ...form, catCls: e.target.value })}
                className="w-full px-3 py-2 border border-gov-line rounded text-sm bg-white"
              >
                {CAT_CLASSES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1 block">Теги (через запятую)</label>
            <input
              value={form.tags}
              onChange={(e) => setForm({ ...form, tags: e.target.value })}
              className="w-full px-3 py-2 border border-gov-line rounded text-sm"
              placeholder="Грант, 2026, АПК"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1 block">Ссылка на источник</label>
            <input
              value={form.url}
              onChange={(e) => setForm({ ...form, url: e.target.value })}
              className="w-full px-3 py-2 border border-gov-line rounded text-sm"
              placeholder="https://..."
            />
          </div>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.important}
                onChange={(e) => setForm({ ...form, important: e.target.checked })}
              />
              Важное объявление
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.isPublished}
                onChange={(e) => setForm({ ...form, isPublished: e.target.checked })}
              />
              Опубликовано
            </label>
          </div>
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
      <div className="flex items-center justify-between mb-4">
        <div className="text-xs text-muted-foreground">{items.length} новостей</div>
        <button
          onClick={startNew}
          className="text-xs bg-gov-navy text-white px-3 py-1.5 rounded flex items-center gap-1.5 hover:opacity-90"
        >
          <Icon name="Plus" size={13} />
          Добавить новость
        </button>
      </div>

      {loading ? (
        <div className="text-center py-8 text-muted-foreground text-sm">Загрузка...</div>
      ) : items.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground text-sm">Новостей пока нет</div>
      ) : (
        <div className="bg-white border border-gov-line rounded overflow-hidden">
          {items.map((it) => (
            <div key={it.id} className="border-b border-gov-line last:border-b-0 p-4 flex items-start gap-3 hover:bg-secondary/30">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-sm ${it.catCls}`}>{it.category}</span>
                  {it.important && <span className="text-xs font-bold text-red-600">Важно</span>}
                  {!it.isPublished && (
                    <span className="text-xs bg-secondary text-muted-foreground px-2 py-0.5 rounded">Черновик</span>
                  )}
                </div>
                <div className="text-sm font-semibold text-gov-navy">{it.title}</div>
                <div className="text-xs text-muted-foreground mt-1 line-clamp-2">{it.text}</div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => togglePublish(it)}
                  title={it.isPublished ? 'Снять с публикации' : 'Опубликовать'}
                  className="p-1.5 hover:bg-secondary rounded text-muted-foreground hover:text-gov-navy"
                >
                  <Icon name={it.isPublished ? 'Eye' : 'EyeOff'} size={14} />
                </button>
                <button
                  onClick={() => startEdit(it)}
                  className="p-1.5 hover:bg-secondary rounded text-muted-foreground hover:text-gov-navy"
                >
                  <Icon name="Pencil" size={14} />
                </button>
                <button
                  onClick={() => remove(it.id)}
                  className="p-1.5 hover:bg-red-50 rounded text-muted-foreground hover:text-red-600"
                >
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
