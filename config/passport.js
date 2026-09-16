/**
 * Passport configuration: teaches Passport how to turn a JWT in the
 * `Authorization: Bearer <token>` header into a logged-in user.
 *
 * Analogy: Passport is a doorman, and a *strategy* is the specific ID check
 * the doorman performs. Here the ID is a JSON Web Token that our own login
 * route issued earlier.
 */

const { Strategy: JwtStrategy, ExtractJwt } = require("passport-jwt");
const User = require("../models/user");
const env = require("./env");

/**
 * Registers the JWT strategy on the given Passport instance.
 *
 * Flow for every protected request:
 *  1. `ExtractJwt.fromAuthHeaderAsBearerToken()` pulls the token out of the
 *     `Authorization` header.
 *  2. passport-jwt verifies the signature using `env.jwtSecret` and checks
 *     the `exp` claim. If either fails the request gets a 401 automatically.
 *  3. Our callback receives the decoded payload and loads the matching user
 *     so route handlers can read `req.user`.
 *
 * @param {import("passport").PassportStatic} passport - The Passport singleton.
 * @returns {void}
 */
module.exports = (passport) => {
  const options = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: env.jwtSecret
  };

  passport.use(
    new JwtStrategy(options, async (jwtPayload, done) => {
      try {
        const user = await User.findById(jwtPayload.id);
        // `false` (not an error) means "token was valid but user no longer exists".
        return done(null, user || false);
      } catch (err) {
        return done(err, false);
      }
    })
  );
};
