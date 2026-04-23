const path = require("path");
const dotenv = require("dotenv");

dotenv.config({ path: path.join(__dirname, "..", "..", ".env") });

const env = {
  port: parseInt(process.env.PORT || "4000", 10),
  db: {
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "3306", 10),
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    name: process.env.DB_NAME || "academic_portal"
  },
  jwt: {
    secret: process.env.JWT_SECRET || "change-me",
    expiresHours: parseInt(process.env.JWT_EXPIRES_HOURS || "12", 10),
    accessTtlMinutes: parseInt(process.env.ACCESS_TOKEN_TTL_MINUTES || "15", 10),
    refreshTtlDays: parseInt(process.env.REFRESH_TOKEN_TTL_DAYS || "7", 10),
    issuer: process.env.JWT_ISSUER || "academic-portal",
    audience: process.env.JWT_AUDIENCE || "academic-portal-web"
  },
  cookies: {
    secure: (process.env.COOKIE_SECURE || "false").toLowerCase() === "true",
    domain: process.env.COOKIE_DOMAIN || undefined
  },
  ldap: {
    mode: process.env.LDAP_MODE || "mock",
    url: process.env.LDAP_URL || "ldap://localhost:389",
    baseDn: process.env.LDAP_BASE_DN || "",
    userDnTemplate: process.env.LDAP_USER_DN_TEMPLATE || "uid={id}",
    bindDn: process.env.LDAP_BIND_DN || "",
    bindPassword: process.env.LDAP_BIND_PASSWORD || "",
    mockAcceptAll: (process.env.MOCK_LDAP_ACCEPT_ALL || "true").toLowerCase() === "true",
    mockPassword: process.env.MOCK_LDAP_PASSWORD || ""
  },
  passwordReset: {
    expiryMinutes: parseInt(process.env.RESET_TOKEN_EXPIRY_MINS || "15", 10),
    bcryptRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS || "12", 10),
    rateLimitForgot: parseInt(process.env.RATE_LIMIT_FORGOT_PWD || "3", 10)
  },
  smtp: {
    host: process.env.SMTP_HOST || "",
    port: parseInt(process.env.SMTP_PORT || "587", 10),
    user: process.env.SMTP_USER || "",
    password: process.env.SMTP_PASSWORD || "",
    from: process.env.SMTP_FROM || "no-reply@university.edu"
  },
  audit: {
    encryptionKey: process.env.AUDIT_ENCRYPTION_KEY || "",
    retentionDays: parseInt(process.env.AUDIT_LOG_RETENTION_DAYS || "90", 10)
  },
  redis: {
    uri: process.env.REDIS_URI || ""
  }
};

module.exports = env;
