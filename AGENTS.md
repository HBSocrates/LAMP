# AGENTS.md

## Repo layout

- Git root is `LAMP/`, but the real project lives in `LAMP/vite-project/`.
- `frontend/` — React 19 + Vite SPA. Entry: `frontend/src/main.jsx`; routing/links in `frontend/src/App.jsx`; pages in `frontend/src/pages/`, shared UI in `frontend/src/components/`.
- `api/` — Flask 3 backend, **single-file** `api/app.py` (routes + SQLAlchemy models `users_template`, `rss_feeds`, `Game` all in one file).
- `LAMP/my-app/` and `LAMP/vite-project/src/` (empty) are stale leftovers — ignore them.
- `frontend/CLAUDE.md` documents commands/architecture; treat its paths as relative to `frontend/`.

## Commands

From `frontend/`:
- `npm run dev` — Vite on :5173, proxies `/api` → `http://localhost:5000`
- `npm run build`, `npm run lint` — only checks besides manual verification; there is **no test suite**
- `npm install` first if `node_modules` is missing

Backend:
- Needs `api/.env` (FLASK_APP, FLASK_ENV, DATABASE_URL). Start with `flask run` (port 5000).
- `npm run api` uses `venv/bin/flask`, so it only works on macOS/Linux. On Windows: `api\venv\Scripts\activate` then `flask run`.

Both `frontend/.env` (DATABASE_URL, DATABASE_URL_DIRECT, VITE_POSTGRES_CLAIM_URL) and `api/.env` are gitignored — never commit real values.

## Backend gotchas

- DB is Neon **PostgreSQL**, not SQLite. Password hashing calls Postgres `pgcrypto` (`func.crypt` / `func.gen_salt`); anything that swaps in SQLite breaks it.
- Most `/api/*` endpoints read `request.form` (form-encoded body), not JSON. Game state GET returns JSON. Keep payload types matching the callers in `frontend/src/pages/`.
- Schema changes: Flask-Migrate/Alembic in `api/migrations/` — run `flask db migrate` / `flask db upgrade` from `api/`.
- Server logging is `print(..., file=sys.stderr)`; Flask debug mode is disabled.
- `Game.state_pieces` is a SQLAlchemy `JSON` column and in-place dict mutation is **not tracked**. `make_move` must `copy.deepcopy(game.state_pieces)` before editing a piece — `list(game.state_pieces)` shares the dicts with the already-loaded value, so the reassigned list compares equal and the column is never saved (turns advance, pieces never persist).

## Frontend gotchas

- API calls are relative `/api/...` URLs via `fetch` (or `axios` in `RSSReader/RSSFetch.jsx`). In dev, Vite proxies `/api` to Flask on :5000.
- Game page (`russianJiangi.jsx`) is a 2-player board game using **polling** on `/api/game/state/:id` (`syncGameState`) plus form-encoded create/join/move. No websockets/sse — don't invent real-time channels.
- `vite-plugin-neon-new` (Postgres plugin) is wired in `vite.config.js` with a fixed `referrer`; don't remove it or the Neon piece of the dev setup breaks.