CREATE TABLE IF NOT EXISTS role_permissions (
  role_name VARCHAR(50) NOT NULL,
  resource VARCHAR(100) NOT NULL,
  action ENUM('CREATE', 'READ', 'UPDATE', 'DELETE') NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  PRIMARY KEY (role_name, resource, action)
);

CREATE INDEX idx_role_permissions_active ON role_permissions (is_active);
