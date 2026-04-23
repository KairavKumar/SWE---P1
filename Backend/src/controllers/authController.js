const authService = require("../services/authService");
const jwtConfig = require("../config/jwt");
const env = require("../config/env");
const sessionService = require("../services/sessionService");

function getTokenFromRequest(req) {
  if (req.cookies && req.cookies.access_token) {
    return req.cookies.access_token;
  }
  if (req.cookies && req.cookies.auth_token) {
    return req.cookies.auth_token;
  }
  const authHeader = req.headers.authorization || "";
  if (authHeader.toLowerCase().startsWith("bearer ")) {
    return authHeader.slice(7).trim();
  }
  return null;
}

async function login(req, res, next) {
  try {
    const { instituteId, password } = req.body || {};
    const result = await authService.login({
      instituteId,
      password,
      ip: req.ip,
      userAgent: req.get("user-agent")
    });

    res.cookie("access_token", result.accessToken, {
      httpOnly: true,
      secure: env.cookies.secure,
      sameSite: "lax",
      domain: env.cookies.domain,
      maxAge: env.jwt.accessTtlMinutes * 60 * 1000
    });

    res.cookie("refresh_token", result.refreshToken, {
      httpOnly: true,
      secure: env.cookies.secure,
      sameSite: "lax",
      domain: env.cookies.domain,
      maxAge: env.jwt.refreshTtlDays * 24 * 60 * 60 * 1000
    });

    res.cookie("auth_token", result.accessToken, {
      httpOnly: true,
      secure: env.cookies.secure,
      sameSite: "lax",
      domain: env.cookies.domain,
      maxAge: env.jwt.accessTtlMinutes * 60 * 1000
    });

    res.status(200).json({
      token: result.accessToken,
      user: result.user
    });
  } catch (err) {
    next(err);
  }
}

function verify(req, res) {
  const token = getTokenFromRequest(req);
  if (!token) {
    return res.status(401).json({ valid: false, reason: "MISSING_TOKEN" });
  }

  try {
    const payload = jwtConfig.verifyToken(token);
    return res.status(200).json({ valid: true, payload });
  } catch (err) {
    return res.status(401).json({ valid: false, reason: "INVALID_TOKEN" });
  }
}

async function logout(req, res, next) {
  try {
    const accessToken = getTokenFromRequest(req);
    const refreshToken = (req.cookies && req.cookies.refresh_token) || null;
    await sessionService.revokeToken(accessToken);
    await sessionService.revokeToken(refreshToken);

    res.clearCookie("access_token", sessionService.getCookieOptions(0));
    res.clearCookie("refresh_token", sessionService.getCookieOptions(0));
    res.clearCookie("auth_token", sessionService.getCookieOptions(0));
    return res.status(200).json({ ok: true });
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  login,
  verify,
  logout
};
