import { useState } from 'react';
import Icon from '@/components/ui/icon';

const applications = [
  { id: 'АС-2026-0021', type: 'Агростартап', applicant: 'КФХ "Солнечное"', amount: '₽ 5 800 000', date: '22 апр 2026', status: 'review' },
  { id: 'СФ-2026-0008', type: 'Семейная ферма', applicant: 'ИП Смирнов К.А.', amount: '₽ 18 000 000', date: '19 апр 2026', status: 'new' },
  { id: 'АС-2026-0019', type: 'Агростартап', applicant: 'КФХ "Заречное"', amount: '₽ 3 200 000', date: '15 апр 2026', status: 'approved' },
  { id: 'МТБ-2025-0047', type: 'Развитие МТБ', applicant: 'СПК "Восток"', amount: '₽ 120 000 000', date: '02 апр 2026', status: 'rejected' },
  { id: 'СФ-2025-0031', type: 'Семейная ферма', applicant: 'ИП Козлова Н.Р.', amount: '₽ 9 700 000', date: '28 мар 2026', status: 'completed' },
];

const statusLabel: Record<string, string> = {
  approved: 'Одобрена',
  review: 'На рассмотрении',
  rejected: 'Отказ',
  completed: 'Завершена',
  new: 'Новая',
};
const statusClass: Record<string, string> = {
  approved: 'badge-status-approved',
  review: 'badge-status-review',
  rejected: 'badge-status-rejected',
  completed: 'badge-status-completed',
  new: 'badge-status-new',
};

const grantTypes = ['Все виды', 'Агростартап', 'Семейная ферма', 'Развитие МТБ'];

interface GrantsPageProps {
  onNavigate: (section: string) => void;
}

