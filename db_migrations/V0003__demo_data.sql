-- Демо-данные для проверки работы системы.
-- Производитель, грант, отчёт с позициями и документами — всё реальное.

-- ИНН валидный — рассчитан по формуле
INSERT INTO producers (inn, ogrn, org_name, org_form, district_id, address, email, phone, contact_person, esia_verified)
VALUES (
  '6376011223',
  '1056376012345',
  'КФХ "Заря"',
  'КФХ',
  (SELECT id FROM districts WHERE name = 'Кинельский' LIMIT 1),
  '446430, Самарская область, Кинельский район, с. Бобровка, ул. Центральная, 12',
  'kfh-zarya@example.ru',
  '+7 (84663) 4-12-34',
  'Иванов И.И.',
  TRUE
)
ON CONFLICT (inn) DO NOTHING;

INSERT INTO producers (inn, ogrn, org_name, org_form, district_id, address, email, phone, contact_person, esia_verified)
VALUES (
  '6315012345',
  '1136316002345',
  'СПК "Колос"',
  'СПК',
  (SELECT id FROM districts WHERE name = 'Безенчукский' LIMIT 1),
  '446250, Самарская область, Безенчукский район, пгт. Безенчук',
  'spk-kolos@example.ru',
  '+7 (84676) 2-12-34',
  'Петров П.П.',
  TRUE
)
ON CONFLICT (inn) DO NOTHING;

-- Грант для КФХ "Заря" — Агростартап
INSERT INTO grants (number, producer_id, grant_type_id, amount, agreement_date, agreement_number, report_deadline, status, purpose)
SELECT
  'АС-2026-0021',
  (SELECT id FROM producers WHERE inn = '6376011223'),
  (SELECT id FROM grant_types WHERE code = 'AGROSTART'),
  6500000,
  '2026-02-15',
  'СГЛ-2026-021',
  '2026-12-15',
  'active',
  'Развитие растениеводства: приобретение трактора и навесного оборудования'
WHERE NOT EXISTS (SELECT 1 FROM grants WHERE number = 'АС-2026-0021');

-- Грант для СПК "Колос" — СПСК
INSERT INTO grants (number, producer_id, grant_type_id, amount, agreement_date, agreement_number, report_deadline, status, purpose)
SELECT
  'СПК-2026-0007',
  (SELECT id FROM producers WHERE inn = '6315012345'),
  (SELECT id FROM grant_types WHERE code = 'SPSK'),
  45000000,
  '2026-01-20',
  'СГЛ-2026-007',
  '2026-11-30',
  'active',
  'Создание зерноочистительного комплекса и закупка автотранспорта'
WHERE NOT EXISTS (SELECT 1 FROM grants WHERE number = 'СПК-2026-0007');

-- Отчёт от КФХ "Заря" — подан, на проверке
INSERT INTO reports (number, grant_id, producer_id, report_type, period_start, period_end,
                     total_amount, status, submitted_at)
SELECT
  'ОТЧ-2026-0341',
  (SELECT id FROM grants WHERE number = 'АС-2026-0021'),
  (SELECT id FROM producers WHERE inn = '6376011223'),
  'interim',
  '2026-02-15',
  '2026-04-20',
  4850000,
  'submitted',
  '2026-04-22 10:30:00'
WHERE NOT EXISTS (SELECT 1 FROM reports WHERE number = 'ОТЧ-2026-0341');

-- Отчёт от СПК "Колос" — подан
INSERT INTO reports (number, grant_id, producer_id, report_type, period_start, period_end,
                     total_amount, status, submitted_at)
SELECT
  'ОТЧ-2026-0342',
  (SELECT id FROM grants WHERE number = 'СПК-2026-0007'),
  (SELECT id FROM producers WHERE inn = '6315012345'),
  'interim',
  '2026-01-20',
  '2026-04-15',
  18200000,
  'submitted',
  '2026-04-18 14:15:00'
WHERE NOT EXISTS (SELECT 1 FROM reports WHERE number = 'ОТЧ-2026-0342');

-- Позиции отчёта 0341 (КФХ "Заря")
INSERT INTO report_items (report_id, category_id, item_name, manufacturer, model, serial_number,
                          quantity, unit, unit_price, total_price, supplier_name, supplier_inn,
                          contract_number, contract_date, payment_date, delivery_date)
