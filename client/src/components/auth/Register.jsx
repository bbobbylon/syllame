/**
 * Registration form. See Login.jsx for the hook-to-class mapping.
 */

import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import classnames from "classnames";

import { registerUser } from "../../actions/authActions";

/** One text input with its label and error message, to avoid repeating markup 5 times. */
function Field({ id, label, type = "text", value, error, onChange }) {
  return (
    <div className="input-field col s12">
      <input
        onChange={onChange}
        value={value}
        id={id}
        type={type}
        placeholder=" "
        className={classnames("", { invalid: error })}
      />
      <label htmlFor={id}>{label}</label>
      <span className="red-text">{error}</span>
    </div>
  );
}

/**
 * @returns {JSX.Element}
 */
export default function Register() {
  const [form, setForm] = useState({
    firstname: "",
    lastname: "",
    email: "",
    password: "",
    password2: ""
  });
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const loading = useSelector((state) => state.auth.loading);
  const errors = useSelector((state) => state.errors);

  // Already logged in? Registration makes no sense; go to the dashboard.
  useEffect(() => {
    if (isAuthenticated) navigate("/dashboard", { replace: true });
  }, [isAuthenticated, navigate]);

  /** @param {React.ChangeEvent<HTMLInputElement>} e */
  const onChange = (e) => setForm({ ...form, [e.target.id]: e.target.value });

  /** @param {React.FormEvent<HTMLFormElement>} e */
  const onSubmit = (e) => {
    e.preventDefault();
    dispatch(registerUser(form, navigate));
  };

  return (
    <div className="container">
      <div className="row">
        <div className="col s8 offset-s2">
          <Link to="/" className="btn-flat waves-effect">
            <i className="material-icons left">keyboard_backspace</i> Back to home
          </Link>
          <div className="col s12" style={{ paddingLeft: "11.250px" }}>
            <h4>
              <b>Register</b> below
            </h4>
            <p className="grey-text text-darken-1">
              Already have an account? <Link to="/login">Log in</Link>
            </p>
          </div>
          <form noValidate onSubmit={onSubmit}>
            {errors.general && <p className="red-text">{errors.general}</p>}
            <Field
              id="firstname"
              label="First name"
              value={form.firstname}
              error={errors.firstname}
              onChange={onChange}
            />
            <Field
              id="lastname"
              label="Last name"
              value={form.lastname}
              error={errors.lastname}
              onChange={onChange}
            />
            <Field
              id="email"
              label="Email"
              type="email"
              value={form.email}
              error={errors.email}
              onChange={onChange}
            />
            <Field
              id="password"
              label="Password"
              type="password"
              value={form.password}
              error={errors.password}
              onChange={onChange}
            />
            <Field
              id="password2"
              label="Confirm Password"
              type="password"
              value={form.password2}
              error={errors.password2}
              onChange={onChange}
            />
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
                {loading ? "Creating account..." : "Sign up"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
