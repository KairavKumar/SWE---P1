const express = require("express");
const authenticate = require("../middleware/authenticate");
const rbac = require("../middleware/rbac");
const studentController = require("../controllers/studentController");

const router = express.Router();

router.get("/dashboard", authenticate, rbac.requireRole(["Student"]), studentController.dashboard);
router.get("/grades", authenticate, rbac.requireRole(["Student"]), studentController.grades);
router.get("/history", authenticate, rbac.requireRole(["Student"]), studentController.history);
router.get("/summary", authenticate, rbac.requireRole(["Student"]), studentController.summary);
router.get("/dropped-history", authenticate, rbac.requireRole(["Student"]), studentController.droppedHistory);

module.exports = router;

