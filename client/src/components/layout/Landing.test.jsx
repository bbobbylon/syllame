import { describe, expect, test } from "vitest";
import { screen } from "@testing-library/react";

import Landing from "./Landing";
import { renderWithProviders } from "../../test/renderWithProviders";

describe("Landing", () => {
  test("offers register and login links", () => {
    renderWithProviders(<Landing />);
    expect(screen.getByRole("link", { name: /register/i })).toHaveAttribute("href", "/register");
    expect(screen.getByRole("link", { name: /log in/i })).toHaveAttribute("href", "/login");
  });
});
