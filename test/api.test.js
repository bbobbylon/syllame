/**
 * HTTP-level tests for the Express app.
 *
 * These start the real app on a random free port and call it with `fetch`,
 * but only exercise paths that finish before any database query runs
 * (validation failures, health check, auth rejection). That keeps the suite
 * fast and runnable in CI without a MongoDB instance.
 */

process.env.NODE_ENV = "test";

const { test, describe, before, after } = require("node:test");
const assert = require("node:assert/strict");

const createApp = require("../app");

/** @type {import("node:http").Server} */
let server;
/** @type {string} */
let baseUrl;

before(async () => {
  server = createApp().listen(0);
  await new Promise((resolve) => server.once("listening", resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(() => new Promise((resolve) => server.close(resolve)));

/**
 * Small helper so each test reads as "POST this JSON, expect that".
 *
 * @param {string} path
 * @param {object} body
 * @param {Record<string, string>} [headers]
 */
async function postJson(path, body, headers = {}) {
  const res = await fetch(baseUrl + path, {
    method: "POST",
    headers: { "content-type": "application/json", ...headers },
    body: JSON.stringify(body)
  });
  return { status: res.status, body: await res.json() };
}

describe("GET /api/health", () => {
  test("responds ok", async () => {
    const res = await fetch(`${baseUrl}/api/health`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.status, "ok");
  });
});

describe("POST /api/users/register", () => {
  test("returns 400 with field errors for an empty body", async () => {
    const { status, body } = await postJson("/api/users/register", {});
    assert.equal(status, 400);
    assert.equal(body.email, "Email field is required");
    assert.equal(body.password, "Password field is required");
  });
});

describe("POST /api/users/login", () => {
  test("returns 400 for an invalid email format", async () => {
    const { status, body } = await postJson("/api/users/login", {
      email: "nope",
      password: "whatever"
    });
    assert.equal(status, 400);
    assert.equal(body.email, "Email is invalid");
  });
});

describe("GET /api/users/current", () => {
  test("returns 401 without a token", async () => {
    const res = await fetch(`${baseUrl}/api/users/current`);
    assert.equal(res.status, 401);
  });

  test("returns 401 with a token signed by the wrong secret", async () => {
    const jwt = require("jsonwebtoken");
    const bad = jwt.sign({ id: "abc" }, "not-the-real-secret");
    const res = await fetch(`${baseUrl}/api/users/current`, {
      headers: { authorization: `Bearer ${bad}` }
    });
    assert.equal(res.status, 401);
  });
});
