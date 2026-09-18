/**
 * Thin wrapper around the syllabus REST endpoints.
 *
 * Why not Redux for this data? Redux shines for state many components share
 * and mutate (the logged-in user). Server records that one page loads, shows
 * and edits are simpler as local component state fetched on demand; keeping
 * them in Redux would mean writing actions, reducers and cache invalidation
 * for no benefit. If this grows, RTK Query is the natural next step.
 *
 * The `Authorization` header is already attached globally by
 * `utils/setAuthToken.js`, so nothing here deals with tokens.
 */

import axios from "axios";

const BASE = "/api/syllabi";

/** @returns {Promise<object[]>} The current user's syllabi, newest first. */
export async function listSyllabi() {
  const res = await axios.get(BASE);
  return res.data;
}

/**
 * @param {string} id
 * @returns {Promise<object>}
 */
export async function getSyllabus(id) {
  const res = await axios.get(`${BASE}/${id}`);
  return res.data;
}

/**
 * @param {object} data - Field values from the form.
 * @returns {Promise<object>} The created syllabus, including its `_id`.
 */
export async function createSyllabus(data) {
  const res = await axios.post(BASE, data);
  return res.data;
}

/**
 * @param {string} id
 * @param {object} data
 * @returns {Promise<object>} The updated syllabus.
 */
export async function updateSyllabus(id, data) {
  const res = await axios.put(`${BASE}/${id}`, data);
  return res.data;
}

/**
 * @param {string} id
 * @returns {Promise<void>}
 */
export async function deleteSyllabus(id) {
  await axios.delete(`${BASE}/${id}`);
}

/**
 * Turns an axios error into something a component can show.
 *
 * @param {unknown} err
 * @returns {{ fieldErrors: Record<string, string>, message: string }}
 */
export function describeError(err) {
  const status = err?.response?.status;
  const data = err?.response?.data;
  if (status === 400 && data && typeof data === "object") {
    return { fieldErrors: data, message: "Please fix the highlighted fields." };
  }
  if (status === 401) return { fieldErrors: {}, message: "Your session has expired. Please log in again." };
  if (status === 404) return { fieldErrors: {}, message: "That syllabus no longer exists." };
  if (!err?.response) return { fieldErrors: {}, message: "Could not reach the server. Is it running?" };
  return { fieldErrors: {}, message: data?.error || "Something went wrong." };
}
