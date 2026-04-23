const db = require("../config/db");

async function listPermissionsByRole(roleName) {
  const rows = await db.query(
    "SELECT role_name, resource, action, is_active FROM role_permissions WHERE role_name = ? AND is_active = true",
    [roleName]
  );
  return rows;
}

async function listRoles() {
  const rows = await db.query(
    "SELECT role_name, resource, action, is_active FROM role_permissions ORDER BY role_name, resource, action",
    []
  );
  return rows;
}

async function upsertPermission({ roleName, resource, action, isActive }) {
  await db.query(
    "INSERT INTO role_permissions (role_name, resource, action, is_active) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE is_active = VALUES(is_active)",
    [roleName, resource, action, isActive]
  );
}

module.exports = {
  listPermissionsByRole,
  listRoles,
  upsertPermission
};
