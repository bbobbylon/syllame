/**
 * Unit tests for validation/syllabus.js. Pure functions, no database.
 */

const { test, describe } = require("node:test");
const assert = require("node:assert/strict");

const validateSyllabusInput = require("../validation/syllabus");

describe("validateSyllabusInput", () => {
  test("requires a title and defaults creditHours to 3", () => {
    const { errors, isValid, value } = validateSyllabusInput({});
    assert.equal(isValid, false);
    assert.equal(errors.title, "Title is required");
    assert.equal(value.creditHours, 3);
  });

  test("accepts a full payload and coerces creditHours from a string", () => {
    const { isValid, value } = validateSyllabusInput({
      title: "  Intro to Databases ",
      creditHours: "4",
      emailAddress: "prof@example.edu",
      courseDescription: "Relational models."
    });
    assert.equal(isValid, true);
    assert.equal(value.title, "Intro to Databases");
    assert.equal(value.creditHours, 4);
    assert.equal(value.courseSchedule, ""); // untouched fields become ""
  });

  test("drops unknown keys such as owner so clients cannot set them", () => {
    const { value } = validateSyllabusInput({ title: "x", owner: "someone-else", _id: "abc" });
    assert.equal("owner" in value, false);
    assert.equal("_id" in value, false);
  });

  test("rejects a bad email and out-of-range credit hours", () => {
    const { errors } = validateSyllabusInput({ title: "x", emailAddress: "nope", creditHours: 9 });
    assert.equal(errors.emailAddress, "Email is invalid");
    assert.match(errors.creditHours, /between 1 and 5/);
  });

  test("rejects over-long text", () => {
    const { errors } = validateSyllabusInput({ title: "t".repeat(201) });
    assert.match(errors.title, /200 characters/);
  });
});
