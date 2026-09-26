/**
 * "My Syllabi": lists the current user's syllabi with view / edit / delete.
 */

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { listSyllabi, deleteSyllabus, describeError } from "../../api/syllabi";

/**
 * @param {string | Date} value
 * @returns {string} e.g. "Sep 18, 2026"
 */
function formatDate(value) {
  return new Date(value).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

/**
 * @returns {JSX.Element}
 */
export default function SyllabusList() {
  const [syllabi, setSyllabi] = useState([]);
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let cancelled = false;
    listSyllabi()
      .then((items) => {
        if (cancelled) return;
        setSyllabi(items);
        setStatus("ready");
      })
      .catch((err) => {
        if (cancelled) return;
        setMessage(describeError(err).message);
        setStatus("error");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  /** @param {object} syllabus */
  const onDelete = async (syllabus) => {
    if (!window.confirm(`Delete "${syllabus.title}"? This cannot be undone.`)) return;
    try {
      await deleteSyllabus(syllabus._id);
      setSyllabi((current) => current.filter((s) => s._id !== syllabus._id));
    } catch (err) {
      setMessage(describeError(err).message);
    }
  };

  return (
    <div className="container">
      <div className="row valign-wrapper page-header">
        <div className="col s12 m8">
          <h4>
            <b>My Syllabi</b>
          </h4>
        </div>
        <div className="col s12 m4 right-align-m">
          <Link to="/syllabi/new" className="btn waves-effect waves-light blue accent-3">
            <i className="material-icons left">add</i>New syllabus
          </Link>
        </div>
      </div>

      {message && (
        <p className="red-text" role="alert">
          {message}
        </p>
      )}

      {status === "loading" && <p className="grey-text">Loading...</p>}

      {status === "ready" && syllabi.length === 0 && (
        <div className="card-panel grey lighten-4 center-align">
          <p className="flow-text">You have not created any syllabi yet.</p>
          <Link to="/syllabi/new" className="btn waves-effect waves-light blue accent-3">
            Create your first one
          </Link>
        </div>
      )}

      {syllabi.length > 0 && (
        <ul className="collection">
          {syllabi.map((s) => (
            <li key={s._id} className="collection-item syllabus-row">
              <div>
                <Link to={`/syllabi/${s._id}`} className="syllabus-title">
                  {s.title}
                </Link>
                <div className="grey-text text-darken-1 small-text">
                  {[s.courseNumber, s.instructorName].filter(Boolean).join(" · ") || "No details yet"}
                  {" · updated "}
                  {formatDate(s.updatedAt)}
                </div>
              </div>
              <div className="syllabus-actions">
                <Link
                  to={`/syllabi/${s._id}/edit`}
                  className="btn-flat waves-effect"
                  aria-label={`Edit ${s.title}`}
                >
                  <i className="material-icons">edit</i>
                </Link>
                <button
                  type="button"
                  className="btn-flat waves-effect red-text"
                  onClick={() => onDelete(s)}
                  aria-label={`Delete ${s.title}`}
                >
                  <i className="material-icons">delete</i>
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
