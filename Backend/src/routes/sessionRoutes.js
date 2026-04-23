const express = require("express");
const authenticate = require("../middleware/authenticate");
const rbac = require("../middleware/rbac");
const sessionController = require("../controllers/sessionController");

const router = express.Router();

router.post("/refresh", sessionController.refresh);
router.post("/logout", sessionController.logout);
router.get("/status", sessionController.status);
router.post("/revoke-all", authenticate, rbac.requireRole(["Admin"]), sessionController.revokeAll);

module.exports = router;
