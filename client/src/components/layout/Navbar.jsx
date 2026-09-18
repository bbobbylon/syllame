/**
 * Top navigation. Shows different links depending on whether the user is
 * logged in, and collapses into a hamburger menu on small screens.
 *
 * The mobile toggle is plain React state rather than Materialize's sidenav
 * plugin, so it works without the CDN JavaScript and is easy to test.
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
    <div className="navbar-fixed no-print">
      <nav className="white z-depth-1">
        <div className="nav-wrapper container">
          <Link to="/" className="brand-logo black-text" style={{ fontFamily: "monospace" }} onClick={close}>
            <i className="material-icons">code</i>
            SyllaMe
          </Link>

          <button
            type="button"
            className="btn-flat nav-toggle right hide-on-large-only"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            <i className="material-icons black-text">{open ? "close" : "menu"}</i>
          </button>

          <ul className={classnames("nav-links right", { "nav-links-open": open })}>
            {links.map((l) => (
              <li key={l.to}>
                <NavLink to={l.to} end className="black-text" onClick={close}>
                  {l.label}
                </NavLink>
              </li>
            ))}
            {isAuthenticated && (
              <li>
                <button type="button" className="btn-flat black-text nav-logout" onClick={onLogout}>
                  Log out{user.firstname ? ` (${user.firstname})` : ""}
                </button>
              </li>
            )}
          </ul>
        </div>
      </nav>
    </div>
  );
}
