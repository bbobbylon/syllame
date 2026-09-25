import { beforeEach, describe, expect, test, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Routes, Route } from "react-router-dom";
import axios from "axios";

import Register from "./Register";
import Login from "./Login";
import { renderWithProviders } from "../../test/renderWithProviders";

vi.mock("axios");

function Tree() {
  return (
    <Routes>
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
    </Routes>
  );
}

async function fillForm() {
  await userEvent.type(screen.getByLabelText(/first name/i), "Ada");
  await userEvent.type(screen.getByLabelText(/last name/i), "Lovelace");
  await userEvent.type(screen.getByLabelText(/^email/i), "ada@example.com");
  await userEvent.type(screen.getByLabelText(/^password/i), "secret123");
  await userEvent.type(screen.getByLabelText(/confirm password/i), "secret123");
}

describe("Register", () => {
  beforeEach(() => vi.clearAllMocks());

  test("posts the form and lands on login with a success notice", async () => {
    axios.post.mockResolvedValueOnce({ data: {} });
    renderWithProviders(<Tree />, { initialEntries: ["/register"] });
    await fillForm();
    await userEvent.click(screen.getByRole("button", { name: /sign up/i }));

    expect(axios.post).toHaveBeenCalledWith(
      "/api/users/register",
      expect.objectContaining({ email: "ada@example.com", password2: "secret123" })
    );
    expect(await screen.findByRole("status")).toHaveTextContent(/account created/i);
  });

  test("shows field errors and re-enables the button on failure", async () => {
    axios.post.mockRejectedValueOnce({ response: { status: 400, data: { email: "Email already exists" } } });
    renderWithProviders(<Tree />, { initialEntries: ["/register"] });
    await fillForm();
    await userEvent.click(screen.getByRole("button", { name: /sign up/i }));

    expect(await screen.findByText("Email already exists")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /sign up/i })).toBeEnabled();
  });
});
