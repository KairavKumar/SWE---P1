const db = require("../config/db");

async function listUpcomingForStudent(studentUserId, { limit = 10 } = {}) {
  const rows = await db.query(
    `SELECT
      a.assignment_id,
      a.title,
      a.due_at,
      o.offering_id,
      c.course_code,
      c.course_title
    FROM assignments a
    JOIN course_offerings o ON o.offering_id = a.offering_id
    JOIN courses c ON c.course_id = o.course_id
    JOIN enrollments e ON e.offering_id = o.offering_id
    WHERE e.student_user_id = ?
      AND e.enrollment_status IN ('pending','approved')
      AND a.is_active = true
      AND a.due_at >= NOW()
    ORDER BY a.due_at ASC
    LIMIT ?`,
    [studentUserId, limit]
  );
  return rows;
}

module.exports = {
  listUpcomingForStudent
};

