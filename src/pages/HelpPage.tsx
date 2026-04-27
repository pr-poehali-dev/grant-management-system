import { useState } from 'react';
import Icon from '@/components/ui/icon';

const faqs = [
  {
    q: 'Как подать заявку на грант?',
    a: 'Для подачи заявки необходима авторизация через Госуслуги (ЕСИА) и подключённая ЭЦП. Перейдите в раздел «Заявки на гранты», нажмите «Новая заявка», выберите вид гранта и следуйте инструкциям. Срок рассмотрения — до 30 рабочих дней.',
  },
  {
    q: 'Какие документы необходимы для Агростартапа?',
    a: 'Для «Агростартапа» потребуются: бизнес-план, правоустанавливающие документы на земли с/х назначения, справка ФНС об отсутствии задолженности, выписка из ЕГРИП/ЕГРЮЛ, документы об образовании руководителя.',
  },
  {
    q: 'В какие сроки нужно сдавать промежуточные отчёты?',
    a: 'Промежуточные отчёты сдаются ежеквартально: до 15 апреля, до 15 июля, до 15 октября. Итоговый отчёт — не позднее 1 марта года, следующего за отчётным.',
  },
  {
    q: 'Как работает интеграция с Госуслугами?',
    a: 'Авторизация осуществляется через ЕСИА — Единую систему идентификации и аутентификации. При входе вы будете перенаправлены на портал Госуслуги для подтверждения личности. Данные из ЕСИА используются для верификации и подписания документов ЭЦП.',
  },
  {
    q: 'Что делать, если отчёт возвращён на доработку?',
    a: 'В личном кабинете вы увидите комментарии проверяющего с указанием конкретных замечаний. Устраните недостатки, загрузите исправленные документы и повторно отправьте отчёт. Срок на доработку — 10 рабочих дней.',
  },
];

const docs = [
  { title: 'Руководство пользователя', subtitle: 'Полное описание системы', icon: 'BookOpen', size: '2.4 МБ', format: 'PDF' },
  { title: 'Регламент подачи заявок', subtitle: 'Порядок и сроки', icon: 'FileText', size: '890 КБ', format: 'PDF' },
  { title: 'Требования к отчётности', subtitle: 'Форматы и состав документов', icon: 'Clipboard', size: '1.1 МБ', format: 'PDF' },
  { title: 'Инструкция по ЭЦП', subtitle: 'Настройка подписи', icon: 'Key', size: '540 КБ', format: 'PDF' },
  { title: 'Нормативная база', subtitle: 'Приказы и постановления', icon: 'Scale', size: '3.8 МБ', format: 'PDF' },
  { title: 'Видеоинструкции', subtitle: 'Обучающие материалы', icon: 'PlayCircle', size: '—', format: 'Онлайн' },
];

export default function HelpPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [query, setQuery] = useState('');

  const filtered = faqs.filter(
    (f) => !query || f.q.toLowerCase().includes(query.toLowerCase()) || f.a.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="animate-fade-in max-w-5xl px-8 py-8">
      <h1 className="text-xl font-bold text-gov-navy flex items-center gap-2 mb-1">
        <Icon name="HelpCircle" size={20} />
        Помощь и документация
      </h1>
      <p className="text-sm text-muted-foreground mb-6">Руководства, инструкции и ответы на частые вопросы</p>

      {/* Search */}
      <div className="relative mb-8">
        <Icon name="Search" size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-3 border border-gov-line rounded bg-white text-sm focus:outline-none focus:border-gov-navy shadow-sm"
          placeholder="Поиск по базе знаний..."
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* FAQ */}
        <div className="lg:col-span-2">
          <h2 className="text-base font-bold text-gov-navy mb-4 flex items-center gap-2">
            <Icon name="MessageSquare" size={15} />
            Частые вопросы
          </h2>
          <div className="space-y-2">
            {filtered.map((item, i) => (
              <div key={i} className="bg-white border border-gov-line rounded overflow-hidden animate-slide-up" style={{ animationDelay: `${i * 0.06}s` }}>
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full text-left px-4 py-3.5 flex items-center justify-between gap-3 hover:bg-secondary/50 transition-colors"
                >
                  <span className="text-sm font-semibold text-gov-navy">{item.q}</span>
                  <Icon name={openFaq === i ? 'ChevronUp' : 'ChevronDown'} size={16} className="text-muted-foreground shrink-0" />
                </button>
                {openFaq === i && (
                  <div className="px-4 pb-4 text-xs text-muted-foreground leading-relaxed border-t border-gov-line pt-3">
                    {item.a}
                  </div>
                )}
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="text-center py-8 text-muted-foreground text-sm">
                Ничего не найдено по запросу "{query}"
              </div>
            )}
          </div>
        </div>

        {/* Docs */}
        <div>
          <h2 className="text-base font-bold text-gov-navy mb-4 flex items-center gap-2">
            <Icon name="FolderOpen" size={15} />
            Документация
          </h2>
          <div className="space-y-2">
            {docs.map((d, i) => (
              <div key={d.title} className="bg-white border border-gov-line rounded p-3 flex items-center gap-3 cursor-pointer hover:border-gov-navy transition-colors animate-slide-up" style={{ animationDelay: `${i * 0.07}s` }}>
                <div className="w-8 h-8 rounded bg-secondary flex items-center justify-center shrink-0">
                  <Icon name={d.icon} size={15} className="text-gov-navy" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-gov-navy truncate">{d.title}</div>
                  <div className="text-xs text-muted-foreground">{d.subtitle}</div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-xs text-muted-foreground">{d.format}</div>
                  <div className="text-xs text-muted-foreground">{d.size}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 bg-gov-navy text-white rounded p-4">
            <div className="flex items-center gap-2 mb-2">
              <Icon name="Headphones" size={15} />
              <span className="text-sm font-bold">Техподдержка</span>
            </div>
            <div className="text-xs text-white/80 leading-relaxed mb-3">
              Не нашли ответ? Свяжитесь с технической поддержкой — ответим в течение 1 рабочего дня.
            </div>
            <a href="tel:88007008090" className="block text-sm font-bold text-amber-400 mb-1">8 800 700-80-90</a>
            <div className="text-xs text-white/60">Бесплатно, пн–пт 9:00–18:00 МСК</div>
          </div>
        </div>
      </div>
    </div>
  );
}
