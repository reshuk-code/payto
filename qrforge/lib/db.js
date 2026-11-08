import 'server-only';
import { SCHEMA_SQL } from './schema';

// One tiny interface over two drivers:
//   - DATABASE_URL set  -> real Postgres via `pg` (Neon, Supabase, local, ...)
//   - DATABASE_URL empty -> PGlite, an embedded Postgres stored in .data/ (dev only)
// Both speak the same SQL and take $1-style parameters.

const MIGRATION_LOCK_ID = 727301;

async function connectPostgres(url) {
  const { Pool } = await import('pg');
  const pool = new Pool({ connectionString: url, max: 5 });

  // Serialize the schema run so parallel cold starts don't race each other.
  // A transaction-level lock is used because poolers like Neon's PgBouncer can move a
  // session between backends; the lock is released automatically on COMMIT/ROLLBACK.
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('SELECT pg_advisory_xact_lock($1)', [MIGRATION_LOCK_ID]);
    await client.query(SCHEMA_SQL);
    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    throw err;
  } finally {
    client.release();
  }

  return { query: (text, params) => pool.query(text, params) };
}

async function connectPglite() {
  if (process.env.VERCEL) {
    throw new Error('DATABASE_URL is required in production. PGlite data would be lost on every deploy.');
  }
  const { PGlite } = await import('@electric-sql/pglite');
  const { mkdirSync } = await import('node:fs');
  const dir = process.env.PGLITE_DIR || './.data/pglite';
  mkdirSync(dir, { recursive: true });
  const db = new PGlite(dir);
  await db.exec(SCHEMA_SQL);
  return { query: (text, params) => db.query(text, params) };
}

function getDb() {
  // Cache on globalThis so dev hot reloads reuse one connection.
  if (!globalThis.__qrforgeDb) {
    const url = process.env.DATABASE_URL;
    globalThis.__qrforgeDb = (url ? connectPostgres(url) : connectPglite()).catch((err) => {
      globalThis.__qrforgeDb = undefined;
      throw err;
    });
  }
  return globalThis.__qrforgeDb;
}

export async function query(text, params = []) {
  const db = await getDb();
  const result = await db.query(text, params);
  return result.rows;
}

export async function queryOne(text, params = []) {
  const rows = await query(text, params);
  return rows[0] ?? null;
}
