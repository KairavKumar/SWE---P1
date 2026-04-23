const jwtConfig = require("../config/jwt");
const { getAccessToken } = require("../utils/requestTokens");
const blocklist = require("../services/blocklist");

async function authenticate(req, res, next) {
  const token = getAccessToken(req);
  if (!token) {
    return res.status(401).json({ error: { code: "MISSING_TOKEN", message: "Missing token" } });
  }

  try {
    const payload = jwtConfig.verifyToken(token);
    const revoked = await blocklist.isRevoked(payload.jti);
    if (revoked) {
      return res.status(401).json({ error: { code: "SESSION_REVOKED", message: "Session revoked" } });
    }
    const userRevoked = await blocklist.isUserRevoked(payload.sub, payload.iat);
    if (userRevoked) {
      return res.status(401).json({ error: { code: "SESSION_REVOKED", message: "Session revoked" } });
    }
    req.user = payload;
    return next();
  } catch (err) {
    return res.status(401).json({ error: { code: "INVALID_TOKEN", message: "Invalid token" } });
  }
}

module.exports = authenticate;
