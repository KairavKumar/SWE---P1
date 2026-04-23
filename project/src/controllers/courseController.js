const courseRegistrationService = require("../services/courseRegistrationService");
const courseDropService = require("../services/courseDropService");
const enrollmentRepository = require("../repositories/enrollmentRepository");

async function available(req, res, next) {
  try {
    const semesterLabel = req.query.semester || null;
    const offerings = await courseRegistrationService.listAvailable({ semesterLabel });
    return res.status(200).json({ offerings });
  } catch (err) {
    return next(err);
  }
}

async function register(req, res, next) {
  try {
    const studentUserId = req.user.sub;
    const { offeringIds } = req.body || {};
    const result = await courseRegistrationService.registerCourses({ studentUserId, offeringIds });
    return res.status(200).json(result);
  } catch (err) {
    return next(err);
  }
}

async function myEnrollments(req, res, next) {
  try {
    const studentUserId = req.user.sub;
    const rows = await enrollmentRepository.listMyEnrollments(studentUserId);
    return res.status(200).json({ enrollments: rows });
  } catch (err) {
    return next(err);
  }
}

async function drop(req, res, next) {
  try {
    const studentUserId = req.user.sub;
    const { offeringId } = req.body || {};
    const result = await courseDropService.dropCourse({ studentUserId, offeringId });
    return res.status(200).json(result);
  } catch (err) {
    return next(err);
  }
}

async function dropStatus(req, res) {
  return res.status(200).json({ open: courseDropService.isDropWindowOpen() });
}

module.exports = {
  available,
  register,
  myEnrollments,
  drop,
  dropStatus
};

