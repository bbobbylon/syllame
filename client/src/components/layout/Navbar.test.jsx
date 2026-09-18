import { describe, expect, test } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import Navbar from "./Navbar";
import { renderWithProviders } from "../../test/renderWithProviders";

const loggedIn = { auth: { isAuthenticated: true, user: { firstname: "Ada" }, loading: false } };

describe("Navbar", () => {
  test("shows login and register links when logged out", () => {
    renderWithProviders(<Navbar />);
    expect(screen.getByRole("link", { name: /log in/i })).toHaveAttribute("href", "/login");
    expect(screen.getByRole("link", { name: /register/i })).toHaveAttribute("href", "/register");
    expect(screen.queryByRole("button", { name: /log out/i })).not.toBeInTheDocument();
  });

  test("shows app links and a logout button when logged in", () => {
    renderWithProviders(<Navbar />, { preloadedState: loggedIn });
    expect(screen.getByRole("link", { name: /my syllabi/i })).toHaveAttribute("href", "/syllabi");
    expect(screen.getByRole("link", { name: /new syllabus/i })).toHaveAttribute("href", "/syllabi/new");
    expect(screen.getByRole("button", { name: /log out \(ada\)/i })).toBeInTheDocument();
  });

  test("logout clears auth state", async () => {
    const { store } = renderWithProviders(<Navbar />, { preloadedState: loggedIn });
    await userEvent.click(screen.getByRole("button", { name: /log out/i }));
    expect(store.getState().auth.isAuthenticated).toBe(false);
  });

  test("mobile toggle opens and closes the menu", async () => {
    renderWithProviders(<Navbar />);
    const toggle = screen.getByRole("button", { name: /open menu/i });
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    await userEvent.click(toggle);
    expect(screen.getByRole("button", { name: /close menu/i })).toHaveAttribute("aria-expanded", "true");
  });
});
