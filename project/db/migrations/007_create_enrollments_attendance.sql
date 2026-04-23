CREATE TABLE IF NOT EXISTS enrollments (
  enrollment_id CHAR(36) NOT NULL PRIMARY KEY,
  student_user_id CHAR(36) NOT NULL,
  offering_id CHAR(36) NOT NULL,
  enrollment_status ENUM('pending','approved','rejected','dropped') NOT NULL DEFAULT 'approved',
  adjustment_status ENUM('none','add','drop','swap') NOT NULL DEFAULT 'none',
  enrolled_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  dropped_at TIMESTAMP NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_enrollment_student FOREIGN KEY (student_user_id) REFERENCES students(user_id),
  CONSTRAINT fk_enrollment_offering FOREIGN KEY (offering_id) REFERENCES course_offerings(offering_id),
  UNIQUE KEY uq_student_offering (student_user_id, offering_id)
);

CREATE TABLE IF NOT EXISTS attendance_summaries (
  student_user_id CHAR(36) NOT NULL,
  offering_id CHAR(36) NOT NULL,
  total_sessions INT NOT NULL DEFAULT 0,
  present_sessions INT NOT NULL DEFAULT 0,
  last_calculated_at TIMESTAMP NULL,
  PRIMARY KEY (student_user_id, offering_id),
  CONSTRAINT fk_attendance_student FOREIGN KEY (student_user_id) REFERENCES students(user_id),
  CONSTRAINT fk_attendance_offering FOREIGN KEY (offering_id) REFERENCES course_offerings(offering_id)
);

CREATE INDEX idx_enrollments_student ON enrollments (student_user_id, enrollment_status);

