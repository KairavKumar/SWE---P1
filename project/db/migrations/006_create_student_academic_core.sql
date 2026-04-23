CREATE TABLE IF NOT EXISTS students (
  user_id CHAR(36) NOT NULL PRIMARY KEY,
  roll_no BIGINT NOT NULL UNIQUE,
  admission_year INT NOT NULL,
  program VARCHAR(100) NOT NULL,
  dept VARCHAR(100) NOT NULL,
  semester INT NOT NULL,
  academic_status ENUM('active','graduated','suspended','alumni') NOT NULL DEFAULT 'active',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_students_user FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS courses (
  course_id CHAR(36) NOT NULL PRIMARY KEY,
  course_code VARCHAR(30) NOT NULL UNIQUE,
  course_title VARCHAR(200) NOT NULL,
  credit_value DECIMAL(4,2) NOT NULL,
  department VARCHAR(100) NOT NULL,
  active_flag BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS course_offerings (
  offering_id CHAR(36) NOT NULL PRIMARY KEY,
  course_id CHAR(36) NOT NULL,
  faculty_user_id CHAR(36) NOT NULL,
  semester_label VARCHAR(20) NOT NULL,
  section_code VARCHAR(20) NULL,
  status ENUM('active','completed','cancelled') NOT NULL DEFAULT 'active',
  seat_capacity INT NOT NULL DEFAULT 60,
  seats_taken INT NOT NULL DEFAULT 0,
  schedule_slot VARCHAR(80) NULL,
  CONSTRAINT fk_offering_course FOREIGN KEY (course_id) REFERENCES courses(course_id),
  CONSTRAINT fk_offering_faculty FOREIGN KEY (faculty_user_id) REFERENCES users(id)
);

CREATE INDEX idx_offering_semester ON course_offerings (semester_label, status);
CREATE INDEX idx_courses_active ON courses (active_flag);

