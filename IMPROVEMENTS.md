# Areas for improvement

Observations from reading and running the codebase during the 2.0 upgrade.
Items marked **fixed in 2.0** were addressed as part of the dependency work;
**fixed in 2.1** items were done in the follow-up enhancement pass on the same
branch. Everything else is left for you to prioritize. Rough effort: S (an hour), M (a day), L (multi-day).

## 1. Security

| # | Issue | Effort | Status |
| - | ----- | ------ | ------ |
| 1.1 | **Live MongoDB Atlas credentials and the JWT secret were committed** in `config/keys.js` and remain in git history for anyone who cloned the repo. Rotate the Atlas password for user `bob`, and use a new `JWT_SECRET` (which also invalidates every old token). Consider `git filter-repo` to scrub history if the repo is public. | S | Code fixed in 2.0; **rotation is on you** |
| 1.2 | The register endpoint returned the whole user document, including the bcrypt hash. | S | Fixed in 2.0 (`toJSON` transform strips it) |
| 1.3 | Login tokens lived for one year. A stolen token stayed valid for a year. Now defaults to one day via `JWT_EXPIRES_IN`. Consider refresh tokens if a day feels short. | S | Fixed in 2.0 |
| 1.4 | Login distinguishes "email not found" (404) from "wrong password" (400). That lets an attacker enumerate registered emails. A single generic "Invalid credentials" is the standard fix, but the current UI shows the two messages under different fields, so changing it means touching `Login.jsx` too. | S | Fixed in 2.1 (single 401 message; timing equalized with a dummy bcrypt compare) |
| 1.5 | No rate limiting on `/login` and `/register`, so password guessing is unthrottled. `express-rate-limit` is a 10-line addition. | S | Fixed in 2.1 (`express-rate-limit`, 20 / 15 min) |
| 1.6 | No `helmet` security headers, no CORS policy (fine while the client is same-origin; needed if you ever host them separately). | S | Fixed in 2.1 (`helmet` with CSP; CORS still unnecessary while same-origin) |
| 1.7 | The token is kept in `localStorage`, readable by any script on the page (XSS). An `httpOnly` cookie is safer but requires CSRF protection. Reasonable to defer for a class project. | M | Open |
| 1.8 | Email uniqueness was only checked in application code, so two simultaneous registrations could create duplicates. Added a unique index plus a duplicate-key handler. **Note:** if the existing `users` collection already contains duplicate emails, Mongoose will log an index-build error on startup; deduplicate first. | S | Fixed in 2.0 |

## 2. Functionality

| # | Issue | Effort | Status |
| - | ----- | ------ | ------ |
| 2.1 | **The core feature does not exist on the server.** `CreateSyllabus` posts to `/templates/add`, but there is no route, model or collection for syllabi. Nothing a user types is ever saved. Needed: a `Syllabus` Mongoose model with an `owner` (user id) field, and routes `POST /api/syllabi`, `GET /api/syllabi` (mine), `GET/PUT/DELETE /api/syllabi/:id`, all behind `passport.authenticate("jwt")`. | M | Fixed in 2.1 (`models/syllabus.js`, `routes/api/syllabi.js`) |
| 2.2 | `ViewSyllabus` is a static page with two buttons. Once 2.1 exists it should list the user's syllabi with edit/delete, and link to a read-only view. | M | Fixed in 2.1 (`SyllabusList`, `SyllabusDetail`) |
| 2.3 | The syllabus form's Submit button reloaded the page (no `onSubmit` on the `<form>`), the payload read a state key that did not exist (`courseCreditHours`), misspelled `meetimgTimes`, and omitted `courseSchedule`. | S | Fixed in 2.0 |
| 2.4 | The syllabus form posted to a hard-coded `http://localhost:5000`, which can never work in production. | S | Fixed in 2.0 (relative `/api/...`) |
| 2.5 | No way to export a syllabus. The obvious end goal of the app is a printable/PDF or `.docx` document. A print stylesheet is the cheapest first step; server-side PDF generation is the polished one. | M | Fixed in 2.1 (server-side PDF via pdfkit at `/api/syllabi/:id/pdf`, plus browser print) |
| 2.6 | No password reset, no email verification, no profile editing. | L | Partially: password reset by emailed link done (`nodemailer`, console fallback); email verification and profile editing still open |
| 2.7 | No server-side validation for syllabus fields (needs 2.1 first). | S | Fixed in 2.1 (`validation/syllabus.js`) |
| 2.8 | Network failures (server down) produced an unhandled promise rejection and a blank form. Now surfaced as "Could not reach the server." | S | Fixed in 2.0 |
| 2.9 | Dashboard crashed with `Cannot read properties of undefined (reading 'split')` if the token had no `firstname`. | S | Fixed in 2.0 |
| 2.10 | Tests that exercise real database paths (register then login round-trip). `mongodb-memory-server` runs a throwaway MongoDB inside the test process; it needs to download a binary once, which this sandbox could not do, so it is not wired up. | S | Fixed in 2.1 (`test/db.test.js`, runs in CI against a MongoDB container) |