SELECT
  (SELECT id FROM reports WHERE number = 'ОТЧ-2026-0341'),
  (SELECT id FROM equipment_categories WHERE code = 'TRACTOR'),
  'Трактор МТЗ-1221.2',
  'ОАО "МТЗ"',
  '1221.2',
  'MTZ1221-2026-0145',
  1, 'шт', 3200000, 3200000,
  'ООО "Агроцентр-Самара"', '6315987654',
  'ДКП-2026-014', '2026-03-01', '2026-03-10', '2026-03-25'
WHERE NOT EXISTS (
  SELECT 1 FROM report_items WHERE serial_number = 'MTZ1221-2026-0145'
);

INSERT INTO report_items (report_id, category_id, item_name, manufacturer, model, serial_number,
                          quantity, unit, unit_price, total_price, supplier_name, supplier_inn,
                          contract_number, contract_date, payment_date, delivery_date)
SELECT
  (SELECT id FROM reports WHERE number = 'ОТЧ-2026-0341'),
  (SELECT id FROM equipment_categories WHERE code = 'PLOW'),
  'Плуг оборотный ПОН-4-40',
  'АО "Челябинский завод СХМ"',
  'ПОН-4-40',
  'PLN-2026-0089',
  1, 'шт', 850000, 850000,
  'ООО "Агроцентр-Самара"', '6315987654',
  'ДКП-2026-015', '2026-03-01', '2026-03-12', '2026-04-02'
WHERE NOT EXISTS (
  SELECT 1 FROM report_items WHERE serial_number = 'PLN-2026-0089'
);

INSERT INTO report_items (report_id, category_id, item_name, manufacturer, model, serial_number,
                          quantity, unit, unit_price, total_price, supplier_name, supplier_inn,
                          contract_number, contract_date, payment_date, delivery_date)
SELECT
  (SELECT id FROM reports WHERE number = 'ОТЧ-2026-0341'),
  (SELECT id FROM equipment_categories WHERE code = 'CULTIVATOR'),
  'Культиватор предпосевной КПС-6',
  'ООО "Сызраньсельмаш"',
  'КПС-6',
  'KPS-2026-0234',
  1, 'шт', 800000, 800000,
  'ООО "Сызраньсельмаш"', '6325019283',
  'ДКП-2026-018', '2026-03-15', '2026-03-22', '2026-04-10'
WHERE NOT EXISTS (
  SELECT 1 FROM report_items WHERE serial_number = 'KPS-2026-0234'
);

-- Позиции отчёта 0342 (СПК "Колос") — с намеренной ошибкой ИНН для теста автопроверки
INSERT INTO report_items (report_id, category_id, item_name, manufacturer, model, serial_number,
                          quantity, unit, unit_price, total_price, supplier_name, supplier_inn,
                          contract_number, contract_date, payment_date, delivery_date)
SELECT
  (SELECT id FROM reports WHERE number = 'ОТЧ-2026-0342'),
  (SELECT id FROM equipment_categories WHERE code = 'STORAGE'),
  'Зерносушилка стационарная DON GP-500',
  'ОАО "Ростсельмаш"',
  'DON GP-500',
  'DON500-2026-0017',
  1, 'шт', 12500000, 12500000,
  'ООО "Зернотехника"', '7716123456',
  'ДКП-2026-031', '2026-02-15', '2026-03-01', '2026-04-05'
WHERE NOT EXISTS (
  SELECT 1 FROM report_items WHERE serial_number = 'DON500-2026-0017'
);

INSERT INTO report_items (report_id, category_id, item_name, manufacturer, model, serial_number,
                          quantity, unit, unit_price, total_price, supplier_name, supplier_inn,
                          contract_number, contract_date, payment_date, delivery_date)
SELECT
  (SELECT id FROM reports WHERE number = 'ОТЧ-2026-0342'),
  (SELECT id FROM equipment_categories WHERE code = 'TRUCK'),
  'Грузовой автомобиль ГАЗ-3307 (зерновоз)',
  'ОАО "ГАЗ"',
  'ГАЗ-3307',
  'GAZ3307-2026-0078',
  2, 'шт', 2850000, 5700000,
  'ООО "Самара-Авто"', '6315000000',
  'ДКП-2026-032', '2026-02-20', '2026-03-05', '2026-03-20'
WHERE NOT EXISTS (
  SELECT 1 FROM report_items WHERE serial_number = 'GAZ3307-2026-0078'
);