/**
 * Test helper: renders a component inside a fresh Redux store and a memory
 * router, the same context the real app provides.
 */

import { configureStore } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import { render } from "@testing-library/react";

import authReducer from "../store/authSlice";
import errorsReducer from "../store/errorsSlice";

/**
 * @param {import("react").ReactElement} ui - Element under test.
 * @param {object} [options]
 * @param {object} [options.preloadedState] - Initial Redux state.
 * @param {string[]} [options.initialEntries] - Starting URL(s) for the router.
 * @returns {ReturnType<typeof render> & { store: ReturnType<typeof configureStore> }}
 */
export function renderWithProviders(ui, { preloadedState, initialEntries = ["/"] } = {}) {
  const store = configureStore({
    reducer: { auth: authReducer, errors: errorsReducer },
    preloadedState
  });
  const result = render(
    <Provider store={store}>
      <MemoryRouter initialEntries={initialEntries}>{ui}</MemoryRouter>
    </Provider>
  );
  return { ...result, store };
}
