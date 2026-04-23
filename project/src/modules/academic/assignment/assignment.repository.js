const db = require("../../../config/db");

async function createAssignment({ assignmentId, offeringId, facultyUserId, title, description, dueAt, maxMarks }) {
  await db.query(
    `INSERT INTO assignments
      (assignment_id, offering_id, title, description, due_at, max_marks, status, is_active, created_by_faculty_user_id)
     VALUES (?, ?, ?, ?, ?, ?, 'Draft', true, ?)`,
    [assignmentId, offeringId, title, description || null, dueAt, maxMarks, facultyUserId]
  );
}

async function publishAssignment(assignmentId) {
  await db.query("UPDATE assignments SET status = 'Published' WHERE assignment_id = ?", [assignmentId]);
}

async function findById(assignmentId) {
  const rows = await db.query(
    "SELECT assignment_id, offering_id, title, description, due_at, max_marks, status, is_active, created_by_faculty_user_id FROM assignments WHERE assignment_id = ?",
    [assignmentId]
  );
  return rows[0] || null;
}

async function listByFaculty(facultyUserId) {
  const rows = await db.query(
    `SELECT a.assignment_id, a.offering_id, a.title, a.due_at, a.status
     FROM assignments a
     JOIN course_offerings o ON o.offering_id = a.offering_id
     WHERE o.faculty_user_id = ?
     ORDER BY a.due_at DESC`,
    [facultyUserId]
  );
  return rows;
}

async function listPublishedForStudent(studentUserId, { limit = 50 } = {}) {
  const rows = await db.query(
    `SELECT
      a.assignment_id,
      a.title,
      a.description,
      a.due_at,
      a.max_marks,
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
      AND a.status = 'Published'
    ORDER BY a.due_at ASC
    LIMIT ?`,
    [studentUserId, limit]
  );
  return rows;
}

module.exports = {
  createAssignment,
  publishAssignment,
  findById,
  listByFaculty,
  listPublishedForStudent
};

