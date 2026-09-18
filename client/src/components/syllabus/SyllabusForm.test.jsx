import { beforeEach, describe, expect, test, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Routes, Route } from "react-router-dom";

import SyllabusForm from "./SyllabusForm";
import { renderWithProviders } from "../../test/renderWithProviders";
import * as api from "../../api/syllabi";

vi.mock("../../api/syllabi", async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, createSyllabus: vi.fn(), updateSyllabus: vi.fn(), getSyllabus: vi.fn() };
});

/** Routes so the form can navigate to the detail page after saving. */
function Tree() {
  return (
    <Routes>
      <Route path="/syllabi/new" element={<SyllabusForm />} />
      <Route path="/syllabi/:id/edit" element={<SyllabusForm />} />
      <Route path="/syllabi/:id" element={<p>detail page</p>} />
    </Routes>
  );
}

describe("SyllabusForm", () => {
  beforeEach(() => vi.clearAllMocks());

  test("creates a syllabus and navigates to it", async () => {
    api.createSyllabus.mockResolvedValueOnce({ _id: "abc", title: "Databases 101" });
    renderWithProviders(<Tree />, { initialEntries: ["/syllabi/new"] });

    await userEvent.type(screen.getByLabelText(/course title/i), "Databases 101");
    await userEvent.selectOptions(screen.getByLabelText(/credit hours/i), "4");
    await userEvent.click(screen.getByRole("button", { name: /create syllabus/i }));

    expect(api.createSyllabus).toHaveBeenCalledWith(expect.objectContaining({ title: "Databases 101", creditHours: "4" }));
    expect(await screen.findByText("detail page")).toBeInTheDocument();
  });

  test("shows server field errors", async () => {
    api.createSyllabus.mockRejectedValueOnce({ response: { status: 400, data: { title: "Title is required" } } });
    renderWithProviders(<Tree />, { initialEntries: ["/syllabi/new"] });
    await userEvent.click(screen.getByRole("button", { name: /create syllabus/i }));
    expect(await screen.findByText("Title is required")).toBeInTheDocument();
    expect(screen.getByLabelText(/course title/i)).toHaveAttribute("aria-invalid", "true");
  });

  test("edit mode loads the existing syllabus and saves with PUT", async () => {
    api.getSyllabus.mockResolvedValueOnce({ _id: "abc", title: "Old title", creditHours: 2 });
    api.updateSyllabus.mockResolvedValueOnce({ _id: "abc" });
    renderWithProviders(<Tree />, { initialEntries: ["/syllabi/abc/edit"] });

    const title = await screen.findByDisplayValue("Old title");
    await userEvent.clear(title);
    await userEvent.type(title, "New title");
    await userEvent.click(screen.getByRole("button", { name: /save changes/i }));

    expect(api.updateSyllabus).toHaveBeenCalledWith("abc", expect.objectContaining({ title: "New title", creditHours: "2" }));
    expect(await screen.findByText("detail page")).toBeInTheDocument();
  });
});
