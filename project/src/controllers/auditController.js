const auditService = require("../services/auditService");

async function ingest(req, res, next) {
  try {
    const logId = await auditService.ingestEvent({
      userId: req.body.userId || null,
      action: req.body.action,
      resource: req.body.resource,
      payload: req.body.payload || null,
      ipAddress: req.ip
    });
    return res.status(200).json({ logId });
  } catch (err) {
    return next(err);
  }
}

async function listAudit(req, res, next) {
  try {
    const limit = Math.min(parseInt(req.query.limit || "50", 10), 200);
    const offset = parseInt(req.query.offset || "0", 10);
    const logs = await auditService.listAuditLogs({ limit, offset });
    return res.status(200).json({ logs });
  } catch (err) {
    return next(err);
  }
}

async function exportLogs(req, res, next) {
  try {
    const logs = await auditService.listAuditLogs({ limit: 1000, offset: 0 });
    const header = "log_id,user_id,action,resource,ip_address,created_at";
    const rows = logs.map((log) => [
      log.log_id,
      log.user_id || "",
      log.action,
      log.resource,
      log.ip_address || "",
      log.created_at
    ].map((value) => `\"${String(value).replace(/\"/g, "\"\"")}\"`).join(","));
    res.setHeader("Content-Type", "text/csv");
    return res.status(200).send([header, ...rows].join("\n"));
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  ingest,
  listAudit,
  exportLogs
};
