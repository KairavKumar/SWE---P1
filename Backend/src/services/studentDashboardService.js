const userRepository = require("../repositories/userRepository");
const studentRepository = require("../repositories/studentRepository");
const enrollmentRepository = require("../repositories/enrollmentRepository");
const assignmentRepository = require("../repositories/assignmentRepository");
const announcementRepository = require("../repositories/announcementRepository");

async function getDashboard(studentUserId) {
  const [user, student, enrollments, assignments, announcements] = await Promise.all([
    userRepository.findAuthById(studentUserId),
    studentRepository.findByUserId(studentUserId),
    enrollmentRepository.listMyEnrollments(studentUserId),
    assignmentRepository.listUpcomingForStudent(studentUserId, { limit: 10 }),
    announcementRepository.listActive({ limit: 10 })
  ]);

  if (!student) {
    const error = new Error("Student not found");
    error.status = 404;
    error.code = "STUDENT_NOT_FOUND";
    throw error;
  }

  return {
    student_summary: {
      id: student.user_id,
      instituteId: user ? user.institute_id : null,
      rollNo: student.roll_no,
      semester: student.semester,
      program: student.program,
      dept: student.dept
    },
    active_courses: enrollments.map((e) => ({
      offeringId: e.offering_id,
      courseCode: e.course_code,
      courseTitle: e.course_title,
      creditValue: e.credit_value,
      semesterLabel: e.semester_label,
      sectionCode: e.section_code,
      scheduleSlot: e.schedule_slot
    })),
    pending_assignments: assignments,
    hostel_status: null,
    announcements
  };
}

module.exports = {
  getDashboard
};

