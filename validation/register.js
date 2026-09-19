/**
 * Server-side validation for the registration form.
 *
 * Even though the browser can validate too, the server must never trust the
 * client: anyone can call the API directly with curl. This module is the
 * authoritative check.
 */

const Validator = require("validator");
const isEmpty = require("is-empty");

/**
 * Validates a registration payload.
 *
 * The `validator` library only accepts strings, so each field is first
 * normalized to a string ("" when missing) before the checks run.
 *
 * @param {object} data - Raw request body.
 * @param {string} [data.firstname]
 * @param {string} [data.lastname]
 * @param {string} [data.email]
 * @param {string} [data.password]
 * @param {string} [data.password2] - Password confirmation.
 * @returns {{ errors: Record<string, string>, isValid: boolean }}
 *   `errors` maps a field name to a human-readable message. `isValid` is true
 *   only when `errors` is empty.
 */
module.exports = function validateRegisterInput(data) {
  const errors = {};

  const firstname = isEmpty(data.firstname) ? "" : String(data.firstname);
  const lastname = isEmpty(data.lastname) ? "" : String(data.lastname);
  const email = isEmpty(data.email) ? "" : String(data.email);
  const password = isEmpty(data.password) ? "" : String(data.password);
  const password2 = isEmpty(data.password2) ? "" : String(data.password2);

  if (Validator.isEmpty(firstname)) {
    errors.firstname = "Name field is required";
  }
  if (Validator.isEmpty(lastname)) {
    errors.lastname = "Last name is required";
  }

  if (Validator.isEmpty(email)) {
    errors.email = "Email field is required";
  } else if (!Validator.isEmail(email)) {
    errors.email = "Email is invalid";
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
