/**
 * Public home page with links to register or log in.
 */

import { Link } from "react-router-dom";

const buttonStyle = { width: "140px", borderRadius: "3px", letterSpacing: "1.5px" };

/**
 * @returns {JSX.Element}
 */
export default function Landing() {
  return (
    <div style={{ height: "75vh" }} className="container valign-wrapper">
      <div className="row">
        <div className="col s12 center-align">
          <h4>Login or register to start creating your Syllabi</h4>
          <p className="flow-text grey-text text-darken-1">
            Effortlessly build your own syllabi by inputting the proper course information.
          </p>
          <br />
          <div className="col s6">
            <Link
              to="/register"
              style={buttonStyle}
              className="btn btn-large waves-effect waves-light hoverable blue accent-3"
            >
              Register
            </Link>
          </div>
          <div className="col s6">
            <Link
              to="/login"
              style={buttonStyle}
              className="btn btn-large btn-flat waves-effect white black-text"
            >
              Log In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
