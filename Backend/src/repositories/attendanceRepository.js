const db = require("../config/db");

async function listDaily({ studentUserId, offeringId, limit = 100 }) {
  const rows = await db.query(
    `SELECT attendance_id, offering_id, attendance_date, status
     FROM attendance_records
     WHERE student_user_id = ?
       AND (? IS NULL OR offering_id = ?)
     ORDER BY attendance_date DESC
     LIMIT ?`,
    [studentUserId, offeringId || null, offeringId || null, limit]
  );
  return rows;
}

async function getPercentage({ studentUserId, offeringId }) {
  const rows = await db.query(
    `SELECT
      COUNT(*) AS total,
      SUM(CASE WHEN status = 'Present' THEN 1 ELSE 0 END) AS present
     FROM attendance_records
     WHERE student_user_id = ?
       AND offering_id = ?`,
    [studentUserId, offeringId]
  );
  const total = Number(rows[0] ? rows[0].total : 0);
  const present = Number(rows[0] ? rows[0].present : 0);
  const percentage = total ? Number(((present / total) * 100).toFixed(2)) : 0;
  return { total, present, percentage };
}

async function listSummary(studentUserId) {
  const rows = await db.query(
    `SELECT
      ar.offering_id,
      COUNT(*) AS total,
      SUM(CASE WHEN ar.status = 'Present' THEN 1 ELSE 0 END) AS present
     FROM attendance_records ar
     WHERE ar.student_user_id = ?
     GROUP BY ar.offering_id`,
    [studentUserId]
  );
  return rows.map((r) => {
    const total = Number(r.total || 0);
    const present = Number(r.present || 0);
    return {
      offeringId: r.offering_id,
      total,
      present,
      percentage: total ? Number(((present / total) * 100).toFixed(2)) : 0
    };
  });
}

async function listCourseStudents(offeringId) {
  const rows = await db.query(
    `SELECT
      s.user_id,
      s.roll_no,
      u.institute_id,
      u.email
     FROM enrollments e
     JOIN students s ON s.user_id = e.student_user_id
     JOIN users u ON u.id = s.user_id
     WHERE e.offering_id = ?
       AND e.enrollment_status IN ('pending','approved')
     ORDER BY s.roll_no ASC`,
    [offeringId]
  );
  return rows;
}

async function upsertAttendanceBulk({ offeringId, attendanceDate, records, facultyUserId }) {
  // records: [{ studentUserId, status }]
  if (!records.length) return;
  const values = records.map((r) => [
    r.attendanceId,
    r.studentUserId,
    offeringId,
    attendanceDate,
    r.status,
    facultyUserId
  ]);

  await db.query(
    `INSERT INTO attendance_records
      (attendance_id, student_user_id, offering_id, attendance_date, status, marked_by_faculty_user_id)
     VALUES ${values.map(() => "(?, ?, ?, ?, ?, ?)").join(", ")}
     ON DUPLICATE KEY UPDATE
       status = VALUES(status),
       marked_by_faculty_user_id = VALUES(marked_by_faculty_user_id),
       updated_at = CURRENT_TIMESTAMP`,
    values.flat()
  );
}

module.exports = {
  listDaily,
  getPercentage,
  listSummary,
  listCourseStudents,
  upsertAttendanceBulk
};

