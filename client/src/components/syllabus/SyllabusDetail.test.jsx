import { describe, expect, test, vi } from "vitest";
import { screen } from "@testing-library/react";
import { Routes, Route } from "react-router-dom";

import SyllabusDetail from "./SyllabusDetail";
import { renderWithProviders } from "../../test/renderWithProviders";
import * as api from "../../api/syllabi";

vi.mock("../../api/syllabi", async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, getSyllabus: vi.fn() };
});

describe("SyllabusDetail", () => {
  test("renders filled sections and hides empty ones", async () => {
    api.getSyllabus.mockResolvedValueOnce({
      _id: "abc",
      title: "Databases 101",
      courseNumber: "CS 340",
      creditHours: 4,
      instructorName: "Ada Lovelace",
      gradingScale: "A 90+\nB 80+"
    });
    renderWithProviders(
      <Routes>
        <Route path="/syllabi/:id" element={<SyllabusDetail />} />
      </Routes>,
      { initialEntries: ["/syllabi/abc"] }
    );
    expect(await screen.findByRole("heading", { name: "Databases 101" })).toBeInTheDocument();
    expect(screen.getByText("CS 340 · 4 credit hours")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Instructor" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Materials and Grading" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Schedule" })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: /edit/i })).toHaveAttribute("href", "/syllabi/abc/edit");
  });

  test("shows a message when the syllabus is missing", async () => {
    api.getSyllabus.mockRejectedValueOnce({ response: { status: 404 } });
    renderWithProviders(
      <Routes>
        <Route path="/syllabi/:id" element={<SyllabusDetail />} />
      </Routes>,
      { initialEntries: ["/syllabi/zzz"] }
    );
    expect(await screen.findByRole("alert")).toHaveTextContent(/no longer exists/i);
  });
});
