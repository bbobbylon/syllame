/**
 * Errors slice: holds the field -> message object the API returns on a 400,
 * so forms can show messages next to the right inputs.
 */

import { GET_ERRORS } from "../actions/types";

const initialState = {};

/**
 * @param {Record<string, string>} state
 * @param {{ type: string, payload?: Record<string, string> }} action
 * @returns {Record<string, string>}
 */
export default function errorReducer(state = initialState, action) {
  switch (action.type) {
    case GET_ERRORS:
      return action.payload ?? {};
    default:
      return state;
  }
}
