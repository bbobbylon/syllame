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

  test("shows field errors returned by the API", async () => {
    axios.post.mockRejectedValueOnce({
      response: { status: 404, data: { emailnotfound: "Email not found" } }
    });
    renderWithProviders(<Login />, { initialEntries: ["/login"] });

    await userEvent.type(screen.getByLabelText(/email/i), "nobody@example.com");
    await userEvent.type(screen.getByLabelText(/password/i), "secret1");
    await userEvent.click(screen.getByRole("button", { name: /login/i }));

    expect(await screen.findByText("Email not found")).toBeInTheDocument();
    expect(axios.post).toHaveBeenCalledWith("/api/users/login", {
      email: "nobody@example.com",
      password: "secret1"
    });
  });
});
