const { createClient } = require("redis");
const env = require("../config/env");

const fallbackStore = new Map();
let redisClient = null;

async function getClient() {
  if (!env.redis.uri) {
    return null;
  }
  if (!redisClient) {
    redisClient = createClient({ url: env.redis.uri });
    redisClient.on("error", (err) => {
      console.error("Redis error", err);
    });
    await redisClient.connect();
  }
  return redisClient;
}

function cleanupFallback() {
  const now = Date.now();
  for (const [key, value] of fallbackStore.entries()) {
    if (value.expiresAt <= now) {
      fallbackStore.delete(key);
    }
  }
}

async function isRevoked(jti) {
  if (!jti) {
    return false;
  }
  const client = await getClient();
  if (client) {
    const value = await client.get(`bl_token:${jti}`);
    return Boolean(value);
  }
  cleanupFallback();
  const item = fallbackStore.get(jti);
  return Boolean(item);
}

async function isUserRevoked(userId, tokenIssuedAt) {
  if (!userId || !tokenIssuedAt) {
    return false;
  }
  const client = await getClient();
  if (client) {
    const value = await client.get(`bl_user:${userId}`);
    if (!value) {
      return false;
    }
    const revokedAt = parseInt(value, 10);
    return tokenIssuedAt * 1000 <= revokedAt;
  }
  cleanupFallback();
  const item = fallbackStore.get(`user:${userId}`);
  if (!item) {
    return false;
  }
  return tokenIssuedAt * 1000 <= item.revokedAt;
}

async function revoke(jti, ttlSeconds, userId) {
  if (!jti || !ttlSeconds) {
    return;
  }
  const client = await getClient();
  if (client) {
    await client.set(`bl_token:${jti}`, userId || "", {
      EX: ttlSeconds
    });
    return;
  }
  cleanupFallback();
  fallbackStore.set(jti, {
    userId: userId || null,
    expiresAt: Date.now() + ttlSeconds * 1000
  });
}

async function revokeAllForUser(userId) {
  const revokedAt = Date.now();
  const client = await getClient();
  if (client) {
    await client.set(`bl_user:${userId}`, String(revokedAt));
    return;
  }
  cleanupFallback();
  fallbackStore.set(`user:${userId}`, {
    revokedAt
  });
}

module.exports = {
  isRevoked,
  isUserRevoked,
  revoke,
  revokeAllForUser
};
