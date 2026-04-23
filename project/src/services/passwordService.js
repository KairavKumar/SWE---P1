const crypto = require("crypto");
const env = require("../config/env");
const userRepository = require("../repositories/userRepository");
const tokenRepository = require("../repositories/passwordTokenRepository");
const cryptoManager = require("./cryptoManager");
const emailService = require("./emailService");
const auditLogger = require("./auditLogger");

function buildResetUrl(baseUrl, token) {
  const url = new URL(baseUrl);
  url.searchParams.set("token", token);
  return url.toString();
}

function validatePasswordStrength(password) {
  if (typeof password !== "string") {
    return false;
  }
  if (password.length < 8) {
    return false;
  }
  const hasLetter = /[A-Za-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSymbol = /[^A-Za-z0-9]/.test(password);
  return hasLetter && hasNumber && hasSymbol;
}

async function requestReset({ instituteId, email, originUrl }) {
  const identifier = instituteId || email || "";
  const user = identifier ? await userRepository.findByInstituteIdOrEmail(identifier) : null;

  if (!user) {
    return;
  }

  const token = cryptoManager.generateToken();
  const hashedToken = cryptoManager.hashToken(token);
  const expiresAt = new Date(Date.now() + env.passwordReset.expiryMinutes * 60 * 1000);
  const tokenId = crypto.randomUUID();

  await tokenRepository.createToken({
    tokenId,
    userId: user.id,
    hashedToken,
    expiresAt
  });

  if (user.institute_id || user.email) {
    const resetUrl = buildResetUrl(originUrl, token);
    await emailService.sendPasswordReset(user.institute_id || user.email, resetUrl);
  }

  auditLogger.logEvent({
    eventType: "PASSWORD_RESET_REQUESTED",
    instituteId: user.institute_id,
    userId: user.id,
    success: true
  });
}

async function verifyToken(token) {
  if (!token) {
    const error = new Error("Token invalid");
    error.status = 400;
    error.code = "TOKEN_INVALID";
    throw error;
  }
  const hashedToken = cryptoManager.hashToken(token);
  const record = await tokenRepository.findByHashedToken(hashedToken);
  if (!record) {
    const error = new Error("Token invalid");
    error.status = 400;
    error.code = "TOKEN_INVALID";
    throw error;
  }
  if (record.is_used) {
    const error = new Error("Token already used");
    error.status = 403;
    error.code = "TOKEN_ALREADY_USED";
    throw error;
  }
  if (new Date(record.expires_at) < new Date()) {
    const error = new Error("Token expired");
    error.status = 401;
    error.code = "TOKEN_EXPIRED";
    throw error;
  }
  return record;
}

async function resetPassword({ token, password }) {
  const record = await verifyToken(token);

  if (!validatePasswordStrength(password)) {
    const error = new Error("Weak password");
    error.status = 422;
    error.code = "WEAK_PASSWORD";
    throw error;
  }

  const passwordHash = await cryptoManager.hashPassword(password);
  await userRepository.updatePasswordHash(record.user_id, passwordHash);
  await tokenRepository.markUsed(record.token_id);

  auditLogger.logEvent({
    eventType: "PASSWORD_RESET_COMPLETED",
    userId: record.user_id,
    success: true
  });
}

async function changePassword({ userId, currentPassword, newPassword }) {
  if (!userId || !currentPassword || !newPassword) {
    const error = new Error("Missing fields");
    error.status = 400;
    error.code = "MALFORMED_REQUEST";
    throw error;
  }

  if (!validatePasswordStrength(newPassword)) {
    const error = new Error("Weak password");
    error.status = 422;
    error.code = "WEAK_PASSWORD";
    throw error;
  }

  const user = await userRepository.findAuthById(userId);
  if (!user) {
    const error = new Error("User not found");
    error.status = 404;
    error.code = "USER_NOT_FOUND";
    throw error;
  }
  if (!user.is_active) {
    const error = new Error("Account disabled");
    error.status = 403;
    error.code = "ACCOUNT_DISABLED";
    throw error;
  }

  const ok = await cryptoManager.verifyPassword(currentPassword, user.password_hash);
  if (!ok) {
    auditLogger.logEvent({
      eventType: "PASSWORD_CHANGE_FAILED",
      instituteId: user.institute_id,
      userId: user.id,
      success: false
    });
    const error = new Error("Invalid credentials");
    error.status = 401;
    error.code = "INVALID_CREDENTIALS";
    throw error;
  }

  const passwordHash = await cryptoManager.hashPassword(newPassword);
  await userRepository.updatePasswordHash(user.id, passwordHash);

  auditLogger.logEvent({
    eventType: "PASSWORD_CHANGED",
    instituteId: user.institute_id,
    userId: user.id,
    success: true
  });
}

module.exports = {
  requestReset,
  verifyToken,
  resetPassword,
  changePassword
};
