# API Reference

The Flask backend lives in a single file: [`api/app.py`](../api/app.py). All routes are prefixed `/api/`.

## Conventions

- **Request bodies are form-encoded** (`request.form`), not JSON. Every `POST` endpoint reads fields from a form body — including the game and YouTube endpoints. Use `URLSearchParams` / `FormData` in the browser, or `curl -d`.
- **Responses are JSON** (`jsonify`), usually `{"message": "..."}`.
- Errors generally return JSON `{"message": "..."}`; some game endpoints also use HTTP status codes (400/403/404). Most user-facing endpoints return HTTP 200 even on failure — check the `message` field.
- CORS is open (`origins: *`) via Flask-CORS.
- There are **no auth tokens/sessions** — username is passed in the form body, and the frontend tracks login state in `localStorage`. Endpoints trust the supplied `username`.

---

## Data & auth

### `GET /api/data`

Sample/hello endpoint (used by the legacy `apiTest.jsx` page).

**Response**
```json
{ "message": "Hello from Flask!", "items": ["item1", "item2", "item3"] }
```

### `POST /api/login`

Form fields: `username`, `password`.

Compares the password using Postgres `pgcrypto` (`func.crypt` against the stored hash).

**Success**
```json
{ "message": "Login successful" }
```
**Failure**
```json
{ "message": "Invalid credentials" }
```

> ⚠️ Note: `login` assumes the user exists (`selectedUsers[0]`) — logging in with an unknown username can raise a server error rather than returning "Invalid credentials".

### `POST /api/signup`

Form fields: `username`, `password`.

Creates a user with a pgcrypto (`gen_salt('md5')`) password hash. Rejects duplicate usernames.

**Responses**
```json
{ "message": "Signup successful" }
{ "message": "Signup failed: username already exists" }
{ "message": "Signup failed" }
```

---

## High scores (Math Game)

### `POST /api/get_score`

Form fields: `username`.

**Responses**
```json
{ "message": "42" }              // high score as a string
{ "message": "User not found" }
```

### `POST /api/set_score`

Form fields: `username`, `high_score`.

**Responses**
```json
{ "message": "High score updated for user <username>" }
{ "message": "User not found" }
```

---

## RSS feeds

These endpoints only persist feed **URLs and titles** per user. Fetching feed content is done client-side via the external [rss2json](https://rss2json.com) API.

### `POST /api/get_rss`

Form fields: `username`.

**Responses**
```json
{ "feeds": [ { "url": "https://example.com/feed.xml", "title": "Example Pod" } ] }
{ "feeds": [], "message": "User not found" }
```
`title` falls back to the URL when no title was saved.

### `POST /api/set_rss`

Form fields: `username`, `rss_feed_url`, `rss_title` (optional).

- First feed for a user is inserted with `id=1` (note: this hardcodes the primary key; a second user's first feed will collide — known limitation).
- If the URL already exists, backfills a missing title.

**Responses**
```json
{ "message": "RSS feed URL set" }
{ "message": "RSS feed URL updated" }
{ "message": "RSS feed URL already exists" }
{ "message": "User not found" }
```

---

## Game (Russian Jiangi)

A game holds 12 pieces (6 per player: 2 small, 2 medium, 2 large) in a JSON column. Players take turns placing/stacking pieces on a 3×3 board; larger pieces may stack on smaller ones; three top pieces in a row wins.

### `POST /api/game/create`

Form fields: `username`.

Creates a game with the caller as player 1, status `waiting`.

**Response**
```json
{ "game_id": 1, "player_role": "player1" }
```
**Errors**: `400` `{ "message": "Username is required" }`

### `POST /api/game/join`

Form fields: `game_id`, `username`.

Joins a `waiting` game as player 2; sets status to `active`.

**Response**
```json
{ "game_id": 1, "player_role": "player2" }
```
**Errors**:
- `400` `"Game ID and username are required"`, `"Game is already full or active"`, `"You are already player 1"`
- `404` `"Game not found"`

### `GET /api/game/state/<game_id>`

No body. Polled by the frontend every 1.5 s during online play.

**Response**
```json
{
  "state_pieces": [
    {
      "id": 0, "player": "player1", "size": "small",
      "x": 10, "y": 10,                 // pixel position
      "placed": false,
      "boardPosition": null             // or { "x": 0, "y": 1 } once placed
    }
  ],
  "current_player": "player1",          // "player1" | "player2"
  "winner": null,                       // winning username, or null
  "winner_player": null,                // "player1" | "player2", or null
  "status": "active"                    // "waiting" | "active" | "finished"
}
```
**Errors**: `404` `{ "message": "Game not found" }`

### `POST /api/game/move`

Form fields: `game_id`, `username`, `piece_id`, `x`, `y` (board coordinates 0–2).

Server validates: it's the caller's turn, the piece belongs to the current player, and the placement is a legal stack (strictly larger than the top piece, or empty cell). On success the turn flips; a win sets `winner` and `status: "finished"`.

**Success (200)**
```json
{
  "success": true,
  "state_pieces": [ ... ],              // same shape as state endpoint
  "current_player": "player2",
  "winner": null,
  "winner_player": null,
  "status": "active"
}
```
**Errors**:
- `400` `"Missing move parameters"`, `"Piece not found"`, `"Cannot move opponent piece"`, `"Invalid move: piece too small to stack"`
- `403` `"Not your turn"`
- `404` `"Game not found"`

> ⚠️ Gotcha for maintainers: `make_move` must `copy.deepcopy(game.state_pieces)` before editing — in-place mutation of the JSON column is not persisted by SQLAlchemy. See [ARCHITECTURE.md](ARCHITECTURE.md).

---

## YouTube Guide

### `POST /api/youtube/guide`

Form fields: `url` (alias: `youtube_url`) — a YouTube URL or bare 11-char video ID.

Accepts `watch?v=`, `youtu.be/`, `embed/`, and `shorts/` URL forms. Fetches the transcript (`youtube-transcript-api`, English preferred, first available as fallback), groups segments into steps (~80 words or >3 s gaps), and fetches the title via YouTube's oEmbed endpoint.

**Success (200)**
```json
{
  "video_id": "dQw4w9WgXcQ",
  "title": "Video Title",
  "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  "steps": [
    { "step": 1, "timestamp": "0:00", "text": "..." }
  ],
  "transcript": "full transcript text joined..."
}
```
**Errors**:
- `400` `"Please enter a valid YouTube URL."`, or a transcript-related message (e.g. `"Transcripts are disabled for this video."`, `"This video does not have a transcript available."`, `"The transcript for this video is empty."`)
- `502` `"Could not reach YouTube. Please try again."`
- `500` `"Could not generate a guide: ..."`
