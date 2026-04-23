const db = require("../config/db");

async function findByUserId(userId) {
  const rows = await db.query(
    "SELECT user_id, roll_no, admission_year, program, dept, semester, academic_status, created_at, updated_at FROM students WHERE user_id = ?",
    [userId]
  );
  return rows[0] || null;
}

module.exports = {
  findByUserId
};

