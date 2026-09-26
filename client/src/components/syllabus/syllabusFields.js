/**
 * Single source of truth for the syllabus form: which fields exist, how they
 * are labelled, and which input type renders them. The form, the detail page
 * and the empty-state object are all generated from this list, so adding a
 * field is a one-line change here (plus the server model).
 */

/** Sections group related fields on both the form and the printed view. */
export const SECTIONS = [
  {
    title: "Course",
    fields: [
      { name: "title", label: "Course Title", required: true },
      { name: "courseNumber", label: "Course Number" },
      { name: "creditHours", label: "Credit Hours", type: "select", options: [1, 2, 3, 4, 5] },
      { name: "courseDescription", label: "Course Description", type: "textarea" }
    ]
  },
  {
    title: "Instructor",
    fields: [
      { name: "instructorName", label: "Instructor Name" },
      { name: "emailAddress", label: "Email Address", type: "email" },
      { name: "phoneNumber", label: "Phone Number", type: "tel" },
      { name: "officeNumber", label: "Office Number" },
      { name: "officeHours", label: "Office Hours" }
    ]
  },
  {
    title: "Schedule",
    fields: [
      { name: "meetingTimes", label: "Meeting Times" },
      { name: "meetingLocation", label: "Meeting Location" },
      { name: "courseSchedule", label: "Course Schedule", type: "textarea" }
    ]
  },
  {
    title: "Materials and Grading",
    fields: [
      { name: "courseMaterials", label: "Course Materials", type: "textarea" },
      { name: "gradingScale", label: "Grading Scale", type: "textarea" },
      { name: "extraInfo", label: "Extra Information", type: "textarea" }
    ]
  }
];

/** Flat list, in display order. */
export const FIELDS = SECTIONS.flatMap((s) => s.fields);

/** A blank form: every text field "" and creditHours "3". */
export const EMPTY_SYLLABUS = Object.fromEntries(FIELDS.map((f) => [f.name, f.type === "select" ? "3" : ""]));

/**
 * Picks the form fields out of a server document, as strings, so a fetched
 * syllabus can populate the form directly.
 *
 * @param {object} doc - Syllabus from the API.
 * @returns {object}
 */
export function toFormValues(doc) {
  return Object.fromEntries(
    FIELDS.map((f) => [f.name, doc[f.name] === undefined || doc[f.name] === null ? "" : String(doc[f.name])])
  );
}
