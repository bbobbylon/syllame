import { describe, expect, test } from "vitest";

import authReducer, { initialState, isEmpty } from "./authReducers";
import { SET_CURRENT_USER, USER_LOADING } from "../actions/types";

describe("authReducer", () => {
  test("returns the initial state for unknown actions", () => {
    expect(authReducer(undefined, { type: "NOPE" })).toEqual(initialState);
  });

  test("marks the user authenticated when a payload is set", () => {
    const next = authReducer(initialState, {
      type: SET_CURRENT_USER,
      payload: { id: "1", firstname: "Ada" }
    });
    expect(next.isAuthenticated).toBe(true);
    expect(next.user.firstname).toBe("Ada");
  });

  test("logs out when the payload is empty", () => {
    const loggedIn = { ...initialState, isAuthenticated: true, user: { id: "1" } };
    const next = authReducer(loggedIn, { type: SET_CURRENT_USER, payload: {} });
    expect(next.isAuthenticated).toBe(false);
    expect(next.user).toEqual({});
  });

  test("sets loading", () => {
    expect(authReducer(initialState, { type: USER_LOADING }).loading).toBe(true);
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
