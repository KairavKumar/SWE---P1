const db = require("../../../config/db");

async function replaceRubric(assignmentId, items) {
  await db.query("DELETE FROM assignment_rubrics WHERE assignment_id = ?", [assignmentId]);
  if (!items.length) return;
  const values = items.map((it) => [it.rubricId, assignmentId, it.criteria, it.maxScore]);
  await db.query(
    `INSERT INTO assignment_rubrics (rubric_id, assignment_id, criteria, max_score)
     VALUES ${values.map(() => "(?, ?, ?, ?)").join(", ")}`,
    values.flat()
  );
}

async function listByAssignment(assignmentId) {
  const rows = await db.query(
    "SELECT rubric_id, criteria, max_score FROM assignment_rubrics WHERE assignment_id = ? ORDER BY rubric_id",
    [assignmentId]
  );
  return rows;
}

module.exports = {
  replaceRubric,
  listByAssignment
};

