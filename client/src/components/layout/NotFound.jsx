/**
 * Shown for any URL that matches no route.
 */

import { Link } from "react-router-dom";
import { useSelector } from "react-redux";

/**
 * @returns {JSX.Element}
 */
export default function NotFound() {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  return (
    <div className="container center-align" style={{ marginTop: "4rem" }}>
      <h4>Page not found</h4>
      <p className="grey-text text-darken-1">That link does not go anywhere.</p>
      <Link to={isAuthenticated ? "/dashboard" : "/"} className="btn waves-effect waves-light blue accent-3">
        {isAuthenticated ? "Back to dashboard" : "Back to home"}
      </Link>
    </div>
  );
}
