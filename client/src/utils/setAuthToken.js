/**
 * Adds or removes the `Authorization` header that axios sends on every
 * request. The server's Passport JWT strategy reads this header.
 */

import axios from "axios";

/**
 * @param {string | false | null | undefined} token - The full "Bearer ..." string
 *   to attach, or a falsy value to remove the header (logout).
 * @returns {void}
 */
export default function setAuthToken(token) {
  if (token) {
    axios.defaults.headers.common["Authorization"] = token;
  } else {
    delete axios.defaults.headers.common["Authorization"];
  }
}
