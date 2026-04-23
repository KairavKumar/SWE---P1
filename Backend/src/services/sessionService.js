const jwtConfig = require("../config/jwt");
const blocklist = require("./blocklist");
const env = require("../config/env");

function issueAccessToken(payload) {
  return jwtConfig.signAccessToken({
    sub: payload.sub,
    instituteId: payload.instituteId,
    role: payload.role,
    jti: payload.jti || payload.refreshJti
  });
}

async function refreshSession(refreshToken) {
  if (!refreshToken) {
    const error = new Error("Missing refresh token");
    error.status = 401;
    error.code = "COOKIE_MISSING";
    throw error;
  }

  let payload;
  try {
    payload = jwtConfig.verifyToken(refreshToken);
  } catch (err) {
    const error = new Error("Invalid token");
    error.status = 401;
    error.code = "TOKEN_INVALID";
    throw error;
  }

  const revoked = await blocklist.isRevoked(payload.jti);
  if (revoked) {
    const error = new Error("Session revoked");
    error.status = 401;
    error.code = "SESSION_REVOKED";
    throw error;
  }

  const userRevoked = await blocklist.isUserRevoked(payload.sub, payload.iat);
  if (userRevoked) {
    const error = new Error("Session revoked");
    error.status = 401;
    error.code = "SESSION_REVOKED";
    throw error;
  }

  const accessToken = issueAccessToken({
    sub: payload.sub,
    instituteId: payload.instituteId,
    role: payload.role,
    refreshJti: payload.jti
  });

  return {
    accessToken,
    refreshToken
  };
}

async function revokeToken(token) {
  if (!token) {
    return;
  }
  let payload;
  try {
    payload = jwtConfig.verifyToken(token);
  } catch {
    return;
  }
  const exp = payload.exp || 0;
  const ttlSeconds = Math.max(exp - Math.floor(Date.now() / 1000), 1);
  await blocklist.revoke(payload.jti, ttlSeconds, payload.sub);
}

async function validateAccessToken(token) {
  if (!token) {
    const error = new Error("Missing token");
    error.status = 401;
    error.code = "COOKIE_MISSING";
    throw error;
  }
  let payload;
  try {
    payload = jwtConfig.verifyToken(token);
  } catch (err) {
    const error = new Error("Invalid token");
    error.status = 401;
    error.code = "TOKEN_INVALID";
    throw error;
  }
  const revoked = await blocklist.isRevoked(payload.jti);
  if (revoked) {
    const error = new Error("Session revoked");
    error.status = 401;
    error.code = "SESSION_REVOKED";
    throw error;
  }
  const userRevoked = await blocklist.isUserRevoked(payload.sub, payload.iat);
  if (userRevoked) {
    const error = new Error("Session revoked");
    error.status = 401;
    error.code = "SESSION_REVOKED";
    throw error;
  }
  return payload;
}

async function revokeAll(userId) {
  await blocklist.revokeAllForUser(userId);
}

function getCookieOptions(maxAgeMs) {
  return {
    httpOnly: true,
    secure: env.cookies.secure,
    sameSite: "lax",
    domain: env.cookies.domain,
    maxAge: maxAgeMs
  };
}

module.exports = {
  refreshSession,
  revokeToken,
  revokeAll,
  validateAccessToken,
  getCookieOptions
};
