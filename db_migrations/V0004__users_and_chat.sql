-- Таблица пользователей системы
CREATE TABLE IF NOT EXISTS app_users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(150) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(200) NOT NULL,
  phone VARCHAR(30),
  org_name VARCHAR(300),
  inn VARCHAR(12),
  role VARCHAR(30) NOT NULL DEFAULT 'producer',
  producer_id INTEGER REFERENCES producers(id),
  is_active BOOLEAN DEFAULT TRUE,
  email_verified BOOLEAN DEFAULT FALSE,
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON app_users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON app_users(role);

-- История диалогов с ИИ-агентом
CREATE TABLE IF NOT EXISTS ai_chat_messages (
  id SERIAL PRIMARY KEY,
  session_id VARCHAR(100) NOT NULL,
  user_id INTEGER REFERENCES app_users(id),
  role VARCHAR(20) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_chat_session ON ai_chat_messages(session_id, created_at);
CREATE INDEX IF NOT EXISTS idx_chat_user ON ai_chat_messages(user_id, created_at DESC);