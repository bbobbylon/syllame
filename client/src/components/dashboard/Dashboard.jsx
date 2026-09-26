/**
 * Landing page for logged-in users: greeting, quick actions, and the most
 * recently updated syllabi.
 */

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";

import { listSyllabi } from "../../api/syllabi";

/**
 * @returns {JSX.Element}
 */
export default function Dashboard() {
  const user = useSelector((state) => state.auth.user);
  const [recent, setRecent] = useState(null);

  // Guard against a token without a firstname instead of crashing on `.split`.
  const firstName = (user.firstname || "").split(" ")[0];

  useEffect(() => {
    let cancelled = false;
    listSyllabi()
      .then((items) => {
        if (!cancelled) setRecent(items.slice(0, 3));
      })
      .catch(() => {
        if (!cancelled) setRecent([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="container">
      <div className="center-align" style={{ marginTop: "3rem" }}>
        <h4>
          <b>Hey there,</b> {firstName}
        </h4>
        <p className="flow-text grey-text text-darken-1">
          Welcome to SyllaMe! Start building your syllabi or view your documents below.
        </p>
      </div>

      <div className="row">
        <div className="col s12 m6">
          <Link
            to="/syllabi/new"
            className="btn btn-large waves-effect waves-light hoverable blue accent-3 full-width-btn"
          >
            <i className="material-icons left">add</i>Create Syllabus
          </Link>
        </div>
        <div className="col s12 m6">
          <Link
            to="/syllabi"
            className="btn btn-large waves-effect waves-light hoverable blue accent-3 full-width-btn"
          >
            <i className="material-icons left">list</i>View Syllabi
          </Link>
        </div>
      </div>

      {recent && recent.length > 0 && (
        <div>
          <h5>Recently updated</h5>
          <ul className="collection">
            {recent.map((s) => (
              <li key={s._id} className="collection-item">
                <Link to={`/syllabi/${s._id}`}>{s.title}</Link>
                {s.courseNumber && <span className="grey-text"> · {s.courseNumber}</span>}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
