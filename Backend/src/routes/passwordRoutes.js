const express = require("express");
const rateLimit = require("express-rate-limit");
const env = require("../config/env");
const passwordController = require("../controllers/passwordController");
const authenticate = require("../middleware/authenticate");

const router = express.Router();

const forgotLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: env.passwordReset.rateLimitForgot,
  standardHeaders: true,
  legacyHeaders: false
});

router.post("/forgot", forgotLimiter, passwordController.forgot);
router.get("/verify", passwordController.verify);
router.post("/reset", passwordController.reset);
router.post("/change", authenticate, passwordController.change);

module.exports = router;
