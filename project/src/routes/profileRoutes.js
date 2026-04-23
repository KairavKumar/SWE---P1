const express = require("express");
const authenticate = require("../middleware/authenticate");
const rbac = require("../middleware/rbac");
const profileController = require("../controllers/profileController");

const router = express.Router();

router.get("/profile", authenticate, profileController.getOwnProfile);
router.put("/profile", authenticate, profileController.updateOwnProfile);
router.get("/:id/profile", authenticate, rbac.requireRole(["Admin", "Faculty"]), profileController.getUserProfile);

module.exports = router;
