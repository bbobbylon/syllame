/**
 * Syllabus creation form.
 *
 * Behavior preserved from the original: collect the fields and POST them to
 * the templates endpoint. Bugs fixed along the way:
 *  - The form had no `onSubmit`, so pressing Submit reloaded the page and
 *    nothing was ever sent. (`onSubmit` on an `<input>` does nothing.)
 *  - The payload read `this.state.courseCreditHours`, which never existed
 *    (the state key is `creditHours`), and spelled `meetimgTimes`.
 *  - `courseSchedule` was collected but never sent.
 *  - The request went to a hard-coded `http://localhost:5000/...`, which
 *    breaks in production; it is now a relative `/api/...` URL.
 *  - `ref="creditHours"` was a string ref, which React 19 removed entirely.
 *  - 15 separate `onChangeX` handlers collapsed into one keyed by `name`.
 *
 * Note: the server has no `/api/templates` route yet, so submitting shows an
 * error until that is built. See IMPROVEMENTS.md.
 */

import { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

/** Field definitions drive both the state shape and the rendered inputs. */
const FIELDS = [
  { name: "title", label: "Class Title" },
  { name: "instructorName", label: "Instructor's Name" },
  { name: "courseNumber", label: "Course Number" },
  { name: "creditHours", label: "Course Credit Hours", type: "select", options: [1, 2, 3, 4, 5] },
  { name: "officeNumber", label: "Office Number" },
  { name: "officeHours", label: "Office Hours" },
  { name: "phoneNumber", label: "Phone Number", type: "tel" },
  { name: "emailAddress", label: "Email Address", type: "email" },
  { name: "courseDescription", label: "Course Description", type: "textarea" },
  { name: "meetingTimes", label: "Course Meeting Times" },
  { name: "meetingLocation", label: "Course Meeting Location" },
  { name: "courseMaterials", label: "Course Materials", type: "textarea" },
  { name: "courseSchedule", label: "Course Schedule", type: "textarea" },
  { name: "gradingScale", label: "Grading Scale", type: "textarea" },
  { name: "extraInfo", label: "Extra Information", type: "textarea" }
];

const emptyForm = Object.fromEntries(
  FIELDS.map((f) => [f.name, f.type === "select" ? String(f.options[0]) : ""])
);

const buttonStyle = { width: "150px", borderRadius: "3px", letterSpacing: "1.5px", marginTop: "2rem" };

/**
 * @returns {JSX.Element}
 */
export default function CreateSyllabus() {
  const [form, setForm] = useState(emptyForm);
  const [status, setStatus] = useState({ state: "idle", message: "" });

  /** @param {React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>} e */
  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  /** @param {React.FormEvent<HTMLFormElement>} e */
  const onSubmit = async (e) => {
    e.preventDefault();
    setStatus({ state: "saving", message: "" });
    try {
      await axios.post("/api/templates/add", form);
      setStatus({ state: "success", message: "Syllabus saved." });
      setForm(emptyForm);
    } catch (err) {
      const message =
        err?.response?.status === 404
          ? "Saving is not available yet: the server has no syllabus endpoint."
          : err?.response?.data?.error || "Could not save the syllabus.";
      setStatus({ state: "error", message });
    }
  };

  return (
    <div className="container">
      <h4 style={{ textAlign: "center" }}>
        <b>Create Syllabus</b>
      </h4>
      <p className="flow-text grey-text text-darken-1" style={{ textAlign: "center" }}>
        Fill out the information below to start making your syllabus!
      </p>

      <form onSubmit={onSubmit}>
        {FIELDS.map((field) => (
          <div key={field.name} style={{ marginBottom: "1rem" }}>
            <label htmlFor={field.name}>{field.label}:</label>
            {field.type === "select" ? (
              <select
                id={field.name}
                name={field.name}
                className="browser-default"
                value={form[field.name]}
                onChange={onChange}
              >
                {field.options.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            ) : field.type === "textarea" ? (
              <textarea
                id={field.name}
                name={field.name}
                className="materialize-textarea"
                value={form[field.name]}
                onChange={onChange}
              />
            ) : (
              <input
                id={field.name}
                name={field.name}
                type={field.type || "text"}
                value={form[field.name]}
                onChange={onChange}
              />
            )}
          </div>
        ))}

        {status.message && (
          <p className={status.state === "error" ? "red-text" : "green-text"} role="status">
            {status.message}
          </p>
        )}

        <button
          style={{ ...buttonStyle, float: "left" }}
          className="btn btn-large waves-effect waves-light hoverable blue accent-3"
          type="submit"
          disabled={status.state === "saving"}
        >
          {status.state === "saving" ? "Saving..." : "Submit"}
        </button>
      </form>

      <Link
        to="/dashboard"
        style={{ ...buttonStyle, float: "right" }}
        className="btn btn-large waves-effect waves-light hoverable blue accent-3"
      >
        Home
      </Link>
    </div>
  );
}
