const gradeRepository = require("../repositories/gradeRepository");
const gpaEngine = require("./gpaEngine");

async function getCurrentGrades(studentUserId, { semesterLabel = null } = {}) {
  const grades = await gradeRepository.listPublishedGradesForStudent(studentUserId, { semesterLabel });
  return grades;
}

async function getHistory(studentUserId) {
  const rows = await gradeRepository.listAllGradesForStudent(studentUserId);
  const grouped = gpaEngine.groupBySemester(rows);

  const semesters = [];
  for (const [semesterLabel, items] of grouped.entries()) {
    const { gpa: sgpa, creditsAttempted } = gpaEngine.calcGpa(items);
    semesters.push({
      semesterLabel,
      sgpa,
      creditsAttempted,
      grades: items.map((g) => ({
        courseCode: g.course_code,
        courseTitle: g.course_title,
        creditValue: g.credit_value,
        letterGrade: g.letter_grade,
        gradePoints: g.grade_points
      }))
    });
  }

  // CGPA over all published grades
  const { gpa: cgpa, creditsAttempted: totalCredits } = gpaEngine.calcGpa(rows);

  return {
    cgpa,
    totalCreditsAttempted: totalCredits,
    semesters
  };
}

async function getSummary(studentUserId) {
  const history = await getHistory(studentUserId);
  const latest = history.semesters[0] || null;
  return {
    cgpa: history.cgpa,
    latestSemester: latest ? latest.semesterLabel : null,
    sgpa: latest ? latest.sgpa : null
  };
}

module.exports = {
  getCurrentGrades,
  getHistory,
  getSummary
};

