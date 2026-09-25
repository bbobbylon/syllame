/**
 * User routes: register, login, and "who am I".
 *
 * Mounted at `/api/users` by `app.js`, so the full paths are:
 *   POST /api/users/register
 *   POST /api/users/login
 *   GET  /api/users/current   (requires `Authorization: Bearer <token>`)
 *
 * All handlers are `async`. Express 5 forwards a rejected promise from an
 * async handler to the error middleware automatically, which is why there is
 * no try/catch boilerplate here (Express 4 silently dropped those errors).
 */

const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const passport = require("passport");

const env = require("../../config/env");
const validateRegisterInput = require("../../validation/register");
const validateLoginInput = require("../../validation/login");
const User = require("../../models/user");

const router = express.Router();

/** bcrypt cost factor. 10 is the conventional balance of security vs. speed. */
const SALT_ROUNDS = 10;

/** Sent for any failed login. One message, so emails cannot be enumerated. */
const INVALID_CREDENTIALS = { general: "Invalid email or password" };

/** A real bcrypt hash of a random string; used to equalize timing when the email is unknown. */
const DUMMY_HASH = bcrypt.hashSync("not-a-real-password", SALT_ROUNDS);

/**
 * @route  POST /api/users/register
 * @desc   Create a new user account.
 * @access Public
 *
 * Steps:
 *  1. Validate the body. Bad input returns 400 with a field -> message map that
 *     the React forms display next to each input.
 *  2. Reject the email if an account already exists (also 400 so the form can
 *     show it inline).
 *  3. Hash the password with bcrypt. Hashing is one-way: we can later check a
 *     guess against the hash but never recover the original.
 *  4. Save and return the new user. The password hash is stripped by the
 *     model's `toJSON` transform.
 */
router.post("/register", async (req, res) => {
  const { errors, isValid } = validateRegisterInput(req.body);
  if (!isValid) {
    return res.status(400).json(errors);
  }

  const email = String(req.body.email).toLowerCase().trim();
  const existing = await User.findOne({ email });
  if (existing) {
    return res.status(400).json({ email: "Email already exists" });
  }

  const hash = await bcrypt.hash(req.body.password, SALT_ROUNDS);
  const user = await User.create({
    firstname: req.body.firstname,
    lastname: req.body.lastname,
    email,
    password: hash
  });

  return res.status(201).json(user);
});

/**
 * @route  POST /api/users/login
 * @desc   Verify credentials and return a signed JWT.
 * @access Public
 *
 * A JWT is a signed statement ("user 123 logged in, valid until <time>") that
 * the client stores and sends back on every request. The server does not keep
 * session state; it just checks the signature with `env.jwtSecret`.
 *
 * A wrong email and a wrong password both answer 401 with the same generic
 * message. Distinguishing them (as 1.0 did) would let anyone confirm which
 * addresses have accounts just by trying to log in.
 */
router.post("/login", async (req, res) => {
  const { errors, isValid } = validateLoginInput(req.body);
  if (!isValid) {
    return res.status(400).json(errors);
  }

  const email = String(req.body.email).toLowerCase().trim();
  const user = await User.findOne({ email });
  // Compare against a dummy hash when the user is missing so both failure
  // paths take about the same time; otherwise response timing would still
  // reveal whether the email exists.
  const isMatch = await bcrypt.compare(req.body.password, user ? user.password : DUMMY_HASH);
  if (!user || !isMatch) {
    return res.status(401).json(INVALID_CREDENTIALS);
  }

  // Only put non-sensitive, useful-to-the-UI data in the payload: anyone who
  // holds the token can decode (but not alter) it.
  const payload = {
    id: user.id,
    firstname: user.firstname,
    lastname: user.lastname
  };

  const token = jwt.sign(payload, env.jwtSecret, { expiresIn: env.jwtExpiresIn });
  return res.json({ success: true, token: `Bearer ${token}` });
});

/**
 * @route  GET /api/users/current
 * @desc   Return the user that the presented JWT belongs to.
 * @access Private
 *
 * `passport.authenticate("jwt", { session: false })` runs the strategy from
 * `config/passport.js`. On success `req.user` is the Mongoose document; on
 * failure Passport responds 401 before this handler runs.
 */
router.get(
  "/current",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    res.json(req.user);
  }
);

module.exports = router;
