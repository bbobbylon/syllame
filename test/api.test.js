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

describe("/api/syllabi without a token", () => {
  test("every method returns 401 before touching the database", async () => {
    const attempts = [
      ["GET", "/api/syllabi"],
      ["POST", "/api/syllabi"],
      ["GET", "/api/syllabi/000000000000000000000000"],
      ["PUT", "/api/syllabi/000000000000000000000000"],
      ["DELETE", "/api/syllabi/000000000000000000000000"]
    ];
    for (const [method, path] of attempts) {
      const res = await fetch(baseUrl + path, { method });
      assert.equal(res.status, 401, `${method} ${path}`);
    }
  });
});

describe("hardening", () => {
  test("security headers are present", async () => {
    const res = await fetch(`${baseUrl}/api/health`);
    assert.ok(res.headers.get("content-security-policy"), "CSP header missing");
    assert.equal(res.headers.get("x-content-type-options"), "nosniff");
    assert.equal(res.headers.get("x-frame-options"), "DENY");
  });

  test("CSP allows the CDNs index.html depends on", async () => {
    const csp = (await fetch(`${baseUrl}/api/health`)).headers.get("content-security-policy");
    assert.match(csp, /script-src[^;]*cdnjs\.cloudflare\.com/);
    assert.match(csp, /style-src[^;]*fonts\.googleapis\.com/);
    assert.match(csp, /font-src[^;]*fonts\.gstatic\.com/);
  });

  test("login is rate limited after 20 attempts", async () => {
    // The limiter is per-IP; 127.0.0.1 in this test process. Any body works
    // because validation runs after the limiter.
    let last;
    for (let i = 0; i < 21; i++) {
      last = await postJson("/api/users/login", {});
    }
    assert.equal(last.status, 429);
    assert.match(last.body.general, /Too many attempts/);
  });
});
