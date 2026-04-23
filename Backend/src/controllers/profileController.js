const profileService = require("../services/profileService");

async function getOwnProfile(req, res, next) {
  try {
    const userId = req.user.sub;
    const profile = await profileService.getProfile(userId);
    if (!profile) {
      return res.status(404).json({ error: { code: "USER_NOT_FOUND", message: "Profile not found" } });
    }
    return res.status(200).json({ profile });
  } catch (err) {
    return next(err);
  }
}

async function updateOwnProfile(req, res, next) {
  try {
    const userId = req.user.sub;
    const profile = await profileService.updateProfile(userId, req.body || {});
    return res.status(200).json({ profile });
  } catch (err) {
    return next(err);
  }
}

async function getUserProfile(req, res, next) {
  try {
    const profile = await profileService.getProfile(req.params.id);
    if (!profile) {
      return res.status(404).json({ error: { code: "USER_NOT_FOUND", message: "Profile not found" } });
    }
    return res.status(200).json({ profile });
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  getOwnProfile,
  updateOwnProfile,
  getUserProfile
};
