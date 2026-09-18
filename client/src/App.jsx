/**
 * Top-level routing.
 *
 * React Router 7 (library mode) differences from v5 that this file reflects:
 *  - `<Switch>` became `<Routes>` and always picks the single best match.
 *  - Routes take `element={<Page />}` instead of `component={Page}`.
 *  - Guarding routes is done with a wrapper element (`<PrivateRoute>`) that
 *    renders `<Outlet />` for its children instead of a custom Route.
 */

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Navbar from "./components/layout/Navbar";
import Landing from "./components/layout/Landing";
import NotFound from "./components/layout/NotFound";
import Register from "./components/auth/Register";
import Login from "./components/auth/Login";
import PrivateRoute from "./components/privateroute/PrivateRoute";
import Dashboard from "./components/dashboard/Dashboard";
import SyllabusList from "./components/syllabus/SyllabusList";
import SyllabusForm from "./components/syllabus/SyllabusForm";
import SyllabusDetail from "./components/syllabus/SyllabusDetail";

/**
 * All routes, exported without a router so tests can mount them inside a
 * `MemoryRouter` at any starting URL.
 *
 * @returns {JSX.Element}
 */
export function AppRoutes() {
  return (
    <div className="App">
      <Navbar />
      <main className="page-content">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route element={<PrivateRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/syllabi" element={<SyllabusList />} />
            <Route path="/syllabi/new" element={<SyllabusForm />} />
            <Route path="/syllabi/:id" element={<SyllabusDetail />} />
            <Route path="/syllabi/:id/edit" element={<SyllabusForm />} />
            {/* Old URLs from 1.0 keep working. */}
            <Route path="/createSyllabus" element={<Navigate to="/syllabi/new" replace />} />
            <Route path="/viewSyllabus" element={<Navigate to="/syllabi" replace />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </div>
  );
}

/**
 * The real app: routes wrapped in a browser (URL-bar) router.
 *
 * @returns {JSX.Element}
 */
export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
