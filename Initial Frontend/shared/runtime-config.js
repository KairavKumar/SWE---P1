/*
  Runtime configuration for frontend shell.
  Update APP_API_BASE to point to your backend gateway.
*/
window.APP_API_BASE = window.APP_API_BASE || "http://localhost:8080";
window.APP_TOTAL_SCREENS = 13;
window.APP_LOGIN_SCREEN = 9;
window.APP_DEMO_MODE = true;
window.APP_DEMO_USERS = {
  student: { instituteId: "student01", password: "demo123", role: "STUDENT", name: "Sarah Student" },
  faculty: { instituteId: "faculty01", password: "demo123", role: "FACULTY", name: "Dr. Faculty" },
  admin: { instituteId: "admin01", password: "demo123", role: "ADMIN", name: "Alex Admin" },
  warden: { instituteId: "warden01", password: "demo123", role: "WARDEN", name: "Wendy Warden" }
};
