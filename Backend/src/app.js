const express = require("express");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const authRoutes = require("./routes/authRoutes");
const passwordRoutes = require("./routes/passwordRoutes");
const profileRoutes = require("./routes/profileRoutes");
const rbacRoutes = require("./routes/rbacRoutes");
const auditRoutes = require("./routes/auditRoutes");
const sessionRoutes = require("./routes/sessionRoutes");
const studentRoutes = require("./routes/studentRoutes");
const courseRoutes = require("./routes/courseRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");
const academicAssignmentRoutes = require("./modules/academic/assignment/assignment.routes");
const academicGradingRoutes = require("./modules/academic/grading/grading.routes");
const errorHandler = require("./middleware/errorHandler");

const app = express();

app.use(morgan("dev"));
app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/password", passwordRoutes);
app.use("/api/user", profileRoutes);
app.use("/api/rbac", rbacRoutes);
app.use("/api/logs", auditRoutes);
app.use("/api/session", sessionRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api", academicAssignmentRoutes);
app.use("/api", academicGradingRoutes);

app.use(errorHandler);

module.exports = app;
