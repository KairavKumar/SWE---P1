const db = require("../config/db");

async function listMyEnrollments(studentUserId) {
  const rows = await db.query(
    `SELECT
      e.enrollment_id,
      e.enrollment_status,
      e.adjustment_status,
      e.enrolled_at,
      e.dropped_at,
      o.offering_id,
      o.semester_label,
      o.section_code,
      o.schedule_slot,
      c.course_code,
      c.course_title,
      c.credit_value,
      c.department
    FROM enrollments e
    JOIN course_offerings o ON o.offering_id = e.offering_id
    JOIN courses c ON c.course_id = o.course_id
    WHERE e.student_user_id = ?
      AND e.enrollment_status IN ('pending','approved')
    ORDER BY o.semester_label DESC, c.course_code`,
    [studentUserId]
  );
  return rows;
}

async function listDroppedHistory(studentUserId) {
  const rows = await db.query(
    `SELECT
      e.enrollment_id,
      e.enrolled_at,
      e.dropped_at,
      o.semester_label,
      c.course_code,
      c.course_title,
      c.credit_value
    FROM enrollments e
    JOIN course_offerings o ON o.offering_id = e.offering_id
    JOIN courses c ON c.course_id = o.course_id
    WHERE e.student_user_id = ?
      AND e.enrollment_status = 'dropped'
    ORDER BY e.dropped_at DESC`,
    [studentUserId]
  );
  return rows;
}

async function getEnrollmentForUpdate(studentUserId, offeringId, connection) {
  const [rows] = await connection.execute(
    `SELECT enrollment_id, enrollment_status
     FROM enrollments
     WHERE student_user_id = ? AND offering_id = ?
     FOR UPDATE`,
    [studentUserId, offeringId]
  );
  return rows[0] || null;
}

async function createEnrollment({ enrollmentId, studentUserId, offeringId, connection }) {
  await connection.execute(
    `INSERT INTO enrollments (enrollment_id, student_user_id, offering_id, enrollment_status, adjustment_status)
     VALUES (?, ?, ?, 'approved', 'add')`,
    [enrollmentId, studentUserId, offeringId]
  );
}

async function dropEnrollment(enrollmentId, connection) {
  await connection.execute(
    "UPDATE enrollments SET enrollment_status = 'dropped', adjustment_status = 'drop', dropped_at = NOW() WHERE enrollment_id = ?",
    [enrollmentId]
  );
}

module.exports = {
  listMyEnrollments,
  listDroppedHistory,
  getEnrollmentForUpdate,
  createEnrollment,
  dropEnrollment
};

