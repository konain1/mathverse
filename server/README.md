# mathVerse backend

A separate Node server for accounts and saved progress. The app (Vite, port 5173) forwards `/api/*` to it (port 4000), so you run both.

```bash
npm --prefix server install   # once
npm run server                # from the project root: API on http://localhost:4000
npm run dev                   # in another terminal: the app on http://localhost:5173
npm run server:test           # backend tests
```

Needs Node 22.6+ (uses Node's built-in SQLite and TypeScript support; no build step).

## What it does

| Route | What |
| --- | --- |
| `POST /api/auth/signup` | `{name, email, password, classLevel}`: creates the account and logs in |
| `POST /api/auth/login` | `{email, password}` |
| `POST /api/auth/logout` | ends the session |
| `GET /api/auth/me` | the logged-in student |
| `GET /api/progress` | saved stars / built / watched |
| `PUT /api/progress` | merges the device's progress in (best stars win) and returns the result |

- Data: SQLite file `server/data/mathverse.db` (git-ignored). Tables: `users`, `sessions`, `progress`.
- Passwords: scrypt with a random salt. Sessions: random token in an httpOnly, SameSite=Lax cookie; only its SHA-256 hash is stored. 30 days.
- Login is rate limited (10 tries per 15 minutes per email + IP).

## Settings (environment variables)

- `PORT` (default 4000)
- `DB_FILE` (default `./data/mathverse.db`)
- `SECURE_COOKIES=1` when served over HTTPS

## In the app

- `/signup`, `/login`, `/dashboard` pages; a Log in button / your initial in the header.
- `src/lib/api.ts` (client), `src/state/auth.ts` (who is logged in + progress sync).
- Progress still works without an account (saved on the device). After logging in, the device's progress is merged into the account, and every new star is saved there too.
