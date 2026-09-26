/**
 * Auth state as a Redux Toolkit "slice".
 *
 * `createSlice` generates the action types, action creators and reducer
 * from one object, replacing the separate `actions/types.js`,
 * `actions/*` and `reducers/*` files of classic Redux.
 *
 * The reducers below look like they mutate `state`. They do not: Redux
 * Toolkit runs them through Immer, which records the "mutations" on a draft
 * and produces a new immutable object. Analogy: editing a photocopy while the
 * original stays in the archive.
 */

import { createSlice } from "@reduxjs/toolkit";

/**
 * Returns true for `{}`, `null`, `undefined`, and blank strings.
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
  /** True while a login or registration request is in flight. */
  loading: false
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    /** Sets (or, with `{}`, clears) the logged-in user. */
    setCurrentUser(state, action) {
      const user = action.payload ?? {};
      state.user = user;
      state.isAuthenticated = !isEmpty(user);
      state.loading = false;
    },
    userLoading(state) {
      state.loading = true;
    },
    userLoadingDone(state) {
      state.loading = false;
    }
  }
});

export const { setCurrentUser, userLoading, userLoadingDone } = authSlice.actions;
export default authSlice.reducer;
