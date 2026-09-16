/**
 * Action type constants. Using constants instead of raw strings means a typo
 * becomes an "undefined" error at import time instead of a silently ignored
 * action.
 */

export const GET_ERRORS = "GET_ERRORS";
export const USER_LOADING = "USER_LOADING";
export const SET_CURRENT_USER = "SET_CURRENT_USER";
