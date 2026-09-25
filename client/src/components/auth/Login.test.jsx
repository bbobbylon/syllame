import { describe, expect, test, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axios from "axios";

import Login from "./Login";
import { renderWithProviders } from "../../test/renderWithProviders";

vi.mock("axios");

describe("Login", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  test("shows the generic error returned by the API", async () => {
    axios.post.mockRejectedValueOnce({
      response: { status: 401, data: { general: "Invalid email or password" } }
    });
    renderWithProviders(<Login />, { initialEntries: ["/login"] });

    await userEvent.type(screen.getByLabelText(/email/i), "nobody@example.com");
    await userEvent.type(screen.getByLabelText(/password/i), "secret1");
    await userEvent.click(screen.getByRole("button", { name: /login/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Invalid email or password");
    expect(screen.getByRole("button", { name: /login/i })).toBeEnabled();
    expect(axios.post).toHaveBeenCalledWith("/api/users/login", {
      email: "nobody@example.com",
      password: "secret1"
    });
  });

  test("shows a success notice after registering", () => {
    renderWithProviders(<Login />, { initialEntries: [{ pathname: "/login", state: { registered: true } }] });
    expect(screen.getByRole("status")).toHaveTextContent(/account created/i);
  });
});
