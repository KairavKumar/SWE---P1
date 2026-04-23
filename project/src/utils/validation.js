function isValidPhone(value) {
  if (!value) {
    return true;
  }
  return /^[0-9+\-() ]{7,20}$/.test(value);
}

function isSafeText(value, maxLength) {
  if (value === null || value === undefined) {
    return true;
  }
  if (typeof value !== "string") {
    return false;
  }
  if (value.length > maxLength) {
    return false;
  }
  return !/[<>]/.test(value);
}

module.exports = {
  isValidPhone,
  isSafeText
};
