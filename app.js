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
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const env = require("./config/env");
const usersRouter = require("./routes/api/users");
const syllabiRouter = require("./routes/api/syllabi");

/**
 * Creates and configures the Express app.
 *
 * @returns {import("express").Express}
 */
function createApp() {
  const app = express();

  // Hosting platforms (Render, Heroku, ...) sit behind a reverse proxy, so the
  // TCP peer is the proxy, not the visitor. Trusting exactly one hop lets
  // Express read the real client IP from X-Forwarded-For, which the rate
  // limiter below needs. `true` would trust any client-supplied header, which
  // express-rate-limit rightly refuses.
  app.set("trust proxy", 1);

  // Security headers. Helmet sets a dozen defensive headers (no MIME
  // sniffing, no framing by other sites, HSTS, ...). Its Content-Security-
  // Policy defaults to "same origin only", which would block the Materialize
  // CSS/JS and Google Fonts that index.html loads from CDNs, so those hosts
  // are allowed explicitly. `'unsafe-inline'` for styles is needed because
  // React's `style={{...}}` props and Materialize both write inline styles.
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          "default-src": ["'self'"],
          "script-src": ["'self'", "https://cdnjs.cloudflare.com"],
          "style-src": ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com", "https://fonts.googleapis.com"],
          "font-src": ["'self'", "https://fonts.gstatic.com", "https://cdnjs.cloudflare.com"],
          "img-src": ["'self'", "data:"],
          "connect-src": ["'self'"],
          "object-src": ["'none'"],
          "frame-ancestors": ["'none'"]
        }
      },
      // Nothing legitimately frames this app; match the CSP frame-ancestors rule.
      frameguard: { action: "deny" },
      // The app is same-origin; this header would otherwise block the
      // Materialize JS from cdnjs in some browsers.
      crossOriginEmbedderPolicy: false
    })
  );

  // Throttle credential guessing: at most 20 login/register attempts per IP
  // per 15 minutes. Everything else stays unlimited so normal use is unaffected.
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 20,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: { general: "Too many attempts. Please wait 15 minutes and try again." }
  });
  app.use(["/api/users/login", "/api/users/register"], authLimiter);

  // Body parsing. Express 5 ships these built in; the separate `body-parser`
  // package the original code used is no longer needed.
  app.use(express.urlencoded({ extended: false }));
  app.use(express.json());

  // Passport only issues/validates tokens here; it keeps no server session.
  app.use(passport.initialize());
  require("./config/passport")(passport);

  // API routes.
  app.use("/api/users", usersRouter);
  app.use("/api/syllabi", syllabiRouter);

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
