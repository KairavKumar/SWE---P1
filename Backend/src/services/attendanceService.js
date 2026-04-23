const crypto = require("crypto");
const attendanceRepository = require("../repositories/attendanceRepository");
const courseRepository = require("../repositories/courseRepository");
const auditLogger = require("./auditLogger");

async function getDaily({ studentUserId, offeringId }) {
  return attendanceRepository.listDaily({ studentUserId, offeringId, limit: 100 });
}

async function getPercentage({ studentUserId, offeringId }) {
  if (!offeringId) {
    const error = new Error("Missing offeringId");
    error.status = 400;
    error.code = "MALFORMED_REQUEST";
    throw error;
  }
  return attendanceRepository.getPercentage({ studentUserId, offeringId });
}

async function getSummary({ studentUserId }) {
  return attendanceRepository.listSummary(studentUserId);
}

async function listCourseStudents({ offeringId, facultyUserId }) {
  if (!offeringId) {
    const error = new Error("Missing offeringId");
    error.status = 400;
    error.code = "MALFORMED_REQUEST";
    throw error;
  }
  const ok = await courseRepository.isFacultyOwner(offeringId, facultyUserId);
  if (!ok) {
    const error = new Error("Forbidden");
    error.status = 403;
    error.code = "UNAUTHORIZED_FACULTY";
    throw error;
  }
  return attendanceRepository.listCourseStudents(offeringId);
}

async function recordBulk({ offeringId, attendanceDate, items, facultyUserId }) {
  if (!offeringId || !attendanceDate || !Array.isArray(items)) {
    const error = new Error("Invalid input");
    error.status = 400;
    error.code = "INVALID_INPUT";
    throw error;
  }
  const ok = await courseRepository.isFacultyOwner(offeringId, facultyUserId);
  if (!ok) {
    const error = new Error("Forbidden");
    error.status = 403;
    error.code = "UNAUTHORIZED_FACULTY";
    throw error;
  }

  const records = items.map((it) => ({
    attendanceId: crypto.randomUUID(),
    studentUserId: String(it.studentUserId),
    status: it.status === "Present" ? "Present" : "Absent"
  }));

  await attendanceRepository.upsertAttendanceBulk({
    offeringId,
    attendanceDate,
    records,
    facultyUserId
  });

  auditLogger.logEvent({
    eventType: "ATTENDANCE_RECORDED",
    userId: facultyUserId,
    success: true,
    resource: "ACADEMIC"
  });
}

module.exports = {
  getDaily,
  getPercentage,
  getSummary,
  listCourseStudents,
  recordBulk
};

