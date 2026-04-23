function getAccessToken(req) {
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

function getRefreshToken(req) {
  if (req.cookies && req.cookies.refresh_token) {
    return req.cookies.refresh_token;
  }
  return null;
}

module.exports = {
  getAccessToken,
  getRefreshToken
};
