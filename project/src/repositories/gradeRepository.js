const db = require("../config/db");

async function listPublishedGradesForStudent(studentUserId, { semesterLabel = null } = {}) {
  const rows = await db.query(
    `SELECT
      g.grade_id,
      g.semester_label,
      g.letter_grade,
      g.grade_points,
      g.remarks,
      g.is_published,
      o.offering_id,
      o.section_code,
      c.course_code,
      c.course_title,
      c.credit_value
    FROM grades g
    JOIN course_offerings o ON o.offering_id = g.offering_id
    JOIN courses c ON c.course_id = o.course_id
    WHERE g.student_user_id = ?
      AND g.is_published = true
      AND (? IS NULL OR g.semester_label = ?)
    ORDER BY g.semester_label DESC, c.course_code`,
    [studentUserId, semesterLabel, semesterLabel]
  );
  return rows;
}

async function listAllGradesForStudent(studentUserId) {
  const rows = await db.query(
    `SELECT
      g.grade_id,
      g.semester_label,
      g.letter_grade,
      g.grade_points,
      g.is_published,
      o.offering_id,
      c.course_code,
      c.course_title,
      c.credit_value
    FROM grades g
    JOIN course_offerings o ON o.offering_id = g.offering_id
    JOIN courses c ON c.course_id = o.course_id
    WHERE g.student_user_id = ?
      AND g.is_published = true
    ORDER BY g.semester_label DESC, c.course_code`,
    [studentUserId]
  );
  return rows;
}

module.exports = {
  listPublishedGradesForStudent,
  listAllGradesForStudent
};

