# LAMP — Full-Stack Portfolio Project

A full-stack portfolio application built with a **React 19 + Vite** frontend and a **Flask** backend, backed by a Neon **PostgreSQL** database. The site hosts a portfolio of three interactive projects: a math game, an RSS/podcast feed reader, and a two-player online board game.

## Features

- **Math Game App** (`/mathApp`) — Timed arithmetic practice with `+`, `-`, `*`, `/` problems. Number range is configurable and high scores are saved per user in the database.
- **RSS Feed Reader** (`/rssFeed`) — A personalized feed/podcast aggregator. Users save RSS URLs, which are fetched and rendered through the rss2json API.
- **Russian Jiangi** (`/RussianJiangi`) — A real-time 2-player board game on a 3x3 grid where opponents stack matryoshka-doll pieces (small < medium < large) to claim three-in-a-row. Play online by creating/joining a game.
- **Auth** (`/signUp`, `/login`) — Username/password accounts with password hashing via Postgres `pgcrypto` (`crypt` / `gen_salt`).

## Tech Stack

| Layer      | Technology                                        |
| ---------- | ------------------------------------------------- |
| Frontend   | React 19, Vite 7, `react-router-dom`, `axios`, `styled-components`, `vite-plugin-neon-new` |
| Backend    | Flask 3, Flask-SQLAlchemy, Flask-Migrate, Flask-CORS |
| Database   | Neon PostgreSQL (`psycopg2`, pgcrypto for password hashing) |
| Deployment | Vercel (config in `vercel.json`)                  |

## Repository Layout

```
vite-project/
├── api/                 Flask backend (single-file app + migrations)
│   ├── app.py           Routes, SQLAlchemy models, game logic
│   ├── migrations/      Flask-Migrate / Alembic migrations
│   └── requirements.txt
├── frontend/            React 19 + Vite SPA
│   ├── src/
│   │   ├── App.jsx      Router setup (routes for all pages)
│   │   ├── main.jsx     Entry point
│   │   ├── pages/       index, MathGameApp, rssFeed, russianJiangi, login, signUp, about
│   │   ├── components/  NavBar, RSSReader, AccordionMenu, UtilityFunctions
│   │   └── styles/      Global and per-page CSS
│   ├── index.html
│   ├── package.json
│   └── vite.config.js   Dev proxy `/api` -> localhost:5000, Neon plugin
├── vercel.json          Service/rewrite config for frontend + backend
└── opencode.json        Editor/agent config (not part of the app)
```

> Note: `src/` at the project root and `my-app/` in the repo root are stale leftovers; the real frontend lives in `frontend/src/`.

## Prerequisites

- Node.js 18+ and npm
- Python 3.11+
- A Neon PostgreSQL database (the app uses a Neon endpoint)

## Getting Started

### 1. Frontend

```bash
cd frontend
npm install
npm run dev        # Vite dev server on http://localhost:5173
```

### 2. Backend

```bash
cd api
python -m venv venv
```

**Windows**

```powershell
cd api
venv\Scripts\activate
pip install -r requirements.txt
flask run
```

**macOS / Linux**

```bash
cd api
source venv/bin/activate
pip install -r requirements.txt
flask run
```

Or from the frontend directory on macOS/Linux: `npm run api`.

Vite proxies `/api/*` requests to `http://localhost:5000` in development, so the frontend calls APIs with relative URLs.

## Environment Variables

Both `.env` files are **gitignored** — do not commit real values.

**`api/.env`**

```
FLASK_APP=app.py
FLASK_ENV=development
DATABASE_URL=postgresql://<user>:<password>@<host>.neon.tech/neondb?sslmode=require&channel_binding=require
```

**`frontend/.env`**

```
DATABASE_URL=postgresql://<user>:<password>@<host>-pooler.neon.tech/neondb?channel_binding=require&sslmode=require
DATABASE_URL_DIRECT=postgresql://<user>:<password>@<host>.neon.tech/neondb?channel_binding=require&sslmode=require
VITE_POSTGRES_CLAIM_URL=<neon.new claim link>
```

The `DATABASE_URL`, `DATABASE_URL_DIRECT`, and `VITE_POSTGRES_CLAIM_URL` values are provided when you claim a Neon database via `vite-plugin-neon-new`.

## API Endpoints

All `POST` endpoints read **form-encoded** bodies (`request.form`); GET state endpoints return JSON.

| Method | Endpoint              | Form fields                   | Description                              |
| ------ | --------------------- | ----------------------------- | ---------------------------------------- |
| GET    | `/api/data`           | —                             | Simple sample data endpoint              |
| POST   | `/api/login`          | `username`, `password`        | Login (password compared via pgcrypto)   |
| POST   | `/api/signup`         | `username`, `password`        | Create a new user (rejects duplicates)   |
| POST   | `/api/get_score`      | `username`                    | Fetch a user's high score                |
| POST   | `/api/set_score`      | `username`, `high_score`      | Update a user's high score               |
| POST   | `/api/get_rss`        | `username`                    | List saved RSS feeds for a user          |
| POST   | `/api/set_rss`        | `username`, `rss_feed_url`, `rss_title` | Add/update a feed for a user |
| POST   | `/api/game/create`    | `username`                    | Create a game (returns `game_id`, role)  |
| POST   | `/api/game/join`      | `game_id`, `username`         | Join a waiting game as player 2          |
| GET    | `/api/game/state/<int:game_id>` | —                      | Poll current game state                  |
| POST   | `/api/game/move`      | `game_id`, `username`, `piece_id`, `x`, `y` | Make a move (validates turn + stacking) |

## Data Model

Defined in `api/app.py`:

- **`users_template`** — `username` (PK), `password` (pgcrypto hash), `high_score`.
- **`rss_feeds`** — `id` (PK), `username`, `rss_url`, `rss_title`.
- **`Game`** — `id` (PK), `player1_username`, `player2_username`, `state_pieces` (JSON), `current_player`, `winner`, `status` (`waiting`/`active`/`finished`), `created_at`.

Schema changes go through Flask-Migrate: from `api/`, run `flask db migrate` then `flask db upgrade`.

## Useful Commands (from `frontend/`)

| Command            | Description                              |
| ------------------ | ---------------------------------------- |
| `npm run dev`      | Start the Vite dev server                |
| `npm run build`    | Build the frontend for production        |
| `npm run preview`  | Preview the production build locally     |
| `npm run lint`     | Run ESLint on frontend source            |

There is currently **no automated test suite**; `npm run build` and `npm run lint` are the main checks.

## Notes & Gotchas

- The database is **PostgreSQL, not SQLite** — anything that swaps in SQLite will break the pgcrypto-based password hashing.
- `Game.state_pieces` is a SQLAlchemy `JSON` column and in-place mutations are **not persisted**. `make_move` deep-copies the list (`copy.deepcopy(game.state_pieces)`) before editing a piece. Doing `list(game.state_pieces)` instead silently misses SQLAlchemy's change detection: the piece is mutated in place, the reassigned list compares equal to the loaded value, and the placement is never written (turns advance but pieces never render online). See `api/app.py`.
- Game updates use **polling** on `/api/game/state/:id` — there are no websockets or SSE.
- Keep `vite-plugin-neon-new` wired in `vite.config.js`; removing it breaks the Neon piece of the dev setup.
- Vercel deployment is split into two services (`frontend/` and `api/`) with `/api/*` rewrites, see `vercel.json`.