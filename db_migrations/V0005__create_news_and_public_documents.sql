-- Таблицы для управления контентом сайта (новости и публичные документы)

CREATE TABLE IF NOT EXISTS news (
  id SERIAL PRIMARY KEY,
  title VARCHAR(500) NOT NULL,
  text TEXT NOT NULL,
  category VARCHAR(100) NOT NULL,
  cat_cls VARCHAR(50) NOT NULL DEFAULT 'badge-status-new',
  tags TEXT NOT NULL DEFAULT '',
  url TEXT NOT NULL DEFAULT '#',
  important BOOLEAN NOT NULL DEFAULT FALSE,
  is_published BOOLEAN NOT NULL DEFAULT TRUE,
  published_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_news_published ON news(is_published, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_news_category ON news(category);

CREATE TABLE IF NOT EXISTS public_documents (
  id SERIAL PRIMARY KEY,
  title VARCHAR(500) NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  doc_section VARCHAR(50) NOT NULL DEFAULT 'normative',
  doc_type VARCHAR(100) NOT NULL DEFAULT '',
  doc_format VARCHAR(20) NOT NULL DEFAULT 'PDF',
  doc_size VARCHAR(50) NOT NULL DEFAULT '',
  doc_date VARCHAR(50) NOT NULL DEFAULT '',
  icon VARCHAR(50) NOT NULL DEFAULT 'FileText',
  file_url TEXT NOT NULL DEFAULT '',
  is_published BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_pubdocs_section ON public_documents(doc_section, sort_order);
CREATE INDEX IF NOT EXISTS idx_pubdocs_published ON public_documents(is_published);

INSERT INTO news (title, text, category, cat_cls, tags, url, important, published_at) VALUES
('Открыт приём заявок на гранты «Агростартап» и «Семейная ферма» 2026 года',
 'Минсельхозпрод Самарской области объявляет о начале конкурсного отбора на получение грантов в рамках федерального проекта «Создание системы поддержки фермеров и развитие сельской кооперации». Срок подачи заявок — до 30 мая 2026 года включительно.',
 'Гранты', 'badge-status-approved', 'Агростартап,Семейная ферма,2026',
 'https://mcx.samregion.ru/category/gospodderzhka/mery-gospodderzhki-2026/', TRUE, '2026-04-26 09:00:00'),

('Открыт приём заявок на несвязанную поддержку растениеводства',
 'Субсидия предоставляется на возмещение части затрат на проведение агротехнологических работ на посевах сельскохозяйственных культур. Ставки дифференцированы по природно-климатическим зонам Самарской области.',
 'Субсидии', 'badge-status-new', 'Растениеводство,Субсидия',
 'https://mcx.samregion.ru/category/gospodderzhka/mery-gospodderzhki-2026/', FALSE, '2026-04-22 09:00:00'),

('Расширены критерии отбора для грантов сельскохозяйственным кооперативам (СПСК)',
 'В 2026 году к конкурсу на грант для СПСК допускаются кооперативы с минимальным числом членов — не менее 10. Размер гранта увеличен до ₽ 70 млн. Приоритет отдаётся кооперативам, реализующим продукцию через торговые сети и рынки сбыта.',
 'Кооперация', 'badge-status-approved', 'СПСК,Кооператив,Грант',
 'https://mcx.samregion.ru/category/gospodderzhka/mery-gospodderzhki-2026/', FALSE, '2026-04-18 09:00:00'),

('Расширен перечень банков — участников программы льготного кредитования АПК',
 'В программу льготного кредитования по ставке до 5% годовых включены новые банки-партнёры. Краткосрочные кредиты доступны для производителей зерновых, масличных культур, сахарной свёклы, а также предприятий молочного и мясного животноводства.',
 'Кредиты', 'badge-status-new', 'Кредиты,Банки,АПК',
 'https://mcx.samregion.ru/category/gospodderzhka/mery-gospodderzhki-2026/', FALSE, '2026-04-15 09:00:00'),

('Приём заявок на возмещение затрат на создание объектов АПК (CAPEX)',
 'Компенсация прямых понесённых затрат на создание и модернизацию объектов АПК — тепличные комплексы, картофеле- и овощехранилища, животноводческие объекты. Возмещение — до 25% фактических затрат.',
 'Компенсация CAPEX', 'badge-status-review', 'CAPEX,Строительство,Субсидия',
 'https://mcx.samregion.ru/category/gospodderzhka/mery-gospodderzhki-2026/', FALSE, '2026-04-10 09:00:00'),

('АСУГ СХ СО: завершена интеграция с ФГИС «Меркурий» и ЭДО «Диадок»',
 'Автоматизированная система учёта и контроля расходования грантов прошла полную интеграцию с федеральными информационными системами. Данные о поголовье скота и объёмах производства теперь автоматически верифицируются при проверке отчётности.',
 'Цифровизация', 'badge-status-completed', 'АСУГ,Интеграция,Цифровизация',
 '#', FALSE, '2026-04-05 09:00:00');

INSERT INTO public_documents (title, description, doc_section, doc_type, doc_format, doc_size, doc_date, icon, file_url, sort_order) VALUES
('Постановление Правительства РФ № 1906 от 14.12.2021', 'О предоставлении грантовой поддержки сельскохозяйственным товаропроизводителям', 'normative', 'Постановление', 'PDF', '284 КБ', '14 дек 2021', 'FileText', 'https://mcx.samregion.ru/', 10),
('Приказ Минсельхоза РФ № 34 от 28.01.2022', 'Об утверждении порядка конкурсного отбора для предоставления гранта «Агростартап»', 'normative', 'Приказ', 'PDF', '196 КБ', '28 янв 2022', 'FileText', 'https://mcx.samregion.ru/', 20),
('Постановление Правительства Самарской области № 142', 'О государственной программе «Развитие сельского хозяйства и регулирование рынков сельскохозяйственной продукции, сырья и продовольствия»', 'normative', 'Постановление', 'PDF', '1,2 МБ', '14 мар 2014', 'FileText', 'https://mcx.samregion.ru/', 30),
('Порядок предоставления субсидий на возмещение затрат (CAPEX) 2026', 'Условия, требования и перечень документов для получения компенсации затрат на создание объектов АПК', 'normative', 'Порядок', 'PDF', '340 КБ', '10 янв 2026', 'FileText', 'https://mcx.samregion.ru/', 40),

('Заявление на грант «Агростартап» 2026', '', 'template', '', 'DOCX', '62 КБ', 'Март 2026', 'FileText', '', 10),
('Заявление на грант «Семейная ферма» 2026', '', 'template', '', 'DOCX', '58 КБ', 'Март 2026', 'FileText', '', 20),
('Промежуточный отчёт о расходовании гранта', '', 'template', '', 'XLSX', '48 КБ', 'Апрель 2026', 'FileSpreadsheet', '', 30),
('Итоговый отчёт о расходовании гранта', '', 'template', '', 'XLSX', '64 КБ', 'Апрель 2026', 'FileSpreadsheet', '', 40),
('Акт выполненных работ (типовая форма)', '', 'template', '', 'DOCX', '24 КБ', 'Март 2026', 'FileCheck', '', 50),
('Согласие на обработку персональных данных', '', 'template', '', 'PDF', '18 КБ', 'Янв 2026', 'FileLock', '', 60),
('Бизнес-план (шаблон для «Агростартап»)', '', 'template', '', 'DOCX', '92 КБ', 'Февр 2026', 'FileText', '', 70),
('Справка об использовании средств гранта', '', 'template', '', 'DOCX', '20 КБ', 'Март 2026', 'FileText', '', 80),

('Статистический бюллетень АПК Самарской области за 2025 год', '', 'statistics', '', 'PDF', '3,4 МБ', 'Март 2026', 'FileText', '', 10),
('Отчёт о расходовании средств господдержки АПК за 2025 год', '', 'statistics', '', 'PDF', '2,1 МБ', 'Февр 2026', 'FileText', '', 20),
('Аналитическая записка: итоги конкурсного отбора грантов 2025', '', 'statistics', '', 'PDF', '890 КБ', 'Янв 2026', 'FileText', '', 30);
