# SyllaMe

A MERN-stack web app for building course syllabi. Instructors register, log in,
and fill out a syllabus form.

Authors: Robert C. Oliver Jr. and Colin J. McClintic

| Layer    | Technology                                                        |
| -------- | ----------------------------------------------------------------- |
| Client   | React 19, React Router 7, Redux Toolkit, Vite 8, Materialize CSS  |
| Server   | Node 22, Express 5, Passport (JWT), bcryptjs                      |
| Database | MongoDB via Mongoose 9                                            |
| Tests    | Node's built-in test runner (server), Vitest + Testing Library (client) |
| CI       | GitHub Actions (`.github/workflows/ci.yml`)                       |

> **Upgrading from the 2021 version?** Read [What changed in 2.0](#what-changed-in-20-and-why)
> and [IMPROVEMENTS.md](IMPROVEMENTS.md). One action is urgent: rotate the MongoDB
> Atlas password and pick a new JWT secret, because the old ones were committed to git.

---

## Project layout

```
syllame/
├── server.js            # Entry point: connects to MongoDB, starts Express
├── app.js               # Builds the Express app (importable by tests)
├── config/
│   ├── env.js           # Reads and validates environment variables
│   └── passport.js      # JWT strategy: turns a Bearer token into req.user
├── models/user.js       # Mongoose User schema
├── routes/api/users.js  # POST /register, POST /login, GET /current
├── validation/          # Server-side form validation
├── test/                # Server tests (node --test)
├── .env.example         # Template for your local .env
└── client/              # React app (Vite)
    ├── index.html
    ├── vite.config.js   # Dev proxy (/api -> :5000), build, and Vitest settings
    └── src/
        ├── main.jsx     # Mounts React, restores login from localStorage
        ├── App.jsx      # Routes
        ├── store.js     # Redux store (Redux Toolkit configureStore)
        ├── actions/     # Thunks that call the API
        ├── reducers/    # auth and errors slices
        └── components/  # Pages and shared UI
```

Analogy for the two-package layout: the root is the restaurant kitchen (API and
database access), `client/` is the dining room (what the customer sees). In
development they run as two processes; in production Express serves the built
dining room from the kitchen on one port.

---

## Prerequisites

- **Node.js 22.12 or newer** (`.nvmrc` pins 22; `nvm use` picks it up).
  Vite 8, Vitest 5 and jsdom 30 all require at least 22.12.
- **npm 10+** (ships with Node 22).
- **MongoDB**: either a local server (`mongod`) or a free
  [MongoDB Atlas](https://www.mongodb.com/atlas) cluster.

---

## Local development

```bash
git clone https://github.com/bbobbylon/syllame.git
cd syllame

# 1. Install server deps; the postinstall hook also installs client deps.
npm install

# 2. Create your local config from the template and edit it.
cp .env.example .env
#    - MONGO_URI: your local or Atlas connection string
#    - JWT_SECRET: any long random string, e.g.
#      node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"

# 3. Run API (port 5000, nodemon) and client (port 3000, Vite) together.
npm run dev
```

Open <http://localhost:3000>. The Vite dev server proxies every `/api/*`
request to `http://localhost:5000`, so the browser only ever talks to one
origin and no CORS setup is needed.

Run either side alone with `npm run server` or `npm run client`.

### Environment variables

| Variable         | Required | Default       | Purpose                                              |
| ---------------- | -------- | ------------- | ---------------------------------------------------- |
| `MONGO_URI`      | yes      |               | MongoDB connection string                            |
| `JWT_SECRET`     | yes      |               | Signs login tokens. Long and random. Never commit it |
| `JWT_EXPIRES_IN` | no       | `86400` (1 d) | Token lifetime in seconds                            |
| `PORT`           | no       | `5000`        | API port. Hosting platforms set this for you         |
| `NODE_ENV`       | no       | `development` | `production` makes Express serve `client/dist`       |

The server refuses to start, with a message naming the variable, if a required
one is missing. That is deliberate: a misconfigured server that half-works is
harder to debug than one that tells you what is wrong.

---

## Scripts

Root (`/`):

| Command              | What it does                                                   |
| -------------------- | -------------------------------------------------------------- |
| `npm run dev`        | API + client with hot reload                                   |
| `npm run server`     | API only, restarts on file change (nodemon)                    |
| `npm run client`     | Client only (Vite dev server)                                  |
| `npm start`          | API in production mode (no reload). Serves `client/dist` when `NODE_ENV=production` |
| `npm run build`      | Builds the client into `client/dist`                           |
| `npm test`           | Server tests                                                   |
| `npm run test:client`| Client tests                                                   |
| `npm run test:all`   | Both                                                           |

Client (`/client`): `npm run dev`, `npm run build`, `npm run preview`,
`npm run lint`, `npm test`, `npm run test:watch`.

---

## Testing

```bash
npm test               # server: validation + HTTP tests, no MongoDB needed
cd client && npm test  # client: reducers, routing guard, forms (jsdom)
```

The server tests start the real Express app on a random port and only hit
paths that finish before a database query (validation 400s, health check, JWT
rejection). That keeps CI simple. Tests that need a database are a listed
improvement.

---

## Production build and run

```bash
npm run build                      # -> client/dist
NODE_ENV=production npm start      # Express serves API + static client on $PORT
```

In production mode Express serves `client/dist` and sends every non-`/api`
URL to `index.html` so React Router can handle deep links like `/dashboard`.

---

## Deployment (cloud)

The app is one Node process plus a MongoDB connection, so any Node host works.
The steps below are the same on Render, Railway, Fly.io or Heroku; the only
difference is where you click.

1. **Database**: create a MongoDB Atlas cluster, add a database user, allow
   network access from your host (or `0.0.0.0/0` while testing), and copy the
   connection string.
2. **Create a Web Service** from this GitHub repo.
3. **Build command**: `npm install && npm run build`
   (`npm install` triggers the root `postinstall`, which installs the client.)
4. **Start command**: `npm start`
5. **Environment variables**: set `MONGO_URI`, `JWT_SECRET`, and
   `NODE_ENV=production`. Do not set `PORT`; the platform injects it.
6. Deploy. Visit `/api/health` to confirm the API is up.

Notes:

- Heroku's old `heroku-postbuild` script was removed; the `postinstall` +
  `build` pair above is portable across hosts. If you do use Heroku, its
  Node buildpack runs `npm install` then `npm run build` automatically.
- For automatic deploys, most hosts let you enable "deploy on push to
  `master`". Combined with the CI workflow below, that gives you: push,
  tests run, green build deploys.

---

## Continuous integration

`.github/workflows/ci.yml` runs on every push and pull request:

- **Server job**: `npm ci`, `npm test`.
- **Client job**: `npm ci`, `npm run lint`, `npm test`, `npm run build`, and
  uploads `client/dist` as a downloadable artifact.

Both jobs use the Node version in `.nvmrc`, so CI and your laptop agree.

---

## What changed in 2.0 and why

Every dependency was 5+ years old. The upgrade path chosen for each, and the
alternatives that were rejected:

| Area | Before | After | Why this and not the alternative |
| ---- | ------ | ----- | -------------------------------- |
| Build tool | Create React App 4 | Vite 8 | CRA was officially deprecated in Feb 2025 and its last release (5.0.1) drags in dozens of audit warnings. Upgrading to CRA 5 would have been a lateral move onto another dead tool. Vite is the React team's recommended non-framework option and starts in well under a second. |
| React | 17 | 19 | 19 is current. Class components still work in 19, but **string refs** (`ref="creditHours"` in the syllabus form) were removed, and `componentWillReceiveProps` has warned since 16.3. Converting the eight small components to hooks removed both issues and is what new React code looks like. |
| Routing | react-router-dom 5 | 7 | v5 is unmaintained. v6/v7 replace `Switch` with `Routes`, `component=` with `element=`, and drop the `history` prop and `withRouter` in favor of `useNavigate()`. That alone required touching every page, which is why the hooks rewrite happened at the same time rather than as a second pass. v7 in library mode has the same API as v6, so there was no reason to stop at 6. |
| State | redux 4 + redux-thunk + manual `compose` | Redux Toolkit 2 (`configureStore`) | Redux 5 marks plain `createStore` deprecated. `configureStore` does exactly what the old 10 lines did (combine reducers, add thunk, wire DevTools). The hand-written reducers and action creators were kept so the code still reads like classic Redux. |
| JWT decode | jwt-decode 3 (default export) | 4 (`import { jwtDecode }`) | Only API change is the named export. |
| HTTP | axios 0.21 | 1.x | Same API; 0.21 has known vulnerabilities. |
| Server | Express 4 + body-parser | Express 5 | Express 5 is the default `latest` since 2025. Two changes affected this code: `express.json()`/`urlencoded()` are built in, and the `'*'` catch-all is now `/{*splat}`. Bonus: rejected promises in async handlers reach the error middleware automatically instead of hanging the request. |
| ODM | Mongoose 5 | Mongoose 9 | The `useNewUrlParser`/`useUnifiedTopology` flags are gone (they became the only behavior). Queries are `await`ed instead of chained `.then`. Requires Node 20.19+. |
| Auth libs | passport 0.4, jsonwebtoken 8, bcryptjs 2 | 0.7, 9, 3 | No API changes for how this app uses them; the majors fix security issues. |
| Secrets | Hard-coded in `config/keys.js` | Environment variables via `dotenv` | See the warning at the top of this file. |
| Tests | One CRA placeholder that could never pass | 12 server + 14 client tests | The old test looked for "learn react" text that did not exist. |
| Repo | `node_modules` committed (46,833 files) | Ignored | Dependencies are reproducible from the lockfiles; committing them bloats every clone and diff. |

Node 22 is required because Vite 8 (`^20.19 || >=22.12`), Vitest 5
(`^22.12 || ^24 || >=26`) and jsdom 30 (`^22.22 || ^24.15 || >=26`) all
demand it; `engines` in both `package.json` files enforce that.

---

## Troubleshooting

- **`Missing required environment variable MONGO_URI`**: you have no `.env`
  (or it is missing that key). `cp .env.example .env` and fill it in.
- **`Could not connect to MongoDB`** within 5 seconds: check the URI, that
  `mongod` is running, or that your IP is allowed in Atlas network access.
- **Register/login return "Could not reach the server"**: the API is not
  running on port 5000; start it with `npm run server`.
- **Old browser tab still logged in after upgrade**: tokens issued by the
  old server were signed with the old secret; log out and back in.
