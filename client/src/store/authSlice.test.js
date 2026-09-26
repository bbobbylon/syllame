import { describe, expect, test } from "vitest";

import authReducer, {
  initialState,
  isEmpty,
  setCurrentUser,
  userLoading,
  userLoadingDone
} from "./authSlice";
import errorsReducer, { setErrors, clearErrors } from "./errorsSlice";

describe("authSlice", () => {
  test("returns the initial state for unknown actions", () => {
    expect(authReducer(undefined, { type: "NOPE" })).toEqual(initialState);
  });

  test("marks the user authenticated when a payload is set", () => {
    const next = authReducer(initialState, setCurrentUser({ id: "1", firstname: "Ada" }));
    expect(next.isAuthenticated).toBe(true);
    expect(next.user.firstname).toBe("Ada");
  });

  test("logs out when the payload is empty", () => {
    const loggedIn = { ...initialState, isAuthenticated: true, user: { id: "1" } };
    const next = authReducer(loggedIn, setCurrentUser({}));
    expect(next.isAuthenticated).toBe(false);
    expect(next.user).toEqual({});
  });

  test("tracks loading", () => {
    const loading = authReducer(initialState, userLoading());
    expect(loading.loading).toBe(true);
    expect(authReducer(loading, userLoadingDone()).loading).toBe(false);
  });

  test("does not mutate the previous state", () => {
    const before = { ...initialState };
    authReducer(before, setCurrentUser({ id: "1" }));
    expect(before).toEqual(initialState);
  });
});

describe("errorsSlice", () => {
  test("sets and clears errors", () => {
    const withErrors = errorsReducer({}, setErrors({ email: "Email is invalid" }));
    expect(withErrors).toEqual({ email: "Email is invalid" });
    expect(errorsReducer(withErrors, clearErrors())).toEqual({});
  });
});

describe("isEmpty", () => {
  test.each([
    [{}, true],
    [null, true],
    [undefined, true],
    ["  ", true],
    [{ a: 1 }, false],
    ["x", false]
  ])("isEmpty(%j) -> %s", (value, expected) => {
    expect(isEmpty(value)).toBe(expected);
  });
});
