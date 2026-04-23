const express = require("express");
const authenticate = require("../middleware/authenticate");
const rbac = require("../middleware/rbac");
const auditController = require("../controllers/auditController");

const router = express.Router();

router.post("/event", auditController.ingest);
router.get("/audit", authenticate, rbac.requireRole(["Admin"]), auditController.listAudit);
router.get("/export", authenticate, rbac.requireRole(["Admin"]), auditController.exportLogs);

module.exports = router;
