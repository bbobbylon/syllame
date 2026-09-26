/**
 * Read-only, print-friendly view of one syllabus.
 *
 * Two export paths: "Download PDF" asks the server for a pdfkit-rendered
 * file (consistent layout on every device), and "Print" opens the browser's
 * print dialog, where `index.css`'s `@media print` block hides the navbar
 * and buttons.
 */

import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { SECTIONS } from "./syllabusFields";
import { getSyllabus, downloadSyllabusPdf, describeError } from "../../api/syllabi";

/**
 * @returns {JSX.Element}
 */
export default function SyllabusDetail() {
  const { id } = useParams();
  const [syllabus, setSyllabus] = useState(null);
  const [message, setMessage] = useState("");
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState("");

  const onDownload = async () => {
    setDownloading(true);
    setDownloadError("");
    try {
      await downloadSyllabusPdf(id);
    } catch (err) {
      setDownloadError(describeError(err).message);
    } finally {
      setDownloading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    getSyllabus(id)
      .then((doc) => {
        if (!cancelled) setSyllabus(doc);
      })
      .catch((err) => {
        if (!cancelled) setMessage(describeError(err).message);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (message) {
    return (
      <div className="container">
        <p className="red-text" role="alert">
          {message}
        </p>
        <Link to="/syllabi">Back to my syllabi</Link>
      </div>
    );
  }
  if (!syllabus) {
    return <p className="container grey-text">Loading...</p>;
  }

  return (
    <div className="container syllabus-detail">
      <div className="row no-print">
        <div className="col s12">
          <Link to="/syllabi" className="btn-flat waves-effect">
            <i className="material-icons left">keyboard_backspace</i>My syllabi
          </Link>
          <span className="detail-actions">
            <Link to={`/syllabi/${id}/edit`} className="btn waves-effect waves-light blue accent-3">
              <i className="material-icons left">edit</i>Edit
            </Link>
            <button
              type="button"
              className="btn waves-effect waves-light grey darken-1"
              onClick={onDownload}
              disabled={downloading}
            >
              <i className="material-icons left">download</i>
              {downloading ? "Preparing..." : "Download PDF"}
            </button>
            <button type="button" className="btn-flat waves-effect" onClick={() => window.print()}>
              <i className="material-icons left">print</i>Print
            </button>
          </span>
        </div>
        {downloadError && (
          <div className="col s12">
            <p className="red-text" role="alert">
              {downloadError}
            </p>
          </div>
        )}
      </div>

      <header className="syllabus-header">
        <h3>{syllabus.title}</h3>
        <p className="grey-text text-darken-2">
          {[syllabus.courseNumber, syllabus.creditHours ? `${syllabus.creditHours} credit hours` : null]
            .filter(Boolean)
            .join(" · ")}
        </p>
      </header>

      {SECTIONS.map((section) => {
        // Skip fields that are empty and the whole section if nothing is filled in.
        const rows = section.fields.filter(
          (f) => f.name !== "title" && String(syllabus[f.name] ?? "").trim() !== ""
        );
        if (rows.length === 0) return null;
        return (
          <section key={section.title} className="syllabus-print-section">
            <h5>{section.title}</h5>
            <dl>
              {rows.map((f) => (
                <div key={f.name} className="dl-row">
                  <dt>{f.label}</dt>
                  <dd className="preserve-lines">{String(syllabus[f.name])}</dd>
                </div>
              ))}
            </dl>
          </section>
        );
      })}
    </div>
  );
}
