/**
 * Create or edit a syllabus. One component handles both: with an `:id` in the
 * URL it loads the existing document and PUTs; without one it POSTs.
 */

import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import classnames from "classnames";

import { SECTIONS, EMPTY_SYLLABUS, toFormValues } from "./syllabusFields";
import { createSyllabus, getSyllabus, updateSyllabus, describeError } from "../../api/syllabi";

/**
 * Renders one labelled input/select/textarea with its error message.
 *
 * @param {{ field: object, value: string, error?: string, onChange: Function }} props
 */
function Field({ field, value, error, onChange }) {
  const common = {
    id: field.name,
    name: field.name,
    value,
    onChange,
    className: classnames({ invalid: error }),
    "aria-describedby": error ? `${field.name}-error` : undefined,
    "aria-invalid": error ? "true" : undefined
  };
  let control;
  if (field.type === "select") {
    control = (
      <select {...common} className="browser-default">
        {field.options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    );
  } else if (field.type === "textarea") {
    control = (
      <textarea {...common} className={classnames("materialize-textarea", { invalid: error })} rows={3} />
    );
  } else {
    control = <input {...common} type={field.type || "text"} />;
  }
  return (
    <div className="col s12 m6 syllabus-field">
      <label htmlFor={field.name} className="active">
        {field.label}
        {field.required ? " *" : ""}
      </label>
      {control}
      {error && (
        <span id={`${field.name}-error`} className="red-text field-error">
          {error}
        </span>
      )}
    </div>
  );
}

/**
 * @returns {JSX.Element}
 */
export default function SyllabusForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState(EMPTY_SYLLABUS);
  const [fieldErrors, setFieldErrors] = useState({});
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState(isEdit ? "loading" : "idle");

  // Edit mode: fetch the existing syllabus once.
  useEffect(() => {
    if (!isEdit) return;
    let cancelled = false;
    getSyllabus(id)
      .then((doc) => {
        if (cancelled) return;
        setForm(toFormValues(doc));
        setStatus("idle");
      })
      .catch((err) => {
        if (cancelled) return;
        setMessage(describeError(err).message);
        setStatus("error");
      });
    return () => {
      cancelled = true;
    };
  }, [id, isEdit]);

  /** @param {React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>} e */
  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  /** @param {React.FormEvent<HTMLFormElement>} e */
  const onSubmit = async (e) => {
    e.preventDefault();
    setStatus("saving");
    setMessage("");
    setFieldErrors({});
    try {
      const saved = isEdit ? await updateSyllabus(id, form) : await createSyllabus(form);
      navigate(`/syllabi/${saved._id}`, { replace: true });
    } catch (err) {
      const described = describeError(err);
      setFieldErrors(described.fieldErrors);
      setMessage(described.message);
      setStatus("error");
    }
  };

  if (status === "loading") {
    return <p className="container center-align grey-text">Loading syllabus...</p>;
  }

  return (
    <div className="container">
      <h4 className="center-align">
        <b>{isEdit ? "Edit Syllabus" : "Create Syllabus"}</b>
      </h4>
      <p className="flow-text grey-text text-darken-1 center-align">
        {isEdit
          ? "Update the details below."
          : "Fill out the information below to start making your syllabus."}
      </p>

      <form onSubmit={onSubmit} noValidate>
        {SECTIONS.map((section) => (
          <fieldset key={section.title} className="syllabus-section">
            <legend>{section.title}</legend>
            <div className="row">
              {section.fields.map((field) => (
                <Field
                  key={field.name}
                  field={field}
                  value={form[field.name]}
                  error={fieldErrors[field.name]}
                  onChange={onChange}
                />
              ))}
            </div>
          </fieldset>
        ))}

        {message && (
          <p className={status === "error" ? "red-text" : "green-text"} role="status">
            {message}
          </p>
        )}

        <div className="row">
          <div className="col s12 m6">
            <button
              className="btn btn-large waves-effect waves-light hoverable blue accent-3 full-width-btn"
              type="submit"
              disabled={status === "saving"}
            >
              {status === "saving" ? "Saving..." : isEdit ? "Save changes" : "Create syllabus"}
            </button>
          </div>
          <div className="col s12 m6">
            <Link
              to={isEdit ? `/syllabi/${id}` : "/syllabi"}
              className="btn btn-large btn-flat waves-effect full-width-btn"
            >
              Cancel
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
}
