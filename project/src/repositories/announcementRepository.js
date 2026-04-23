const db = require("../config/db");

async function listActive({ limit = 20 } = {}) {
  const rows = await db.query(
    "SELECT announcement_id, title, body, priority, created_at FROM announcements WHERE is_active = true ORDER BY priority DESC, created_at DESC LIMIT ?",
    [limit]
  );
  return rows;
}

module.exports = {
  listActive
};

