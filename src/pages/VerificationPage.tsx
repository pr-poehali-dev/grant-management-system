import { useState } from 'react';
import Icon from '@/components/ui/icon';

const queue = [
  { id: 'ОТЧ-2026-0341', applicant: 'КФХ "Солнечное"', grant: 'АС-2026-0021', period: 'I кв. 2026', amount: '₽ 1 260 000', received: '22 апр 2026', risk: 'low', docs: 4 },
  { id: 'ОТЧ-2026-0298', applicant: 'ИП Смирнов К.А.', grant: 'СФ-2025-0112', period: 'IV кв. 2025', amount: '₽ 3 500 000', received: '19 апр 2026', risk: 'medium', docs: 6 },
  { id: 'ОТЧ-2026-0271', applicant: 'СПК "Восток"', grant: 'МТБ-2025-0047', period: 'III кв. 2025', amount: '₽ 28 000 000', received: '15 апр 2026', risk: 'high', docs: 9 },
];

const riskLabel: Record<string, string> = { low: 'Низкий', medium: 'Средний', high: 'Высокий' };
const riskClass: Record<string, string> = {
  low: 'bg-green-50 text-green-700 border-green-200',
  medium: 'bg-amber-50 text-amber-700 border-amber-200',
  high: 'bg-red-50 text-red-700 border-red-200',
};

const checksData = [
  { name: 'Соответствие ИНН данным ЕГРЮЛ', status: 'ok' },
  { name: 'Отсутствие задолженности по налогам (ФНС)', status: 'ok' },
  { name: 'Верификация данных в ФГИС «Меркурий»', status: 'ok' },
  { name: 'Соответствие целевых расходов бизнес-плану', status: 'warn' },
  { name: 'Наличие подписи уполномоченного лица (ЭЦП)', status: 'ok' },
  { name: 'Сверка с реестром получателей субсидий', status: 'pending' },
];

export default function VerificationPage() {
  const [selected, setSelected] = useState<string | null>(null);
  const selectedItem = queue.find((q) => q.id === selected);

  return (
    <div className="animate-fade-in max-w-5xl px-8 py-8">
      <h1 className="text-xl font-bold text-gov-navy flex items-center gap-2 mb-2">
        <Icon name="ShieldCheck" size={20} />
        Модуль проверки отчётности
      </h1>
      <p className="text-sm text-muted-foreground mb-6">Верификация документов и автоматизированный контроль целевого расходования</p>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Queue */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-gov-navy">Очередь проверки</h2>
            <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded">{queue.length} отчётов</span>
          </div>
          <div className="space-y-2">
            {queue.map((item, i) => (
              <div
                key={item.id}
                onClick={() => setSelected(item.id)}
                className={`border rounded p-4 cursor-pointer transition-all animate-slide-up ${selected === item.id ? 'border-gov-navy bg-blue-50/50 shadow-sm' : 'border-gov-line bg-white hover:border-gov-navy/40'}`}
                style={{ animationDelay: `${i * 0.07}s` }}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="font-mono text-xs font-semibold text-gov-navy">{item.id}</div>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-sm border ${riskClass[item.risk]}`}>
                    {riskLabel[item.risk]}
                  </span>
                </div>
                <div className="text-sm font-semibold text-foreground mb-0.5">{item.applicant}</div>
                <div className="text-xs text-muted-foreground">{item.period} · {item.amount}</div>
                <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                  <Icon name="Paperclip" size={11} />
                  {item.docs} документов
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Detail */}
        <div className="lg:col-span-3">
          {!selectedItem ? (
            <div className="bg-white border border-gov-line rounded p-12 text-center text-muted-foreground h-full flex flex-col items-center justify-center">
              <Icon name="MousePointerClick" size={36} className="mb-3 opacity-30" />
              <div className="text-sm">Выберите отчёт из очереди для проверки</div>
            </div>
          ) : (
            <div className="bg-white border border-gov-line rounded overflow-hidden animate-slide-up">
              <div className="px-5 py-4 border-b border-gov-line bg-secondary/50">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-bold text-gov-navy">{selectedItem.applicant}</div>
                    <div className="text-xs text-muted-foreground font-mono mt-0.5">{selectedItem.id} · {selectedItem.grant}</div>
                  </div>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-sm border ${riskClass[selectedItem.risk]}`}>
                    Риск: {riskLabel[selectedItem.risk]}
                  </span>
                </div>
              </div>

              <div className="px-5 py-4 border-b border-gov-line">
                <div className="grid grid-cols-3 gap-4 text-xs">
                  <div><div className="text-muted-foreground mb-0.5">Период</div><div className="font-semibold">{selectedItem.period}</div></div>
                  <div><div className="text-muted-foreground mb-0.5">Сумма</div><div className="font-semibold text-gov-navy">{selectedItem.amount}</div></div>
                  <div><div className="text-muted-foreground mb-0.5">Поступил</div><div className="font-semibold">{selectedItem.received}</div></div>
                </div>
              </div>

              {/* Auto checks */}
              <div className="px-5 py-4 border-b border-gov-line">
                <h3 className="text-xs font-bold text-gov-navy mb-3 uppercase tracking-wide">Автоматические проверки</h3>
                <div className="space-y-2">
                  {checksData.map((c) => (
                    <div key={c.name} className="flex items-center gap-3">
                      {c.status === 'ok' && <Icon name="CheckCircle" size={15} className="text-green-600 shrink-0" />}
                      {c.status === 'warn' && <Icon name="AlertCircle" size={15} className="text-amber-500 shrink-0" />}
                      {c.status === 'pending' && <Icon name="Clock" size={15} className="text-muted-foreground shrink-0" />}
                      <span className={`text-xs ${c.status === 'warn' ? 'text-amber-700 font-medium' : 'text-foreground'}`}>{c.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Documents */}
              <div className="px-5 py-4 border-b border-gov-line">
                <h3 className="text-xs font-bold text-gov-navy mb-3 uppercase tracking-wide">Документы ({selectedItem.docs})</h3>
                <div className="space-y-1.5">
                  {Array.from({ length: Math.min(selectedItem.docs, 4) }, (_, i) => (
                    <div key={i} className="flex items-center justify-between text-xs py-1">
                      <div className="flex items-center gap-2">
                        <Icon name="FileText" size={13} className="text-muted-foreground" />
                        <span>{['Отчёт о расходах', 'Акт выполненных работ', 'Платёжные поручения', 'Банковская выписка'][i]}.pdf</span>
                      </div>
                      <button className="text-blue-700 hover:underline flex items-center gap-1">
                        <Icon name="Eye" size={11} />
                        Просмотр
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Comment */}
              <div className="px-5 py-4 border-b border-gov-line">
                <label className="block text-xs font-semibold mb-1.5">Комментарий проверяющего</label>
                <textarea className="w-full border border-gov-line rounded px-3 py-2 text-sm focus:outline-none focus:border-gov-navy resize-none text-xs" rows={2} placeholder="Замечания или пояснения..." />
              </div>

              {/* Actions */}
              <div className="px-5 py-4 flex gap-3">
                <button className="flex-1 bg-gov-green text-white text-sm font-semibold py-2.5 rounded hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
                  <Icon name="CheckCircle" size={15} />
                  Принять отчёт
                </button>
                <button className="flex-1 bg-amber-500 text-white text-sm font-semibold py-2.5 rounded hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
                  <Icon name="RotateCcw" size={15} />
                  Вернуть на доработку
                </button>
                <button className="px-4 bg-red-100 text-red-700 text-sm font-semibold py-2.5 rounded hover:bg-red-200 transition-colors flex items-center gap-2">
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
