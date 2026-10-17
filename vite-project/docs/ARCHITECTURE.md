# Architecture

How the LAMP frontend and backend fit together.

## High level

```
Browser (React 19 SPA)
   │  fetch/axios, relative /api/... URLs
   ▼
Vite dev server :5173 ── proxy /api/* ──▶ Flask :5000 ──▶ Neon PostgreSQL
                                            │
                                            ├── youtube-transcript-api, YouTube oEmbed
                                            └── (RSS content is fetched client-side
                                                via api.rss2json.com)
```

- **Frontend**: `vite-project/frontend/` — React 19 + Vite 7 SPA, `react-router-dom` v7.
- **Backend**: `vite-project/api/` — Flask 3, single-file `app.py` (routes + models + game/YouTube logic), Flask-SQLAlchemy, Flask-Migrate, Flask-CORS.
- **Database**: Neon **PostgreSQL** (never SQLite — password hashing uses the Postgres `pgcrypto` extension: `func.crypt` / `func.gen_salt`).
- **Deployment**: Vercel, two services (`frontend/` and `api/`) wired by `vercel.json` with `/api/*` rewrites. Because routing into a service is final, the frontend's SPA fallback (`/(.*)` → `/index.html`) lives inside the `my_frontend` service in the top-level `vercel.json`, not only in `frontend/vercel.json`.

## Frontend

### Routing (`src/App.jsx`)

| Path | Page | File |
|------|------|------|
| `/` | Home | `pages/index.jsx` |
| `/mathApp` | Math game | `pages/MathGameApp.jsx` |
| `/rssFeed` | RSS/podcast reader | `pages/rssFeed.jsx` |
| `/RussianJiangi` | Board game | `pages/russianJiangi.jsx` |
| `/youtubeGuide` | YouTube guide generator | `pages/youtubeGuide.jsx` |
| `/about` | About | `pages/about.jsx` |
| `/signUp` | Sign up | `pages/signUp.jsx` |
| `/login` | Log in | `pages/login.jsx` |

Unrouted/legacy: `pages/apiTest.jsx`, `pages/gameLogic.js` (pure helpers not currently imported).

### State management

No global store (no Redux/Zustand/Context). State is local `useState`/`useEffect`, plus **`localStorage`** for:

- Auth: `loggedIn`, `username` (set by login/signup pages; read by `NavBar` and pages that need the user).
- Math game settings/high score: `min`, `max`, `highScore`.

### HTTP calls

- Most `/api/*` calls use native `fetch` with **form-encoded** bodies (`URLSearchParams`), matching the backend's `request.form`.
- `axios` is used only in the RSS feature (`components/RSSReader/RSSFetch.jsx` and `pages/rssFeed.jsx`) — for the external rss2json API and for saving/loading feed URLs.

### Dev proxy

`vite.config.js` proxies `/api` → `http://localhost:5000` in development, so frontend code always uses relative URLs. The config also wires `vite-plugin-neon-new` (referrer `github:/HBSocrates/LAMP`) — **do not remove the plugin**; the Neon dev-database flow depends on it.

## Backend (`api/app.py`)

Single-file layout:

