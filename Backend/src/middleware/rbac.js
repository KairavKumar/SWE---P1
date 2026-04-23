const permissionService = require("../services/permissionService");
const auditLogger = require("../services/auditLogger");

function requireRole(roles) {
  return (req, res, next) => {
    const role = req.user && req.user.role;
    if (!role || !roles.includes(role)) {
      auditLogger.logEvent({
        eventType: "RBAC_DENIED",
        userId: req.user ? req.user.sub : null,
        success: false
      });
      return res.status(403).json({ error: { code: "INSUFFICIENT_ROLE", message: "Forbidden" } });
    }
    return next();
  };
}

function requirePermission(resource, action) {
  return async (req, res, next) => {
    const role = req.user && req.user.role;
    if (!role) {
      return res.status(401).json({ error: { code: "MISSING_TOKEN", message: "Missing token" } });
    }
    const allowed = await permissionService.hasPermission(role, resource, action);
    if (!allowed) {
      auditLogger.logEvent({
        eventType: "RBAC_DENIED",
        userId: req.user ? req.user.sub : null,
        success: false
      });
      return res.status(403).json({ error: { code: "INSUFFICIENT_ROLE", message: "Forbidden" } });
    }
    return next();
  };
}

module.exports = {
  requireRole,
  requirePermission
};
