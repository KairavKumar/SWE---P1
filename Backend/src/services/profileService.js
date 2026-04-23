const profileRepository = require("../repositories/profileRepository");
const auditLogger = require("./auditLogger");
const { isValidPhone, isSafeText } = require("../utils/validation");

function sanitizeProfileInput(input) {
  return {
    fullName: input.fullName || "",
    phoneNumber: input.phoneNumber || null,
    localAddress: input.localAddress || null,
    emergencyContact: input.emergencyContact || null,
    profilePicture: input.profilePicture || null
  };
}

function validateProfile(fields) {
  if (!isSafeText(fields.fullName, 160)) {
    return "Invalid name";
  }
  if (!isSafeText(fields.localAddress, 255)) {
    return "Invalid address";
  }
  if (!isSafeText(fields.emergencyContact, 200)) {
    return "Invalid emergency contact";
  }
  if (!isValidPhone(fields.phoneNumber)) {
    return "Invalid phone number";
  }
  return null;
}

async function getProfile(userId) {
  return profileRepository.findByUserId(userId);
}

async function updateProfile(userId, payload) {
  const fields = sanitizeProfileInput(payload);
  const validationError = validateProfile(fields);
  if (validationError) {
    const error = new Error(validationError);
    error.status = 400;
    error.code = "VALIDATION_FAILED";
    throw error;
  }

  await profileRepository.upsertProfile(userId, fields);
  auditLogger.logEvent({
    eventType: "PROFILE_UPDATED",
    userId,
    success: true
  });

  return profileRepository.findByUserId(userId);
}

module.exports = {
  getProfile,
  updateProfile
};
