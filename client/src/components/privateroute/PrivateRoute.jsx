/**
 * Route guard. In React Router 7 a guard is a layout element: it renders
 * `<Outlet />` (the matched child route) when allowed, or redirects.
 */

import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

/**
 * @returns {JSX.Element} The child route when logged in, otherwise a redirect to /login.
 */
export default function PrivateRoute() {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}
