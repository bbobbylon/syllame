/**
 * Central place for runtime configuration.
 *
 * Analogy: think of this file as the "settings screen" of the app. Nothing
 * else in the codebase should reach for `process.env` directly; it asks this
 * module instead. That gives us one spot to validate values and fail fast
 * with a clear message when something is missing.
 *
 * Values come from environment variables. In local development they are read
 * from a `.env` file by the `dotenv` package (see `.env.example`). In cloud
 * hosting (Render, Railway, Fly, Heroku, ...) you set the same variable names
 * in the provider's dashboard and no `.env` file is needed.
 *
 * Why not hard-code them like the original `config/keys.js` did?
 *  - Secrets committed to git are visible to anyone who can read the repo
 *    (and stay in history forever, even after deletion).
 *  - Different environments (your laptop, CI, production) need different
 *    values without changing code.
 */

// `quiet` suppresses dotenv 17's startup banner so logs stay clean.
require("dotenv").config({ quiet: true });

/**
 * Reads a required environment variable and throws if it is absent.
 *
 * @param {string} name - Environment variable name, e.g. "MONGO_URI".
 * @returns {string} The variable's value.
 * @throws {Error} When the variable is not set or is an empty string.
 */
function required(name) {
  const value = process.env[name];
  if (value === undefined || value.trim() === "") {
    throw new Error(
      `Missing required environment variable ${name}. ` +
        `Copy .env.example to .env and fill it in (see README.md).`
    );
  }
  return value;
}

/**
 * Parses an optional integer environment variable with a fallback.
 *
 * @param {string} name - Environment variable name.
 * @param {number} fallback - Value used when the variable is unset or not a number.
 * @returns {number}
 */
function optionalInt(name, fallback) {
  const parsed = Number.parseInt(process.env[name] ?? "", 10);
  return Number.isNaN(parsed) ? fallback : parsed;
}

const nodeEnv = process.env.NODE_ENV || "development";

module.exports = {
  /** "development" | "production" | "test" */
  nodeEnv,
  /** True when NODE_ENV === "production"; controls static serving of the built client. */
  isProduction: nodeEnv === "production",
  /** MongoDB connection string. Required unless running tests. */
  mongoURI: nodeEnv === "test" ? process.env.MONGO_URI || "" : required("MONGO_URI"),
  /** Secret used to sign and verify JWTs. Required. */
  jwtSecret: nodeEnv === "test" ? process.env.JWT_SECRET || "test-secret" : required("JWT_SECRET"),
  /** JWT lifetime in seconds. Defaults to one day. */
  jwtExpiresIn: optionalInt("JWT_EXPIRES_IN", 86400),
  /** TCP port for the HTTP server. Hosting providers inject PORT automatically. */
  port: optionalInt("PORT", 5000)
};
