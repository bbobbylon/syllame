/**
 * Top navigation. Shows different links depending on whether the user is
 * logged in, and collapses into a hamburger menu on small screens.
 *
 * Layout is owned by `.app-nav*` rules in index.css rather than Materialize's
 * navbar styles, which changed shape between 1.0 and 2.x. Materialize still
 * provides the colors, shadow and ripple. The mobile toggle is plain React
 * state, so it works without any framework JavaScript and is easy to test.
 */

import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import classnames from "classnames";

import { logoutUser } from "../../actions/authActions";

/**
 * @returns {JSX.Element}
 */
export default function Navbar() {
  const [open, setOpen] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  const close = () => setOpen(false);

  const onLogout = () => {
    close();
    dispatch(logoutUser());
    navigate("/login");
  };

  const links = isAuthenticated
    ? [
        { to: "/dashboard", label: "Dashboard" },
        { to: "/syllabi", label: "My Syllabi" },
        { to: "/syllabi/new", label: "New Syllabus" }
      ]
    : [
        { to: "/login", label: "Log in" },
        { to: "/register", label: "Register" }
      ];

  return (
    <header className="app-nav navbar-fixed no-print white z-depth-1">
      <nav className="app-nav-inner container" aria-label="Main">
        <Link to="/" className="app-nav-brand black-text" onClick={close} aria-label="SyllaMe home">
          <i className="material-icons" aria-hidden="true">
            code
          </i>
          <span>SyllaMe</span>
        </Link>

        <button
          type="button"
          className="btn-flat app-nav-toggle"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="app-nav-links"
          onClick={() => setOpen((v) => !v)}
        >
          <i className="material-icons black-text" aria-hidden="true">
            {open ? "close" : "menu"}
          </i>
        </button>

        <ul id="app-nav-links" className={classnames("app-nav-links", { "app-nav-links-open": open })}>
          {links.map((l) => (
            <li key={l.to}>
              <NavLink to={l.to} end className="black-text" onClick={close}>
                {l.label}
              </NavLink>
            </li>
          ))}
          {isAuthenticated && (
            <li>
              <button type="button" className="btn-flat black-text app-nav-logout" onClick={onLogout}>
                Log out{user.firstname ? ` (${user.firstname})` : ""}
              </button>
            </li>
          )}
        </ul>
      </nav>
    </header>
  );
}
