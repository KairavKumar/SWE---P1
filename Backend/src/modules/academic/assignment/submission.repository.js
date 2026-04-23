const db = require("../../../config/db");

async function createSubmission({ submissionId, assignmentId, studentUserId, fileUrl, status }) {
  await db.query(
    `INSERT INTO assignment_submissions
      (submission_id, assignment_id, student_user_id, file_url, status)
     VALUES (?, ?, ?, ?, ?)`,
    [submissionId, assignmentId, studentUserId, fileUrl, status]
  );
}

async function findByAssignmentAndStudent(assignmentId, studentUserId) {
  const rows = await db.query(
    "SELECT submission_id, assignment_id, student_user_id, file_url, submitted_at, status FROM assignment_submissions WHERE assignment_id = ? AND student_user_id = ?",
    [assignmentId, studentUserId]
  );
  return rows[0] || null;
}

async function listForStudent(studentUserId) {
  const rows = await db.query(
    `SELECT submission_id, assignment_id, file_url, submitted_at, status
     FROM assignment_submissions
     WHERE student_user_id = ?
     ORDER BY submitted_at DESC`,
    [studentUserId]
  );
  return rows;
}

async function listByAssignment(assignmentId) {
  const rows = await db.query(
    `SELECT s.submission_id, s.assignment_id, s.student_user_id, s.file_url, s.submitted_at, s.status,
            u.institute_id, st.roll_no
     FROM assignment_submissions s
     JOIN users u ON u.id = s.student_user_id
     JOIN students st ON st.user_id = s.student_user_id
     WHERE s.assignment_id = ?
     ORDER BY s.submitted_at DESC`,
    [assignmentId]
  );
  return rows;
}

async function findById(submissionId) {
  const rows = await db.query(
    "SELECT submission_id, assignment_id, student_user_id, file_url, submitted_at, status FROM assignment_submissions WHERE submission_id = ?",
    [submissionId]
  );
  return rows[0] || null;
}

module.exports = {
  createSubmission,
  findByAssignmentAndStudent,
  listForStudent,
  listByAssignment,
  findById
};

