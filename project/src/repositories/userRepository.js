const db = require("../config/db");

async function findByInstituteId(instituteId) {
  const rows = await db.query(
    "SELECT id, institute_id, email, role, is_active, last_login FROM users WHERE institute_id = ?",
    [instituteId]
  );
  return rows[0] || null;
}

async function findByInstituteIdOrEmail(identifier) {
  const rows = await db.query(
    "SELECT id, institute_id, email, role, is_active, last_login FROM users WHERE institute_id = ? OR email = ?",
    [identifier, identifier]
  );
  return rows[0] || null;
}

async function updateLastLogin(userId) {
  await db.query("UPDATE users SET last_login = NOW() WHERE id = ?", [userId]);
}

async function updatePasswordHash(userId, passwordHash) {
  await db.query("UPDATE users SET password_hash = ? WHERE id = ?", [passwordHash, userId]);
}

async function findAuthById(userId) {
  const rows = await db.query(
    "SELECT id, institute_id, email, role, is_active, password_hash FROM users WHERE id = ?",
    [userId]
  );
  return rows[0] || null;
}

module.exports = {
  findByInstituteId,
  findByInstituteIdOrEmail,
  updateLastLogin,
  updatePasswordHash,
  findAuthById
};
