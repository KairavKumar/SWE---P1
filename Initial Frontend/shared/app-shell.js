/*
  Scholarly Admin Frontend Interaction Layer
  - Real API integration with HttpOnly cookie auth
  - Route-level and action-level RBAC enforcement
  - Shared button behavior and modal UX
*/

(function () {
  "use strict";

  var API_BASE = window.APP_API_BASE || "http://localhost:8080";
  var DEMO_MODE = window.APP_DEMO_MODE !== false;
  var TOTAL_SCREENS = Number(window.APP_TOTAL_SCREENS || 13);
  var LOGIN_SCREEN = Number(window.APP_LOGIN_SCREEN || 9);
  var PUBLIC_SCREENS = [LOGIN_SCREEN];
  var DEMO_SESSION_KEY = "scholarly.demo.session";
  var DEMO_DB_KEY = "scholarly.demo.db";

  var DEFAULT_DEMO_USERS = {
    student: { instituteId: "student01", password: "demo123", role: "STUDENT", name: "Sarah Student" },
    faculty: { instituteId: "faculty01", password: "demo123", role: "FACULTY", name: "Dr. Faculty" },
    admin: { instituteId: "admin01", password: "demo123", role: "ADMIN", name: "Alex Admin" },
    warden: { instituteId: "warden01", password: "demo123", role: "WARDEN", name: "Wendy Warden" }
  };

  var DEMO_USERS = window.APP_DEMO_USERS || DEFAULT_DEMO_USERS;

  var ROUTE_MAP = {
    academic: 1,
    hostel: 5,
    admin: 7,
    security: 2,
    dashboard: 1,
    students: 2,
    approvals: 7,
    auth: 9,
    profile: 10,
    messaging: 11,
    resource: 12,
    feedback: 13
  };

  var SERVICE_ENDPOINTS = {
    authLogin: "/api/auth/login",
    authLogout: "/api/auth/logout",
    sessionStatus: "/api/session/status",
    rbacMyPermissions: "/api/rbac/my-permissions",
    profileGet: "/api/user/profile",
    profileUpdate: "/api/user/profile",
    messageSend: "/api/message/send",
    messageCourse: "/api/message/course",
    messageAnnouncements: "/api/message/announcements",
    resourceUpload: "/api/resource/upload",
    resourceCourse: "/api/resource/course",
    feedbackEligible: "/eligible-courses",
    feedbackSubmit: "/submit-feedback",
    feedbackSummary: "/admin/feedback-summary",
    dashboard: "/api/student/dashboard",
    coursesRegister: "/api/courses/register",
    coursesDrop: "/api/courses/drop",
    assignmentUpload: "/api/assignment/upload",
    transcriptRequest: "/api/transcript/request",
    leaveApply: "/api/leave/apply",
    complaintRaise: "/api/complaints/raise",
    logsExport: "/api/logs/export",
    hmcMinutes: "/api/hmc/minutes"
  };

  var SCREEN_ROLE_MAP = {
    1: ["STUDENT"],
    2: ["ADMIN", "WARDEN"],
    3: ["FACULTY"],
    4: ["STUDENT"],
    5: ["STUDENT"],
    6: ["WARDEN", "ADMIN"],
    7: ["ADMIN"],
    8: ["WARDEN"],
    9: ["PUBLIC"],
    10: ["STUDENT", "FACULTY", "ADMIN", "WARDEN"],
    11: ["STUDENT", "FACULTY", "ADMIN", "WARDEN"],
    12: ["STUDENT", "FACULTY"],
    13: ["STUDENT", "ADMIN"]
  };

  var ACTION_ROLE_MAP = {
    support: ["STUDENT", "FACULTY", "ADMIN", "WARDEN"],
    "apply-leave": ["STUDENT"],
    "new-request": ["STUDENT"],
    "upload-assignment": ["STUDENT"],
    enroll: ["STUDENT"],
    "drop-course": ["STUDENT"],
    "download-logs": ["ADMIN", "WARDEN"],
    "submit-complaint": ["STUDENT"],
    "save-draft-minutes": ["WARDEN"],
    "submit-minutes": ["WARDEN"],
    "review-item": ["FACULTY", "ADMIN", "WARDEN"],
    "delete-item": ["ADMIN", "WARDEN"],
    login: ["PUBLIC"],
    logout: ["STUDENT", "FACULTY", "ADMIN", "WARDEN"],
    "profile-save": ["STUDENT", "FACULTY", "ADMIN", "WARDEN"],
    "message-send": ["STUDENT", "FACULTY", "ADMIN", "WARDEN"],
    "resource-upload": ["FACULTY"],
    "feedback-submit": ["STUDENT"],
    "feedback-admin-view": ["ADMIN"]
  };

  var authState = {
    screen: 1,
    authenticated: false,
    role: "PUBLIC",
    permissions: []
  };

  function getHomeScreenForRole(role) {
    var r = normalizeRole(role);
    if (r === "STUDENT") return 1;
    if (r === "FACULTY") return 3;
    if (r === "ADMIN") return 7;
    if (r === "WARDEN") return 8;
    return LOGIN_SCREEN;
  }

  function navigateToHomeForRole(role) {
    var homeScreen = getHomeScreenForRole(role);
    window.location.href = "../screen" + homeScreen + "/code.html";
  }

  function getDefaultDemoData() {
    return {
      profile: {
        fullName: "Sarah Mitchell",
        phoneNumber: "+91-98XXXXXXXX",
        localAddress: "Block B, Room 402",
        emergencyContact: "Michael - +91-97XXXXXXXX"
      },
      messages: [
        { courseId: "CS301", messageType: "Announcement", messageText: "Quiz 2 moved to Friday", senderRole: "FACULTY", sentAt: new Date().toISOString() },
        { courseId: "CS202", messageType: "Normal", messageText: "Can we get an extra tutorial?", senderRole: "STUDENT", sentAt: new Date().toISOString() }
      ],
      resources: [
        { id: "res-1", courseId: "CS301", fileName: "dbms-unit4.pdf", resourceType: "Notes", uploadedAt: new Date().toISOString() },
        { id: "res-2", courseId: "CS202", fileName: "algo-handout.docx", resourceType: "Notes", uploadedAt: new Date().toISOString() }
      ],
      feedback: [],
      leaves: [],
      transcripts: [],
      complaints: [],
      enrollments: [],
      submissions: [],
      hmcMinutes: []
    };
  }

  function readDemoDb() {
    try {
      var raw = localStorage.getItem(DEMO_DB_KEY);
      if (!raw) {
        var base = getDefaultDemoData();
        localStorage.setItem(DEMO_DB_KEY, JSON.stringify(base));
        return base;
      }
      return JSON.parse(raw);
    } catch (error) {
      var fallback = getDefaultDemoData();
      localStorage.setItem(DEMO_DB_KEY, JSON.stringify(fallback));
      return fallback;
    }
  }

  function writeDemoDb(db) {
    localStorage.setItem(DEMO_DB_KEY, JSON.stringify(db));
  }

  function setDemoSession(user) {
    localStorage.setItem(DEMO_SESSION_KEY, JSON.stringify({
      instituteId: user.instituteId,
      role: user.role,
      name: user.name
    }));
  }

  function clearDemoSession() {
    localStorage.removeItem(DEMO_SESSION_KEY);
  }

  function getDemoSession() {
    try {
      var raw = localStorage.getItem(DEMO_SESSION_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (error) {
      return null;
    }
  }

  function getRolePermissions(role) {
    var all = {
      STUDENT: [
        { resource: "PROFILE", action: "READ" },
        { resource: "PROFILE", action: "UPDATE" },
        { resource: "COURSES", action: "CREATE" },
        { resource: "LEAVE_REQUESTS", action: "CREATE" },
        { resource: "FEEDBACK", action: "CREATE" },
        { resource: "MESSAGES", action: "READ" },
        { resource: "MESSAGES", action: "CREATE" },
        { resource: "RESOURCES", action: "READ" }
      ],
      FACULTY: [
        { resource: "PROFILE", action: "READ" },
        { resource: "PROFILE", action: "UPDATE" },
        { resource: "GRADES", action: "UPDATE" },
        { resource: "MESSAGES", action: "READ" },
        { resource: "MESSAGES", action: "CREATE" },
        { resource: "RESOURCES", action: "CREATE" },
        { resource: "RESOURCES", action: "READ" }
      ],
      ADMIN: [
        { resource: "*", action: "*" }
      ],
      WARDEN: [
        { resource: "PROFILE", action: "READ" },
        { resource: "PROFILE", action: "UPDATE" },
        { resource: "APPROVALS", action: "UPDATE" },
        { resource: "AUDIT", action: "READ" },
        { resource: "HMC", action: "CREATE" },
        { resource: "FACILITY", action: "READ" }
      ]
    };
    return all[role] || [];
  }

  async function requestDemoApi(method, endpoint, payload, options) {
    var db = readDemoDb();
    var session = getDemoSession();
    var role = session ? normalizeRole(session.role) : "PUBLIC";

    if (endpoint === SERVICE_ENDPOINTS.authLogin && method === "POST") {
      var matched = Object.keys(DEMO_USERS).map(function (key) { return DEMO_USERS[key]; }).find(function (u) {
        return u.instituteId === (payload && payload.instituteId) && u.password === (payload && payload.password);
      });
      if (!matched) {
        var invalid = new Error("Invalid credentials. Use demo defaults.");
        invalid.status = 401;
        throw invalid;
      }
      setDemoSession(matched);
      return { success: true, role: matched.role, user: { name: matched.name, instituteId: matched.instituteId } };
    }

    if (endpoint === SERVICE_ENDPOINTS.authLogout && method === "POST") {
      clearDemoSession();
      return { success: true };
    }

    if (!session && endpoint !== SERVICE_ENDPOINTS.authLogin) {
      var unauth = new Error("Unauthorized");
      unauth.status = 401;
      throw unauth;
    }

    if (endpoint === SERVICE_ENDPOINTS.sessionStatus && method === "GET") {
      return { active: true, role: role, user: session };
    }

    if (endpoint === SERVICE_ENDPOINTS.rbacMyPermissions && method === "GET") {
      return { permissions: getRolePermissions(role) };
    }

    if (endpoint === SERVICE_ENDPOINTS.profileGet && method === "GET") {
      return { data: db.profile };
    }

    if (endpoint === SERVICE_ENDPOINTS.profileUpdate && method === "PUT") {
      db.profile = {
        fullName: payload.fullName || db.profile.fullName,
        phoneNumber: payload.phoneNumber || db.profile.phoneNumber,
        localAddress: payload.localAddress || db.profile.localAddress,
        emergencyContact: payload.emergencyContact || db.profile.emergencyContact
      };
      writeDemoDb(db);
      return { success: true, data: db.profile };
    }

    if (endpoint === SERVICE_ENDPOINTS.messageSend && method === "POST") {
      db.messages.unshift({
        courseId: payload.courseId,
        messageType: payload.messageType || "Normal",
        messageText: payload.messageText,
        senderRole: role,
        sentAt: new Date().toISOString()
      });
      writeDemoDb(db);
      return { success: true };
    }

    if (endpoint === SERVICE_ENDPOINTS.messageCourse && method === "GET") {
      return { data: db.messages };
    }

    if (endpoint === SERVICE_ENDPOINTS.messageAnnouncements && method === "GET") {
      return { data: db.messages.filter(function (m) { return m.messageType === "Announcement"; }) };
    }

    if (endpoint === SERVICE_ENDPOINTS.resourceUpload && method === "POST") {
      var file = options && options.formData ? options.formData.get("file") : null;
      db.resources.unshift({
        id: "res-" + Date.now(),
        courseId: "CS301",
        fileName: file ? file.name : "resource.pdf",
        resourceType: (options && options.formData && options.formData.get("resourceType")) || "Notes",
        uploadedAt: new Date().toISOString()
      });
      writeDemoDb(db);
      return { success: true };
    }

    if (endpoint === SERVICE_ENDPOINTS.resourceCourse && method === "GET") {
      return { data: db.resources };
    }

    if (endpoint === SERVICE_ENDPOINTS.feedbackSubmit && method === "POST") {
      db.feedback.unshift({
        id: "fb-" + Date.now(),
        courseId: payload.courseId,
        rating: payload.rating,
        comments: payload.comments,
        createdAt: new Date().toISOString()
      });
      writeDemoDb(db);
      return { success: true };
    }

    if (endpoint === SERVICE_ENDPOINTS.feedbackSummary && method === "GET") {
      return { data: db.feedback };
    }

    if (endpoint === SERVICE_ENDPOINTS.feedbackEligible && method === "GET") {
      return { data: [{ courseId: "CS301" }, { courseId: "CS202" }] };
    }

    if (endpoint === SERVICE_ENDPOINTS.leaveApply && method === "POST") {
      db.leaves.unshift({ id: "leave-" + Date.now(), status: "PENDING", payload: payload });
      writeDemoDb(db);
      return { success: true };
    }

    if (endpoint === SERVICE_ENDPOINTS.transcriptRequest && method === "POST") {
      db.transcripts.unshift({ id: "tr-" + Date.now(), status: "PENDING", payload: payload });
      writeDemoDb(db);
      return { success: true };
    }

    if (endpoint === SERVICE_ENDPOINTS.complaintRaise && method === "POST") {
      db.complaints.unshift({ id: "cmp-" + Date.now(), status: "OPEN", payload: payload });
      writeDemoDb(db);
      return { success: true };
    }

    if (endpoint === SERVICE_ENDPOINTS.coursesRegister && method === "POST") {
      db.enrollments.unshift({ id: "enr-" + Date.now(), payload: payload });
      writeDemoDb(db);
      return { success: true };
    }

    if (endpoint === SERVICE_ENDPOINTS.assignmentUpload && method === "POST") {
      var assignmentFile = options && options.formData ? options.formData.get("file") : null;
      db.submissions.unshift({ id: "sub-" + Date.now(), fileName: assignmentFile ? assignmentFile.name : "submission.pdf" });
      writeDemoDb(db);
      return { success: true };
    }

    if (endpoint === SERVICE_ENDPOINTS.hmcMinutes && method === "POST") {
      db.hmcMinutes.unshift({ id: "hmc-" + Date.now(), payload: payload });
      writeDemoDb(db);
      return { success: true };
    }

    if (endpoint === SERVICE_ENDPOINTS.dashboard && method === "GET") {
      return {
        student_summary: { name: session.name, instituteId: session.instituteId, role: session.role },
        announcements: db.messages.filter(function (m) { return m.messageType === "Announcement" })
      };
    }

    if (endpoint === SERVICE_ENDPOINTS.logsExport && method === "GET") {
      return { success: true, downloadUrl: "#" };
    }

    return { success: true, endpoint: endpoint, method: method, payload: payload };
  }

  function getCurrentScreenNumber() {
    var match = window.location.pathname.match(/screen(\d+)\/code\.html$/i);
    return match ? parseInt(match[1], 10) : 1;
  }

  function normalizeRole(role) {
    return String(role || "PUBLIC").toUpperCase();
  }

  function toast(message, tone) {
    var el = document.createElement("div");
    el.textContent = message;
    el.style.position = "fixed";
    el.style.left = "16px";
    el.style.bottom = "16px";
    el.style.zIndex = "10001";
    el.style.padding = "10px 14px";
    el.style.borderRadius = "10px";
    el.style.border = "1px solid #c6c5d4";
    el.style.boxShadow = "0 8px 20px rgba(0,0,0,0.12)";
    el.style.fontSize = "13px";
    el.style.fontWeight = "600";
    el.style.background = tone === "error" ? "#ffdad6" : tone === "warn" ? "#fff5d6" : "#e8f1ff";
    el.style.color = "#1a237e";
    document.body.appendChild(el);
    window.setTimeout(function () {
      el.remove();
    }, 2600);
  }

  function createModalShell() {
    var modal = document.getElementById("global-action-modal");
    if (modal) return modal;

    modal = document.createElement("div");
    modal.id = "global-action-modal";
    modal.style.display = "none";
    modal.style.position = "fixed";
    modal.style.inset = "0";
    modal.style.background = "rgba(15, 23, 42, 0.45)";
    modal.style.zIndex = "10000";

    modal.innerHTML = "" +
      "<div style='max-width:640px;margin:7vh auto;background:#fff;border-radius:12px;border:1px solid #c6c5d4;overflow:hidden;'>" +
      "  <div style='display:flex;justify-content:space-between;align-items:center;padding:12px 16px;border-bottom:1px solid #e2e8f0;'>" +
      "    <h3 id='global-action-title' style='margin:0;font-size:16px;color:#1a237e;'>Action</h3>" +
      "    <button id='global-action-close' type='button' style='border:1px solid #cbd5e1;background:#fff;border-radius:8px;padding:4px 10px;cursor:pointer;'>Close</button>" +
      "  </div>" +
      "  <div id='global-action-content' style='padding:16px;max-height:70vh;overflow:auto;'></div>" +
      "</div>";

    modal.addEventListener("click", function (event) {
      if (event.target === modal) hideModal();
    });

    document.body.appendChild(modal);
    document.getElementById("global-action-close").addEventListener("click", hideModal);
    return modal;
  }

  function showModal(title, html) {
    createModalShell();
    document.getElementById("global-action-title").textContent = title;
    document.getElementById("global-action-content").innerHTML = html;
    document.getElementById("global-action-modal").style.display = "block";
  }

  function hideModal() {
    var modal = document.getElementById("global-action-modal");
    if (modal) modal.style.display = "none";
  }

  async function requestApi(method, endpoint, payload, options) {
    /*
      BACKEND API INTEGRATION POINT
      Real API integration with JWT in HttpOnly secure cookies.
      - `credentials: include` is mandatory.
      - Keep cookie flags server-side: HttpOnly, Secure, SameSite.
    */

    var opts = options || {};

    if (DEMO_MODE) {
      return requestDemoApi(method, endpoint, payload, opts);
    }
    var requestOptions = {
      method: method,
      credentials: "include",
      headers: {}
    };

    if (opts.formData) {
      requestOptions.body = opts.formData;
    } else if (payload !== undefined && payload !== null) {
      requestOptions.headers["Content-Type"] = "application/json";
      requestOptions.body = JSON.stringify(payload);
    }

    var response = await fetch(API_BASE + endpoint, requestOptions);
    var responseText = await response.text();
    var data;
    try {
      data = responseText ? JSON.parse(responseText) : {};
    } catch (error) {
      data = { message: responseText || "Invalid JSON response" };
    }

    if (!response.ok) {
      var errorObj = new Error(data.message || ("API error: " + response.status));
      errorObj.status = response.status;
      errorObj.payload = data;
      throw errorObj;
    }

    return data;
  }

  async function bootstrapAuthAndRbac() {
    authState.screen = getCurrentScreenNumber();
    var isPublicScreen = PUBLIC_SCREENS.indexOf(authState.screen) !== -1;

    if (isPublicScreen) {
      authState.authenticated = false;
      authState.role = "PUBLIC";
      document.body.setAttribute("data-role", authState.role);
      return;
    }

    try {
      var session = await requestApi("GET", SERVICE_ENDPOINTS.sessionStatus);
      var role = normalizeRole((session && (session.role || (session.user && session.user.role))) || "PUBLIC");
      authState.authenticated = true;
      authState.role = role;
    } catch (error) {
      if (error.status === 401) {
        window.location.href = "../screen" + LOGIN_SCREEN + "/code.html";
        return;
      }
      toast("Session check failed. Verify backend API base URL.", "error");
      authState.authenticated = false;
      authState.role = "PUBLIC";
    }

    try {
      var perms = await requestApi("GET", SERVICE_ENDPOINTS.rbacMyPermissions);
      if (Array.isArray(perms)) {
        authState.permissions = perms;
      } else if (Array.isArray(perms.permissions)) {
        authState.permissions = perms.permissions;
      } else {
        authState.permissions = [];
      }
    } catch (error) {
      authState.permissions = [];
    }

    document.body.setAttribute("data-role", authState.role);
  }

  function permissionMatch(resource, action) {
    if (!authState.permissions || !authState.permissions.length) {
      return false;
    }
    var targetResource = String(resource || "").toUpperCase();
    var targetAction = String(action || "READ").toUpperCase();

    return authState.permissions.some(function (perm) {
      if (typeof perm === "string") {
        var key = perm.toUpperCase();
        return key === (targetResource + ":" + targetAction) || key === targetResource || key === "*";
      }
      var pRes = String((perm.resource || perm.resourceName || "")).toUpperCase();
      var pAct = String((perm.action || "READ")).toUpperCase();
      var pActive = perm.isActive !== false && perm.is_active !== false;
      return pActive && (pRes === targetResource || pRes === "*") && (pAct === targetAction || pAct === "*" || targetAction === "READ");
    });
  }

  function enforceRouteGuard() {
    var allowed = SCREEN_ROLE_MAP[authState.screen] || ["STUDENT", "FACULTY", "ADMIN", "WARDEN"];
    var currentRole = authState.role;
    if (allowed.indexOf("PUBLIC") !== -1) return true;
    if (allowed.indexOf(currentRole) !== -1) return true;

    var byPermission = {
      2: permissionMatch("RBAC", "READ"),
      3: permissionMatch("GRADES", "UPDATE"),
      4: permissionMatch("COURSES", "CREATE"),
      5: permissionMatch("LEAVE_REQUESTS", "CREATE"),
      6: permissionMatch("FACILITY", "READ"),
      7: permissionMatch("APPROVALS", "UPDATE"),
      8: permissionMatch("HMC", "CREATE"),
      10: permissionMatch("PROFILE", "READ"),
      11: permissionMatch("MESSAGES", "READ"),
      12: permissionMatch("RESOURCES", "READ"),
      13: permissionMatch("FEEDBACK", "CREATE") || permissionMatch("FEEDBACK", "READ")
    };

    if (byPermission[authState.screen]) return true;

    toast("Access denied for your role.", "error");
    navigateToHomeForRole(authState.role);
    return false;
  }

  function ensureRouterOptions(select) {
    if (!select) return;
    select.innerHTML = "";
    for (var i = 1; i <= TOTAL_SCREENS; i += 1) {
      var option = document.createElement("option");
      option.value = String(i);
      option.textContent = String(i);
      select.appendChild(option);
    }
  }

  function runRouter() {
    var select = document.getElementById("router-select");
    var prev = document.getElementById("router-prev");
    var next = document.getElementById("router-next");
    if (!select || !prev || !next) return;

    ensureRouterOptions(select);

    var currentScreen = authState.screen;

    function goToScreen(screenNumber) {
      window.location.href = "../screen" + screenNumber + "/code.html";
    }

    select.value = String(currentScreen);

    select.addEventListener("change", function (event) {
      goToScreen(Number(event.target.value));
    });

    prev.addEventListener("click", function () {
      var target = currentScreen <= 1 ? TOTAL_SCREENS : currentScreen - 1;
      goToScreen(target);
    });

    next.addEventListener("click", function () {
      var target = currentScreen >= TOTAL_SCREENS ? 1 : currentScreen + 1;
      goToScreen(target);
    });

    document.addEventListener("keydown", function (event) {
      var tag = event.target && event.target.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if (event.key === "ArrowLeft") prev.click();
      if (event.key === "ArrowRight") next.click();
    });
  }

  function bindNavLinks() {
    var links = document.querySelectorAll('a[href="#"]');
    links.forEach(function (link) {
      var text = (link.textContent || "").toLowerCase().trim();

      if (text.indexOf("logout") !== -1) {
        link.href = "javascript:void(0)";
        link.addEventListener("click", function (event) {
          event.preventDefault();
          handleButtonAction("logout", link).catch(function (error) {
            toast(error.message || "Logout failed.", "error");
          });
        });
        return;
      }

      var roleAwareRouteMap = {
        academic: getHomeScreenForRole(authState.role),
        dashboard: getHomeScreenForRole(authState.role),
        hostel: authState.role === "WARDEN" ? 8 : 5,
        admin: authState.role === "FACULTY" ? 3 : 7,
        security: authState.role === "ADMIN" ? 2 : 7,
        students: authState.role === "ADMIN" ? 2 : 1,
        approvals: authState.role === "ADMIN" ? 7 : 8,
        auth: 9,
        profile: 10,
        messaging: 11,
        resource: 12,
        feedback: 13
      };

      Object.keys(ROUTE_MAP).forEach(function (key) {
        if (text.indexOf(key) !== -1) {
          var target = roleAwareRouteMap[key] || ROUTE_MAP[key];
          link.href = "../screen" + target + "/code.html";
        }
      });
    });
  }

  function inferActionByText(text) {
    if (text.indexOf("login") !== -1 || text.indexOf("sign in") !== -1) return "login";
    if (text.indexOf("logout") !== -1) return "logout";
    if (text.indexOf("support") !== -1) return "support";
    if (text.indexOf("apply for leave") !== -1 || text === "apply leave") return "apply-leave";
    if (text.indexOf("new request") !== -1 || text.indexOf("transcript") !== -1) return "new-request";
    if (text.indexOf("upload submission") !== -1 || text === "upload") return "upload-assignment";
    if (text.indexOf("upload resource") !== -1) return "resource-upload";
    if (text === "enroll" || text.indexOf("enroll now") !== -1) return "enroll";
    if (text.indexOf("drop") !== -1) return "drop-course";
    if (text.indexOf("download audit logs") !== -1) return "download-logs";
    if (text.indexOf("submit complaint") !== -1) return "submit-complaint";
    if (text.indexOf("save draft") !== -1) return "save-draft-minutes";
    if (text.indexOf("submit for review") !== -1) return "submit-minutes";
    if (text.indexOf("send message") !== -1) return "message-send";
    if (text.indexOf("save profile") !== -1 || text.indexOf("update profile") !== -1) return "profile-save";
    if (text.indexOf("submit feedback") !== -1) return "feedback-submit";
    if (text.indexOf("view feedback summary") !== -1) return "feedback-admin-view";
    if (text.indexOf("review") !== -1 || text.indexOf("view details") !== -1) return "review-item";
    if (text === "delete") return "delete-item";
    return "";
  }

  function isActionAllowed(action) {
    var allowedRoles = ACTION_ROLE_MAP[action] || ["STUDENT", "FACULTY", "ADMIN", "WARDEN"];
    if (allowedRoles.indexOf("PUBLIC") !== -1) return true;
    if (allowedRoles.indexOf(authState.role) !== -1) return true;

    var permissionHint = {
      "download-logs": permissionMatch("AUDIT", "READ"),
      "resource-upload": permissionMatch("RESOURCES", "CREATE"),
      "feedback-admin-view": permissionMatch("FEEDBACK", "READ")
    };

    return !!permissionHint[action];
  }

  async function handleButtonAction(action, sourceEl) {
    if (action === "login") {
      var form = sourceEl.closest("form");
      if (!form) {
        toast("Login form not found.", "error");
        return;
      }
      var instituteId = (form.querySelector("[name='instituteId']") || {}).value || "";
      var password = (form.querySelector("[name='password']") || {}).value || "";
      await requestApi("POST", SERVICE_ENDPOINTS.authLogin, { instituteId: instituteId, password: password });
      toast("Login successful.");
      window.location.href = "../screen1/code.html";
      return;
    }

    if (action === "logout") {
      await requestApi("POST", SERVICE_ENDPOINTS.authLogout, {});
      window.location.href = "../screen" + LOGIN_SCREEN + "/code.html";
      return;
    }

    if (action === "support") {
      showModal(
        "Support Ticket",
        "<form id='support-ticket-form' style='display:grid;gap:10px;'>" +
          "<input required name='subject' placeholder='Subject' style='padding:10px;border:1px solid #cbd5e1;border-radius:8px;' />" +
          "<textarea required name='details' rows='4' placeholder='Details' style='padding:10px;border:1px solid #cbd5e1;border-radius:8px;'></textarea>" +
          "<button type='submit' style='padding:10px 12px;border-radius:8px;border:1px solid #1a237e;background:#1a237e;color:#fff;font-weight:700;'>Submit Ticket</button>" +
          "</form>"
      );
      var supportForm = document.getElementById("support-ticket-form");
      supportForm.addEventListener("submit", async function (event) {
        event.preventDefault();
        var fd = new FormData(supportForm);
        await requestApi("POST", "/api/logs/event", {
          action: "SUPPORT_TICKET_CREATE",
          subject: fd.get("subject"),
          details: fd.get("details")
        });
        hideModal();
        toast("Support ticket submitted.");
      });
      return;
    }

    if (action === "apply-leave") {
      showModal(
        "Apply Leave",
        "<form id='leave-form' style='display:grid;gap:10px;'>" +
          "<input type='date' required name='fromDate' style='padding:10px;border:1px solid #cbd5e1;border-radius:8px;' />" +
          "<input type='date' required name='toDate' style='padding:10px;border:1px solid #cbd5e1;border-radius:8px;' />" +
          "<textarea required name='reason' rows='4' placeholder='Reason for leave' style='padding:10px;border:1px solid #cbd5e1;border-radius:8px;'></textarea>" +
          "<button type='submit' style='padding:10px 12px;border-radius:8px;border:1px solid #1a237e;background:#1a237e;color:#fff;font-weight:700;'>Submit Leave</button>" +
          "</form>"
      );
      var leaveForm = document.getElementById("leave-form");
      leaveForm.addEventListener("submit", async function (event) {
        event.preventDefault();
        var fd = new FormData(leaveForm);
        await requestApi("POST", SERVICE_ENDPOINTS.leaveApply, {
          fromDate: fd.get("fromDate"),
          toDate: fd.get("toDate"),
          reason: fd.get("reason")
        });
        hideModal();
        toast("Leave request submitted.");
      });
      return;
    }

    if (action === "new-request") {
      showModal(
        "New Transcript Request",
        "<form id='transcript-form' style='display:grid;gap:10px;'>" +
          "<select required name='requestType' style='padding:10px;border:1px solid #cbd5e1;border-radius:8px;'><option value='Transcript'>Transcript</option><option value='Bonafide'>Bonafide</option><option value='Grade Card'>Grade Card</option></select>" +
          "<textarea name='remarks' rows='3' placeholder='Remarks' style='padding:10px;border:1px solid #cbd5e1;border-radius:8px;'></textarea>" +
          "<button type='submit' style='padding:10px 12px;border-radius:8px;border:1px solid #1a237e;background:#1a237e;color:#fff;font-weight:700;'>Create Request</button>" +
          "</form>"
      );
      var transcriptForm = document.getElementById("transcript-form");
      transcriptForm.addEventListener("submit", async function (event) {
        event.preventDefault();
        var fd = new FormData(transcriptForm);
        await requestApi("POST", SERVICE_ENDPOINTS.transcriptRequest, {
          requestType: fd.get("requestType"),
          remarks: fd.get("remarks")
        });
        hideModal();
        toast("Transcript request created.");
      });
      return;
    }

    if (action === "upload-assignment") {
      var picker = document.createElement("input");
      picker.type = "file";
      picker.accept = ".pdf,.doc,.docx,.zip";
      picker.addEventListener("change", async function () {
        if (!picker.files || !picker.files.length) return;
        var fd = new FormData();
        fd.append("file", picker.files[0]);
        fd.append("assignment", "Current Assignment");
        await requestApi("POST", SERVICE_ENDPOINTS.assignmentUpload, null, { formData: fd });
        toast("Assignment uploaded.");
      });
      picker.click();
      return;
    }

    if (action === "resource-upload") {
      var resourcePicker = document.createElement("input");
      resourcePicker.type = "file";
      resourcePicker.accept = ".pdf,.ppt,.pptx,.doc,.docx";
      resourcePicker.addEventListener("change", async function () {
        if (!resourcePicker.files || !resourcePicker.files.length) return;
        var rf = new FormData();
        rf.append("file", resourcePicker.files[0]);
        rf.append("resourceType", "Notes");
        await requestApi("POST", SERVICE_ENDPOINTS.resourceUpload, null, { formData: rf });
        toast("Resource uploaded.");
      });
      resourcePicker.click();
      return;
    }

    if (action === "enroll") {
      await requestApi("POST", SERVICE_ENDPOINTS.coursesRegister, { courseId: "selected-course-id" });
      toast("Enrollment request submitted.");
      return;
    }

    if (action === "drop-course") {
      await requestApi("POST", SERVICE_ENDPOINTS.coursesDrop, { courseId: "selected-course-id" });
      toast("Drop course request submitted.", "warn");
      return;
    }

    if (action === "download-logs") {
      await requestApi("GET", SERVICE_ENDPOINTS.logsExport);
      toast("Audit export requested.");
      return;
    }

    if (action === "submit-complaint") {
      await requestApi("POST", SERVICE_ENDPOINTS.complaintRaise, {
        category: "Facility",
        title: "Complaint",
        description: "Submitted from portal"
      });
      toast("Complaint submitted.");
      return;
    }

    if (action === "save-draft-minutes") {
      await requestApi("POST", SERVICE_ENDPOINTS.hmcMinutes, { agenda: "Draft Minute", status: "DRAFT" });
      toast("Draft saved.");
      return;
    }

    if (action === "submit-minutes") {
      await requestApi("POST", SERVICE_ENDPOINTS.hmcMinutes, { agenda: "HMC Minute", status: "PENDING_REVIEW" });
      toast("Minutes submitted for review.");
      return;
    }

    if (action === "profile-save") {
      var pForm = sourceEl.closest("form");
      if (!pForm) return;
      var fdProfile = new FormData(pForm);
      await requestApi("PUT", SERVICE_ENDPOINTS.profileUpdate, {
        fullName: fdProfile.get("fullName"),
        phoneNumber: fdProfile.get("phoneNumber"),
        localAddress: fdProfile.get("localAddress"),
        emergencyContact: fdProfile.get("emergencyContact")
      });
      toast("Profile updated.");
      return;
    }

    if (action === "message-send") {
      var msgForm = sourceEl.closest("form");
      if (!msgForm) return;
      var fdMsg = new FormData(msgForm);
      await requestApi("POST", SERVICE_ENDPOINTS.messageSend, {
        courseId: fdMsg.get("courseId"),
        messageText: fdMsg.get("messageText"),
        messageType: fdMsg.get("messageType") || "Normal"
      });
      toast("Message sent.");
      msgForm.reset();
      return;
    }

    if (action === "feedback-submit") {
      var fForm = sourceEl.closest("form");
      if (!fForm) return;
      var fdFeedback = new FormData(fForm);
      await requestApi("POST", SERVICE_ENDPOINTS.feedbackSubmit, {
        courseId: fdFeedback.get("courseId"),
        rating: Number(fdFeedback.get("rating")),
        comments: fdFeedback.get("comments")
      });
      toast("Feedback submitted.");
      fForm.reset();
      return;
    }

    if (action === "feedback-admin-view") {
      await requestApi("GET", SERVICE_ENDPOINTS.feedbackSummary);
      toast("Feedback summary loaded from backend.");
      return;
    }

    if (action === "review-item") {
      toast("Review panel action triggered.");
      return;
    }

    if (action === "delete-item") {
      var row = sourceEl.closest("div.p-6, tr, .group, .card");
      if (row) row.style.opacity = "0.35";
      toast("Item marked. Connect delete API to persist.", "warn");
      return;
    }
  }

  function applyElementRbac() {
    var roleElements = document.querySelectorAll("[data-roles]");
    roleElements.forEach(function (el) {
      var allowedRoles = (el.getAttribute("data-roles") || "").split(",").map(function (x) { return normalizeRole(x.trim()); }).filter(Boolean);
      if (allowedRoles.length && allowedRoles.indexOf(authState.role) === -1) {
        el.style.display = "none";
      }
    });

    var permElements = document.querySelectorAll("[data-rbac-resource]");
    permElements.forEach(function (el) {
      var resource = el.getAttribute("data-rbac-resource");
      var action = el.getAttribute("data-rbac-action") || "READ";
      if (!permissionMatch(resource, action)) {
        el.style.display = "none";
      }
    });
  }

  function bindButtons() {
    var buttons = document.querySelectorAll("button");
    buttons.forEach(function (button) {
      if (button.id === "router-prev" || button.id === "router-next") return;

      var explicitAction = button.getAttribute("data-action");
      var text = (button.textContent || "").replace(/\s+/g, " ").trim().toLowerCase();
      var action = explicitAction || inferActionByText(text);

      if (!action) {
        var icon = button.querySelector(".material-symbols-outlined");
        var iconText = icon ? (icon.textContent || "").trim().toLowerCase() : "";
        if (iconText === "delete") action = "delete-item";
      }

      if (action) {
        button.dataset.action = action;

        if (!isActionAllowed(action)) {
          button.style.display = "none";
          return;
        }

        button.style.cursor = "pointer";
        button.addEventListener("click", function (event) {
          event.preventDefault();
          handleButtonAction(action, button).catch(function (error) {
            if (error.status === 401) {
              toast("Session expired. Please login again.", "warn");
              window.location.href = "../screen" + LOGIN_SCREEN + "/code.html";
              return;
            }
            if (error.status === 403) {
              toast("RBAC denied this action.", "error");
              return;
            }
            toast(error.message || "Action failed.", "error");
          });
        });
      }
    });
  }

  function bindForms() {
    var forms = document.querySelectorAll("form");
    forms.forEach(function (form) {
      if (form.getAttribute("data-shell-submit-bound") === "1") return;
      form.setAttribute("data-shell-submit-bound", "1");

      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var submitButton = form.querySelector("button[type='submit']");
        if (submitButton && submitButton.dataset.action) {
          submitButton.click();
          return;
        }
      });
    });
  }

  function exposeIntegrationMap() {
    window.ScholarlyIntegration = {
      apiBase: API_BASE,
      demoMode: DEMO_MODE,
      demoUsers: DEMO_USERS,
      endpoints: SERVICE_ENDPOINTS,
      role: authState.role,
      permissions: authState.permissions,
      /*
        DATABASE INTEGRATION HINT
        Expected backend table domains (from PDF):
        - users, roles, role_permissions, sessions
        - enrollments, grades, attendance, assignments, submissions
        - transcript_requests, leave_requests, complaints
        - messages, announcements, audit_logs, hmc_minutes
      */
      tables: [
        "users",
        "roles",
        "role_permissions",
        "sessions",
        "enrollments",
        "grades",
        "attendance",
        "assignments",
        "submissions",
        "transcript_requests",
        "leave_requests",
        "complaints",
        "messages",
        "announcements",
        "audit_logs",
        "hmc_minutes"
      ]
    };
  }

  async function init() {
    await bootstrapAuthAndRbac();
    if (!enforceRouteGuard()) return;

    runRouter();
    bindNavLinks();
    applyElementRbac();
    bindButtons();
    bindForms();
    exposeIntegrationMap();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      init().catch(function (error) {
        toast(error.message || "Initialization failed.", "error");
      });
    });
  } else {
    init().catch(function (error) {
      toast(error.message || "Initialization failed.", "error");
    });
  }
})();
