const express = require("express");
const authenticate = require("../middleware/authenticate");
const rbac = require("../middleware/rbac");
const courseController = require("../controllers/courseController");

const router = express.Router();

router.get("/available", authenticate, rbac.requireRole(["Student"]), courseController.available);
router.post("/register", authenticate, rbac.requireRole(["Student"]), courseController.register);
router.get("/my-enrollments", authenticate, rbac.requireRole(["Student"]), courseController.myEnrollments);

router.post("/drop", authenticate, rbac.requireRole(["Student"]), courseController.drop);
router.get("/drop-status", authenticate, rbac.requireRole(["Student"]), courseController.dropStatus);

module.exports = router;