## 3. UI / UX

| # | Issue | Effort | Status |
| - | ----- | ------ | ------ |
| 3.1 | `Navbar` wrapped itself in a second `<BrowserRouter>`. React Router 6+ throws on nested routers. | S | Fixed in 2.0 |
| 3.2 | The syllabus form used raw `<input>` and `<br>` elements outside Materialize's grid, so it looked unstyled next to the login/register pages and had no responsive layout. It now uses labelled fields, `textarea`s for long text, and Materialize's `browser-default` select, but it still deserves the same `input-field` card treatment as the auth pages, grouped into sections (Instructor, Course, Schedule, Grading). | S | Fixed in 2.1 (sectioned form on the Materialize grid) |
| 3.3 | No loading or success feedback anywhere. Login now disables the button and shows "Logging in..."; the syllabus form shows a status line. Register still gives no feedback between click and redirect. A toast library or Materialize's `M.toast` would unify this. | S | Fixed in 2.1 (register shows a saving state and a success notice on the login page) |
| 3.4 | The navbar has no links. Logged-in users should see Dashboard / Create / View / Logout in the bar instead of scattered buttons on each page; logged-out users should see Login / Register. That also removes the duplicated Logout buttons on three pages. | S | Fixed in 2.1 (auth-aware Navbar with mobile menu) |
| 3.5 | Buttons are positioned with inline `float` and `marginLeft`, which stack badly on phones. Use Materialize's grid (`row`/`col s12 m6`) or flexbox. | S | Fixed in 2.1 (grid columns, full-width buttons on phones) |
| 3.6 | No 404 page: an unknown URL renders only the navbar. Add `<Route path="*" element={<NotFound />} />`. | S | Fixed in 2.1 (`NotFound` route) |
| 3.7 | Materialize CSS 1.0.0 (2018) is unmaintained and loaded from a CDN, so the app breaks offline and pulls a third-party script at runtime. Options: install `@materializecss/materialize` (community fork) locally, or move to a maintained library such as MUI or Tailwind. Moving is a rewrite of every className, so treat it as its own project. | L | Mostly: Materialize is now the maintained 2.x fork, bundled locally with the icon font; no CDN. Moving to a different library remains a design choice |
| 3.8 | Accessibility: the Materialize floating labels work, but error text is not associated with inputs via `aria-describedby`, and the brand link in the navbar has no `aria-label`. | S | Partially: form errors linked via `aria-describedby` / `aria-invalid`; icon buttons labelled |
| 3.9 | The `index.html` still ships CRA's default `logo192.png`/`logo512.png` React logos and manifest. Replace with a SyllaMe icon. | S | Fixed in 2.1 (SVG icon + rendered PNGs, manifest updated) |
| 3.10 | No dark mode, no favicon beyond the CRA default, and the Dashboard greeting wraps the paragraph inside an `<h4>` (invalid HTML, since fixed). | S | Partially |

## 4. Code quality and tooling

| # | Issue | Effort | Status |
| - | ----- | ------ | ------ |
| 4.1 | `node_modules` (46,833 files) was committed. | S | Fixed in 2.0 |
| 4.2 | The root `package.json` listed every client dependency (React, Redux, react-scripts) as server dependencies. Now server-only. | S | Fixed in 2.0 |
| 4.3 | `models/user.js` assigned to an undeclared global (`module.exports = User = ...`). | S | Fixed in 2.0 |
| 4.4 | Fifteen near-identical `onChangeX` handlers in `CreateSyllabus`. Collapsed into one handler driven by a field list. | S | Fixed in 2.0 |
| 4.5 | No linter on the client after leaving CRA. Added ESLint 10 with the React Hooks rules. Consider Prettier for consistent formatting. | S | Fixed in 2.1 (ESLint + Prettier, both checked in CI) |
| 4.6 | TypeScript would catch the exact class of bugs found in 2.3 (`courseCreditHours` never existed). Vite supports it with zero config; migrate file by file. | M | Open |
| 4.7 | Redux Toolkit's `createSlice` would shrink `reducers/` + `actions/` by half and remove the string action types. Kept classic style in 2.0 so the code still matches the tutorial it came from. | S | Fixed in 2.1 (`client/src/store/*Slice.js`) |
| 4.8 | No `Dockerfile`/`compose.yml` for one-command local setup with MongoDB included. | S | Fixed in 2.1 (`Dockerfile`, `compose.yml`, verified by the CI docker job) |

## Suggested order (remaining)

1. Rotate the leaked credentials (1.1). Ten minutes, and it is the only item with real-world consequences today.
2. Configure `SMTP_URL` on Render so password-reset emails actually send (until then they only print to the server log).
3. Email verification and profile editing (rest of 2.6) once real users sign up.
4. TypeScript (4.6) and `httpOnly` cookie sessions (1.7) when the app grows beyond a class project.
5. Dark mode (3.10) and a full accessibility audit (3.8) as polish.
