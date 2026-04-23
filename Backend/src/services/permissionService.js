const rolePermissionRepository = require("../repositories/rolePermissionRepository");

const roleCache = new Map();
const cacheTtlMs = 60 * 60 * 1000;

function cacheKey(roleName) {
  return roleName.toUpperCase();
}

function setCache(roleName, permissions) {
  roleCache.set(cacheKey(roleName), {
    permissions,
    expiresAt: Date.now() + cacheTtlMs
  });
}

function getCache(roleName) {
  const item = roleCache.get(cacheKey(roleName));
  if (!item) {
    return null;
  }
  if (item.expiresAt <= Date.now()) {
    roleCache.delete(cacheKey(roleName));
    return null;
  }
  return item.permissions;
}

async function getPermissions(roleName) {
  const cached = getCache(roleName);
  if (cached) {
    return cached;
  }
  const permissions = await rolePermissionRepository.listPermissionsByRole(roleName);
  setCache(roleName, permissions);
  return permissions;
}

async function hasPermission(roleName, resource, action) {
  const permissions = await getPermissions(roleName);
  return permissions.some(
    (perm) =>
      perm.resource.toUpperCase() === resource.toUpperCase() &&
      perm.action.toUpperCase() === action.toUpperCase() &&
      perm.is_active
  );
}

function invalidateRole(roleName) {
  if (!roleName) {
    roleCache.clear();
    return;
  }
  roleCache.delete(cacheKey(roleName));
}

module.exports = {
  getPermissions,
  hasPermission,
  invalidateRole
};
