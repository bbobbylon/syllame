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
| Hosting  | Render (`render.yaml`) + MongoDB Atlas                            |

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
├── models/              # Mongoose schemas: user.js, syllabus.js
├── routes/api/          # users.js (auth) and syllabi.js (CRUD)
├── validation/          # Server-side form validation
├── scripts/seed.js      # Loads test users and syllabi
├── test/                # Server tests (node --test)
├── .env.example         # Template for your local .env
├── render.yaml          # Render deployment blueprint
├── Dockerfile           # Two-stage image: build client, run server
├── compose.yml          # App + MongoDB for one-command local runs
└── client/              # React app (Vite)
    ├── index.html
    ├── vite.config.js   # Dev proxy (/api -> :5000), build, and Vitest settings
    └── src/
        ├── main.jsx     # Mounts React, restores login from localStorage
        ├── App.jsx      # Routes
        ├── store.js     # Redux store (Redux Toolkit configureStore)
        ├── actions/     # Auth thunks that call the API
        ├── reducers/    # auth and errors slices
        ├── api/         # Plain axios helpers for syllabus endpoints
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

### Seed test data

Instead of registering by hand, load two test accounts and four syllabi:

```bash
npm run seed            # adds or refreshes the seed data
npm run seed -- --wipe  # empties users and syllabi first, then seeds
```

| Email               | Password      | Syllabi |
| ------------------- | ------------- | ------- |
| `alice@example.com` | `Password123` | 3       |
| `bob@example.com`   | `Password123` | 1       |

Log in as Alice to see a full syllabus (Introduction to Databases) on the
detail and print pages; log in as Bob to confirm users only see their own.
Running the script again replaces the seed users' data rather than
duplicating it. It refuses to run when `NODE_ENV=production` unless you pass
`--force`, since the passwords are public.

MongoDB has no SQL files to import; the seed script is the equivalent. It has
to be code rather than a data file because passwords are stored as bcrypt
hashes, which a plain `mongoimport` cannot produce.

### Docker (no local Node or MongoDB needed)

If you have Docker Desktop, the whole stack runs with one command:

```bash
docker compose up --build                          # app on http://localhost:5000
docker compose run --rm app node scripts/seed.js --force   # load the test accounts
docker compose down                                # stop; add -v to delete the database
```

`compose.yml` starts a MongoDB container and the app container, wired
together by name, so no `.env` file is needed. The `--force` on the seed
command is required because the container runs with `NODE_ENV=production`.
Change `JWT_SECRET` in `compose.yml` before exposing this to anyone else.

The `Dockerfile` is a two-stage build: stage one compiles the React client,
stage two copies only the server code and the compiled client onto a small
Node image and runs as a non-root user. CI builds the image and boots the
compose stack on every push, so the files are verified even though they are
not needed for the Render deployment.

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
| `npm run seed`       | Loads test accounts and syllabi (see Seed test data)           |
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

Server tests come in two flavours:

- **No database needed** (`validation.test.js`, `syllabus-validation.test.js`,
  `api.test.js`): pure functions plus HTTP calls that finish before any query
  (validation 400s, 401s, security headers, rate limiting).
- **Database-backed** (`db.test.js`): register, log in, then create / list /
  read / update / delete syllabi and prove one user cannot touch another's.
  It runs only when `MONGO_URI` is set. Each test file uses its own database
  named after the one in the URI (`..._api`, `..._seed`) and **drops it
  afterwards**, so point it at a scratch server:

  ```bash
  MONGO_URI=mongodb://127.0.0.1:27017/syllame_test npm test
  ```

  CI starts a temporary MongoDB container so this suite always runs there.

---

## API reference

All responses are JSON. Validation failures return `400` with a
`{ field: "message" }` object the forms display inline.

| Method | Path                   | Auth   | Purpose                                   |
| ------ | ---------------------- | ------ | ----------------------------------------- |
| POST   | `/api/users/register`  | none   | Create an account. Returns the user (no hash). |
| POST   | `/api/users/login`     | none   | Returns `{ token: "Bearer ..." }`; any failure is `401` with one generic message |
| GET    | `/api/users/current`   | Bearer | The user the token belongs to             |
| GET    | `/api/syllabi`         | Bearer | My syllabi, most recently updated first   |
| POST   | `/api/syllabi`         | Bearer | Create a syllabus                         |
| GET    | `/api/syllabi/:id`     | Bearer | One of my syllabi (`404` if not mine)     |
| PUT    | `/api/syllabi/:id`     | Bearer | Update one of my syllabi                  |
| DELETE | `/api/syllabi/:id`     | Bearer | Delete one of my syllabi (`204`)          |
| GET    | `/api/health`          | none   | `{ status: "ok" }` for uptime checks      |

Send the token as `Authorization: Bearer <token>`; the client does this
automatically after login. Login and register are rate limited to 20 attempts
per IP per 15 minutes (`429` afterwards).

### Pages

