const passwordService = require("../services/passwordService");

async function forgot(req, res, next) {
  try {
    const { instituteId, email } = req.body || {};
    const originUrl = `${req.protocol}://${req.get("host")}/reset-password`;
    await passwordService.requestReset({ instituteId, email, originUrl });
    return res.status(200).json({ message: "If an account exists, an email was sent." });
  } catch (err) {
    return next(err);
  }
}

async function verify(req, res, next) {
  try {
    const { token } = req.query || {};
    await passwordService.verifyToken(token);
    return res.status(200).json({ valid: true });
  } catch (err) {
    return next(err);
  }
}

async function reset(req, res, next) {
  try {
    const { token, password } = req.body || {};
    await passwordService.resetPassword({ token, password });
    return res.status(200).json({ ok: true });
  } catch (err) {
    return next(err);
  }
}

async function change(req, res, next) {
  try {
    const userId = req.user.sub;
    const { currentPassword, newPassword } = req.body || {};
    await passwordService.changePassword({ userId, currentPassword, newPassword });
    return res.status(200).json({ ok: true });
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  forgot,
  verify,
  reset,
  change
};
