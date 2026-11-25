import assert from 'node:assert/strict';
import type { AddressInfo } from 'node:net';
import { after, before, describe, it } from 'node:test';
import { createApp } from './app.ts';
import { openDb } from './db.ts';

let base = '';
let close: () => void;

before(async () => {
  const server = createApp({ db: openDb(':memory:') }).listen(0);
  await new Promise((r) => server.once('listening', r));
  base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  close = () => server.close();
});
after(() => close());

async function call(path: string, init: { method?: string; body?: unknown; cookie?: string } = {}) {
  const res = await fetch(base + path, {
    method: init.method ?? 'GET',
    headers: { 'content-type': 'application/json', ...(init.cookie ? { cookie: init.cookie } : {}) },
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
  });
  const cookie = res.headers.get('set-cookie')?.split(';')[0];
  return { status: res.status, json: (await res.json()) as Record<string, any>, cookie };
}

const student = { name: 'Asha', email: 'Asha@Example.com', password: 'secret123', classLevel: 8 };

describe('auth', () => {
  let cookie = '';

  it('signs up and starts a session', async () => {
    const r = await call('/api/auth/signup', { method: 'POST', body: student });
    assert.equal(r.status, 201);
    assert.equal(r.json.user.email, 'asha@example.com');
    assert.equal(r.json.user.classLevel, 8);
    assert.equal(r.json.user.password_hash, undefined);
    assert.ok(r.cookie?.startsWith('mv_session='));
    cookie = r.cookie!;
  });

  it('rejects a second account with the same email', async () => {
    const r = await call('/api/auth/signup', { method: 'POST', body: { ...student, email: 'asha@example.com' } });
    assert.equal(r.status, 409);
    assert.equal(r.json.error, 'email_taken');
  });

  it('validates input', async () => {
    const r = await call('/api/auth/signup', { method: 'POST', body: { ...student, email: 'b@x.com', password: 'short' } });
    assert.equal(r.status, 400);
    assert.equal(r.json.field, 'password');
  });

  it('knows who is logged in', async () => {
    assert.equal((await call('/api/auth/me')).status, 401);
    const r = await call('/api/auth/me', { cookie });
    assert.equal(r.json.user.name, 'Asha');
  });

  it('logs in only with the right password', async () => {
    assert.equal((await call('/api/auth/login', { method: 'POST', body: { email: 'asha@example.com', password: 'wrongpass' } })).status, 401);
    const r = await call('/api/auth/login', { method: 'POST', body: { email: 'ASHA@example.com', password: 'secret123' } });
    assert.equal(r.status, 200);
    assert.ok(r.cookie);
  });

  it('merges progress and keeps the best stars', async () => {
    await call('/api/progress', { method: 'PUT', cookie, body: { progress: { stars: { 'cube-volume': { 'find-volume': 2 } }, built: {}, watched: {} } } });
    const r = await call('/api/progress', {
      method: 'PUT',
      cookie,
      body: { progress: { stars: { 'cube-volume': { 'find-volume': 1 }, bad_id: { x: 3 } }, built: { 'cube-volume': { 'find-volume': true } }, watched: {} } },
    });
    assert.deepEqual(r.json.progress, { stars: { 'cube-volume': { 'find-volume': 2 } }, built: { 'cube-volume': { 'find-volume': true } }, watched: {} });
    assert.deepEqual((await call('/api/progress', { cookie })).json.progress, r.json.progress);
  });

  it('logs out and the old cookie stops working', async () => {
    await call('/api/auth/logout', { method: 'POST', cookie });
    assert.equal((await call('/api/auth/me', { cookie })).status, 401);
  });
});
