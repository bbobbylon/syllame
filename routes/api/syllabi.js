/**
 * Syllabus routes. Every route requires a valid JWT and only ever touches
 * documents owned by the requesting user.
 *
 * Mounted at `/api/syllabi`:
 *   GET    /api/syllabi        list my syllabi (newest first)
 *   POST   /api/syllabi        create
 *   GET    /api/syllabi/:id    read one of mine
 *   GET    /api/syllabi/:id/pdf download one of mine as a PDF
 *   PUT    /api/syllabi/:id    update one of mine
 *   DELETE /api/syllabi/:id    delete one of mine
 *
 * A syllabus that exists but belongs to someone else returns 404, not 403.
 * Saying "forbidden" would confirm the id is real; "not found" reveals nothing.
 */

const express = require("express");
const mongoose = require("mongoose");
const passport = require("passport");

const Syllabus = require("../../models/syllabus");
const validateSyllabusInput = require("../../validation/syllabus");
const { renderSyllabusPdf, pdfFilename } = require("../../services/syllabusPdf");

const router = express.Router();

/** Applies to every route below: rejects with 401 unless the JWT is valid. */
router.use(passport.authenticate("jwt", { session: false }));

/**
 * Rejects ids that are not well-formed ObjectIds before touching the
 * database. Without this, Mongoose throws a CastError for input like
 * `/api/syllabi/abc`, which would surface as a confusing 500.
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 */
function requireValidId(req, res, next) {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(404).json({ error: "Syllabus not found" });
  }
  next();
}

/**
 * @route GET /api/syllabi
 * @desc  List the current user's syllabi, most recently updated first.
 */
router.get("/", async (req, res) => {
  const syllabi = await Syllabus.find({ owner: req.user.id }).sort({ updatedAt: -1 });
  res.json(syllabi);
});

/**
 * @route POST /api/syllabi
 * @desc  Create a syllabus owned by the current user.
 */
router.post("/", async (req, res) => {
  const { errors, isValid, value } = validateSyllabusInput(req.body);
  if (!isValid) {
    return res.status(400).json(errors);
  }
  const syllabus = await Syllabus.create({ ...value, owner: req.user.id });
  res.status(201).json(syllabus);
});

/**
 * @route GET /api/syllabi/:id
 */
router.get("/:id", requireValidId, async (req, res) => {
  const syllabus = await Syllabus.findOne({ _id: req.params.id, owner: req.user.id });
  if (!syllabus) {
    return res.status(404).json({ error: "Syllabus not found" });
  }
  res.json(syllabus);
});

/**
 * @route GET /api/syllabi/:id/pdf
 * @desc  Stream one of my syllabi as a PDF download.
 *
 * The client fetches this with its Authorization header (a plain link would
 * not carry the token), receives a blob, and triggers the download itself.
 */
router.get("/:id/pdf", requireValidId, async (req, res) => {
  const syllabus = await Syllabus.findOne({ _id: req.params.id, owner: req.user.id });
  if (!syllabus) {
    return res.status(404).json({ error: "Syllabus not found" });
  }
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="${pdfFilename(syllabus.title)}"`);
  renderSyllabusPdf(syllabus.toObject()).pipe(res);
});

/**
 * @route PUT /api/syllabi/:id
 * @desc  Replace the editable fields of one of my syllabi.
 */
router.put("/:id", requireValidId, async (req, res) => {
  const { errors, isValid, value } = validateSyllabusInput(req.body);
  if (!isValid) {
    return res.status(400).json(errors);
  }
  // `new: true` returns the updated document instead of the pre-update one.
  const syllabus = await Syllabus.findOneAndUpdate(
    { _id: req.params.id, owner: req.user.id },
    { $set: value },
    { new: true, runValidators: true }
  );
  if (!syllabus) {
    return res.status(404).json({ error: "Syllabus not found" });
  }
  res.json(syllabus);
});

/**
 * @route DELETE /api/syllabi/:id
 */
router.delete("/:id", requireValidId, async (req, res) => {
  const result = await Syllabus.deleteOne({ _id: req.params.id, owner: req.user.id });
  if (result.deletedCount === 0) {
    return res.status(404).json({ error: "Syllabus not found" });
  }
  res.status(204).end();
});

module.exports = router;
