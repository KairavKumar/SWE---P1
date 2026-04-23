const attendanceService = require("../services/attendanceService");

async function daily(req, res, next) {
  try {
    const offeringId = req.query.courseId || req.query.offeringId || null;
    const rows = await attendanceService.getDaily({ studentUserId: req.user.sub, offeringId });
    if (!rows.length) {
      return res.status(404).json({ error: { code: "DATA_NOT_FOUND", message: "No attendance records" } });
    }
    return res.status(200).json({ records: rows });
  } catch (err) {
    return next(err);
  }
}

async function percentage(req, res, next) {
  try {
    const offeringId = req.query.courseId || req.query.offeringId;
    const result = await attendanceService.getPercentage({ studentUserId: req.user.sub, offeringId });
    return res.status(200).json(result);
  } catch (err) {
    return next(err);
  }
}

async function summary(req, res, next) {
  try {
    const rows = await attendanceService.getSummary({ studentUserId: req.user.sub });
    return res.status(200).json({ summary: rows });
  } catch (err) {
    return next(err);
  }
}

async function courseStudents(req, res, next) {
  try {
    const offeringId = req.query.courseId || req.query.offeringId;
    const rows = await attendanceService.listCourseStudents({ offeringId, facultyUserId: req.user.sub });
    return res.status(200).json({ students: rows });
  } catch (err) {
    return next(err);
  }
}

async function record(req, res, next) {
  try {
    const { offeringId, date, items } = req.body || {};
    await attendanceService.recordBulk({
      offeringId,
      attendanceDate: date,
      items: items || [],
      facultyUserId: req.user.sub
    });
    return res.status(200).json({ ok: true });
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  daily,
  percentage,
  summary,
  courseStudents,
  record
};

