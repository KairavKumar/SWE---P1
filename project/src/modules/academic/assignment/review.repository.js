const db = require("../../../config/db");

async function upsertReview({ reviewId, submissionId, assignmentId, studentUserId, facultyUserId, marks, letterGrade, feedback }) {
  await db.query(
    `INSERT INTO assignment_reviews
      (review_id, submission_id, assignment_id, student_user_id, faculty_user_id, marks, letter_grade, feedback)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
       faculty_user_id = VALUES(faculty_user_id),
       marks = VALUES(marks),
       letter_grade = VALUES(letter_grade),
       feedback = VALUES(feedback),
       reviewed_at = CURRENT_TIMESTAMP`,
    [reviewId, submissionId, assignmentId, studentUserId, facultyUserId, marks, letterGrade, feedback]
  );
}

async function findBySubmission(submissionId) {
  const rows = await db.query(
    "SELECT review_id, submission_id, marks, letter_grade, feedback, reviewed_at FROM assignment_reviews WHERE submission_id = ?",
    [submissionId]
  );
  return rows[0] || null;
}

module.exports = {
  upsertReview,
  findBySubmission
};

