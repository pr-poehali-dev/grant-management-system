-- Безопасность: лимит попыток входа, аудит-лог, 2FA, rate-limit для API

CREATE TABLE IF NOT EXISTS login_attempts (
  id SERIAL PRIMARY KEY,
  email VARCHAR(150) NOT NULL,
  ip VARCHAR(64) NOT NULL DEFAULT '',
  success BOOLEAN NOT NULL DEFAULT FALSE,
  user_agent VARCHAR(500) NOT NULL DEFAULT '',
  attempted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_login_attempts_email_time ON login_attempts(email, attempted_at DESC);
CREATE INDEX IF NOT EXISTS idx_login_attempts_ip_time ON login_attempts(ip, attempted_at DESC);

CREATE TABLE IF NOT EXISTS security_audit (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NULL,
  email VARCHAR(150) NOT NULL DEFAULT '',
  action VARCHAR(80) NOT NULL,
  details TEXT NOT NULL DEFAULT '',
  ip VARCHAR(64) NOT NULL DEFAULT '',
  user_agent VARCHAR(500) NOT NULL DEFAULT '',
  severity VARCHAR(20) NOT NULL DEFAULT 'info',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_audit_created ON security_audit(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_severity ON security_audit(severity, created_at DESC);

CREATE TABLE IF NOT EXISTS two_fa_codes (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  code_hash VARCHAR(255) NOT NULL,
  purpose VARCHAR(40) NOT NULL DEFAULT 'login',
  expires_at TIMESTAMP NOT NULL,
  used BOOLEAN NOT NULL DEFAULT FALSE,
  ip VARCHAR(64) NOT NULL DEFAULT '',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_2fa_user ON two_fa_codes(user_id, expires_at DESC);

CREATE TABLE IF NOT EXISTS api_rate_limits (
  id SERIAL PRIMARY KEY,
  ip VARCHAR(64) NOT NULL,
  endpoint VARCHAR(80) NOT NULL,
  hits INTEGER NOT NULL DEFAULT 1,
  window_start TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_ratelimit_unique ON api_rate_limits(ip, endpoint);
CREATE INDEX IF NOT EXISTS idx_ratelimit_window ON api_rate_limits(window_start);
