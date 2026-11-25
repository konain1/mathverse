/** Starts the mathVerse API. Env: PORT (4000), DB_FILE (./data/mathverse.db), SECURE_COOKIES=1 behind HTTPS. */
import { resolve } from 'node:path';
import { createApp } from './app.ts';
import { openDb } from './db.ts';

const port = Number(process.env.PORT ?? 4000);
const dbFile = resolve(process.env.DB_FILE ?? './data/mathverse.db');
const app = createApp({ db: openDb(dbFile), secureCookies: process.env.SECURE_COOKIES === '1' });

app.listen(port, () => {
  console.log(`mathVerse API on http://localhost:${port}  (db: ${dbFile})`);
});
