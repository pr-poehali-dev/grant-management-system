CREATE TABLE IF NOT EXISTS districts (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  type VARCHAR(20) NOT NULL DEFAULT 'район',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS equipment_categories (
  id SERIAL PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(200) NOT NULL,
  parent_id INTEGER,
  okof_code VARCHAR(20),
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS grant_types (
  id SERIAL PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(200) NOT NULL,
  max_amount BIGINT,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS producers (
  id SERIAL PRIMARY KEY,
  inn VARCHAR(12) UNIQUE NOT NULL,
  ogrn VARCHAR(15),
  org_name VARCHAR(300) NOT NULL,
  org_form VARCHAR(50),
  district_id INTEGER REFERENCES districts(id),
  address TEXT,
  email VARCHAR(150),
  phone VARCHAR(30),
  contact_person VARCHAR(200),
  esia_verified BOOLEAN DEFAULT FALSE,
  is_blocked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS grants (
  id SERIAL PRIMARY KEY,
  number VARCHAR(50) UNIQUE NOT NULL,
  producer_id INTEGER NOT NULL REFERENCES producers(id),
  grant_type_id INTEGER NOT NULL REFERENCES grant_types(id),
  amount BIGINT NOT NULL,
  amount_used BIGINT DEFAULT 0,
  agreement_date DATE NOT NULL,
  agreement_number VARCHAR(100),
  report_deadline DATE,
  status VARCHAR(30) DEFAULT 'active',
  purpose TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_grants_producer ON grants(producer_id);
CREATE INDEX IF NOT EXISTS idx_grants_status ON grants(status);

CREATE TABLE IF NOT EXISTS reports (
  id SERIAL PRIMARY KEY,
  number VARCHAR(50) UNIQUE NOT NULL,
  grant_id INTEGER NOT NULL REFERENCES grants(id),
  producer_id INTEGER NOT NULL REFERENCES producers(id),
  report_type VARCHAR(30) NOT NULL DEFAULT 'interim',
  period_start DATE,
  period_end DATE,
  total_amount BIGINT NOT NULL DEFAULT 0,
  status VARCHAR(30) NOT NULL DEFAULT 'draft',
  auto_check_status VARCHAR(30),
  auto_check_score INTEGER,
  auto_check_data JSONB,
  reviewer_id INTEGER,
  reviewer_comment TEXT,
  reviewed_at TIMESTAMP,
  submitted_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_reports_grant ON reports(grant_id);
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_producer ON reports(producer_id);

CREATE TABLE IF NOT EXISTS report_items (
  id SERIAL PRIMARY KEY,
  report_id INTEGER NOT NULL REFERENCES reports(id),
  category_id INTEGER REFERENCES equipment_categories(id),
  item_name VARCHAR(500) NOT NULL,
  manufacturer VARCHAR(200),
  model VARCHAR(200),
  serial_number VARCHAR(100),
  quantity NUMERIC(10,2) NOT NULL DEFAULT 1,
  unit VARCHAR(20) DEFAULT 'шт',
  unit_price BIGINT NOT NULL,
  total_price BIGINT NOT NULL,
  supplier_name VARCHAR(300),
  supplier_inn VARCHAR(12),
  contract_number VARCHAR(100),
  contract_date DATE,
  payment_date DATE,
  delivery_date DATE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_report_items_report ON report_items(report_id);

CREATE TABLE IF NOT EXISTS documents (
  id SERIAL PRIMARY KEY,
  report_id INTEGER REFERENCES reports(id),
  report_item_id INTEGER REFERENCES report_items(id),
  doc_type VARCHAR(50) NOT NULL,
  file_name VARCHAR(300) NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER,
  mime_type VARCHAR(100),
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_documents_report ON documents(report_id);

CREATE TABLE IF NOT EXISTS check_rules (
  id SERIAL PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(300) NOT NULL,
  description TEXT,
  severity VARCHAR(20) DEFAULT 'warning',
  is_active BOOLEAN DEFAULT TRUE,
  config JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS check_results (
  id SERIAL PRIMARY KEY,
  report_id INTEGER NOT NULL REFERENCES reports(id),
  rule_code VARCHAR(50) NOT NULL,
  rule_name VARCHAR(300),
  status VARCHAR(20) NOT NULL,
  message TEXT,
  details JSONB,
  checked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_check_results_report ON check_results(report_id);

CREATE TABLE IF NOT EXISTS audit_log (
  id SERIAL PRIMARY KEY,
  user_role VARCHAR(30),
  user_name VARCHAR(200),
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50),
  entity_id INTEGER,
  details JSONB,
  ip_address VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_log(created_at DESC);

CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  producer_id INTEGER REFERENCES producers(id),
  type VARCHAR(50) NOT NULL,
  title VARCHAR(300) NOT NULL,
  message TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  link VARCHAR(300),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_notifications_producer ON notifications(producer_id);