| URL                  | What it shows                                        |
| -------------------- | ---------------------------------------------------- |
| `/`                  | Landing page                                         |
| `/register`, `/login`| Auth forms                                           |
| `/dashboard`         | Greeting, quick actions, recently updated syllabi    |
| `/syllabi`           | My syllabi with edit / delete                        |
| `/syllabi/new`       | Create form                                          |
| `/syllabi/:id`       | Print-friendly view; "Print / PDF" uses the browser  |
| `/syllabi/:id/edit`  | Edit form                                            |

The 1.0 URLs `/createSyllabus` and `/viewSyllabus` redirect to the new pages.

---

## Production build and run

```bash
npm run build                      # -> client/dist
NODE_ENV=production npm start      # Express serves API + static client on $PORT
```

In production mode Express serves `client/dist` and sends every non-`/api`
URL to `index.html` so React Router can handle deep links like `/dashboard`.

---

## Deployment: Render + MongoDB Atlas

The app is one Node process plus a MongoDB connection. In production Express
serves both the API and the compiled React app, so a single Render **Web
Service** and a free Atlas cluster are all you need. Total cost on the free
tiers: $0.

```
Browser  ──HTTPS──▶  Render web service (Express: /api/* + client/dist)  ──▶  MongoDB Atlas
```

### Step 1: MongoDB Atlas (the database)

1. Sign in at <https://cloud.mongodb.com> and create a free **M0** cluster.
2. **Database Access** -> Add New Database User. Choose password auth, give it
   read/write to any database, and save the password somewhere safe. Do not
   reuse the old committed one.
3. **Network Access** -> Add IP Address. Render's outbound IP addresses are
   listed on your service page under "Connect" once it exists; add those. While
   testing, `0.0.0.0/0` (allow from anywhere) is acceptable, but tighten it
   afterwards.
4. **Connect** -> Drivers -> copy the connection string. It looks like
   `mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/syllame?retryWrites=true&w=majority`.
   Put your real password in and set the database name (`syllame`) before the `?`.

### Step 2: Render (the server) via Blueprint, recommended

`render.yaml` in the repo root already describes the service: build and start
commands, health check, Node version and environment variables.

1. Sign in at <https://dashboard.render.com>, **New** -> **Blueprint**.
2. Connect your GitHub account if asked and pick `bbobbylon/syllame`.
   Render reads `render.yaml` from the branch you select.
3. Render shows the service it will create and asks for the one value the
   file does not contain: paste your Atlas connection string as `MONGO_URI`.
   `JWT_SECRET` is generated for you.
4. Click **Apply**. The first build takes a few minutes: `npm install`,
   `npm run build`, then `npm start`.
5. When the deploy is live, open `https://<your-service>.onrender.com/api/health`.
   You should see `{"status":"ok",...}`. Then open the root URL and register
   a user.

### Step 2 (alternative): Render manually

If you prefer clicking through the dashboard, **New** -> **Web Service**,
pick the repo, and enter:

| Setting            | Value                             |
| ------------------ | --------------------------------- |
| Runtime            | Node                              |
| Build command      | `npm install && npm run build`    |
| Start command      | `npm start`                       |
| Health check path  | `/api/health`                     |
| Instance type      | Free                              |

Environment variables: `NODE_ENV=production`, `NODE_VERSION=22.22.2`,
`MONGO_URI=<your Atlas string>`, `JWT_SECRET=<long random string>`.
Do not set `PORT`; Render injects it and `config/env.js` reads it.

### Things that bite people

- **Dev dependencies under `NODE_ENV=production`.** npm skips
  `devDependencies` when that variable is set, which would leave the client
  without Vite and make the build fail with `vite: not found`. The root
  `postinstall` script passes `--include=dev` to the client install so the
  build works regardless. If you ever change that script, keep the flag.
- **Free tier sleeps.** After about 15 minutes with no traffic Render spins the
  service down. The next request takes 30 to 60 seconds while it wakes. Paid
  instances stay warm.
- **Atlas network access.** `MongoServerSelectionError` or a 5-second
  connection timeout in the Render logs almost always means Render's IP is not
  allowed in Atlas, or the password in `MONGO_URI` is wrong.
- **Auto-deploy.** Render redeploys on every push to the connected branch by
  default. Together with the CI workflow below, the flow is: push, GitHub runs
  tests, Render rebuilds. Note that Render does not wait for CI to pass; if you
  want that gate, turn off auto-deploy and use a deploy hook from the workflow.
- **Other hosts.** Railway, Fly.io and Heroku work with the same build and
  start commands and the same three environment variables. Only `render.yaml`
  is Render-specific.

---

## Continuous integration

`.github/workflows/ci.yml` runs on every push and pull request:

- **Server job**: `npm ci`, `npm test`.
- **Client job**: `npm ci`, `npm run lint`, `npm test`, `npm run build`, and
  uploads `client/dist` as a downloadable artifact.
- **Docker job**: builds the image, starts the compose stack, checks
  `/api/health`, and runs the seed script inside the container.

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
| Hardening | none | `helmet` (CSP and friends), `express-rate-limit` on auth routes | The CSP explicitly allows the Materialize CDN and Google Fonts that `index.html` loads; everything else is same-origin only. |
| Syllabi | Form posted to a route that did not exist | `Syllabus` model + owner-scoped CRUD API + list / edit / print pages | The app's actual purpose now works end to end. |
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
