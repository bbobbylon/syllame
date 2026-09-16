/**
 * Builds the Express application without starting it or touching the database.
 *
 * Splitting "build the app" (this file) from "connect to Mongo and listen"
 * (`server.js`) lets tests import the app and exercise routes on a random
 * port without a real MongoDB, and lets hosting platforms or serverless
 * wrappers import it too.
 */

const path = require("node:path");
const express = require("express");
const passport = require("passport");

const env = require("./config/env");
const usersRouter = require("./routes/api/users");

/**
 * Creates and configures the Express app.
 *
 * @returns {import("express").Express}
 */
function createApp() {
  const app = express();

  // Body parsing. Express 5 ships these built in; the separate `body-parser`
  // package the original code used is no longer needed.
  app.use(express.urlencoded({ extended: false }));
  app.use(express.json());

  // Passport only issues/validates tokens here; it keeps no server session.
  app.use(passport.initialize());
  require("./config/passport")(passport);

  // API routes.
  app.use("/api/users", usersRouter);

  /** Lightweight health check for uptime monitors and hosting platforms. */
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", uptime: process.uptime() });
  });

  // In production, Express also serves the compiled React app so the whole
  // site runs from one process on one port.
  if (env.isProduction) {
    const clientDist = path.join(__dirname, "client", "dist");
    app.use(express.static(clientDist));

    // Express 5 uses path-to-regexp v8, where the old `'*'` wildcard is a
    // syntax error. `/{*splat}` means "zero or more path segments" and sends
    // every non-API URL to index.html so React Router can handle it.
    app.get("/{*splat}", (_req, res) => {
      res.sendFile(path.join(clientDist, "index.html"));
    });
  }

  /**
   * Final error handler. Express recognizes it by the 4-argument signature.
   * Async handlers that throw end up here (Express 5 behavior).
   */
  // eslint-disable-next-line no-unused-vars
  app.use((err, _req, res, _next) => {
    // Mongo duplicate-key error (e.g. two registrations racing on one email).
    if (err && err.code === 11000) {
      return res.status(400).json({ email: "Email already exists" });
    }
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  });

  return app;
}

module.exports = createApp;
