/**
 * Field -> message errors from the last failed auth request, so forms can
 * show each message next to the right input.
 */

import { createSlice } from "@reduxjs/toolkit";

const errorsSlice = createSlice({
  name: "errors",
  initialState: {},
  reducers: {
    /** Replaces all errors. Returning a value replaces the state outright. */
    setErrors(_state, action) {
      return action.payload ?? {};
    },
    clearErrors() {
      return {};
    }
  }
});

export const { setErrors, clearErrors } = errorsSlice.actions;
export default errorsSlice.reducer;
