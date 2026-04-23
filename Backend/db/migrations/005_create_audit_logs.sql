CREATE TABLE IF NOT EXISTS audit_logs (
  log_id CHAR(36) NOT NULL PRIMARY KEY,
  user_id CHAR(36) NULL,
  action VARCHAR(150) NOT NULL,
  resource VARCHAR(150) NOT NULL,
  encrypted_data TEXT NULL,
  integrity_hash CHAR(64) NOT NULL,
  ip_address VARCHAR(45) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_logs_user ON audit_logs (user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs (action);
CREATE INDEX idx_audit_logs_created ON audit_logs (created_at);
