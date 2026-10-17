# LAMP

A personal full-stack portfolio project: a **React 19 + Vite** frontend, a **Flask** (Python) API, and a **Neon PostgreSQL** database. It hosts a math game, an RSS/podcast reader, a YouTube transcript guide generator, and a real-time two-player online board game (Russian Jiangi).

## Where things live

The git repository root is `LAMP/`, but **the actual project lives in [`vite-project/`](vite-project/)**:

- [`vite-project/README.md`](vite-project/README.md) — main project documentation (features, tech stack, setup, API, data model).
- [`vite-project/docs/`](vite-project/docs/) — in-depth guides: [setup](vite-project/docs/SETUP.md), [API reference](vite-project/docs/API.md), and [architecture](vite-project/docs/ARCHITECTURE.md).
- `vite-project/frontend/` — the React SPA.
- `vite-project/api/` — the Flask backend (single-file `app.py`).

## Stale leftovers

These are abandoned and not part of the working app — ignore them:

- `my-app/` — an old Create React App scaffold.
- `index.html` at the repo root — a stray legacy HTML file.
- `vite-project/src/` — empty leftover directory.

## Quick start

From `vite-project/`:

```bash
# Frontend (terminal 1)
cd frontend
npm install
npm run dev        # http://localhost:5173, proxies /api -> :5000

# Backend (terminal 2) — activate api/venv first, see docs/SETUP.md
cd api
python -m flask run   # http://localhost:5000
```

Full environment setup (env vars, Neon database, migrations) is in [`vite-project/docs/SETUP.md`](vite-project/docs/SETUP.md).
