# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands
### Frontend (React + Vite)
- Build: `npm run build`
- Dev Server: `npm run dev`
- Lint: `npm run lint`
- Preview Production Build: `npm run preview`

### Backend (Flask)
- Run API: `npm run api` (which executes `cd api && venv/bin/flask run --no-debugger`)
- Manual Windows Start: Activate `api/venv\Scripts\activate` then `flask run`
- Manual Unix Start: Activate `api/venv/bin/activate` then `flask run`

## Architecture
The project is a full-stack application with a decoupled frontend and backend.

### Frontend (`/src`)
- **Framework**: React 19 with Vite.
- **Routing**: Managed by `react-router-dom`.
- **Styling**: Uses `styled-components` and CSS files in `/src/styles`.
- **Pages**: Located in `/src/pages`, including:
    - `index.jsx`: Home page.
    - `MathGameApp.jsx`: Math game implementation.
    - `rssFeed.jsx`: RSS feed reader.
    - `login.jsx` / `signUp.jsx`: Authentication pages.
- **Components**: Shared UI elements in `/src/components` (e.g., `NavBar`, `RSSReader`, `AccordionMenu`).
- **Utilities**: Helper functions in `/src/components/UtilityFunctions`.

### Backend (`/api`)
- **Framework**: Flask (Python).
- **Entry Point**: `app.py`.
- **Environment**: Managed via `requirements.txt` and `Pipfile`.
- **Deployment**: Includes `vercel.json` for Vercel deployment.
- **Database**: Migrations are handled in the `migrations/` directory.

## Project Structure
- `/api`: Python Flask backend source code.
- `/src`: React frontend source code.
- `/public`: Static assets.
- `/src/styles`: Global and component-specific stylesheets.
