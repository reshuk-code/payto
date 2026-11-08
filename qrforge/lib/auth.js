import 'server-only';
import { cache } from 'react';
import { createHash, randomBytes } from 'node:crypto';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { query, queryOne } from './db';

const COOKIE_NAME = 'qf_session';
const SESSION_DAYS = 30;

// Only a hash of the token is stored, so a leaked database can't be used to log in.
function hashToken(token) {
  return createHash('sha256').update(token).digest('hex');
}

export async function createSession(userId) {
  const token = randomBytes(32).toString('base64url');
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);

  await query('INSERT INTO sessions (token_hash, user_id, expires_at) VALUES ($1, $2, $3)', [
    hashToken(token),
    userId,
    expiresAt,
  ]);

  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    expires: expiresAt,
  });
}

export async function destroySession() {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (token) {
    await query('DELETE FROM sessions WHERE token_hash = $1', [hashToken(token)]);
  }
  store.delete(COOKIE_NAME);
}

// Cached per request, so layouts and pages can both call it for free.
export const getCurrentUser = cache(async () => {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return null;

  return queryOne(
    `SELECT u.id, u.email, u.name, u.plan
       FROM sessions s
       JOIN users u ON u.id = s.user_id
      WHERE s.token_hash = $1 AND s.expires_at > now()`,
    [hashToken(token)],
  );
});

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  return user;
}
