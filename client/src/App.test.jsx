import { describe, expect, test, vi } from "vitest";
import { screen } from "@testing-library/react";

import { AppRoutes } from "./App";
import { renderWithProviders } from "./test/renderWithProviders";

vi.mock("./api/syllabi", () => ({
  listSyllabi: vi.fn().mockResolvedValue([]),
  describeError: vi.fn(() => ({ fieldErrors: {}, message: "" }))
}));

describe("AppRoutes", () => {
  test("renders the landing page at /", () => {
    renderWithProviders(<AppRoutes />, { initialEntries: ["/"] });
    expect(screen.getByRole("heading", { name: /login or register/i })).toBeInTheDocument();
  });

  test("shows a 404 page for unknown URLs", () => {
    renderWithProviders(<AppRoutes />, { initialEntries: ["/does/not/exist"] });
    expect(screen.getByRole("heading", { name: /page not found/i })).toBeInTheDocument();
  });

  test("redirects the old /createSyllabus URL to the new form when logged in", async () => {
    renderWithProviders(<AppRoutes />, {
      initialEntries: ["/createSyllabus"],
      preloadedState: { auth: { isAuthenticated: true, user: { firstname: "Ada" }, loading: false } }
    });
    expect(await screen.findByRole("heading", { name: /create syllabus/i })).toBeInTheDocument();
  });
});
