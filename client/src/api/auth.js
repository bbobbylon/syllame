/**
 * Password-reset API calls. Plain axios helpers; these flows do not touch
 * Redux because nothing about them is shared app state.
 */

import axios from "axios";

/**
 * Asks the server to email a reset link. The server replies identically
 * whether or not the address is registered.
 *
 * @param {string} email
 * @returns {Promise<{ message: string }>}
 */
export async function requestPasswordReset(email) {
  const res = await axios.post("/api/users/forgot-password", { email });
  return res.data;
}

/**
 * Sets a new password using the token from the emailed link.
 *
 * @param {string} token
 * @param {string} password
 * @param {string} password2 - Confirmation.
 * @returns {Promise<{ success: boolean }>}
 */
export async function resetPassword(token, password, password2) {
  const res = await axios.post("/api/users/reset-password", { token, password, password2 });
  return res.data;
}

/**
 * Field errors from a 400, or a general message otherwise.
 *
 * @param {unknown} err
 * @returns {Record<string, string>}
 */
export function authErrors(err) {
  const data = err?.response?.data;
  if (data && typeof data === "object") return data;
  return { general: "Could not reach the server. Is it running?" };
}
