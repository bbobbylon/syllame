/**
 * Fixed top navigation bar.
 *
 * The original wrapped this in its own `<BrowserRouter>`. Nesting routers is
 * an error in React Router 6+ ("You cannot render a <Router> inside another
 * <Router>"), so the wrapper is gone; `<Link>` uses the router from App.jsx.
 */

import { Link } from "react-router-dom";

/**
 * @returns {JSX.Element}
 */
export default function Navbar() {
  return (
    <div className="navbar-fixed">
      <nav className="z-depth-0">
        <div className="nav-wrapper white">
          <Link
            to="/"
            style={{ fontFamily: "monospace" }}
            className="col s5 brand-logo center black-text"
          >
            <i className="material-icons">code</i>
            SyllaMe
          </Link>
        </div>
      </nav>
    </div>
  );
}
