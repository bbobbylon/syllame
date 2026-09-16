/**
 * Top-level routing.
 *
 * React Router 7 (library mode) differences from v5 that this file reflects:
 *  - `<Switch>` became `<Routes>` and always picks the single best match.
 *  - Routes take `element={<Page />}` instead of `component={Page}`.
 *  - Guarding routes is done with a wrapper element (`<PrivateRoute>`) that
 *    renders `<Outlet />` for its children instead of a custom Route.
 */

import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./components/layout/Navbar";
import Landing from "./components/layout/Landing";
import Register from "./components/auth/Register";
import Login from "./components/auth/Login";
import PrivateRoute from "./components/privateroute/PrivateRoute";
import Dashboard from "./components/dashboard/Dashboard";
import CreateSyllabus from "./components/createSyllabus/CreateSyllabus";
import ViewSyllabus from "./components/viewSyllabus/ViewSyllabus";

/**
 * Declares every page in the app. Public pages are listed first; everything
 * nested under `<PrivateRoute>` requires a valid login.
 *
 * @returns {JSX.Element}
 */
export default function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <Navbar />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route element={<PrivateRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/createSyllabus" element={<CreateSyllabus />} />
            <Route path="/viewSyllabus" element={<ViewSyllabus />} />
          </Route>
        </Routes>
      </div>
    </BrowserRouter>
  );
}
