const express = require("express");
const authenticate = require("../middleware/authenticate");
const rbac = require("../middleware/rbac");
const rbacController = require("../controllers/rbacController");

const router = express.Router();

router.get("/my-permissions", authenticate, rbacController.myPermissions);
router.get("/roles", authenticate, rbac.requireRole(["Admin"]), rbacController.listRoles);
router.put("/roles/update", authenticate, rbac.requireRole(["Admin"]), rbacController.updateRole);

module.exports = router;
