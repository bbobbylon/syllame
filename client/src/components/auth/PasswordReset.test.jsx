import { beforeEach, describe, expect, test, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Routes, Route } from "react-router-dom";

import ForgotPassword from "./ForgotPassword";
import ResetPassword from "./ResetPassword";
import Login from "./Login";
import { renderWithProviders } from "../../test/renderWithProviders";
import * as api from "../../api/auth";

vi.mock("../../api/auth", async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, requestPasswordReset: vi.fn(), resetPassword: vi.fn() };
});

function Tree() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />
    </Routes>
  );
}

describe("ForgotPassword", () => {
  beforeEach(() => vi.clearAllMocks());

  test("submits the email and shows the server's message", async () => {
    api.requestPasswordReset.mockResolvedValueOnce({
      message: "If that email is registered, a reset link has been sent."
    });
    renderWithProviders(<Tree />, { initialEntries: ["/forgot-password"] });
    await userEvent.type(screen.getByLabelText(/email/i), "ada@example.com");
    await userEvent.click(screen.getByRole("button", { name: /send reset link/i }));
    expect(api.requestPasswordReset).toHaveBeenCalledWith("ada@example.com");
    expect(await screen.findByRole("status")).toHaveTextContent(/reset link has been sent/i);
  });

  test("is linked from the login page", () => {
    renderWithProviders(<Tree />, { initialEntries: ["/login"] });
    expect(screen.getByRole("link", { name: /forgot password/i })).toHaveAttribute(
      "href",
      "/forgot-password"
    );
  });
});

describe("ResetPassword", () => {
  beforeEach(() => vi.clearAllMocks());

  test("sends the token from the URL and lands on login with a notice", async () => {
    api.resetPassword.mockResolvedValueOnce({ success: true });
    renderWithProviders(<Tree />, { initialEntries: ["/reset-password/abc123"] });
    await userEvent.type(screen.getByLabelText(/^new password/i), "newpass1");
    await userEvent.type(screen.getByLabelText(/confirm new password/i), "newpass1");
    await userEvent.click(screen.getByRole("button", { name: /set new password/i }));
    expect(api.resetPassword).toHaveBeenCalledWith("abc123", "newpass1", "newpass1");
    expect(await screen.findByRole("status")).toHaveTextContent(/password updated/i);
  });

  test("shows an expired-token error with a link to request another", async () => {
    api.resetPassword.mockRejectedValueOnce({
      response: { status: 400, data: { token: "This reset link is invalid or has expired" } }
    });
    renderWithProviders(<Tree />, { initialEntries: ["/reset-password/old"] });
    await userEvent.type(screen.getByLabelText(/^new password/i), "newpass1");
    await userEvent.type(screen.getByLabelText(/confirm new password/i), "newpass1");
    await userEvent.click(screen.getByRole("button", { name: /set new password/i }));
    expect(await screen.findByRole("alert")).toHaveTextContent(/invalid or has expired/i);
    expect(screen.getByRole("link", { name: /request a new link/i })).toHaveAttribute(
      "href",
      "/forgot-password"
    );
  });
});
