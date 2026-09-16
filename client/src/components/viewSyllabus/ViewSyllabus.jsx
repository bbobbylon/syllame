/**
 * Placeholder page for browsing saved syllabi. The server does not yet store
 * syllabi (see IMPROVEMENTS.md), so this page only offers navigation.
 */

import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";

import { logoutUser } from "../../actions/authActions";

const buttonStyle = { width: "150px", borderRadius: "3px", letterSpacing: "1.5px", marginTop: "2rem" };

/**
 * @returns {JSX.Element}
 */
export default function ViewSyllabus() {
  const dispatch = useDispatch();

  return (
    <div className="container">
      <h4 style={{ textAlign: "center" }}>
        <b>View Syllabi</b>
      </h4>
      <p className="flow-text grey-text text-darken-1" style={{ textAlign: "center" }}>
        Start browsing and editing the syllabi you made below!
      </p>
      <Link
        to="/dashboard"
        style={{ ...buttonStyle, float: "right" }}
        className="btn btn-large waves-effect waves-light hoverable blue accent-3"
      >
        Home
      </Link>
      <button
        style={{ ...buttonStyle, marginTop: "1rem", marginLeft: "2rem" }}
        onClick={() => dispatch(logoutUser())}
        className="btn btn-large waves-effect waves-light hoverable blue accent-3"
      >
        Logout
      </button>
    </div>
  );
}
