const crypto = require("crypto");
const env = require("../config/env");

function getKey() {
  if (!env.audit.encryptionKey) {
    return null;
  }
  const key = Buffer.from(env.audit.encryptionKey, "base64");
  if (key.length !== 32) {
    throw new Error("Invalid audit encryption key length");
  }
  return key;
}

function encryptPayload(payload) {
  const key = getKey();
  if (!key) {
    return { encrypted: null, iv: null, tag: null };
  }
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const data = Buffer.from(JSON.stringify(payload), "utf-8");
  const encrypted = Buffer.concat([cipher.update(data), cipher.final()]);
  const tag = cipher.getAuthTag();
  return {
    encrypted: encrypted.toString("base64"),
    iv: iv.toString("base64"),
    tag: tag.toString("base64")
  };
}

function decryptPayload(record) {
  const key = getKey();
  if (!key || !record || !record.encrypted_data) {
    return null;
  }
  const parsed = JSON.parse(record.encrypted_data);
  const iv = Buffer.from(parsed.iv, "base64");
  const tag = Buffer.from(parsed.tag, "base64");
  const encrypted = Buffer.from(parsed.data, "base64");
  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(tag);
  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
  return JSON.parse(decrypted.toString("utf-8"));
}

function hashRecord(record) {
  return crypto.createHash("sha256").update(record).digest("hex");
}

module.exports = {
  encryptPayload,
  decryptPayload,
  hashRecord
};
