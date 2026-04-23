const db = require("../config/db");

async function findByUserId(userId) {
  const rows = await db.query(
    "SELECT user_id, full_name, phone_number, local_address, emergency_contact, profile_picture FROM user_profiles WHERE user_id = ?",
    [userId]
  );
  return rows[0] || null;
}

async function upsertProfile(userId, fields) {
  await db.query(
    "INSERT INTO user_profiles (user_id, full_name, phone_number, local_address, emergency_contact, profile_picture) VALUES (?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE full_name = VALUES(full_name), phone_number = VALUES(phone_number), local_address = VALUES(local_address), emergency_contact = VALUES(emergency_contact), profile_picture = VALUES(profile_picture)",
    [
      userId,
      fields.fullName,
      fields.phoneNumber,
      fields.localAddress,
      fields.emergencyContact,
      fields.profilePicture
    ]
  );
}

module.exports = {
  findByUserId,
  upsertProfile
};
