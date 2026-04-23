const express = require("express");
const authenticate = require("../../../middleware/authenticate");
const rbac = require("../../../middleware/rbac");
const controller = require("./assignment.controller");

const router = express.Router();

// Faculty: assignment config/publish
router.get("/faculty/courses", authenticate, rbac.requireRole(["Faculty"]), controller.facultyCourses);
router.post("/assignment/create", authenticate, rbac.requireRole(["Faculty"]), controller.create);
router.post("/assignment/publish", authenticate, rbac.requireRole(["Faculty"]), controller.publish);

// Student: upload/submission status
router.post("/assignment/upload", authenticate, rbac.requireRole(["Student"]), controller.upload);
router.get("/assignment/submission/status", authenticate, rbac.requireRole(["Student"]), controller.submissionStatus);
router.get("/assignment/submission/list", authenticate, rbac.requireRole(["Student"]), controller.submissionList);
router.get("/assignment/rubric", authenticate, rbac.requireRole(["Student","Faculty"]), controller.rubric);

// Faculty: review
router.get("/review/submissions", authenticate, rbac.requireRole(["Faculty"]), controller.listSubmissions);
router.get("/review/submission/file", authenticate, rbac.requireRole(["Faculty"]), controller.submissionFile);
router.post("/review/review-submission", authenticate, rbac.requireRole(["Faculty"]), controller.reviewSubmission);

module.exports = router;

