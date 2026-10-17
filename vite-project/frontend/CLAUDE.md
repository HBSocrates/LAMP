# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Paths in this file are relative to `frontend/` (this directory); the Flask backend is the sibling directory `../api/`.

## Development Commands
### Frontend (React + Vite)
- Build: `npm run build`
- Dev Server: `npm run dev`
- Lint: `npm run lint`
- Preview Production Build: `npm run preview`

### Backend (Flask)
- Run API: with `../api/venv` activated, `npm run api` (which executes `cd ../api && python -m flask run --no-debugger`)
- Manual Windows Start: activate `..\api\venv\Scripts\activate` then `flask run` from `../api/`
- Manual Unix Start: activate `../api/venv/bin/activate` then `flask run` from `../api/`

## Architecture
The project is a full-stack application with a decoupled frontend and backend.

### Frontend (`src/`)
- **Framework**: React 19 with Vite.
- **Routing**: Managed by `react-router-dom`; routes in `src/App.jsx`.
- **Styling**: Uses `styled-components` and CSS files in `src/styles`.
- **Pages**: Located in `src/pages`:
    - `index.jsx`: Home page.
    - `MathGameApp.jsx`: Math game implementation.
    - `rssFeed.jsx`: RSS feed reader page.
    - `russianJiangi.jsx`: Online/AI/two-player board game.
    - `youtubeGuide.jsx`: YouTube transcript guide generator.
    - `login.jsx` / `signUp.jsx`: Authentication pages.
    - `about.jsx`: About page (accordion bio).
    - `apiTest.jsx`: Legacy/unrouted API demo.
    - `gameLogic.js`: Standalone game helpers (not currently imported).
- **Components**: Shared UI elements in `src/components` (e.g., `NavBar`, `RSSReader`, `AccordionMenu`).
- **Utilities**: Helper functions in `src/components/UtilityFunctions`.

### Backend (`../api/`)
- **Framework**: Flask (Python).
- **Entry Point**: `app.py`.
- **Environment**: Managed via `requirements.txt`.
- **Database**: Neon PostgreSQL; migrations handled in the `migrations/` directory.
- **Gotcha**: `Game.state_pieces` (SQLAlchemy `JSON` column) ignores in-place mutations; `make_move` deep-copies it before editing (`copy.deepcopy`), never `list(game.state_pieces)`.

## Project Structure
- `../api`: Python Flask backend source code.
- `src/`: React frontend source code.
- `public/`: Static assets.
- `src/styles`: Global and component-specific stylesheets.