1. App/config setup — CORS open, `DATABASE_URL` from env, SQLAlchemy + Migrate init.
2. Models: `users_template`, `rss_feeds`, `Game` (see [Data model](#data-model)).
3. Game logic helpers — `get_size_value`, `get_top_piece_at_position`, `check_winner`, `is_valid_placement`.
4. Routes — see [API.md](API.md).
5. YouTube helpers — `extract_video_id`, `fetch_youtube_title`, `fetch_youtube_transcript`, `format_timestamp`, `build_step_guide`, and the `/api/youtube/guide` route.

### Auth model (important caveat)

There are **no server-side sessions, cookies, or tokens**. `/api/login` verifies the password via pgcrypto and returns a success message; the frontend then sets `localStorage.loggedIn = "true"`. Higher-risk endpoints (game create/join/move, score/RSS updates) simply trust the `username` field in the request. This is fine for a portfolio project but is not real authentication.

### Data model

- **`users_template`** — `username` (String(100), **PK**), `password` (String(120), pgcrypto hash), `high_score` (Integer, default 0).
- **`rss_feeds`** — `id` (Integer PK), `username` (String(100)), `rss_url` (String(300)), `rss_title` (String(200), nullable).
- **`Game`** — `id` (PK), `player1_username`, `player2_username` (nullable), `state_pieces` (**JSON**, non-null), `current_player` (`player1`/`player2`), `winner` (username or null), `status` (`waiting`/`active`/`finished`), `created_at`.

Migrations live in `api/migrations/` (Flask-Migrate/Alembic).

## Data-flow deep dives

### Auth flow

1. `signUp.jsx` / `login.jsx` POST form-encoded `username` + `password` to `/api/signup` / `/api/login`.
2. On success the page sets `localStorage.loggedIn` and `localStorage.username`.
3. `NavBar` re-reads `localStorage.loggedIn` to switch between logged-in and guest menus. No revalidation against the server ever happens.

### Math game flow (`MathGameApp.jsx`)

- Problems generated client-side from operands in `src/mathOperands.js`; min/max range persisted to `localStorage`.
- High score kept locally, and if logged in, synced via `POST /api/get_score` (on load) and `POST /api/set_score` (on new record).

### RSS flow (`pages/rssFeed.jsx`, `components/RSSReader/`)

Two separate concerns:

1. **Feed content** — fetched client-side from the external **rss2json** proxy (`https://api.rss2json.com/v1/api.json`, API key hardcoded in `RSSFetch.jsx` and `rssFeed.jsx`). `RSSFetch.jsx` implements a hand-rolled Suspense "suspender" (`read()` throws the promise until resolved), consumed via `<Suspense>` in `rssFeed.jsx`. `RSSReader.jsx` renders podcast cards with `<audio>` players and paginates at 51 items/page.
2. **Saved feed URLs** — persisted per user in Postgres via `POST /api/get_rss` and `POST /api/set_rss`. `RSSMenu.jsx` lists saved feeds; selecting one sets the current URL. Before saving, the page resolves the feed title through rss2json.

The backend never fetches RSS itself.

### Game flow (`pages/russianJiangi.jsx` + game endpoints)

Game: 3×3 board, 6 matryoshka pieces per player (small < medium < large). A piece may only be placed on an empty cell or on a strictly smaller piece. Three "top" pieces in a row win.

Client modes: **vs AI** (pure client-side `getAiMove`), **two-player local** (hotseat), and **online**.

Online flow:

1. **Create**: `POST /api/game/create` (form: `username`) → `{game_id, player_role: "player1"}`, status `waiting`.
2. **Join**: `POST /api/game/join` (form: `game_id`, `username`) → `{game_id, player_role: "player2"}`, status flips to `active`.
3. **Poll**: a `useEffect` runs `setInterval(syncGameState, 1500)` while in online mode with a `game_id`. `syncGameState` GETs `/api/game/state/:id`, de-dupes with `lastSyncRef` (JSON compare), and promotes `waiting → active` when player 2 joins. **Polling only — no websockets or SSE.**
4. **Move**: on piece drop, the client POSTs `/api/game/move` (form: `game_id`, `username`, `piece_id`, `x`, `y`), optimistically renders, then replaces state with the server response — or reverts and alerts on rejection.
5. Server `normalizeServerPieces` (client) converts board coords to pixel positions for rendering.

Game state is **authoritative on the server** for online play; the client AI mode never touches the API.

### YouTube guide flow (`pages/youtubeGuide.jsx`)

1. User pastes a YouTube URL; the page POSTs form-encoded `url` to `/api/youtube/guide`.
2. Backend extracts the video ID, fetches the transcript and oEmbed title, groups transcript segments into timestamped steps (`build_step_guide`: ~80-word steps, split on >3 s gaps), and returns `{video_id, title, url, steps, transcript}`.
3. Page renders the step list; shows a warning banner when deployed on `vercel.app` domains (YouTube may block server-side transcript fetches from cloud IPs).

## Known gotchas

- **Postgres only** — pgcrypto hashing (`func.crypt`/`func.gen_salt`) breaks on SQLite or anything without the extension.
- **Form-encoded bodies** — all `POST` endpoints read `request.form`, not JSON. Keep payload types matching the callers in `frontend/src/pages/`.
- **`Game.state_pieces` JSON mutation** — SQLAlchemy does not track in-place mutation of JSON columns. `make_move` must `copy.deepcopy(game.state_pieces)` before editing a piece. Using `list(game.state_pieces)` instead shares the inner dicts with the already-loaded value, so the reassigned list compares equal, the column is never saved, and moves silently don't persist (turn advances, pieces never update for the opponent).
- **Polling, not real-time** — game updates poll `/api/game/state/:id` every 1.5 s; don't invent websockets/SSE without redesigning both ends.
- **`set_rss` first-insert bug** — the first feed for a user is inserted with hardcoded `id=1`, which will collide across users (known limitation).
- **`login` with unknown user** — indexes into the user list and can 500 instead of returning "Invalid credentials".
- **No server-side auth** — endpoints trust the client-supplied `username`.
- **`vite-plugin-neon-new`** must stay wired in `vite.config.js`.
- **No test suite** — `npm run build` and `npm run lint` are the only automated checks.
