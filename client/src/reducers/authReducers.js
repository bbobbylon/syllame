/**
 * Auth slice of the Redux state.
 *
 * A reducer is a pure function: (previous state, action) -> next state. It
 * never mutates its input and never does I/O; that is what makes Redux state
 * predictable and easy to test (see `authReducers.test.js`).
 */

import { SET_CURRENT_USER, USER_LOADING, USER_LOADING_DONE } from "../actions/types";

/**
 * Returns true for `{}`, `null`, `undefined`, and `""`. Replaces the
 * `is-empty` package the original code required from CommonJS.
 *
 * @param {unknown} value
 * @returns {boolean}
 */
export function isEmpty(value) {
  return (
    value === undefined ||
    value === null ||
    (typeof value === "object" && Object.keys(value).length === 0) ||
    (typeof value === "string" && value.trim().length === 0)
  );
}

export const initialState = {
  isAuthenticated: false,
  /** Decoded JWT payload: `{ id, firstname, lastname, iat, exp }` when logged in. */
  user: {},
  loading: false
};

/**
 * @param {typeof initialState} state
 * @param {{ type: string, payload?: unknown }} action
 * @returns {typeof initialState}
 */
export default function authReducer(state = initialState, action) {
  switch (action.type) {
    case SET_CURRENT_USER:
      return {
        ...state,
        isAuthenticated: !isEmpty(action.payload),
        user: action.payload ?? {},
        loading: false
      };
    case USER_LOADING:
      return { ...state, loading: true };
    case USER_LOADING_DONE:
      return { ...state, loading: false };
    default:
      return state;
  }
}
