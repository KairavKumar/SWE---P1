const crypto = require("crypto");
const auditRepository = require("../repositories/auditRepository");
const auditCrypto = require("./auditCrypto");

async function ingestEvent(event) {
  if (!event.action || !event.resource) {
    const error = new Error("Invalid payload");
    error.status = 400;
    error.code = "INVALID_PAYLOAD";
    throw error;
  }

  const logId = crypto.randomUUID();
  const payload = event.payload || null;
  const encrypted = auditCrypto.encryptPayload(payload);
  const encryptedData = encrypted.encrypted
    ? JSON.stringify({ data: encrypted.encrypted, iv: encrypted.iv, tag: encrypted.tag })
    : null;
  const integrityHash = auditCrypto.hashRecord(`${logId}:${event.action}:${event.resource}:${encryptedData || ""}`);

  await auditRepository.insertLog({
    logId,
    userId: event.userId || null,
    action: event.action,
    resource: event.resource,
    encryptedData,
    integrityHash,
    ipAddress: event.ipAddress || null
  });

  return logId;
}

async function listAuditLogs({ limit, offset }) {
  const logs = await auditRepository.listLogs({ limit, offset });
  return logs.map((log) => ({
    ...log,
    decrypted_payload: auditCrypto.decryptPayload(log)
  }));
}

module.exports = {
  ingestEvent,
  listAuditLogs
};
