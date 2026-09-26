/**
 * Password reset flow against a real MongoDB. Skipped without MONGO_URI.
 */

process.env.NODE_ENV = "test";

const { test, describe, before, after } = require("node:test");
const assert = require("node:assert/strict");
const mongoose = require("mongoose");

const createApp = require("../app");
const { outbox } = require("../config/mailer");
const { testDatabaseUri } = require("./helpers/db");

const MONGO_URI = testDatabaseUri("reset");

describe("password reset", { skip: !MONGO_URI && "MONGO_URI not set" }, () => {
  let server;
  let baseUrl;

  before(async () => {
    await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 10000 });
    await mongoose.connection.dropDatabase();
    server = createApp().listen(0);
    await new Promise((resolve) => server.once("listening", resolve));
    baseUrl = `http://127.0.0.1:${server.address().port}`;
  });

  after(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
    await new Promise((resolve) => server.close(resolve));
  });

  async function post(path, body) {
    const res = await fetch(baseUrl + path, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body)
    });
    return { status: res.status, body: await res.json() };
  }

  const email = "carol@example.com";
  let token;

  test("register a user to reset", async () => {
    const reg = await post("/api/users/register", {
      firstname: "Carol",
      lastname: "Reset",
      email,
      password: "oldpass1",
      password2: "oldpass1"
    });
    assert.equal(reg.status, 201);
  });

  test("unknown and known emails get the same reply; only the known one gets mail", async () => {
    outbox.length = 0;
    const unknown = await post("/api/users/forgot-password", { email: "nobody@example.com" });
    assert.equal(unknown.status, 200);
    assert.equal(outbox.length, 0);

    const known = await post("/api/users/forgot-password", { email: "CAROL@example.com" });
    assert.equal(known.status, 200);
    assert.deepEqual(known.body, unknown.body);
    assert.equal(outbox.length, 1);
    assert.equal(outbox[0].to, email);
    const match = outbox[0].text.match(/\/reset-password\/([a-f0-9]{64})/);
    assert.ok(match, "reset link missing from email");
    token = match[1];
  });

  test("bad token and mismatched passwords are rejected", async () => {
    const bad = await post("/api/users/reset-password", {
      token: "f".repeat(64),
      password: "newpass1",
      password2: "newpass1"
    });
    assert.equal(bad.status, 400);
    assert.match(bad.body.token, /invalid or has expired/);

    const mismatch = await post("/api/users/reset-password", {
      token,
      password: "newpass1",
      password2: "other"
    });
    assert.equal(mismatch.status, 400);
    assert.equal(mismatch.body.password2, "Passwords must match");
  });

  test("a valid token sets the new password once", async () => {
    const ok = await post("/api/users/reset-password", {
      token,
      password: "newpass1",
      password2: "newpass1"
    });
    assert.equal(ok.status, 200);

    assert.equal((await post("/api/users/login", { email, password: "oldpass1" })).status, 401);
    assert.equal((await post("/api/users/login", { email, password: "newpass1" })).status, 200);

    const reuse = await post("/api/users/reset-password", {
      token,
      password: "again123",
      password2: "again123"
    });
    assert.equal(reuse.status, 400);
  });

  test("the user document never exposes reset fields", async () => {
    const login = await post("/api/users/login", { email, password: "newpass1" });
    const res = await fetch(`${baseUrl}/api/users/current`, { headers: { authorization: login.body.token } });
    const user = await res.json();
    assert.equal("resetPasswordTokenHash" in user, false);
    assert.equal("resetPasswordExpires" in user, false);
  });
});
