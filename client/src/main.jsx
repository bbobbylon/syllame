/**
 * Browser entry point (replaces CRA's `index.js`).
 *
 * React 19 removed the legacy `ReactDOM.render`; `createRoot` is the only
 * supported way to mount and it enables concurrent rendering features.
 */

import React from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";

// UI framework and icon font, bundled by Vite instead of loaded from CDNs.
// Bundling means the app works offline, never depends on a third party at
// runtime, and lets the server's Content Security Policy stay "same-origin".
import "@materializecss/materialize/dist/css/materialize.css";
import "@materializecss/materialize/dist/css/materialize.colors.min.css";
import "material-icons/iconfont/filled.css";
// Importing the JS registers Materialize's document-level handlers (floating
// labels, ripple effect, textarea auto-resize). Nothing else is needed.
import "@materializecss/materialize";

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
