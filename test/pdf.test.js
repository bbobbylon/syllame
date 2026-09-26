/**
 * Unit tests for the PDF renderer. No database or HTTP involved.
 */

const { test, describe } = require("node:test");
const assert = require("node:assert/strict");

const { renderSyllabusPdf, pdfFilename } = require("../services/syllabusPdf");

/** Collects a readable stream into one Buffer. */
function collect(stream) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    stream.on("data", (c) => chunks.push(c));
    stream.on("end", () => resolve(Buffer.concat(chunks)));
    stream.on("error", reject);
  });
}

describe("renderSyllabusPdf", () => {
  test("produces a PDF containing the title", async () => {
    const bytes = await collect(
      renderSyllabusPdf({
        title: "Databases 101",
        courseNumber: "CS 340",
        creditHours: 4,
        gradingScale: "A 90+\nB 80+"
      })
    );
    assert.equal(bytes.subarray(0, 5).toString(), "%PDF-");
    // pdfkit writes document info uncompressed, so the title is findable.
    assert.match(bytes.toString("latin1"), /Databases 101/);
  });

  test("copes with a syllabus that has only a title", async () => {
    const bytes = await collect(renderSyllabusPdf({ title: "Bare" }));
    assert.ok(bytes.length > 500);
  });
});

describe("pdfFilename", () => {
  test("sanitizes titles", () => {
    assert.equal(pdfFilename("Intro to Databases: Fall '26"), "Intro-to-Databases-Fall-26.pdf");
    assert.equal(pdfFilename("   "), "syllabus.pdf");
    assert.equal(pdfFilename(undefined), "syllabus.pdf");
  });
});
