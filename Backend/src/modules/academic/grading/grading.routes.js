const express = require("express");
const authenticate = require("../../../middleware/authenticate");
const rbac = require("../../../middleware/rbac");
const controller = require("./grading.controller");

const router = express.Router();

router.get("/grades/students-enrolled", authenticate, rbac.requireRole(["Faculty"]), controller.studentsEnrolled);
router.post("/grades/submit-grades", authenticate, rbac.requireRole(["Faculty"]), controller.submitGrades);

module.exports = router;

