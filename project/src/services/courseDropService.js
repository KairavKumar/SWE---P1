const db = require("../config/db");
const courseRepository = require("../repositories/courseRepository");
const enrollmentRepository = require("../repositories/enrollmentRepository");
const auditLogger = require("./auditLogger");

function isDropWindowOpen() {
  // Simple policy hook; can be replaced with Program Configuration module later.
  return (process.env.DROP_WINDOW_OPEN || "true").toLowerCase() === "true";
}

async function dropCourse({ studentUserId, offeringId }) {
  if (!offeringId) {
    const error = new Error("Missing offeringId");
    error.status = 400;
    error.code = "MALFORMED_REQUEST";
    throw error;
  }
  if (!isDropWindowOpen()) {
    const error = new Error("Window closed");
    error.status = 403;
    error.code = "WINDOW_CLOSED";
    throw error;
  }

  const connection = await db.pool.getConnection();
  try {
    await connection.beginTransaction();

    const enrollment = await enrollmentRepository.getEnrollmentForUpdate(studentUserId, offeringId, connection);
    if (!enrollment) {
      const error = new Error("Not enrolled");
      error.status = 404;
      error.code = "NOT_ENROLLED";
      throw error;
    }
    if (enrollment.enrollment_status === "dropped") {
      const error = new Error("Already dropped");
      error.status = 400;
      error.code = "ALREADY_DROPPED";
      throw error;
    }

    const offering = await courseRepository.getOfferingForUpdate(offeringId, connection);
    if (!offering) {
      const error = new Error("Offering not found");
      error.status = 404;
      error.code = "OFFERING_NOT_FOUND";
      throw error;
    }

    await enrollmentRepository.dropEnrollment(enrollment.enrollment_id, connection);
    await courseRepository.incrementSeatsTaken(offeringId, -1, connection);

    await connection.commit();

    auditLogger.logEvent({
      eventType: "COURSE_DROPPED",
      userId: studentUserId,
      success: true,
      resource: "ACADEMIC"
    });

    return { ok: true };
  } catch (err) {
    try {
      await connection.rollback();
    } catch {}
    throw err;
  } finally {
    connection.release();
  }
}

module.exports = {
  isDropWindowOpen,
  dropCourse
};

