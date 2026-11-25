/**
 * HTTP API. All routes live under /api.
 *   POST /api/auth/signup   {name, email, password, classLevel}
 *   POST /api/auth/login    {email, password}
 *   POST /api/auth/logout
 *   GET  /api/auth/me
 *   GET  /api/progress      saved progress of the logged-in student
 *   PUT  /api/progress      merge the device's progress in; returns the merged result
 * Sessions: random token in an httpOnly cookie; the database keeps only its SHA-256 hash.
 */
import express, { type NextFunction, type Request, type Response } from 'express';
import type { DB } from './db.ts';
import { cleanProgress, emptyProgress, mergeProgress, type Progress } from './progress.ts';
import { hashPassword, hashToken, newToken, verifyPassword } from './security.ts';

export const COOKIE = 'mv_session';
const SESSION_DAYS = 30;
const CLASSES = [7, 8, 9];

interface UserRow {
  id: number;
  name: string;
  email: string;
  password_hash: string;
  class_level: number;
  created_at: string;
}
export interface PublicUser {
  id: number;
  name: string;
  email: string;
  classLevel: number;
  createdAt: string;
}
const publicUser = (u: UserRow): PublicUser => ({ id: u.id, name: u.name, email: u.email, classLevel: u.class_level, createdAt: u.created_at });

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Error codes the app translates; never leak which part of a login was wrong. */
type Code = 'invalid_input' | 'email_taken' | 'bad_credentials' | 'unauthorized' | 'too_many_attempts' | 'server_error';
const fail = (res: Response, status: number, code: Code, field?: string) => res.status(status).json({ error: code, field });

function parseCookies(header: string | undefined): Record<string, string> {
  const out: Record<string, string> = {};
  for (const part of (header ?? '').split(';')) {
    const i = part.indexOf('=');
    if (i > 0) out[part.slice(0, i).trim()] = decodeURIComponent(part.slice(i + 1).trim());
  }
  return out;
}

/** Simple in-memory limiter: max `limit` tries per key per window. */
function limiter(limit: number, windowMs: number) {
  const hits = new Map<string, { n: number; until: number }>();
  return (key: string) => {
    const now = Date.now();
    const h = hits.get(key);
    if (!h || h.until < now) {
      hits.set(key, { n: 1, until: now + windowMs });
      return true;
    }
    h.n += 1;
    return h.n <= limit;
  };
}

export interface AppOptions {
  db: DB;
  /** send the cookie with Secure (turn on behind HTTPS) */
  secureCookies?: boolean;
}

