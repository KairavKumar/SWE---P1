const studentDashboardService = require("../services/studentDashboardService");
const academicRecordService = require("../services/academicRecordService");
const enrollmentRepository = require("../repositories/enrollmentRepository");

async function dashboard(req, res, next) {
  try {
    const studentUserId = req.user.sub;
    const payload = await studentDashboardService.getDashboard(studentUserId);
    return res.status(200).json(payload);
  } catch (err) {
    return next(err);
  }
}

async function grades(req, res, next) {
  try {
    const studentUserId = req.user.sub;
    const semesterLabel = req.query.semester || null;
    const rows = await academicRecordService.getCurrentGrades(studentUserId, { semesterLabel });
    if (!rows || rows.length === 0) {
      return res.status(204).send();
    }
    return res.status(200).json({ grades: rows });
  } catch (err) {
    return next(err);
  }
}

async function history(req, res, next) {
  try {
    const studentUserId = req.user.sub;
    const historyPayload = await academicRecordService.getHistory(studentUserId);
    if (!historyPayload.semesters.length) {
      return res.status(404).json({ error: { code: "RECORDS_NOT_FOUND", message: "No academic history found" } });
    }
    return res.status(200).json(historyPayload);
  } catch (err) {
    return next(err);
  }
}

async function summary(req, res, next) {
  try {
    const studentUserId = req.user.sub;
    const payload = await academicRecordService.getSummary(studentUserId);
    return res.status(200).json(payload);
  } catch (err) {
    return next(err);
  }
}

async function droppedHistory(req, res, next) {
  try {
    const studentUserId = req.user.sub;
    const rows = await enrollmentRepository.listDroppedHistory(studentUserId);
    return res.status(200).json({ dropped: rows });
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  dashboard,
  grades,
  history,
  summary,
  droppedHistory
};

