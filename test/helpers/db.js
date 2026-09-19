/**
 * Helpers for database-backed tests.
 *
 * Node's test runner executes each test file in its own process, in
 * parallel. Two files sharing one database and both calling dropDatabase()
 * would wipe each other's data mid-run, so every file gets its own database
 * name derived from MONGO_URI plus a suffix.
 */

/**
 * Returns MONGO_URI with the database name suffixed, e.g.
 * `mongodb://127.0.0.1:27017/syllame_ci` + "seed" ->
 * `mongodb://127.0.0.1:27017/syllame_ci_seed`.
 *
 * @param {string} suffix - Identifies the test file, e.g. "api" or "seed".
 * @returns {string | undefined} The per-file URI, or undefined when MONGO_URI is unset.
 */
function testDatabaseUri(suffix) {
  const base = process.env.MONGO_URI;
  if (!base) return undefined;
  const url = new URL(base);
  const current = url.pathname.replace(/^\//, "") || "syllame_test";
  url.pathname = `/${current}_${suffix}`;
  return url.toString();
}

module.exports = { testDatabaseUri };
