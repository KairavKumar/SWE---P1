const permissionService = require("../services/permissionService");
const rolePermissionRepository = require("../repositories/rolePermissionRepository");

async function myPermissions(req, res, next) {
  try {
    const role = req.user.role;
    const permissions = await permissionService.getPermissions(role);
    return res.status(200).json({ role, permissions });
  } catch (err) {
    return next(err);
  }
}

async function listRoles(req, res, next) {
  try {
    const rows = await rolePermissionRepository.listRoles();
    return res.status(200).json({ roles: rows });
  } catch (err) {
    return next(err);
  }
}

async function updateRole(req, res, next) {
  try {
    const { roleName, resource, action, isActive } = req.body || {};
    if (!roleName || !resource || !action) {
      return res.status(400).json({ error: { code: "MALFORMED_REQUEST", message: "Missing fields" } });
    }
    await rolePermissionRepository.upsertPermission({
      roleName,
      resource,
      action,
      isActive: Boolean(isActive)
    });
    permissionService.invalidateRole(roleName);
    return res.status(200).json({ ok: true });
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  myPermissions,
  listRoles,
  updateRole
};
