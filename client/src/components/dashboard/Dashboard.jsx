/**
 * Landing page for logged-in users.
 */

import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import { logoutUser } from "../../actions/authActions";

const bigButton = { width: "250px", borderRadius: "3px", letterSpacing: "1.5px", marginTop: "1rem" };

/**
 * @returns {JSX.Element}
 */
export default function Dashboard() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);

  // Guard against a token without a firstname instead of crashing on `.split`.
  const firstName = (user.firstname || "").split(" ")[0];

  return (
    <div style={{ height: "75vh" }} className="container valign-wrapper">
      <div className="row">
        <div className="col s12 center-align">
          <h4>
            <b>Hey there,</b> {firstName}
          </h4>
          <p className="flow-text grey-text text-darken-1">
            Welcome to SyllaMe! Start building your syllabi or view your documents below.
          </p>
          <Link
            to="/createSyllabus"
            style={bigButton}
            className="btn btn-large waves-effect waves-light hoverable blue accent-3"
          >
            Create Syllabus
          </Link>
          <Link
            to="/viewSyllabus"
            style={{ ...bigButton, marginLeft: "2rem" }}
            className="btn btn-large waves-effect waves-light hoverable blue accent-3"
          >
            View Syllabi
          </Link>
          <button
            style={{ ...bigButton, width: "150px", marginLeft: "2rem" }}
            onClick={() => dispatch(logoutUser())}
            className="btn btn-large waves-effect waves-light hoverable blue accent-3"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
