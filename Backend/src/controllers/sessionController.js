const sessionService = require("../services/sessionService");
const env = require("../config/env");
const { getAccessToken, getRefreshToken } = require("../utils/requestTokens");

async function refresh(req, res, next) {
  try {
    const refreshToken = getRefreshToken(req);
    const result = await sessionService.refreshSession(refreshToken);

    res.cookie(
      "access_token",
      result.accessToken,
      sessionService.getCookieOptions(env.jwt.accessTtlMinutes * 60 * 1000)
    );
    res.cookie(
      "refresh_token",
      result.refreshToken,
      sessionService.getCookieOptions(env.jwt.refreshTtlDays * 24 * 60 * 60 * 1000)
    );
    res.cookie(
      "auth_token",
      result.accessToken,
      sessionService.getCookieOptions(env.jwt.accessTtlMinutes * 60 * 1000)
    );

    return res.status(200).json({ token: result.accessToken });
  } catch (err) {
    return next(err);
  }
}

async function logout(req, res, next) {
  try {
    const accessToken = getAccessToken(req);
    const refreshToken = getRefreshToken(req);
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

async function status(req, res, next) {
  try {
    const accessToken = getAccessToken(req);
    if (!accessToken) {
      return res.status(401).json({ active: false });
    }
    await sessionService.validateAccessToken(accessToken);
    return res.status(200).json({ active: true });
  } catch (err) {
    return next(err);
  }
}

async function revokeAll(req, res, next) {
  try {
    const { userId } = req.body || {};
    if (!userId) {
      return res.status(400).json({ error: { code: "MALFORMED_REQUEST", message: "Missing userId" } });
    }
    await sessionService.revokeAll(userId);
    return res.status(200).json({ ok: true });
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  refresh,
  logout,
  status,
  revokeAll
};
