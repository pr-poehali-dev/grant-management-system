import { useState } from 'react';
import Icon from '@/components/ui/icon';

const normativeDocs = [
  {
    id: 1,
    title: 'Постановление Правительства РФ № 1906 от 14.12.2021',
    desc: 'О предоставлении грантовой поддержки сельскохозяйственным товаропроизводителям',
    date: '14 дек 2021',
    type: 'Постановление',
    size: '284 КБ',
    url: 'https://mcx.samregion.ru/',
  },
  {
    id: 2,
    title: 'Приказ Минсельхоза РФ № 34 от 28.01.2022',
    desc: 'Об утверждении порядка конкурсного отбора для предоставления гранта «Агростартап»',
    date: '28 янв 2022',
    type: 'Приказ',
    size: '196 КБ',
    url: 'https://mcx.samregion.ru/',
  },
  {
    id: 3,
    title: 'Постановление Правительства Самарской области № 142',
    desc: 'О государственной программе «Развитие сельского хозяйства и регулирование рынков сельскохозяйственной продукции, сырья и продовольствия»',
    date: '14 мар 2014',
    type: 'Постановление',
    size: '1,2 МБ',
    url: 'https://mcx.samregion.ru/',
  },
  {
    id: 4,
    title: 'Порядок предоставления субсидий на возмещение затрат (CAPEX) 2026',
    desc: 'Условия, требования и перечень документов для получения компенсации затрат на создание объектов АПК',
    date: '10 янв 2026',
    type: 'Порядок',
    size: '340 КБ',
    url: 'https://mcx.samregion.ru/',
  },
];

const formTemplates = [
  {
    title: 'Заявление на грант «Агростартап» 2026',
    format: 'DOCX',
    size: '62 КБ',
    updated: 'Март 2026',
    icon: 'FileText',
  },
  {
    title: 'Заявление на грант «Семейная ферма» 2026',
    format: 'DOCX',
    size: '58 КБ',
    updated: 'Март 2026',
    icon: 'FileText',
  },
  {
    title: 'Промежуточный отчёт о расходовании гранта',
    format: 'XLSX',
    size: '48 КБ',
    updated: 'Апрель 2026',
    icon: 'FileSpreadsheet',
  },
  {
    title: 'Итоговый отчёт о расходовании гранта',
    format: 'XLSX',
    size: '64 КБ',
    updated: 'Апрель 2026',
    icon: 'FileSpreadsheet',
  },
  {
    title: 'Акт выполненных работ (типовая форма)',
    format: 'DOCX',
    size: '24 КБ',
    updated: 'Март 2026',
    icon: 'FileCheck',
  },
  {
    title: 'Согласие на обработку персональных данных',
    format: 'PDF',
    size: '18 КБ',
    updated: 'Янв 2026',
    icon: 'FileLock',
  },
  {
    title: 'Бизнес-план (шаблон для «Агростартап»)',
    format: 'DOCX',
    size: '92 КБ',
    updated: 'Февр 2026',
    icon: 'FileText',
  },
  {
    title: 'Справка об использовании средств гранта',
    format: 'DOCX',
    size: '20 КБ',
    updated: 'Март 2026',
    icon: 'FileText',
  },
];

const statistics = [
  { title: 'Статистический бюллетень АПК Самарской области за 2025 год', date: 'Март 2026', size: '3,4 МБ', format: 'PDF' },
  { title: 'Отчёт о расходовании средств господдержки АПК за 2025 год', date: 'Февр 2026', size: '2,1 МБ', format: 'PDF' },
  { title: 'Аналитическая записка: итоги конкурсного отбора грантов 2025', date: 'Янв 2026', size: '890 КБ', format: 'PDF' },
];

const tabs = ['Нормативные акты', 'Формы и шаблоны', 'Отчёты и статистика'];

