const db = require("../config/db");

async function listAvailableOfferings({ semesterLabel, limit = 200, offset = 0 }) {
  const rows = await db.query(
    `SELECT
      o.offering_id,
      o.semester_label,
      o.section_code,
      o.status,
      o.seat_capacity,
      o.seats_taken,
      o.schedule_slot,
      c.course_id,
      c.course_code,
      c.course_title,
      c.credit_value,
      c.department,
      o.faculty_user_id
    FROM course_offerings o
    JOIN courses c ON c.course_id = o.course_id
    WHERE o.status = 'active'
      AND c.active_flag = true
      AND (? IS NULL OR o.semester_label = ?)
    ORDER BY c.department, c.course_code, o.section_code
    LIMIT ? OFFSET ?`,
    [semesterLabel || null, semesterLabel || null, limit, offset]
  );
  return rows;
}

async function getOfferingForUpdate(offeringId, connection) {
  const [rows] = await connection.execute(
    `SELECT offering_id, seat_capacity, seats_taken, status
     FROM course_offerings
     WHERE offering_id = ?
     FOR UPDATE`,
    [offeringId]
  );
  return rows[0] || null;
}

async function incrementSeatsTaken(offeringId, delta, connection) {
  await connection.execute(
    "UPDATE course_offerings SET seats_taken = seats_taken + ? WHERE offering_id = ?",
    [delta, offeringId]
  );
}

async function isFacultyOwner(offeringId, facultyUserId) {
  const rows = await db.query(
    "SELECT offering_id FROM course_offerings WHERE offering_id = ? AND faculty_user_id = ?",
    [offeringId, facultyUserId]
  );
  return Boolean(rows[0]);
}

module.exports = {
  listAvailableOfferings,
  getOfferingForUpdate,
  incrementSeatsTaken,
  isFacultyOwner
};

