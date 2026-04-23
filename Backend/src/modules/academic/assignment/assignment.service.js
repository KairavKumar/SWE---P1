const crypto = require("crypto");
const courseRepository = require("../../../repositories/courseRepository");
const assignmentRepository = require("./assignment.repository");
const rubricRepository = require("./rubric.repository");
const submissionRepository = require("./submission.repository");
const reviewRepository = require("./review.repository");
const auditLogger = require("../../../services/auditLogger");

const allowedExt = new Set([".pdf", ".docx", ".zip"]);

function getExt(fileUrl) {
  const idx = String(fileUrl || "").lastIndexOf(".");
  if (idx === -1) return "";
  return String(fileUrl).slice(idx).toLowerCase();
}

async function facultyCreateAssignment({ facultyUserId, offeringId, title, description, dueAt, maxMarks, rubricItems }) {
  if (!offeringId || !title || !dueAt) {
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

  const assignmentId = crypto.randomUUID();
  await assignmentRepository.createAssignment({
    assignmentId,
    offeringId,
    facultyUserId,
    title,
    description,
    dueAt,
    maxMarks: maxMarks || 100
  });

  const items = Array.isArray(rubricItems) ? rubricItems.slice(0, 10) : [];
  await rubricRepository.replaceRubric(
    assignmentId,
    items.map((it) => ({
      rubricId: crypto.randomUUID(),
      criteria: String(it.criteria || "").slice(0, 255),
      maxScore: Number(it.maxScore || 0)
    }))
  );

  auditLogger.logEvent({
    eventType: "ASSIGNMENT_CREATED",
    userId: facultyUserId,
    success: true,
    resource: "ACADEMIC"
  });

  return { assignmentId };
}

async function facultyPublishAssignment({ facultyUserId, assignmentId }) {
  const assignment = await assignmentRepository.findById(assignmentId);
  if (!assignment) {
    const error = new Error("Assignment not found");
    error.status = 400;
    error.code = "INVALID_ASSIGNMENT";
    throw error;
  }
  const owns = await courseRepository.isFacultyOwner(assignment.offering_id, facultyUserId);
  if (!owns) {
    const error = new Error("Forbidden");
    error.status = 403;
    error.code = "UNAUTHORIZED_FACULTY";
    throw error;
  }
  await assignmentRepository.publishAssignment(assignmentId);
  auditLogger.logEvent({
    eventType: "ASSIGNMENT_PUBLISHED",
    userId: facultyUserId,
    success: true,
    resource: "ACADEMIC"
  });
}

async function studentUpload({ studentUserId, assignmentId, fileUrl }) {
  if (!assignmentId || !fileUrl) {
    const error = new Error("Invalid input");
    error.status = 400;
    error.code = "INVALID_INPUT";
    throw error;
  }

  const ext = getExt(fileUrl);
  if (!allowedExt.has(ext)) {
    const error = new Error("Invalid file");
    error.status = 400;
    error.code = "INVALID_FILE";
    throw error;
  }

  const assignment = await assignmentRepository.findById(assignmentId);
  if (!assignment) {
    const error = new Error("Assignment not found");
    error.status = 400;
    error.code = "INVALID_ASSIGNMENT";
    throw error;
  }
  if (assignment.status !== "Published") {
    const error = new Error("Assignment not published");
    error.status = 403;
    error.code = "INVALID_ASSIGNMENT";
    throw error;
  }

  const existing = await submissionRepository.findByAssignmentAndStudent(assignmentId, studentUserId);
  if (existing) {
    const error = new Error("Duplicate submission");
    error.status = 400;
    error.code = "DUPLICATE_SUBMISSION";
    throw error;
  }

  const due = new Date(assignment.due_at);
  const late = Date.now() > due.getTime();
  if (late) {
    const error = new Error("Deadline passed");
    error.status = 400;
    error.code = "DEADLINE_PASSED";
    throw error;
  }

  const submissionId = crypto.randomUUID();
  await submissionRepository.createSubmission({
    submissionId,
    assignmentId,
    studentUserId,
    fileUrl,
    status: "Submitted"
  });

  auditLogger.logEvent({
    eventType: "ASSIGNMENT_SUBMITTED",
    userId: studentUserId,
    success: true,
    resource: "ACADEMIC"
  });

  return { submissionId };
}

async function studentSubmissionStatus({ studentUserId, assignmentId }) {
  const record = await submissionRepository.findByAssignmentAndStudent(assignmentId, studentUserId);
  return record;
}

async function studentSubmissionList({ studentUserId }) {
  return submissionRepository.listForStudent(studentUserId);
}

async function facultyListSubmissions({ facultyUserId, assignmentId }) {
  const assignment = await assignmentRepository.findById(assignmentId);
  if (!assignment) {
    const error = new Error("Assignment not found");
    error.status = 400;
    error.code = "INVALID_ASSIGNMENT";
    throw error;
  }
  const owns = await courseRepository.isFacultyOwner(assignment.offering_id, facultyUserId);
  if (!owns) {
    const error = new Error("Forbidden");
    error.status = 403;
    error.code = "UNAUTHORIZED_FACULTY";
    throw error;
  }
  return submissionRepository.listByAssignment(assignmentId);
}

async function facultyGetSubmissionFile({ facultyUserId, submissionId }) {
  const sub = await submissionRepository.findById(submissionId);
  if (!sub) {
    const error = new Error("Submission not found");
    error.status = 404;
    error.code = "SUBMISSION_NOT_FOUND";
    throw error;
  }
  const assignment = await assignmentRepository.findById(sub.assignment_id);
  const owns = assignment ? await courseRepository.isFacultyOwner(assignment.offering_id, facultyUserId) : false;
  if (!owns) {
    const error = new Error("Forbidden");
    error.status = 403;
    error.code = "UNAUTHORIZED_FACULTY";
    throw error;
  }
  return { fileUrl: sub.file_url };
}

async function facultyReviewSubmission({ facultyUserId, submissionId, marks, letterGrade, feedback }) {
  const sub = await submissionRepository.findById(submissionId);
  if (!sub) {
    const error = new Error("Submission not found");
    error.status = 404;
    error.code = "SUBMISSION_NOT_FOUND";
    throw error;
  }

  const assignment = await assignmentRepository.findById(sub.assignment_id);
  if (!assignment) {
    const error = new Error("Assignment not found");
    error.status = 400;
    error.code = "INVALID_ASSIGNMENT";
    throw error;
  }
  const owns = await courseRepository.isFacultyOwner(assignment.offering_id, facultyUserId);
  if (!owns) {
    const error = new Error("Forbidden");
    error.status = 403;
    error.code = "UNAUTHORIZED_FACULTY";
    throw error;
  }

  const reviewId = crypto.randomUUID();
  await reviewRepository.upsertReview({
    reviewId,
    submissionId,
    assignmentId: sub.assignment_id,
    studentUserId: sub.student_user_id,
    facultyUserId,
    marks: marks === undefined ? null : Number(marks),
    letterGrade: letterGrade ? String(letterGrade).slice(0, 4) : null,
    feedback: feedback ? String(feedback) : null
  });

  auditLogger.logEvent({
    eventType: "ASSIGNMENT_REVIEWED",
    userId: facultyUserId,
    success: true,
    resource: "ACADEMIC"
  });
}

module.exports = {
  facultyCreateAssignment,
  facultyPublishAssignment,
  studentUpload,
  studentSubmissionStatus,
  studentSubmissionList,
  facultyListSubmissions,
  facultyGetSubmissionFile,
  facultyReviewSubmission
};

