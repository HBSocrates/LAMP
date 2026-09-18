# Vite React + Flask Project

A simple Vite + React frontend paired with a Flask backend.

## Overview

- Frontend: React 19 + Vite
- Backend: Flask API in `/api/`
- Routing: `react-router-dom`
- Data fetching: `axios`

## Prerequisites

- Node.js 18+ and npm
- Python 3.11+ (or compatible Python 3.x)
- Optional: `pipenv` if you choose to use the provided `Pipfile`

## Setup

1. Install frontend dependencies

```bash
cd vite-project
npm install
```

2. Setup the Flask backend

```bash
cd vite-project/api
python -m venv venv
```

### On Windows

```powershell
cd vite-project\api
venv\Scripts\activate
pip install -r requirements.txt
```

### On macOS/Linux

```bash
cd vite-project/api
source venv/bin/activate
pip install -r requirements.txt
```

## Running the app

### Start the frontend

```bash
cd vite-project
npm run dev
```

### Start the backend

Go into the API folder, then:

If you are on macOS or Linux, use:

```bash
cd vite-project
npm run api
```

On Windows, after activating the virtual environment, run:

```
flask run
```

## Notes

- The app needs environment variables in a `.env` and `api/.env`
- Use `npm run build` to create a production build of the frontend.

## Useful commands

- `npm run dev` — start Vite development server
- `npm run build` — build the frontend for production
- `npm run preview` — preview the production build locally
- `npm run lint` — run ESLint on frontend source files
