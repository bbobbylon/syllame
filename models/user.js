/**
 * Mongoose model for a registered user.
 *
 * Analogy: a Mongoose *schema* is the blueprint (which fields exist and their
 * types), and a *model* is the factory built from that blueprint that knows
 * how to read and write documents in one MongoDB collection.
 */

const mongoose = require("mongoose");

/**
 * Shape of a user document in the `users` collection.
 *
 * `email` is stored lower-cased and trimmed so "Bob@Example.com" and
 * "bob@example.com" are the same account, and it carries a unique index so
 * MongoDB itself rejects duplicates even if two registrations race each other.
 */
const userSchema = new mongoose.Schema(
  {
    firstname: { type: String, required: true, trim: true },
    lastname: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    /** bcrypt hash of the password. The plain-text password is never stored. */
    password: { type: String, required: true },
    date: { type: Date, default: Date.now }
  },
  {
    /**
     * `toJSON` runs whenever a document is serialized with `res.json(user)`.
     * Removing the hash here guarantees no route can accidentally leak it,
     * which the original register route did.
     */
    toJSON: {
      transform(_doc, ret) {
        delete ret.password;
        delete ret.__v;
        return ret;
      }
    }
  }
);

/**
 * The "users" model. The third argument pins the collection name so Mongoose
 * does not pluralize it into something unexpected.
 *
 * @type {import("mongoose").Model<any>}
 */
const User = mongoose.model("users", userSchema, "users");

module.exports = User;
