import { useState } from 'react';
import Icon from '@/components/ui/icon';

const reports = [
  { id: 'ОТЧ-2026-0341', grant: 'АС-2024-0891', period: 'I кв. 2026', type: 'Промежуточный', submitted: '14 апр 2026', status: 'approved', reviewer: 'Петрова М.С.' },
  { id: 'ОТЧ-2026-0298', grant: 'СФ-2025-0112', period: 'IV кв. 2025', type: 'Промежуточный', submitted: '12 янв 2026', status: 'review', reviewer: '—' },
  { id: 'ОТЧ-2025-0891', grant: 'АС-2023-0456', period: 'III кв. 2025', type: 'Итоговый', submitted: '08 окт 2025', status: 'completed', reviewer: 'Соколов А.В.' },
  { id: 'ОТЧ-2025-0712', grant: 'МТБ-2025-0012', period: 'II кв. 2025', type: 'Промежуточный', submitted: '10 июл 2025', status: 'rejected', reviewer: 'Иванова Е.П.' },
];

const statusLabel: Record<string, string> = {
  approved: 'Принят',
  review: 'На проверке',
  rejected: 'Возврат',
  completed: 'Завершён',
};
const statusClass: Record<string, string> = {
  approved: 'badge-status-approved',
  review: 'badge-status-review',
  rejected: 'badge-status-rejected',
  completed: 'badge-status-completed',
};

export default function ReportsPage() {
  const [showUpload, setShowUpload] = useState(false);

  return (
    <div className="animate-fade-in max-w-5xl px-8 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold text-gov-navy flex items-center gap-2">
            <Icon name="FileCheck" size={20} />
            Отчётность
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">Подача и контроль отчётных документов по грантам</p>
        </div>
        <button
          onClick={() => setShowUpload(true)}
          className="bg-gov-navy text-white text-sm font-semibold px-4 py-2.5 rounded hover:bg-gov-navy-light transition-colors flex items-center gap-2 shrink-0"
        >
          <Icon name="Upload" size={16} />
          Сдать отчёт
        </button>
      </div>

      {/* Alert */}
      <div className="bg-amber-50 border border-amber-300 rounded p-4 mb-5 flex items-start gap-3">
        <Icon name="AlertTriangle" size={16} className="text-amber-600 mt-0.5 shrink-0" />
        <div>
          <div className="text-sm font-semibold text-amber-800">Приближается срок сдачи отчёта</div>
          <div className="text-xs text-amber-700 mt-0.5">По гранту <span className="font-mono font-semibold">АС-2024-0891</span> необходимо сдать промежуточный отчёт за II кв. 2026 до <strong>15 мая 2026</strong></div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-gov-line rounded overflow-hidden mb-6">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-secondary border-b border-gov-line text-left">
              <th className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Номер</th>
              <th className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Грант</th>
              <th className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Период</th>
              <th className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Тип</th>
              <th className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Дата сдачи</th>
              <th className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Статус</th>
              <th className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Проверяющий</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gov-line">
            {reports.map((r, i) => (
              <tr key={r.id} className="hover:bg-secondary/50 transition-colors animate-slide-up cursor-pointer" style={{ animationDelay: `${i * 0.05}s` }}>
                <td className="px-4 py-3 font-mono text-xs text-gov-navy font-semibold">{r.id}</td>
                <td className="px-4 py-3 font-mono text-xs">{r.grant}</td>
                <td className="px-4 py-3 text-xs">{r.period}</td>
                <td className="px-4 py-3 text-xs">{r.type}</td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{r.submitted}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-sm ${statusClass[r.status]}`}>
                    {statusLabel[r.status]}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{r.reviewer}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Templates */}
      <div>
        <h2 className="text-base font-bold text-gov-navy mb-3 flex items-center gap-2">
          <Icon name="FolderDown" size={16} />
          Шаблоны документов
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            { name: 'Промежуточный отчёт', format: 'XLSX', size: '48 КБ', updated: 'Апрель 2026' },
            { name: 'Итоговый отчёт', format: 'XLSX', size: '62 КБ', updated: 'Апрель 2026' },
            { name: 'Акт выполненных работ', format: 'DOCX', size: '24 КБ', updated: 'Март 2026' },
            { name: 'Справка об использовании средств', format: 'DOCX', size: '18 КБ', updated: 'Март 2026' },
          ].map((t) => (
            <div key={t.name} className="bg-white border border-gov-line rounded p-4 flex items-center gap-3 hover:border-gov-navy transition-colors cursor-pointer">
              <div className="w-10 h-10 rounded bg-blue-50 border border-blue-200 flex items-center justify-center shrink-0">
                <Icon name="FileSpreadsheet" size={18} className="text-blue-700" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-gov-navy truncate">{t.name}</div>
                <div className="text-xs text-muted-foreground">{t.format} · {t.size} · обновлён {t.updated}</div>
              </div>
              <button className="text-xs text-blue-700 hover:underline flex items-center gap-1 shrink-0">
                <Icon name="Download" size={13} />
                Скачать
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Upload modal */}
      {showUpload && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded border border-gov-line w-full max-w-lg shadow-xl animate-slide-up">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gov-line">
              <h2 className="font-bold text-gov-navy">Сдача отчёта</h2>
              <button onClick={() => setShowUpload(false)}><Icon name="X" size={18} className="text-muted-foreground" /></button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1.5">Грант</label>
                <select className="w-full border border-gov-line rounded px-3 py-2 text-sm focus:outline-none focus:border-gov-navy">
                  <option>АС-2024-0891 — Агростартап</option>
                  <option>СФ-2025-0112 — Семейная ферма</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5">Тип отчёта</label>
                <select className="w-full border border-gov-line rounded px-3 py-2 text-sm focus:outline-none focus:border-gov-navy">
                  <option>Промежуточный</option>
                  <option>Итоговый</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5">Отчётный период</label>
                <div className="grid grid-cols-2 gap-2">
                  <select className="border border-gov-line rounded px-3 py-2 text-sm focus:outline-none focus:border-gov-navy">
                    <option>I квартал</option>
                    <option>II квартал</option>
                    <option>III квартал</option>
                    <option>IV квартал</option>
                  </select>
                  <select className="border border-gov-line rounded px-3 py-2 text-sm focus:outline-none focus:border-gov-navy">
                    <option>2026</option>
                    <option>2025</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5">Файл отчёта</label>
                <div className="border-2 border-dashed border-gov-line rounded p-6 text-center hover:border-gov-navy transition-colors cursor-pointer">
                  <Icon name="Upload" size={24} className="mx-auto mb-2 text-muted-foreground" />
                  <div className="text-sm text-muted-foreground">Перетащите файл или нажмите для выбора</div>
                  <div className="text-xs text-muted-foreground mt-1">PDF, XLSX, DOCX до 50 МБ</div>
                </div>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded p-3 text-xs text-blue-800 flex items-start gap-2">
                <Icon name="Info" size={13} className="shrink-0 mt-0.5" />
                Отчёт будет подписан вашей ЭЦП через Госуслуги и направлен на проверку
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gov-line flex justify-end gap-3">
              <button onClick={() => setShowUpload(false)} className="text-sm text-muted-foreground px-4 py-2 border border-gov-line rounded">Отмена</button>
              <button className="text-sm bg-gov-navy text-white px-5 py-2 rounded hover:bg-gov-navy-light transition-colors font-semibold">Подписать и отправить</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
