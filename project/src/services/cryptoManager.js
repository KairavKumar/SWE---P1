const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const env = require("../config/env");

function generateToken() {
  return crypto.randomBytes(32).toString("hex");
}

function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

async function hashPassword(password) {
  const rounds = env.passwordReset.bcryptRounds;
  return bcrypt.hash(password, rounds);
}

async function verifyPassword(password, passwordHash) {
  if (!passwordHash) {
    return false;
  }
  return bcrypt.compare(password, passwordHash);
}

module.exports = {
  generateToken,
  hashToken,
  hashPassword,
  verifyPassword
};
