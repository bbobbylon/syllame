/**
 * Server-side validation for the login form. See `register.js` for why the
 * server validates even though the browser does too.
 */

const Validator = require("validator");
const isEmpty = require("is-empty");

/**
 * Validates a login payload.
 *
 * @param {object} data - Raw request body.
 * @param {string} [data.email]
 * @param {string} [data.password]
 * @returns {{ errors: Record<string, string>, isValid: boolean }}
 */
module.exports = function validateLoginInput(data) {
  const errors = {};

  const email = isEmpty(data.email) ? "" : String(data.email);
  const password = isEmpty(data.password) ? "" : String(data.password);

  if (Validator.isEmpty(email)) {
    errors.email = "Email field is required";
  } else if (!Validator.isEmail(email)) {
    errors.email = "Email is invalid";
  }

  if (Validator.isEmpty(password)) {
    errors.password = "Password field is required";
  }

  return { errors, isValid: isEmpty(errors) };
};
