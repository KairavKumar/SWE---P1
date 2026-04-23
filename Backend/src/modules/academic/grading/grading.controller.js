const gradingService = require("./grading.service");

async function studentsEnrolled(req, res, next) {
  try {
    const offeringId = req.query.courseId || req.query.offeringId;
    const rows = await gradingService.studentsEnrolled({ offeringId, facultyUserId: req.user.sub });
    return res.status(200).json({ students: rows });
  } catch (err) {
    return next(err);
  }
}

async function submitGrades(req, res, next) {
  try {
    await gradingService.submitGrades({
      offeringId: req.body.offeringId,
      semesterLabel: req.body.semesterLabel,
      grades: req.body.grades,
      facultyUserId: req.user.sub
    });
    return res.status(200).json({ ok: true });
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  studentsEnrolled,
  submitGrades
};