export default function GrantsPage({ onNavigate }: GrantsPageProps) {
  const [filter, setFilter] = useState('Все виды');
  const [showForm, setShowForm] = useState(false);
  const [formStep, setFormStep] = useState(1);

  const filtered = applications.filter(
    (a) => filter === 'Все виды' || a.type === filter
  );

  return (
    <div className="animate-fade-in max-w-5xl px-8 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold text-gov-navy flex items-center gap-2">
            <Icon name="FilePlus" size={20} />
            Заявки на гранты
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">Управление заявками на государственную поддержку АПК</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-gov-navy text-white text-sm font-semibold px-4 py-2.5 rounded hover:bg-gov-navy-light transition-colors flex items-center gap-2 shrink-0"
        >
          <Icon name="Plus" size={16} />
          Новая заявка
        </button>
      </div>

      {/* Filter */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {grantTypes.map((t) => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className={`text-xs px-3 py-1.5 rounded border font-medium transition-colors ${filter === t ? 'bg-gov-navy text-white border-gov-navy' : 'bg-white text-muted-foreground border-gov-line hover:border-gov-navy hover:text-gov-navy'}`}
          >
            {t}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-2">
          <div className="relative">
            <Icon name="Search" size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Поиск по ID или заявителю..."
              className="text-xs pl-8 pr-3 py-1.5 border border-gov-line rounded bg-white focus:outline-none focus:border-gov-navy w-52"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-gov-line rounded overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-secondary text-left border-b border-gov-line">
              <th className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Номер</th>
              <th className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Тип гранта</th>
              <th className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Заявитель</th>
              <th className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Сумма</th>
              <th className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Дата</th>
              <th className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Статус</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gov-line">
            {filtered.map((app, i) => (
              <tr key={app.id} className="hover:bg-secondary/50 transition-colors animate-slide-up" style={{ animationDelay: `${i * 0.05}s` }}>
                <td className="px-4 py-3 font-mono text-xs text-gov-navy font-semibold">{app.id}</td>
                <td className="px-4 py-3 text-xs text-foreground">{app.type}</td>
                <td className="px-4 py-3 text-xs text-foreground">{app.applicant}</td>
                <td className="px-4 py-3 text-xs font-semibold text-gov-navy">{app.amount}</td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{app.date}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-sm ${statusClass[app.status]}`}>
                    {statusLabel[app.status]}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <button className="text-xs text-gov-navy hover:underline flex items-center gap-1">
                    <Icon name="Eye" size={12} />
                    Открыть
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="text-center py-12 text-muted-foreground text-sm">
            <Icon name="Search" size={32} className="mx-auto mb-2 opacity-30" />
            Заявки не найдены
          </div>
        )}
      </div>

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded border border-gov-line w-full max-w-xl shadow-xl animate-slide-up">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gov-line">
              <div>
                <h2 className="font-bold text-gov-navy">Новая заявка на грант</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Шаг {formStep} из 3</p>
              </div>
              <button onClick={() => setShowForm(false)} className="text-muted-foreground hover:text-foreground">
                <Icon name="X" size={18} />
              </button>
            </div>

            {/* Steps indicator */}
            <div className="px-6 pt-4 flex gap-2">
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex-1">
                  <div className={`h-1 rounded-full ${s <= formStep ? 'bg-gov-navy' : 'bg-secondary'} transition-colors`} />
                  <div className={`text-xs mt-1 ${s === formStep ? 'text-gov-navy font-semibold' : 'text-muted-foreground'}`}>
                    {s === 1 ? 'Тип гранта' : s === 2 ? 'Данные' : 'Документы'}
                  </div>
                </div>
              ))}
            </div>

            <div className="px-6 py-5">
              {formStep === 1 && (
                <div className="space-y-3">
                  <label className="block text-xs font-semibold text-foreground mb-2">Выберите вид гранта</label>
                  {['Агростартап (до ₽ 6 млн)', 'Семейная ферма (до ₽ 30 млн)', 'Развитие МТБ (до ₽ 500 млн)'].map((t) => (
                    <label key={t} className="flex items-center gap-3 p-3 border border-gov-line rounded cursor-pointer hover:border-gov-navy transition-colors">
                      <input type="radio" name="grantType" className="accent-gov-navy" />
                      <span className="text-sm">{t}</span>
                    </label>
                  ))}
                </div>
              )}
              {formStep === 2 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold mb-1.5">Наименование организации</label>
                    <input className="w-full border border-gov-line rounded px-3 py-2 text-sm focus:outline-none focus:border-gov-navy" placeholder="КФХ или ИП..." />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold mb-1.5">ИНН</label>
                      <input className="w-full border border-gov-line rounded px-3 py-2 text-sm focus:outline-none focus:border-gov-navy font-mono" placeholder="000000000000" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1.5">ОГРН / ОГРНИП</label>
                      <input className="w-full border border-gov-line rounded px-3 py-2 text-sm focus:outline-none focus:border-gov-navy font-mono" placeholder="000000000000000" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1.5">Запрашиваемая сумма, руб.</label>
                    <input className="w-full border border-gov-line rounded px-3 py-2 text-sm focus:outline-none focus:border-gov-navy" placeholder="0,00" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1.5">Краткое описание проекта</label>
                    <textarea className="w-full border border-gov-line rounded px-3 py-2 text-sm focus:outline-none focus:border-gov-navy resize-none" rows={3} placeholder="Цели и направления использования гранта..." />
                  </div>
                </div>
              )}
              {formStep === 3 && (
                <div className="space-y-3">
                  <p className="text-xs text-muted-foreground mb-3">Прикрепите необходимые документы в формате PDF, DOC или XLS</p>
                  {['Бизнес-план', 'Правоустанавливающие документы', 'Справка об отсутствии долгов', 'Выписка из ЕГРИП / ЕГРЮЛ'].map((doc) => (
                    <div key={doc} className="flex items-center justify-between p-3 border border-gov-line rounded">
                      <div className="flex items-center gap-2">
                        <Icon name="FileText" size={14} className="text-muted-foreground" />
                        <span className="text-xs">{doc}</span>
                      </div>
                      <button className="text-xs text-blue-700 hover:underline flex items-center gap-1">
                        <Icon name="Upload" size={12} />
                        Загрузить
                      </button>
                    </div>
                  ))}
                  <div className="bg-amber-50 border border-amber-200 rounded p-3 text-xs text-amber-800 flex items-start gap-2 mt-2">
                    <Icon name="Info" size={13} className="shrink-0 mt-0.5" />
                    Подписание заявки производится с помощью ЭЦП через Госуслуги (ЕСИА)
                  </div>
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-gov-line flex justify-between">
              <button
                onClick={() => formStep > 1 ? setFormStep(formStep - 1) : setShowForm(false)}
                className="text-sm text-muted-foreground hover:text-foreground px-4 py-2 border border-gov-line rounded transition-colors"
              >
                {formStep > 1 ? 'Назад' : 'Отмена'}
              </button>
              <button
                onClick={() => formStep < 3 ? setFormStep(formStep + 1) : setShowForm(false)}
                className="text-sm bg-gov-navy text-white px-5 py-2 rounded hover:bg-gov-navy-light transition-colors font-semibold"
              >
                {formStep < 3 ? 'Далее' : 'Подписать и отправить'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
