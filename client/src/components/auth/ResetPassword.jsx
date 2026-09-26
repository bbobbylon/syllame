/**
 * "Choose a new password" form, reached from the link in the reset email.
 * The token is the last URL segment: /reset-password/:token
 */

import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { resetPassword, authErrors } from "../../api/auth";

/**
 * @returns {JSX.Element}
 */
export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ password: "", password2: "" });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  /** @param {React.ChangeEvent<HTMLInputElement>} e */
  const onChange = (e) => setForm({ ...form, [e.target.id]: e.target.value });

  /** @param {React.FormEvent<HTMLFormElement>} e */
  const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrors({});
    try {
      await resetPassword(token, form.password, form.password2);
      navigate("/login", { replace: true, state: { passwordReset: true } });
    } catch (err) {
      setErrors(authErrors(err));
      setSaving(false);
    }
  };

  return (
    <div className="container">
      <div style={{ marginTop: "4rem" }} className="row">
        <div className="col s12 m8 offset-m2">
          <h4>
            <b>Choose</b> a new password
          </h4>
          <form noValidate onSubmit={onSubmit}>
            {(errors.general || errors.token) && (
              <p className="red-text" role="alert">
                {errors.general || errors.token}{" "}
                {errors.token && <Link to="/forgot-password">Request a new link</Link>}
              </p>
            )}
            <div className="input-field col s12">
              <input
                id="password"
                type="password"
                placeholder=" "
                value={form.password}
                onChange={onChange}
                className={errors.password ? "invalid" : ""}
              />
              <label htmlFor="password">New password</label>
              <span className="red-text">{errors.password}</span>
            </div>
            <div className="input-field col s12">
              <input
                id="password2"
                type="password"
                placeholder=" "
                value={form.password2}
                onChange={onChange}
                className={errors.password2 ? "invalid" : ""}
              />
              <label htmlFor="password2">Confirm new password</label>
              <span className="red-text">{errors.password2}</span>
            </div>
            <button
              type="submit"
              disabled={saving}
              className="btn btn-large waves-effect waves-light hoverable blue accent-3"
              style={{ borderRadius: "3px", letterSpacing: "1.5px", marginTop: "1rem" }}
            >
              {saving ? "Saving..." : "Set new password"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