export default function DocumentsPage() {
  const [activeTab, setActiveTab] = useState('Нормативные акты');

  const typeColors: Record<string, string> = {
    'Постановление': 'badge-status-new',
    'Приказ': 'badge-status-review',
    'Порядок': 'badge-status-approved',
  };

  const formatColors: Record<string, string> = {
    DOCX: 'bg-blue-50 text-blue-700 border-blue-200',
    XLSX: 'bg-green-50 text-green-700 border-green-200',
    PDF: 'bg-red-50 text-red-700 border-red-200',
  };

  return (
    <div className="animate-fade-in max-w-5xl mx-auto px-6 lg:px-12 py-8">
      <h1 className="text-2xl font-bold text-gov-navy mb-1">Документы</h1>
      <p className="text-muted-foreground mb-6">Нормативная база, шаблоны документов, отчёты и статистика</p>

      {/* Табы */}
      <div className="flex border-b border-gov-line mb-6">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${activeTab === t ? 'border-gov-navy text-gov-navy' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Нормативные акты */}
      {activeTab === 'Нормативные акты' && (
        <div className="space-y-3">
          {normativeDocs.map((d, i) => (
            <div key={d.id} className="bg-white border border-gov-line rounded p-5 animate-slide-up" style={{ animationDelay: `${i * 0.07}s` }}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-sm ${typeColors[d.type] ?? 'badge-status-completed'}`}>{d.type}</span>
                    <span className="text-xs text-muted-foreground">{d.date}</span>
                  </div>
                  <h3 className="text-sm font-semibold text-gov-navy mb-1 leading-snug">{d.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{d.desc}</p>
                </div>
                <a
                  href={d.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs bg-gov-navy text-white px-3 py-1.5 rounded hover:opacity-90 transition-opacity shrink-0"
                >
                  <Icon name="Download" size={13} />
                  {d.size}
                </a>
              </div>
            </div>
          ))}
          <div className="mt-4 text-center">
            <a
              href="https://mcx.samregion.ru/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-gov-navy hover:underline flex items-center gap-1 justify-center"
            >
              <Icon name="ExternalLink" size={14} />
              Все нормативные документы на сайте МСХ Самарской области
            </a>
          </div>
        </div>
      )}

      {/* Формы и шаблоны */}
      {activeTab === 'Формы и шаблоны' && (
        <div>
          <div className="bg-amber-50 border border-amber-200 rounded p-4 mb-5 flex items-start gap-2">
            <Icon name="Info" size={15} className="text-amber-600 mt-0.5 shrink-0" />
            <div className="text-xs text-amber-800">
              Актуальные шаблоны документов в соответствии с приказом Минсельхоза РФ № 34 и Порядком предоставления субсидий.
              Обновлено: <strong>апрель 2026</strong>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {formTemplates.map((f, i) => (
              <div key={f.title} className="bg-white border border-gov-line rounded p-4 flex items-center gap-3 hover:border-gov-navy transition-colors cursor-pointer animate-slide-up" style={{ animationDelay: `${i * 0.05}s` }}>
                <div className="w-10 h-10 rounded bg-secondary flex items-center justify-center shrink-0">
                  <Icon name={f.icon} size={18} className="text-gov-navy" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-gov-navy leading-snug truncate">{f.title}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">Обновлён: {f.updated} · {f.size}</div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded border ${formatColors[f.format] ?? ''}`}>{f.format}</span>
                  <button className="text-xs text-gov-navy hover:underline flex items-center gap-1">
                    <Icon name="Download" size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Отчёты и статистика */}
      {activeTab === 'Отчёты и статистика' && (
        <div className="space-y-3">
          {statistics.map((s, i) => (
            <div key={s.title} className="bg-white border border-gov-line rounded p-5 flex items-center gap-4 animate-slide-up" style={{ animationDelay: `${i * 0.07}s` }}>
              <div className="w-10 h-10 rounded bg-red-50 border border-red-200 flex items-center justify-center shrink-0">
                <Icon name="FileBarChart" size={18} className="text-red-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-gov-navy leading-snug">{s.title}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{s.date} · {s.size}</div>
              </div>
              <button className="flex items-center gap-1.5 text-xs border border-gov-line rounded px-3 py-1.5 text-gov-navy hover:bg-gov-navy hover:text-white transition-colors shrink-0">
                <Icon name="Download" size={13} />
                Скачать
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
