const crypto = require("crypto");
const ldapConnector = require("../config/ldap");
const jwtConfig = require("../config/jwt");
const userRepository = require("../repositories/userRepository");
const auditLogger = require("./auditLogger");

async function login({ instituteId, password, ip, userAgent }) {
  if (!instituteId || !password) {
    const error = new Error("Missing credentials");
    error.status = 400;
    error.code = "MALFORMED_REQUEST";
    throw error;
  }

  let ldapOk = false;
  try {
    ldapOk = await ldapConnector.verifyCredentials(instituteId, password);
  } catch (err) {
    const error = new Error("LDAP unavailable");
    error.status = 503;
    error.code = "LDAP_UNAVAILABLE";
    throw error;
  }

  if (!ldapOk) {
    auditLogger.logEvent({
      eventType: "LOGIN_FAILED",
      instituteId,
      success: false,
      ip,
      userAgent
    });
    const error = new Error("Invalid credentials");
    error.status = 401;
    error.code = "INVALID_CREDENTIALS";
    throw error;
  }

  const user = await userRepository.findByInstituteId(instituteId);
  if (!user) {
    auditLogger.logEvent({
      eventType: "LOGIN_FAILED",
      instituteId,
      success: false,
      ip,
      userAgent
    });
    const error = new Error("Invalid credentials");
    error.status = 401;
    error.code = "INVALID_CREDENTIALS";
    throw error;
  }

  if (!user.is_active) {
    auditLogger.logEvent({
      eventType: "LOGIN_DISABLED",
      instituteId,
      userId: user.id,
      success: false,
      ip,
      userAgent
    });
    const error = new Error("Account disabled");
    error.status = 403;
    error.code = "ACCOUNT_DISABLED";
    throw error;
  }

  await userRepository.updateLastLogin(user.id);

  const accessToken = jwtConfig.signAccessToken({
    sub: String(user.id),
    instituteId: user.institute_id,
    role: user.role,
    jti: crypto.randomUUID()
  });

  const refreshToken = jwtConfig.signRefreshToken({
    sub: String(user.id),
    instituteId: user.institute_id,
    role: user.role,
    jti: crypto.randomUUID()
  });

  auditLogger.logEvent({
    eventType: "LOGIN_SUCCESS",
    instituteId,
    userId: user.id,
    success: true,
    ip,
    userAgent
  });

  return {
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      instituteId: user.institute_id,
      email: user.email || null,
      role: user.role
    }
  };
}

module.exports = {
  login
};
