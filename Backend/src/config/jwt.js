const jwt = require("jsonwebtoken");
const env = require("./env");

function signAccessToken(payload, options = {}) {
  return jwt.sign(payload, env.jwt.secret, {
    expiresIn: `${env.jwt.accessTtlMinutes}m`,
    issuer: env.jwt.issuer,
    audience: env.jwt.audience,
    ...options
  });
}

function signRefreshToken(payload, options = {}) {
  return jwt.sign(payload, env.jwt.secret, {
    expiresIn: `${env.jwt.refreshTtlDays}d`,
    issuer: env.jwt.issuer,
    audience: env.jwt.audience,
    ...options
  });
}

function verifyToken(token) {
  return jwt.verify(token, env.jwt.secret, {
    issuer: env.jwt.issuer,
    audience: env.jwt.audience
  });
}

module.exports = {
  signAccessToken,
  signRefreshToken,
  verifyToken
};
