/**
 * Redux store.
 *
 * `configureStore` combines the slice reducers, adds the thunk middleware
 * (so action creators can be async functions), and wires up the Redux
 * DevTools browser extension automatically.
 */

import { configureStore } from "@reduxjs/toolkit";

import authReducer from "./store/authSlice";
import errorsReducer from "./store/errorsSlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    errors: errorsReducer
  }
});

export default store;
