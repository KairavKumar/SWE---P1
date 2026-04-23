-- Attendance: per student per offering per date
CREATE TABLE IF NOT EXISTS attendance_records (
  attendance_id CHAR(36) NOT NULL PRIMARY KEY,
  student_user_id CHAR(36) NOT NULL,
  offering_id CHAR(36) NOT NULL,
  attendance_date DATE NOT NULL,
  status ENUM('Present','Absent') NOT NULL,
  marked_by_faculty_user_id CHAR(36) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_att_rec_student FOREIGN KEY (student_user_id) REFERENCES students(user_id),
  CONSTRAINT fk_att_rec_offering FOREIGN KEY (offering_id) REFERENCES course_offerings(offering_id),
  CONSTRAINT fk_att_rec_faculty FOREIGN KEY (marked_by_faculty_user_id) REFERENCES users(id),
  UNIQUE KEY uq_attendance_student_offering_date (student_user_id, offering_id, attendance_date)
);

CREATE INDEX idx_attendance_offering_date ON attendance_records (offering_id, attendance_date);

-- Assignment enhancements for faculty config/publish
ALTER TABLE assignments
  ADD COLUMN IF NOT EXISTS description TEXT NULL,
  ADD COLUMN IF NOT EXISTS max_marks INT NOT NULL DEFAULT 100,
  ADD COLUMN IF NOT EXISTS status ENUM('Draft','Published') NOT NULL DEFAULT 'Draft',
  ADD COLUMN IF NOT EXISTS created_by_faculty_user_id CHAR(36) NULL;

CREATE INDEX idx_assignments_offering ON assignments (offering_id, status, due_at);

CREATE TABLE IF NOT EXISTS assignment_rubrics (
  rubric_id CHAR(36) NOT NULL PRIMARY KEY,
  assignment_id CHAR(36) NOT NULL,
  criteria VARCHAR(255) NOT NULL,
  max_score INT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_rubric_assignment FOREIGN KEY (assignment_id) REFERENCES assignments(assignment_id)
);

CREATE INDEX idx_rubrics_assignment ON assignment_rubrics (assignment_id);

-- Student submissions
CREATE TABLE IF NOT EXISTS assignment_submissions (
  submission_id CHAR(36) NOT NULL PRIMARY KEY,
  assignment_id CHAR(36) NOT NULL,
  student_user_id CHAR(36) NOT NULL,
  file_url VARCHAR(255) NOT NULL,
  submitted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  status ENUM('Submitted','Late','Rejected') NOT NULL DEFAULT 'Submitted',
  CONSTRAINT fk_sub_assignment FOREIGN KEY (assignment_id) REFERENCES assignments(assignment_id),
  CONSTRAINT fk_sub_student FOREIGN KEY (student_user_id) REFERENCES students(user_id),
  UNIQUE KEY uq_submission_assignment_student (assignment_id, student_user_id)
);

CREATE INDEX idx_submissions_assignment ON assignment_submissions (assignment_id, submitted_at);

-- Faculty review (marks/grade/feedback)
CREATE TABLE IF NOT EXISTS assignment_reviews (
  review_id CHAR(36) NOT NULL PRIMARY KEY,
  submission_id CHAR(36) NOT NULL UNIQUE,
  assignment_id CHAR(36) NOT NULL,
  student_user_id CHAR(36) NOT NULL,
  faculty_user_id CHAR(36) NOT NULL,
  marks FLOAT NULL,
  letter_grade VARCHAR(4) NULL,
  feedback TEXT NULL,
  reviewed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_review_submission FOREIGN KEY (submission_id) REFERENCES assignment_submissions(submission_id),
  CONSTRAINT fk_review_assignment FOREIGN KEY (assignment_id) REFERENCES assignments(assignment_id),
  CONSTRAINT fk_review_student FOREIGN KEY (student_user_id) REFERENCES students(user_id),
  CONSTRAINT fk_review_faculty FOREIGN KEY (faculty_user_id) REFERENCES users(id)
);

-- Course grade submission (per offering per student)
ALTER TABLE grades
  ADD COLUMN IF NOT EXISTS marks FLOAT NULL,
  ADD COLUMN IF NOT EXISTS uploaded_by_faculty_user_id CHAR(36) NULL,
  ADD COLUMN IF NOT EXISTS uploaded_at TIMESTAMP NULL DEFAULT NULL;

CREATE INDEX idx_grades_offering ON grades (offering_id, is_published);

