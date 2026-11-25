/** Tiny client for the mathVerse backend (server/). Same-origin /api, session in an httpOnly cookie. */
import type { SavedProgress } from '@/state/progress';

export interface User {
  id: number;
  name: string;
  email: string;
  classLevel: number;
  createdAt: string;
}

export type ApiErrorCode =
  | 'invalid_input'
  | 'email_taken'
  | 'bad_credentials'
  | 'unauthorized'
  | 'too_many_attempts'
  | 'server_error'
  | 'offline';

export class ApiError extends Error {
  constructor(
    public code: ApiErrorCode,
    public status: number,
    public field?: string,
  ) {
    super(code);
  }
}

async function request<T>(path: string, method = 'GET', body?: unknown): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`/api${path}`, {
      method,
      credentials: 'same-origin',
      headers: body === undefined ? undefined : { 'content-type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiError('offline', 0);
  }
  const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (!res.ok) {
    // a missing backend shows up as a proxy error (5xx with no JSON code)
    const code = (typeof data.error === 'string' ? data.error : res.status >= 500 ? 'offline' : 'server_error') as ApiErrorCode;
    throw new ApiError(code, res.status, typeof data.field === 'string' ? data.field : undefined);
  }
  return data as T;
}

export const api = {
  me: () => request<{ user: User }>('/auth/me'),
  login: (email: string, password: string) => request<{ user: User }>('/auth/login', 'POST', { email, password }),
  signup: (b: { name: string; email: string; password: string; classLevel: number }) => request<{ user: User }>('/auth/signup', 'POST', b),
  logout: () => request<{ ok: true }>('/auth/logout', 'POST'),
  pushProgress: (progress: SavedProgress) => request<{ progress: SavedProgress }>('/progress', 'PUT', { progress }),
};
