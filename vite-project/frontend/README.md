# LAMP Frontend

The React 19 + Vite single-page app for the LAMP portfolio project. The Flask backend lives in `../api/`; see the [project README](../README.md) and [docs/](../docs/) for the full picture.

## Overview

- Frontend: React 19 + Vite 7
- Routing: `react-router-dom` (routes defined in `src/App.jsx`)
- Styling: `styled-components` + CSS files in `src/styles/`
- Data fetching: `fetch` for `/api/*` calls; `axios` only in the RSS feature (`src/components/RSSReader/`)
- Dev server proxies `/api/*` to the Flask backend at `http://localhost:5000`

## Prerequisites

- Node.js 18+ and npm
- Python 3.11+ (for the backend in `../api/`)

## Setup

All commands below are run from **`vite-project/frontend/`** (this directory — there is no `package.json` at `vite-project/`).

1. Install frontend dependencies:

```bash
npm install
```

2. Set up the Flask backend (sibling directory):

```bash
cd ../api
python -m venv venv
```

**Windows**

```powershell
venv\Scripts\activate
pip install -r requirements.txt
```

**macOS / Linux**

```bash
source venv/bin/activate
pip install -r requirements.txt
```

3. Create the env files `../api/.env` and `./.env` — see [docs/SETUP.md](../docs/SETUP.md) for the required variables.

## Running the app

### Start the frontend

```bash
npm run dev        # http://localhost:5173
```

### Start the backend

With the `api/venv` virtual environment activated (see setup above), either:

```bash
# From this directory (frontend/) — works on any OS while the venv is active:
npm run api
```

or manually:

```bash
cd ../api
python -m flask run     # http://localhost:5000
```

## Notes

- Both `.env` (here) and `../api/.env` are gitignored — never commit real values.
- There is no automated test suite; `npm run build` and `npm run lint` are the checks.

## Useful commands

- `npm run dev` — start Vite development server
- `npm run build` — build the frontend for production
- `npm run preview` — preview the production build locally
- `npm run lint` — run ESLint on frontend source files
- `npm run api` — start the Flask backend (requires activated `api/venv`)
