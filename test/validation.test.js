/**
 * Unit tests for the validation modules. These run with Node's built-in test
 * runner (`node --test`), so there is nothing extra to install.
 */

const { test, describe } = require("node:test");
const assert = require("node:assert/strict");

const validateRegisterInput = require("../validation/register");
const validateLoginInput = require("../validation/login");

describe("validateRegisterInput", () => {
  test("accepts a complete, matching registration", () => {
    const { errors, isValid } = validateRegisterInput({
      firstname: "Ada",
      lastname: "Lovelace",
      email: "ada@example.com",
      password: "secret123",
      password2: "secret123"
    });
    assert.equal(isValid, true);
    assert.deepEqual(errors, {});
  });

  test("flags every missing field on an empty body", () => {
    const { errors, isValid } = validateRegisterInput({});
    assert.equal(isValid, false);
    assert.deepEqual(Object.keys(errors).sort(), [
      "email",
      "firstname",
      "lastname",
      "password",
      "password2"
    ]);
  });

  test("rejects a malformed email", () => {
    const { errors } = validateRegisterInput({ email: "not-an-email" });
    assert.equal(errors.email, "Email is invalid");
  });

  test("rejects a short password and mismatched confirmation", () => {
    const { errors } = validateRegisterInput({
      firstname: "A",
      lastname: "B",
      email: "a@b.co",
      password: "abc",
      password2: "abcd"
    });
    assert.match(errors.password, /between 6 and 30/);
    assert.equal(errors.password2, "Passwords must match");
  });

  test("does not crash on non-string values", () => {
    const { isValid } = validateRegisterInput({ firstname: 42, email: null, password: {} });
    assert.equal(isValid, false);
  });
});

describe("validateLoginInput", () => {
  test("accepts a valid email and any non-empty password", () => {
    const { isValid } = validateLoginInput({ email: "ada@example.com", password: "x" });
    assert.equal(isValid, true);
  });

  test("requires both fields", () => {
    const { errors, isValid } = validateLoginInput({});
    assert.equal(isValid, false);
    assert.equal(errors.email, "Email field is required");
    assert.equal(errors.password, "Password field is required");
  });
});
