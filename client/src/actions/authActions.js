/**
 * Auth action creators.
 *
 * The async ones are "thunks": instead of returning an action object they
 * return a function `(dispatch) => ...`. The thunk middleware (included by
 * Redux Toolkit's `configureStore`) calls that function, which lets us await
 * an HTTP request and dispatch when it finishes.
 */

import axios from "axios";
import { jwtDecode } from "jwt-decode";

import setAuthToken from "../utils/setAuthToken";
import { GET_ERRORS, SET_CURRENT_USER, USER_LOADING, USER_LOADING_DONE } from "./types";

/** localStorage key under which the "Bearer ..." token is kept. */
export const TOKEN_KEY = "jwtToken";

/**
 * Extracts the field -> message error object from a failed axios call, or a
 * generic message when the server never answered (network down, proxy off).
 *
 * @param {unknown} err
 * @returns {Record<string, string>}
 */
function errorPayload(err) {
  const data = err?.response?.data;
  if (data && typeof data === "object") return data;
  return { general: "Could not reach the server. Is it running?" };
}

/**
 * Registers a new account, then sends the user to the login page.
 *
 * React Router 7 has no `history` prop; components pass the `navigate`
 * function from `useNavigate()` instead.
 *
 * @param {object} userData - firstname, lastname, email, password, password2.
 * @param {(to: string, options?: object) => void} navigate - From `useNavigate()`.
 */
export const registerUser = (userData, navigate) => async (dispatch) => {
  dispatch({ type: USER_LOADING });
  try {
    await axios.post("/api/users/register", userData);
    dispatch({ type: GET_ERRORS, payload: {} });
    // `state` rides along with the navigation (not the URL) so the login
    // page can show a one-time "account created" notice.
    navigate("/login", { state: { registered: true } });
  } catch (err) {
    dispatch({ type: USER_LOADING_DONE });
    dispatch({ type: GET_ERRORS, payload: errorPayload(err) });
  }
};

/**
 * Logs in: stores the token, attaches it to axios, and puts the decoded
 * payload in the store (which flips `isAuthenticated` to true).
 *
 * @param {{ email: string, password: string }} userData
 */
export const loginUser = (userData) => async (dispatch) => {
  dispatch({ type: USER_LOADING });
  try {
    const res = await axios.post("/api/users/login", userData);
    const { token } = res.data;
    localStorage.setItem(TOKEN_KEY, token);
    setAuthToken(token);
    dispatch({ type: GET_ERRORS, payload: {} });
    dispatch(setCurrentUser(jwtDecode(token)));
  } catch (err) {
    dispatch({ type: USER_LOADING_DONE });
    dispatch({ type: GET_ERRORS, payload: errorPayload(err) });
  }
};

/**
 * Plain action: sets (or clears, with `{}`) the logged-in user.
 *
 * @param {object} decoded - Decoded JWT payload, or `{}` to log out.
 */
export const setCurrentUser = (decoded) => ({
  type: SET_CURRENT_USER,
  payload: decoded
});

/** Clears the token everywhere and resets auth state. */
export const logoutUser = () => (dispatch) => {
  localStorage.removeItem(TOKEN_KEY);
  setAuthToken(false);
  dispatch(setCurrentUser({}));
};

/**
 * Restores a previous login from localStorage on page load. Called once from
 * `main.jsx` before the first render. If the stored token is expired or
 * unreadable it is discarded so the user sees the login page.
 *
 * @param {{ dispatch: Function }} store - The Redux store.
 * @returns {void}
 */
export function restoreSession(store) {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) return;

  try {
    const decoded = jwtDecode(token);
    const nowSeconds = Date.now() / 1000;
    if (decoded.exp && decoded.exp < nowSeconds) {
      store.dispatch(logoutUser());
      return;
    }
    setAuthToken(token);
    store.dispatch(setCurrentUser(decoded));
  } catch {
    // Corrupt token in storage; treat as logged out.
    store.dispatch(logoutUser());
  }
}
