CREATE TABLE IF NOT EXISTS user_profiles (
  user_id CHAR(36) NOT NULL PRIMARY KEY,
  full_name VARCHAR(160) NOT NULL,
  phone_number VARCHAR(30) NULL,
  local_address TEXT NULL,
  emergency_contact VARCHAR(200) NULL,
  profile_picture VARCHAR(255) NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_profile_user FOREIGN KEY (user_id) REFERENCES users(id)
);
