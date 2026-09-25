/**
 * End-to-end tests against a real MongoDB: register, log in, then exercise
 * the syllabus CRUD routes including ownership isolation.
 *
 * These only run when MONGO_URI is set (CI provides a throwaway MongoDB
 * service container; locally you can point it at a scratch database).
 * Without it the whole file is skipped, so `npm test` still works offline.
 *
 * Run locally:  MONGO_URI=mongodb://127.0.0.1:27017/syllame_test npm test
 *
 * The database named in MONGO_URI is DROPPED at the end. Never point this
 * at real data.
 */

process.env.NODE_ENV = "test";

const { test, describe, before, after } = require("node:test");
const assert = require("node:assert/strict");
const mongoose = require("mongoose");

const createApp = require("../app");

const { testDatabaseUri } = require("./helpers/db");

/** Own database per test file; see helpers/db.js. */
const MONGO_URI = testDatabaseUri("api");

describe("database-backed API", { skip: !MONGO_URI && "MONGO_URI not set" }, () => {
  /** @type {import("node:http").Server} */
  let server;
  /** @type {string} */
  let baseUrl;

  before(async () => {
    await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 10000 });
    await mongoose.connection.dropDatabase();
    // Ensure unique indexes exist before the duplicate-email test runs.
    await mongoose.model("users").syncIndexes();
    server = createApp().listen(0);
    await new Promise((resolve) => server.once("listening", resolve));
    baseUrl = `http://127.0.0.1:${server.address().port}`;
  });

  after(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
    await new Promise((resolve) => server.close(resolve));
  });

  /**
   * @param {string} method
   * @param {string} path
   * @param {object} [options]
   * @param {object} [options.body]
   * @param {string} [options.token] - Full "Bearer ..." string.
   */
  async function call(method, path, { body, token } = {}) {
    const res = await fetch(baseUrl + path, {
      method,
      headers: {
        ...(body ? { "content-type": "application/json" } : {}),
        ...(token ? { authorization: token } : {})
      },
      body: body ? JSON.stringify(body) : undefined
    });
    const text = await res.text();
    return { status: res.status, body: text ? JSON.parse(text) : null };
  }

  /** Registers and logs in a user, returning the Bearer token. */
  async function signUpAndLogin(email) {
    const reg = await call("POST", "/api/users/register", {
      body: { firstname: "Test", lastname: "User", email, password: "secret123", password2: "secret123" }
    });
    assert.equal(reg.status, 201, JSON.stringify(reg.body));
    assert.equal(reg.body.password, undefined, "password hash must not be returned");
    const login = await call("POST", "/api/users/login", { body: { email, password: "secret123" } });
    assert.equal(login.status, 200, JSON.stringify(login.body));
    assert.match(login.body.token, /^Bearer /);
    return login.body.token;
  }

  let alice;
  let bob;

  test("register + login round-trip", async () => {
    alice = await signUpAndLogin("alice@example.com");
    bob = await signUpAndLogin("bob@example.com");
  });

  test("duplicate email is rejected, case-insensitively", async () => {
    const res = await call("POST", "/api/users/register", {
      body: { firstname: "A", lastname: "B", email: "ALICE@example.com", password: "secret123", password2: "secret123" }
    });
    assert.equal(res.status, 400);
    assert.equal(res.body.email, "Email already exists");
  });

  test("wrong password and unknown email get the same 401", async () => {
    const wrongPassword = await call("POST", "/api/users/login", { body: { email: "alice@example.com", password: "wrong" } });
    const unknownEmail = await call("POST", "/api/users/login", { body: { email: "nobody@example.com", password: "wrong" } });
    assert.equal(wrongPassword.status, 401);
    assert.equal(unknownEmail.status, 401);
    assert.deepEqual(wrongPassword.body, unknownEmail.body);
    assert.equal(wrongPassword.body.general, "Invalid email or password");
  });

  test("GET /api/users/current returns the token's user", async () => {
    const res = await call("GET", "/api/users/current", { token: alice });
    assert.equal(res.status, 200);
    assert.equal(res.body.email, "alice@example.com");
    assert.equal(res.body.password, undefined);
  });

  let syllabusId;

  test("create, list, read a syllabus", async () => {
    const created = await call("POST", "/api/syllabi", {
      token: alice,
      body: { title: "Databases 101", creditHours: "4", emailAddress: "alice@example.com", owner: "spoofed" }
    });
    assert.equal(created.status, 201, JSON.stringify(created.body));
    assert.equal(created.body.title, "Databases 101");
    assert.equal(created.body.creditHours, 4);
    assert.notEqual(created.body.owner, "spoofed");
    syllabusId = created.body._id;

    const list = await call("GET", "/api/syllabi", { token: alice });
    assert.equal(list.status, 200);
    assert.equal(list.body.length, 1);

    const one = await call("GET", `/api/syllabi/${syllabusId}`, { token: alice });
    assert.equal(one.status, 200);
    assert.equal(one.body._id, syllabusId);
  });

  test("validation errors on create", async () => {
    const res = await call("POST", "/api/syllabi", { token: alice, body: { creditHours: 7 } });
    assert.equal(res.status, 400);
    assert.equal(res.body.title, "Title is required");
  });

  test("another user cannot see, edit or delete it", async () => {
    assert.equal((await call("GET", "/api/syllabi", { token: bob })).body.length, 0);
    assert.equal((await call("GET", `/api/syllabi/${syllabusId}`, { token: bob })).status, 404);
    assert.equal((await call("PUT", `/api/syllabi/${syllabusId}`, { token: bob, body: { title: "hacked" } })).status, 404);
    assert.equal((await call("DELETE", `/api/syllabi/${syllabusId}`, { token: bob })).status, 404);
  });

  test("update then delete", async () => {
    const updated = await call("PUT", `/api/syllabi/${syllabusId}`, {
      token: alice,
      body: { title: "Databases 102", creditHours: 3 }
    });
    assert.equal(updated.status, 200);
    assert.equal(updated.body.title, "Databases 102");

    assert.equal((await call("DELETE", `/api/syllabi/${syllabusId}`, { token: alice })).status, 204);
    assert.equal((await call("GET", `/api/syllabi/${syllabusId}`, { token: alice })).status, 404);
  });

  test("malformed ids return 404 rather than 500", async () => {
    assert.equal((await call("GET", "/api/syllabi/not-an-id", { token: alice })).status, 404);
  });
});