export function createApp({ db, secureCookies = false }: AppOptions) {
  const app = express();
  app.disable('x-powered-by');
  app.use(express.json({ limit: '200kb' }));

  const q = {
    userByEmail: db.prepare('SELECT * FROM users WHERE email = ?'),
    userById: db.prepare('SELECT * FROM users WHERE id = ?'),
    insertUser: db.prepare('INSERT INTO users (name, email, password_hash, class_level) VALUES (?, ?, ?, ?)'),
    insertSession: db.prepare('INSERT INTO sessions (token_hash, user_id, expires_at) VALUES (?, ?, ?)'),
    session: db.prepare('SELECT user_id, expires_at FROM sessions WHERE token_hash = ?'),
    deleteSession: db.prepare('DELETE FROM sessions WHERE token_hash = ?'),
    deleteExpired: db.prepare('DELETE FROM sessions WHERE expires_at < ?'),
    getProgress: db.prepare('SELECT data FROM progress WHERE user_id = ?'),
    putProgress: db.prepare(
      "INSERT INTO progress (user_id, data, updated_at) VALUES (?, ?, datetime('now')) ON CONFLICT(user_id) DO UPDATE SET data = excluded.data, updated_at = excluded.updated_at",
    ),
  };

  const loginLimit = limiter(10, 15 * 60_000);

  const startSession = (res: Response, userId: number) => {
    const token = newToken();
    const expires = Date.now() + SESSION_DAYS * 86_400_000;
    q.deleteExpired.run(Date.now());
    q.insertSession.run(hashToken(token), userId, expires);
    res.cookie(COOKIE, token, { httpOnly: true, sameSite: 'lax', secure: secureCookies, path: '/', expires: new Date(expires) });
  };

  /** Puts the logged-in user on res.locals.user, or answers 401. */
  const requireUser = (req: Request, res: Response, next: NextFunction) => {
    const token = parseCookies(req.headers.cookie)[COOKIE];
    if (!token) return fail(res, 401, 'unauthorized');
    const s = q.session.get(hashToken(token)) as unknown as { user_id: number; expires_at: number } | undefined;
    if (!s || s.expires_at < Date.now()) return fail(res, 401, 'unauthorized');
    const u = q.userById.get(s.user_id) as unknown as UserRow | undefined;
    if (!u) return fail(res, 401, 'unauthorized');
    res.locals.user = u;
    next();
  };

  const readProgress = (userId: number): Progress => {
    const row = q.getProgress.get(userId) as unknown as { data: string } | undefined;
    return row ? cleanProgress(JSON.parse(row.data)) : emptyProgress();
  };

  app.get('/api/health', (_req, res) => res.json({ ok: true }));

  app.post('/api/auth/signup', async (req, res, next) => {
    try {
      const { name, email, password, classLevel } = req.body ?? {};
      const n = typeof name === 'string' ? name.trim() : '';
      const e = typeof email === 'string' ? email.trim().toLowerCase() : '';
      if (n.length < 2 || n.length > 60) return fail(res, 400, 'invalid_input', 'name');
      if (!EMAIL.test(e) || e.length > 120) return fail(res, 400, 'invalid_input', 'email');
      if (typeof password !== 'string' || password.length < 8 || password.length > 128) return fail(res, 400, 'invalid_input', 'password');
      if (!CLASSES.includes(Number(classLevel))) return fail(res, 400, 'invalid_input', 'classLevel');
      if (q.userByEmail.get(e)) return fail(res, 409, 'email_taken', 'email');
      const hash = await hashPassword(password);
      const r = q.insertUser.run(n, e, hash, Number(classLevel));
      const user = q.userById.get(Number(r.lastInsertRowid)) as unknown as UserRow;
      startSession(res, user.id);
      res.status(201).json({ user: publicUser(user) });
    } catch (err) {
      next(err);
    }
  });

  app.post('/api/auth/login', async (req, res, next) => {
    try {
      const { email, password } = req.body ?? {};
      const e = typeof email === 'string' ? email.trim().toLowerCase() : '';
      if (!loginLimit(`${req.ip}|${e}`)) return fail(res, 429, 'too_many_attempts');
      if (!e || typeof password !== 'string' || !password) return fail(res, 400, 'invalid_input');
      const u = q.userByEmail.get(e) as unknown as UserRow | undefined;
      // same answer whether the email or the password was wrong
      if (!u || !(await verifyPassword(password, u.password_hash))) return fail(res, 401, 'bad_credentials');
      startSession(res, u.id);
      res.json({ user: publicUser(u) });
    } catch (err) {
      next(err);
    }
  });

  app.post('/api/auth/logout', (req, res) => {
    const token = parseCookies(req.headers.cookie)[COOKIE];
    if (token) q.deleteSession.run(hashToken(token));
    res.clearCookie(COOKIE, { path: '/' });
    res.json({ ok: true });
  });

  app.get('/api/auth/me', requireUser, (_req, res) => {
    res.json({ user: publicUser(res.locals.user as UserRow) });
  });

  app.get('/api/progress', requireUser, (_req, res) => {
    res.json({ progress: readProgress((res.locals.user as UserRow).id) });
  });

  app.put('/api/progress', requireUser, (req, res) => {
    const id = (res.locals.user as UserRow).id;
    const merged = mergeProgress(readProgress(id), cleanProgress(req.body?.progress));
    q.putProgress.run(id, JSON.stringify(merged));
    res.json({ progress: merged });
  });

  app.use('/api', (_req, res) => res.status(404).json({ error: 'not_found' }));

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    if (err instanceof SyntaxError) return fail(res, 400, 'invalid_input');
    console.error(err);
    fail(res, 500, 'server_error');
  });

  return app;
}
