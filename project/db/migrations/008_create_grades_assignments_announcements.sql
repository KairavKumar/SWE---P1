CREATE TABLE IF NOT EXISTS grades (
  grade_id CHAR(36) NOT NULL PRIMARY KEY,
  student_user_id CHAR(36) NOT NULL,
  offering_id CHAR(36) NOT NULL,
  semester_label VARCHAR(20) NOT NULL,
  letter_grade CHAR(2) NULL,
  grade_points INT NULL,
  remarks TEXT NULL,
  is_published BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_grades_student FOREIGN KEY (student_user_id) REFERENCES students(user_id),
  CONSTRAINT fk_grades_offering FOREIGN KEY (offering_id) REFERENCES course_offerings(offering_id),
  UNIQUE KEY uq_grade_student_offering (student_user_id, offering_id)
);

CREATE TABLE IF NOT EXISTS assignments (
  assignment_id CHAR(36) NOT NULL PRIMARY KEY,
  offering_id CHAR(36) NOT NULL,
  title VARCHAR(200) NOT NULL,
  due_at TIMESTAMP NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_assignment_offering FOREIGN KEY (offering_id) REFERENCES course_offerings(offering_id)
);

CREATE INDEX idx_assignments_due ON assignments (due_at, is_active);

CREATE TABLE IF NOT EXISTS announcements (
  announcement_id CHAR(36) NOT NULL PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  body TEXT NOT NULL,
  priority INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_announcements_active ON announcements (is_active, created_at);

