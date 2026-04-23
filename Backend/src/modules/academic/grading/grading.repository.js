const db = require("../../../config/db");

async function upsertCourseGrade({ gradeId, studentUserId, offeringId, semesterLabel, marks, letterGrade, gradePoints, facultyUserId }) {
  await db.query(
    `INSERT INTO grades
      (grade_id, student_user_id, offering_id, semester_label, marks, letter_grade, grade_points, is_published, uploaded_by_faculty_user_id, uploaded_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, false, ?, NOW())
     ON DUPLICATE KEY UPDATE
       marks = VALUES(marks),
       letter_grade = VALUES(letter_grade),
       grade_points = VALUES(grade_points),
       uploaded_by_faculty_user_id = VALUES(uploaded_by_faculty_user_id),
       uploaded_at = NOW()`,
    [gradeId, studentUserId, offeringId, semesterLabel, marks, letterGrade, gradePoints, facultyUserId]
  );
}

module.exports = {
  upsertCourseGrade
};

