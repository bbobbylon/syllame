import { describe, expect, test } from "vitest";
import { screen } from "@testing-library/react";
import { Routes, Route } from "react-router-dom";

import PrivateRoute from "./PrivateRoute";
import { renderWithProviders } from "../../test/renderWithProviders";

/** Minimal route tree: one guarded page and the login page it should redirect to. */
function Tree() {
  return (
    <Routes>
      <Route path="/login" element={<p>login page</p>} />
      <Route element={<PrivateRoute />}>
        <Route path="/dashboard" element={<p>secret dashboard</p>} />
      </Route>
    </Routes>
  );
}

describe("PrivateRoute", () => {
  test("redirects anonymous visitors to /login", () => {
    renderWithProviders(<Tree />, { initialEntries: ["/dashboard"] });
    expect(screen.getByText("login page")).toBeInTheDocument();
    expect(screen.queryByText("secret dashboard")).not.toBeInTheDocument();
  });

  test("renders the page for authenticated users", () => {
    renderWithProviders(<Tree />, {
      initialEntries: ["/dashboard"],
      preloadedState: { auth: { isAuthenticated: true, user: { firstname: "Ada" }, loading: false } }
    });
    expect(screen.getByText("secret dashboard")).toBeInTheDocument();
  });
});
