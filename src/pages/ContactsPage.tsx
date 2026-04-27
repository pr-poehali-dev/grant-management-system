import Icon from '@/components/ui/icon';

const contacts = [
  {
    dept: 'Техническая поддержка системы',
    desc: 'Вопросы по работе платформы, авторизации, ошибкам',
    phone: '8 800 700-80-90',
    email: 'support@agrogrant.gov.ru',
    hours: 'Пн–Пт, 9:00–18:00 МСК',
    icon: 'Headphones',
    color: 'border-blue-500',
  },
  {
    dept: 'Отдел господдержки АПК',
    desc: 'Консультации по условиям и требованиям грантов',
    phone: '+7 (495) 608-08-00',
    email: 'grants@mcx.gov.ru',
    hours: 'Пн–Пт, 10:00–17:00 МСК',
    icon: 'Landmark',
    color: 'border-green-600',
  },
  {
    dept: 'Отдел проверки отчётности',
    desc: 'Вопросы по сдаче и проверке отчётных документов',
    phone: '+7 (495) 608-09-11',
    email: 'reports@mcx.gov.ru',
    hours: 'Пн–Пт, 9:00–17:00 МСК',
    icon: 'FileCheck',
    color: 'border-amber-500',
  },
];

const offices = [
  { city: 'Москва (головной офис)', address: 'Орликов пер., д. 1/11, стр. 1', metro: 'Красные ворота', zip: '107139' },
  { city: 'Краснодар', address: 'ул. Красная, д. 35', metro: null, zip: '350000' },
  { city: 'Ростов-на-Дону', address: 'пр. Ворошиловский, д. 2', metro: null, zip: '344000' },
];

export default function ContactsPage() {
  return (
    <div className="animate-fade-in max-w-5xl px-8 py-8">
      <h1 className="text-xl font-bold text-gov-navy flex items-center gap-2 mb-1">
        <Icon name="Phone" size={20} />
        Контакты и информация о системе
      </h1>
      <p className="text-sm text-muted-foreground mb-8">Министерство сельского хозяйства Российской Федерации</p>

      {/* About */}
      <div className="bg-gov-navy text-white rounded p-6 mb-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/3 rounded-full translate-x-16 -translate-y-16" />
        <div className="relative">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded bg-white/10 flex items-center justify-center">
              <Icon name="Wheat" size={24} className="text-amber-400" />
            </div>
            <div>
              <div className="font-black text-lg leading-tight">АгроГрант</div>
              <div className="text-xs text-white/60">Государственная информационная система</div>
            </div>
          </div>
          <p className="text-sm text-white/80 leading-relaxed max-w-2xl mb-4">
            АгроГрант — официальная государственная система управления грантами агропромышленного комплекса Российской Федерации. Разработана по заказу Министерства сельского хозяйства РФ в соответствии с постановлением Правительства №1906 от 14.12.2021.
          </p>
          <div className="flex flex-wrap gap-4 text-xs text-white/60">
            <span className="flex items-center gap-1.5"><Icon name="Shield" size={12} /> Версия системы: 2.4.1</span>
            <span className="flex items-center gap-1.5"><Icon name="Calendar" size={12} /> Обновлена: апрель 2026</span>
            <span className="flex items-center gap-1.5"><Icon name="Lock" size={12} /> Сертификат ФСТЭК: №12/2024</span>
          </div>
        </div>
      </div>

      {/* Contacts */}
      <h2 className="text-base font-bold text-gov-navy mb-4 flex items-center gap-2">
        <Icon name="Phone" size={15} />
        Контакты подразделений
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {contacts.map((c, i) => (
          <div key={c.dept} className={`bg-white border-l-4 ${c.color} border border-gov-line rounded p-5 animate-slide-up`} style={{ animationDelay: `${i * 0.08}s` }}>
            <div className="flex items-center gap-2 mb-3">
              <Icon name={c.icon} size={16} className="text-gov-navy" />
              <span className="text-sm font-bold text-gov-navy leading-tight">{c.dept}</span>
            </div>
            <p className="text-xs text-muted-foreground mb-4 leading-relaxed">{c.desc}</p>
            <div className="space-y-2">
              <a href={`tel:${c.phone}`} className="flex items-center gap-2 text-sm font-semibold text-gov-navy hover:text-gov-gold transition-colors">
                <Icon name="Phone" size={13} />
                {c.phone}
              </a>
              <a href={`mailto:${c.email}`} className="flex items-center gap-2 text-xs text-muted-foreground hover:text-gov-navy transition-colors">
                <Icon name="Mail" size={13} />
                {c.email}
              </a>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Icon name="Clock" size={13} />
                {c.hours}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Offices */}
      <h2 className="text-base font-bold text-gov-navy mb-4 flex items-center gap-2">
        <Icon name="MapPin" size={15} />
        Региональные представительства
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {offices.map((o, i) => (
          <div key={o.city} className="bg-white border border-gov-line rounded p-4 animate-slide-up" style={{ animationDelay: `${i * 0.07}s` }}>
            <div className="font-semibold text-gov-navy text-sm mb-1">{o.city}</div>
            <div className="text-xs text-muted-foreground leading-relaxed">{o.address}</div>
            {o.metro && <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1"><Icon name="Train" size={11} /> {o.metro}</div>}
            <div className="text-xs font-mono text-muted-foreground mt-1">{o.zip}</div>
          </div>
        ))}
      </div>

      {/* Feedback form */}
      <div>
        <h2 className="text-base font-bold text-gov-navy mb-4 flex items-center gap-2">
          <Icon name="MessageSquare" size={15} />
          Обратная связь
        </h2>
        <div className="bg-white border border-gov-line rounded p-6 max-w-xl">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold mb-1.5">Имя</label>
                <input className="w-full border border-gov-line rounded px-3 py-2 text-sm focus:outline-none focus:border-gov-navy" placeholder="Ваше имя" />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5">Email</label>
                <input type="email" className="w-full border border-gov-line rounded px-3 py-2 text-sm focus:outline-none focus:border-gov-navy" placeholder="email@example.ru" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5">Тема обращения</label>
              <select className="w-full border border-gov-line rounded px-3 py-2 text-sm focus:outline-none focus:border-gov-navy">
                <option>Технический вопрос</option>
                <option>Вопрос по гранту</option>
                <option>Отчётность</option>
                <option>Другое</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5">Сообщение</label>
              <textarea className="w-full border border-gov-line rounded px-3 py-2 text-sm focus:outline-none focus:border-gov-navy resize-none" rows={4} placeholder="Опишите ваш вопрос..." />
            </div>
            <button className="w-full bg-gov-navy text-white font-semibold py-2.5 rounded hover:bg-gov-navy-light transition-colors text-sm flex items-center justify-center gap-2">
              <Icon name="Send" size={15} />
              Отправить обращение
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
