/**
 * Server-side validation for syllabus create/update payloads.
 *
 * Returns both the field errors and a *sanitized* copy of the data containing
 * only known fields, so the route can pass it straight to Mongoose without
 * letting a client set `owner` or any other unexpected key.
 */

const Validator = require("validator");
const isEmpty = require("is-empty");
const { TEXT_FIELDS } = require("../models/syllabus");

/** Longest value accepted for any free-text field. Generous but bounded. */
const MAX_TEXT = 5000;
/** Title gets a tighter bound because it shows in list rows and headings. */
const MAX_TITLE = 200;

/**
 * @param {object} data - Raw request body.
 * @returns {{ errors: Record<string, string>, isValid: boolean, value: object }}
 *   `value` holds only the accepted fields, trimmed, with `creditHours` as a number.
 */
module.exports = function validateSyllabusInput(data = {}) {
  const errors = {};
  const value = {};

  for (const name of TEXT_FIELDS) {
    const raw = isEmpty(data[name]) ? "" : String(data[name]).trim();
    const max = name === "title" ? MAX_TITLE : MAX_TEXT;
    if (raw.length > max) {
      errors[name] = `Must be ${max} characters or fewer`;
    }
    value[name] = raw;
  }

  if (Validator.isEmpty(value.title)) {
    errors.title = "Title is required";
  }

  if (!Validator.isEmpty(value.emailAddress) && !Validator.isEmail(value.emailAddress)) {
    errors.emailAddress = "Email is invalid";
  }

  // creditHours arrives as a string from <select>; accept 1-5 inclusive.
  const hours = Number.parseInt(String(data.creditHours ?? "3"), 10);
  if (Number.isNaN(hours) || hours < 1 || hours > 5) {
    errors.creditHours = "Credit hours must be between 1 and 5";
  } else {
    value.creditHours = hours;
  }

  return { errors, isValid: isEmpty(errors), value };
};
