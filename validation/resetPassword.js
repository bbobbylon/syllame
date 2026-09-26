/**
 * Validation for the "choose a new password" step of a password reset.
 */

const Validator = require("validator");
const isEmpty = require("is-empty");

/**
 * @param {object} data - Raw request body.
 * @param {string} [data.token]
 * @param {string} [data.password]
 * @param {string} [data.password2]
 * @returns {{ errors: Record<string, string>, isValid: boolean }}
 */
module.exports = function validateResetPasswordInput(data = {}) {
  const errors = {};

  const token = isEmpty(data.token) ? "" : String(data.token);
  const password = isEmpty(data.password) ? "" : String(data.password);
  const password2 = isEmpty(data.password2) ? "" : String(data.password2);

  if (Validator.isEmpty(token)) {
    errors.token = "Reset token is missing";
  }

  if (Validator.isEmpty(password)) {
    errors.password = "Password field is required";
  } else if (!Validator.isLength(password, { min: 6, max: 30 })) {
    errors.password = "Password must be between 6 and 30 characters";
  }

  if (Validator.isEmpty(password2)) {
    errors.password2 = "Confirm password field is required";
  } else if (!Validator.equals(password, password2)) {
    errors.password2 = "Passwords must match";
  }

  return { errors, isValid: isEmpty(errors) };
};
