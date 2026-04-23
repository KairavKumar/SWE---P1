const db = require("../config/db");

async function insertLog({ logId, userId, action, resource, encryptedData, integrityHash, ipAddress }) {
  await db.query(
    "INSERT INTO audit_logs (log_id, user_id, action, resource, encrypted_data, integrity_hash, ip_address) VALUES (?, ?, ?, ?, ?, ?, ?)",
    [logId, userId, action, resource, encryptedData, integrityHash, ipAddress]
  );
}

async function listLogs({ limit, offset }) {
  const rows = await db.query(
    "SELECT log_id, user_id, action, resource, encrypted_data, integrity_hash, ip_address, created_at FROM audit_logs ORDER BY created_at DESC LIMIT ? OFFSET ?",
    [limit, offset]
  );
  return rows;
}

module.exports = {
  insertLog,
  listLogs
};
