const db = require("../config/db");

async function createToken({ tokenId, userId, hashedToken, expiresAt }) {
  await db.query(
    "INSERT INTO password_reset_tokens (token_id, user_id, hashed_token, expires_at, is_used) VALUES (?, ?, ?, ?, false)",
    [tokenId, userId, hashedToken, expiresAt]
  );
}

async function findByHashedToken(hashedToken) {
  const rows = await db.query(
    "SELECT token_id, user_id, hashed_token, expires_at, is_used FROM password_reset_tokens WHERE hashed_token = ?",
    [hashedToken]
  );
  return rows[0] || null;
}

async function markUsed(tokenId) {
  await db.query(
    "UPDATE password_reset_tokens SET is_used = true WHERE token_id = ?",
    [tokenId]
  );
}

module.exports = {
  createToken,
  findByHashedToken,
  markUsed
};
