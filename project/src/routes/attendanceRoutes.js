const express = require("express");
const authenticate = require("../middleware/authenticate");
const rbac = require("../middleware/rbac");
const attendanceController = require("../controllers/attendanceController");

const router = express.Router();

// Student monitoring endpoints
router.get("/daily", authenticate, rbac.requireRole(["Student"]), attendanceController.daily);
router.get("/percentage", authenticate, rbac.requireRole(["Student"]), attendanceController.percentage);
router.get("/summary", authenticate, rbac.requireRole(["Student"]), attendanceController.summary);

// Faculty marking endpoints
router.get("/course/students", authenticate, rbac.requireRole(["Faculty"]), attendanceController.courseStudents);
router.post("/record", authenticate, rbac.requireRole(["Faculty"]), attendanceController.record);

module.exports = router;

