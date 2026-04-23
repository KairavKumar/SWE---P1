const crypto = require("crypto");
const env = require("../config/env");
const db = require("../config/db");
const courseRepository = require("../repositories/courseRepository");
const enrollmentRepository = require("../repositories/enrollmentRepository");
const auditLogger = require("./auditLogger");

function isRegistrationOpen() {
  return (process.env.REGISTRATION_OPEN || "true").toLowerCase() === "true";
}

async function listAvailable({ semesterLabel }) {
  return courseRepository.listAvailableOfferings({ semesterLabel });
}

async function registerCourses({ studentUserId, offeringIds }) {
  if (!isRegistrationOpen()) {
    const error = new Error("Registration closed");
    error.status = 403;
    error.code = "REGISTRATION_CLOSED";
    throw error;
  }
  if (!Array.isArray(offeringIds) || offeringIds.length === 0) {
    const error = new Error("Missing offeringIds");
    error.status = 400;
    error.code = "MALFORMED_REQUEST";
    throw error;
  }

  const uniqueOfferingIds = [...new Set(offeringIds.map(String))];
  const connection = await db.pool.getConnection();
  try {
    await connection.beginTransaction();

    const created = [];
    for (const offeringId of uniqueOfferingIds) {
      const offering = await courseRepository.getOfferingForUpdate(offeringId, connection);
      if (!offering || offering.status !== "active") {
        const error = new Error("Offering not available");
        error.status = 404;
        error.code = "OFFERING_NOT_FOUND";
        throw error;
      }
      if (offering.seats_taken >= offering.seat_capacity) {
        const error = new Error("Course full");
        error.status = 409;
        error.code = "COURSE_FULL";
        throw error;
      }

      const existing = await enrollmentRepository.getEnrollmentForUpdate(studentUserId, offeringId, connection);
      if (existing && existing.enrollment_status !== "dropped") {
        continue;
      }
      if (existing && existing.enrollment_status === "dropped") {
        // Keep it simple for now: prevent re-add via this endpoint.
        const error = new Error("Already dropped");
        error.status = 400;
        error.code = "ALREADY_DROPPED";
        throw error;
      }

      const enrollmentId = crypto.randomUUID();
      await enrollmentRepository.createEnrollment({
        enrollmentId,
        studentUserId,
        offeringId,
        connection
      });
      await courseRepository.incrementSeatsTaken(offeringId, 1, connection);
      created.push({ enrollmentId, offeringId });
    }

    await connection.commit();

    auditLogger.logEvent({
      eventType: "COURSE_REGISTERED",
      userId: studentUserId,
      success: true,
      resource: "ACADEMIC"
    });

    return { created };
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
  listAvailable,
  registerCourses
};

