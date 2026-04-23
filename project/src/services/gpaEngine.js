const gradePointMap = new Map([
  ["O", 10],
  ["A+", 10],
  ["A", 9],
  ["B+", 8],
  ["B", 7],
  ["C+", 6],
  ["C", 5],
  ["D", 4],
  ["F", 0]
]);

function toPoints(letterGrade, explicitPoints) {
  if (typeof explicitPoints === "number" && Number.isFinite(explicitPoints)) {
    return explicitPoints;
  }
  if (!letterGrade) {
    return null;
  }
  const key = String(letterGrade).toUpperCase();
  return gradePointMap.has(key) ? gradePointMap.get(key) : null;
}

function calcGpa(rows) {
  let totalCredits = 0;
  let totalWeighted = 0;

  for (const row of rows) {
    const credits = Number(row.credit_value || 0);
    const points = toPoints(row.letter_grade, row.grade_points);
    if (!credits || points === null) {
      continue;
    }
    totalCredits += credits;
    totalWeighted += credits * points;
  }

  if (!totalCredits) {
    return { gpa: null, creditsAttempted: 0 };
  }
  const gpa = Number((totalWeighted / totalCredits).toFixed(2));
  return { gpa, creditsAttempted: totalCredits };
}

function groupBySemester(rows) {
  const map = new Map();
  for (const row of rows) {
    const sem = row.semester_label || "UNKNOWN";
    if (!map.has(sem)) {
      map.set(sem, []);
    }
    map.get(sem).push(row);
  }
  return map;
}

module.exports = {
  calcGpa,
  groupBySemester
};

