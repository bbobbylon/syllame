/**
 * Browser entry point (replaces CRA's `index.js`).
 *
 * React 19 removed the legacy `ReactDOM.render`; `createRoot` is the only
 * supported way to mount and it enables concurrent rendering features.
 */

import React from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";

import "./index.css";
import App from "./App";
import store from "./store";
import { restoreSession } from "./actions/authActions";

// Re-hydrate the login state from localStorage *before* the first render so a
// refreshed page never flashes the logged-out UI.
restoreSession(store);

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
);
