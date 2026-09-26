/**
 * Login form.
 *
 * Hooks used and what they replace from the class version:
 *  - `useState`   -> `this.state` / `this.setState`
 *  - `useSelector` -> `connect(mapStateToProps)`
 *  - `useDispatch` -> `connect(null, { loginUser })`
 *  - `useNavigate` -> `this.props.history.push`
 *  - `useEffect`   -> `componentDidMount` + `componentWillReceiveProps`
 *    (the latter was deprecated in React 16.3 and warns loudly in 19).
 */

import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import classnames from "classnames";

import { loginUser } from "../../actions/authActions";

/**
 * @returns {JSX.Element}
 */
export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  /** Set by registerUser() right after a successful sign-up. */
  const justRegistered = Boolean(location.state?.registered);
  /** Set by ResetPassword after a successful reset. */
  const passwordReset = Boolean(location.state?.passwordReset);
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const loading = useSelector((state) => state.auth.loading);
  const errors = useSelector((state) => state.errors);

  // Once logged in (now or after submit), go to the dashboard.
  useEffect(() => {
    if (isAuthenticated) navigate("/dashboard", { replace: true });
  }, [isAuthenticated, navigate]);

  /** @param {React.ChangeEvent<HTMLInputElement>} e */
  const onChange = (e) => setForm({ ...form, [e.target.id]: e.target.value });

  /** @param {React.FormEvent<HTMLFormElement>} e */
  const onSubmit = (e) => {
    e.preventDefault();
    dispatch(loginUser(form));
  };

  return (
    <div className="container">
      <div style={{ marginTop: "4rem" }} className="row">
        <div className="col s8 offset-s2">
          <Link to="/" className="btn-flat waves-effect">
            <i className="material-icons left">keyboard_backspace</i> Back to home
          </Link>
          <div className="col s12" style={{ paddingLeft: "11.250px" }}>
            <h4>
              <b>Login</b> below
            </h4>
            <p className="grey-text text-darken-1">
              Don&apos;t have an account? <Link to="/register">Register</Link>
            </p>
          </div>
          <form noValidate onSubmit={onSubmit}>
            {justRegistered && !errors.general && (
              <p className="green-text" role="status">
                Account created. Log in to get started.
              </p>
            )}
            {passwordReset && !errors.general && (
              <p className="green-text" role="status">
                Password updated. Log in with your new password.
              </p>
            )}
            {errors.general && (
              <p className="red-text" role="alert">
                {errors.general}
              </p>
            )}
            <div className="input-field col s12">
              <input
                onChange={onChange}
                value={form.email}
                id="email"
                type="email"
                placeholder=" "
                className={classnames("", { invalid: errors.email || errors.general })}
              />
              <label htmlFor="email">Email</label>
              <span className="red-text">{errors.email}</span>
            </div>
            <div className="input-field col s12">
              <input
                onChange={onChange}
                value={form.password}
                id="password"
                type="password"
                placeholder=" "
                className={classnames("", { invalid: errors.password || errors.general })}
              />
              <label htmlFor="password">Password</label>
              <span className="red-text">{errors.password}</span>
              <Link to="/forgot-password" className="forgot-link">
                Forgot password?
              </Link>
            </div>
            <div className="col s12" style={{ paddingLeft: "11.250px" }}>
              <button
                style={{
                  width: "150px",
                  borderRadius: "3px",
                  letterSpacing: "1.5px",
                  marginTop: "1rem"
                }}
                type="submit"
                disabled={loading}
                className="btn btn-large waves-effect waves-light hoverable blue accent-3"
              >
                {loading ? "Logging in..." : "Login"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
