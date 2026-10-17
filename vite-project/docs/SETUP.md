# Setup Guide

Step-by-step instructions for running the LAMP project locally.

## Prerequisites

- **Node.js 18+** and npm
- **Python 3.11+**
- **A Neon PostgreSQL database** — the app depends on Postgres-specific features (notably `pgcrypto` for password hashing), so SQLite or other databases will not work.

## 1. Get the code

The git repository root is `LAMP/`, but the project lives in `vite-project/`:

```bash
cd vite-project
```

All commands below assume you are in `vite-project/` unless stated otherwise.

## 2. Frontend setup

```bash
cd frontend
npm install
```

The frontend also needs a `.env` file at `frontend/.env` (see [Environment variables](#4-environment-variables) below).

## 3. Backend setup

```bash
cd api
python -m venv venv
```

Activate the virtual environment, then install dependencies:

**Windows (PowerShell)**

```powershell
venv\Scripts\activate
pip install -r requirements.txt
```

**macOS / Linux**

```bash
source venv/bin/activate
pip install -r requirements.txt
```

The backend needs an `api/.env` file (see below).

## 4. Environment variables

Both `.env` files are **gitignored** — never commit real values.

### `api/.env`

| Variable     | Purpose                                          |
| ------------ | ------------------------------------------------ |
| `FLASK_APP`  | Entry point: `app.py`                            |
| `FLASK_ENV`  | `development`                                    |
| `DATABASE_URL` | Neon Postgres connection string (use the **pooler** URL, with `?sslmode=require`) |

Example shape (do not use these values):

```
FLASK_APP=app.py
FLASK_ENV=development
DATABASE_URL=postgresql://<user>:<password>@<host>-pooler.neon.tech/neondb?sslmode=require&channel_binding=require
```

### `frontend/.env`

These are consumed by `vite-plugin-neon-new` (wired in `frontend/vite.config.js`), not by app code:

| Variable                 | Purpose                                          |
| ------------------------ | ------------------------------------------------ |
| `DATABASE_URL`           | Neon pooler connection string                    |
| `DATABASE_URL_DIRECT`    | Neon direct (non-pooler) connection string       |
| `VITE_POSTGRES_CLAIM_URL`| The neon.new claim link for the provisioned DB   |

You get these values when you claim a Neon database via the plugin (the plugin's state is also stored in `frontend/.neon/`).

## 5. Database migrations

Schema is managed with Flask-Migrate (Alembic); migration files live in `api/migrations/versions/`. With the venv activated:

```bash
cd api
flask db upgrade     # apply migrations
# after changing models in app.py:
flask db migrate -m "description of change"
flask db upgrade
```

Run these from `api/` so Flask can find `app.py` and `FLASK_APP`.

## 6. Running the servers

Two servers run at once in development:

### Backend (Flask, port 5000)

With `api/venv` activated, from `api/`:

```bash
flask run            # http://localhost:5000
```

Or from `frontend/` (any OS, venv must be active):

```bash
npm run api          # runs: cd ../api && python -m flask run --no-debugger
```

### Frontend (Vite, port 5173)

From `frontend/`:

```bash
npm run dev          # http://localhost:5173
```

Vite proxies `/api/*` to `http://localhost:5000` in development (configured in `frontend/vite.config.js`), so the frontend always calls relative `/api/...` URLs.

> If you start Flask on a different port, update the proxy target in `vite.config.js`.

## 7. Checks

There is **no automated test suite**. The main checks are, from `frontend/`:

```bash
npm run lint
npm run build
```

Backend changes are verified manually against a running Flask server.

## Deployment (Vercel)

`vite-project/vercel.json` defines two services:

- `my_frontend` — root `frontend/`
- `my_backend` — root `api/`, entrypoint `app:app`

with rewrites: `/api/(.*)` → the backend service, `/(.*)` → the frontend. `frontend/vercel.json` additionally provides the SPA catch-all rewrite to `/`. Set the env vars above in the Vercel project settings for production.

## External services used

- **Neon PostgreSQL** — primary datastore.
- **`vite-plugin-neon-new`** — provisions/claims the Neon DB during dev; keep it wired in `vite.config.js`.
- **rss2json.com** — external RSS→JSON proxy used by the RSS feature (frontend).
- **YouTube** (`oembed` API + `youtube-transcript-api`) — used by the YouTube Guide backend endpoint.
