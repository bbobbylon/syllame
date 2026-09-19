/**
 * Verifies the seed script against a real MongoDB: it creates the accounts,
 * they can log in through the API, they see only their own syllabi, and
 * running it twice does not duplicate anything. Skipped without MONGO_URI.
 */

process.env.NODE_ENV = "test";

const { test, describe, before, after } = require("node:test");
const assert = require("node:assert/strict");
const mongoose = require("mongoose");

const createApp = require("../app");
const User = require("../models/user");
const Syllabus = require("../models/syllabus");
const { seed, SEED_USERS, SEED_PASSWORD, SEED_SYLLABI } = require("../scripts/seed");

const MONGO_URI = process.env.MONGO_URI;

describe("seed script", { skip: !MONGO_URI && "MONGO_URI not set" }, () => {
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

  test("creates the expected users and syllabi, idempotently", async () => {
    const first = await seed({ log: () => {} });
    const second = await seed({ log: () => {} });
    assert.deepEqual(first, second);
    assert.equal(await User.countDocuments(), SEED_USERS.length);
    const expectedSyllabi = Object.values(SEED_SYLLABI).reduce((n, list) => n + list.length, 0);
    assert.equal(await Syllabus.countDocuments(), expectedSyllabi);
  });

  test("seed accounts can log in and see only their own syllabi", async () => {
    for (const u of SEED_USERS) {
      const login = await fetch(`${baseUrl}/api/users/login`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: u.email, password: SEED_PASSWORD })
      });
      assert.equal(login.status, 200, `login failed for ${u.email}`);
      const { token } = await login.json();
      const list = await fetch(`${baseUrl}/api/syllabi`, { headers: { authorization: token } });
      const syllabi = await list.json();
      assert.equal(syllabi.length, SEED_SYLLABI[u.email].length, `syllabus count for ${u.email}`);
    }
  });

  test("--wipe removes unrelated documents too", async () => {
    await User.create({ firstname: "Stray", lastname: "User", email: "stray@example.com", password: "x" });
    await seed({ wipe: true, log: () => {} });
    assert.equal(await User.countDocuments({ email: "stray@example.com" }), 0);
    assert.equal(await User.countDocuments(), SEED_USERS.length);
  });
});
