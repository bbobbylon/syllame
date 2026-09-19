/**
 * Mongoose model for a syllabus.
 *
 * Every syllabus belongs to exactly one user (`owner`). All queries in
 * `routes/api/syllabi.js` filter by owner, so users can never see or modify
 * each other's documents.
 *
 * Analogy: `owner` is the name written on a folder in a shared filing cabinet.
 * The routes are the clerk who only hands you folders with your name on them.
 */

const mongoose = require("mongoose");

/**
 * Free-text fields on a syllabus. Exported so the validator and the routes
 * agree on exactly which keys are accepted; anything else in a request body
 * is ignored rather than stored.
 */
const TEXT_FIELDS = [
  "title",
  "instructorName",
  "courseNumber",
  "officeNumber",
  "officeHours",
  "phoneNumber",
  "emailAddress",
  "courseDescription",
  "meetingTimes",
  "meetingLocation",
  "courseMaterials",
  "courseSchedule",
  "gradingScale",
  "extraInfo"
];

const fieldDefinitions = Object.fromEntries(
  TEXT_FIELDS.map((name) => [name, { type: String, trim: true, default: "" }])
);

const syllabusSchema = new mongoose.Schema(
  {
    /** The user who created the syllabus. Indexed because every list query filters on it. */
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
      index: true
    },
    ...fieldDefinitions,
    /** Overridden to be required: a syllabus without a title is unusable in lists. */
    title: { type: String, required: true, trim: true },
    creditHours: { type: Number, min: 1, max: 5, default: 3 }
  },
  {
    /** Adds `createdAt` and `updatedAt`, maintained automatically by Mongoose. */
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        delete ret.__v;
        return ret;
      }
    }
  }
);

const Syllabus = mongoose.model("syllabi", syllabusSchema, "syllabi");

module.exports = Syllabus;
module.exports.TEXT_FIELDS = TEXT_FIELDS;
