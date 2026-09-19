import { beforeEach, describe, expect, test, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import SyllabusList from "./SyllabusList";
import { renderWithProviders } from "../../test/renderWithProviders";
import * as api from "../../api/syllabi";

vi.mock("../../api/syllabi", async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, listSyllabi: vi.fn(), deleteSyllabus: vi.fn() };
});

const two = [
  { _id: "1", title: "Databases 101", courseNumber: "CS 340", instructorName: "Ada", updatedAt: "2026-09-01T00:00:00Z" },
  { _id: "2", title: "Compilers", updatedAt: "2026-08-01T00:00:00Z" }
];

describe("SyllabusList", () => {
  beforeEach(() => vi.clearAllMocks());

  test("renders each syllabus with view and edit links", async () => {
    api.listSyllabi.mockResolvedValueOnce(two);
    renderWithProviders(<SyllabusList />);
    expect(await screen.findByRole("link", { name: "Databases 101" })).toHaveAttribute("href", "/syllabi/1");
    expect(screen.getByRole("link", { name: /edit compilers/i })).toHaveAttribute("href", "/syllabi/2/edit");
    expect(screen.getByText(/CS 340 · Ada/)).toBeInTheDocument();
  });

  test("shows an empty state", async () => {
    api.listSyllabi.mockResolvedValueOnce([]);
    renderWithProviders(<SyllabusList />);
    expect(await screen.findByText(/not created any syllabi yet/i)).toBeInTheDocument();
  });

  test("deletes after confirmation", async () => {
    api.listSyllabi.mockResolvedValueOnce(two);
    api.deleteSyllabus.mockResolvedValueOnce();
    vi.spyOn(window, "confirm").mockReturnValueOnce(true);
    renderWithProviders(<SyllabusList />);
    await screen.findByRole("link", { name: "Compilers" });
    await userEvent.click(screen.getByRole("button", { name: /delete compilers/i }));
    expect(api.deleteSyllabus).toHaveBeenCalledWith("2");
    expect(screen.queryByRole("link", { name: "Compilers" })).not.toBeInTheDocument();
  });
});
