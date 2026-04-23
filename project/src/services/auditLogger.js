const auditService = require("./auditService");

function logEvent(event) {
  const payload = {
    eventType: event.eventType,
    instituteId: event.instituteId || null,
    userId: event.userId || null,
    success: event.success,
    ip: event.ip || null,
    userAgent: event.userAgent || null,
    createdAt: new Date().toISOString()
  };

  auditService
    .ingestEvent({
      userId: event.userId || null,
      action: event.eventType,
      resource: event.resource || "AUTH",
      payload,
      ipAddress: event.ip || null
    })
    .catch((err) => {
      console.error("Audit log failed", err);
    });
}

module.exports = {
  logEvent
};
