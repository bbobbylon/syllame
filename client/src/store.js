/**
 * Redux store.
 *
 * Redux Toolkit's `configureStore` replaces the hand-rolled
 * `createStore(rootReducer, initialState, compose(applyMiddleware(thunk), devtools))`
 * from the original code. It does all of that for you: combines the reducers,
 * adds the thunk middleware (so action creators can be async functions), and
 * wires up the Redux DevTools browser extension automatically.
 *
 * Plain `createStore` from the `redux` package still exists but is marked
 * deprecated in Redux 5, which is why we switched.
 */

import { configureStore } from "@reduxjs/toolkit";

import authReducer from "./reducers/authReducers";
import errorReducer from "./reducers/errorReducers";

const store = configureStore({
  reducer: {
    auth: authReducer,
    errors: errorReducer
  }
});

export default store;
