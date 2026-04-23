const assignmentService = require("./assignment.service");
const assignmentRepository = require("./assignment.repository");
const rubricRepository = require("./rubric.repository");

async function facultyCourses(req, res, next) {
  try {
    // Minimal: faculty can use /api/courses/available?semester=... filtered client-side,
    // but provide a direct list of their offerings here for the module spec.
    const rows = await assignmentRepository.listByFaculty(req.user.sub);
    return res.status(200).json({ assignments: rows });
  } catch (err) {
    return next(err);
  }
}

async function create(req, res, next) {
  try {
    const result = await assignmentService.facultyCreateAssignment({
      facultyUserId: req.user.sub,
      offeringId: req.body.offeringId,
      title: req.body.title,
      description: req.body.description,
      dueAt: req.body.dueAt,
      maxMarks: req.body.maxMarks,
      rubricItems: req.body.rubricItems
    });
    return res.status(200).json(result);
  } catch (err) {
    return next(err);
  }
}

async function publish(req, res, next) {
  try {
    await assignmentService.facultyPublishAssignment({
      facultyUserId: req.user.sub,
      assignmentId: req.body.assignmentId
    });
    return res.status(200).json({ ok: true });
  } catch (err) {
    return next(err);
  }
}

async function upload(req, res, next) {
  try {
    const result = await assignmentService.studentUpload({
      studentUserId: req.user.sub,
      assignmentId: req.body.assignmentId,
      fileUrl: req.body.fileUrl
    });
    return res.status(200).json(result);
  } catch (err) {
    return next(err);
  }
}

async function submissionStatus(req, res, next) {
  try {
    const record = await assignmentService.studentSubmissionStatus({
      studentUserId: req.user.sub,
      assignmentId: req.query.assignmentId
    });
    return res.status(200).json({ submission: record });
  } catch (err) {
    return next(err);
  }
}

async function submissionList(req, res, next) {
  try {
    const rows = await assignmentService.studentSubmissionList({ studentUserId: req.user.sub });
    return res.status(200).json({ submissions: rows });
  } catch (err) {
    return next(err);
  }
}

async function listSubmissions(req, res, next) {
  try {
    const rows = await assignmentService.facultyListSubmissions({
      facultyUserId: req.user.sub,
      assignmentId: req.query.assignmentId
    });
    return res.status(200).json({ submissions: rows });
  } catch (err) {
    return next(err);
  }
}

async function submissionFile(req, res, next) {
  try {
    const result = await assignmentService.facultyGetSubmissionFile({
      facultyUserId: req.user.sub,
      submissionId: req.query.submissionId
    });
    return res.status(200).json(result);
  } catch (err) {
    return next(err);
  }
}

async function reviewSubmission(req, res, next) {
  try {
    await assignmentService.facultyReviewSubmission({
      facultyUserId: req.user.sub,
      submissionId: req.body.submissionId,
      marks: req.body.marks,
      letterGrade: req.body.letterGrade,
      feedback: req.body.feedback
    });
    return res.status(200).json({ ok: true });
  } catch (err) {
    return next(err);
  }
}

async function rubric(req, res, next) {
  try {
    const rows = await rubricRepository.listByAssignment(req.query.assignmentId);
    return res.status(200).json({ rubric: rows });
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  facultyCourses,
  create,
  publish,
  upload,
  submissionStatus,
  submissionList,
  listSubmissions,
  submissionFile,
  reviewSubmission,
  rubric
};

