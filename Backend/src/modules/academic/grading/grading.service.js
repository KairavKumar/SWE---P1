const crypto = require("crypto");
const courseRepository = require("../../../repositories/courseRepository");
const attendanceRepository = require("../../../repositories/attendanceRepository");
const gradingRepository = require("./grading.repository");
const auditLogger = require("../../../services/auditLogger");

function toLetter(marks) {
  const m = Number(marks);
  if (!Number.isFinite(m)) return null;
  if (m >= 90) return "A+";
  if (m >= 80) return "A";
  if (m >= 70) return "B+";
  if (m >= 60) return "B";
  if (m >= 50) return "C";
  if (m >= 40) return "D";
  return "F";
}

function toPoints(letter) {
  const map = {
    "A+": 10,
    A: 9,
    "B+": 8,
    B: 7,
    C: 5,
    D: 4,
    F: 0
  };
  return map[String(letter || "").toUpperCase()] ?? null;
}

async function studentsEnrolled({ offeringId, facultyUserId }) {
  const owns = await courseRepository.isFacultyOwner(offeringId, facultyUserId);
  if (!owns) {
    const error = new Error("Forbidden");
    error.status = 403;
    error.code = "UNAUTHORIZED_FACULTY";
    throw error;
  }
  return attendanceRepository.listCourseStudents(offeringId);
}

async function submitGrades({ offeringId, semesterLabel, grades, facultyUserId }) {
  if (!offeringId || !semesterLabel || !Array.isArray(grades) || grades.length === 0) {
    const error = new Error("Invalid input");
    error.status = 400;
    error.code = "INVALID_INPUT";
    throw error;
  }
  const owns = await courseRepository.isFacultyOwner(offeringId, facultyUserId);
  if (!owns) {
    const error = new Error("Forbidden");
    error.status = 403;
    error.code = "UNAUTHORIZED_FACULTY";
    throw error;
  }

  for (const g of grades) {
    const studentUserId = String(g.studentUserId || "");
    const marks = g.marks === undefined ? null : Number(g.marks);
    const letterGrade = g.letterGrade ? String(g.letterGrade).toUpperCase() : toLetter(marks);
    const gradePoints = toPoints(letterGrade);
    await gradingRepository.upsertCourseGrade({
      gradeId: crypto.randomUUID(),
      studentUserId,
      offeringId,
      semesterLabel,
      marks,
      letterGrade,
      gradePoints,
      facultyUserId
    });
  }

  auditLogger.logEvent({
    eventType: "COURSE_GRADES_SUBMITTED",
    userId: facultyUserId,
    success: true,
    resource: "ACADEMIC"
  });
}

module.exports = {
  studentsEnrolled,
  submitGrades
};

