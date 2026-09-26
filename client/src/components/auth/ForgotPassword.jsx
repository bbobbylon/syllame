/**
 * "Forgot password" form: asks for an email and always shows the same
 * confirmation, so the page cannot be used to discover which emails exist.
 */

import { useState } from "react";
import { Link } from "react-router-dom";

import { requestPasswordReset, authErrors } from "../../api/auth";

/**
 * @returns {JSX.Element}
 */
export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState({});

  /** @param {React.FormEvent<HTMLFormElement>} e */
  const onSubmit = async (e) => {
    e.preventDefault();
    setStatus("sending");
    setErrors({});
    try {
      const res = await requestPasswordReset(email);
      setMessage(res.message);
      setStatus("sent");
    } catch (err) {
      setErrors(authErrors(err));
      setStatus("idle");
    }
  };

  return (
    <div className="container">
      <div style={{ marginTop: "4rem" }} className="row">
        <div className="col s12 m8 offset-m2">
          <Link to="/login" className="btn-flat waves-effect">
            <i className="material-icons left">keyboard_backspace</i> Back to login
          </Link>
          <h4>
            <b>Forgot</b> your password?
          </h4>
          <p className="grey-text text-darken-1">
            Enter your email and we will send you a link to choose a new one.
          </p>

          {status === "sent" ? (
            <p className="green-text" role="status">
              {message}
            </p>
          ) : (
            <form noValidate onSubmit={onSubmit}>
              {errors.general && (
                <p className="red-text" role="alert">
                  {errors.general}
                </p>
              )}
              <div className="input-field col s12">
                <input
                  id="email"
                  type="email"
                  placeholder=" "
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={errors.email ? "invalid" : ""}
                />
                <label htmlFor="email">Email</label>
                <span className="red-text">{errors.email}</span>
              </div>
              <button
                type="submit"
                disabled={status === "sending"}
                className="btn btn-large waves-effect waves-light hoverable blue accent-3"
                style={{ borderRadius: "3px", letterSpacing: "1.5px", marginTop: "1rem" }}
              >
                {status === "sending" ? "Sending..." : "Send reset link"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
