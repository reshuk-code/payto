'use server';

import bcrypt from 'bcryptjs';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { query, queryOne } from '@/lib/db';
import { createSession, destroySession, requireUser } from '@/lib/auth';
import * as codes from '@/lib/codes';
import { colorProblem, normalizeUrl } from '@/lib/utils';

// Every action re-checks the user: server actions are public HTTP endpoints.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Compared against when an email isn't found, so both paths take the same time.
const DUMMY_HASH = '$2b$12$eKiC0aHADoe2RNP5Uzf8AeatKlZo9nJDRR5lSefRpPgvtI26HqV52';

export async function signup(_prev, formData) {
  const name = String(formData.get('name') || '').trim().slice(0, 80);
  const email = String(formData.get('email') || '').trim().toLowerCase();
  const password = String(formData.get('password') || '');
  const values = { name, email };

  if (!EMAIL_RE.test(email)) return { error: 'Enter a valid email address.', values };
  if (password.length < 8) return { error: 'Password must be at least 8 characters.', values };
  if (password.length > 72) return { error: 'Password must be 72 characters or fewer.', values };

  const existing = await queryOne('SELECT id FROM users WHERE email = $1', [email]);
  if (existing) return { error: 'An account with this email already exists. Try logging in.', values };

  const hash = await bcrypt.hash(password, 12);
  const user = await queryOne(
    'INSERT INTO users (email, name, password_hash) VALUES ($1, $2, $3) RETURNING id',
    [email, name || null, hash],
  );
  await createSession(user.id);
  redirect('/dashboard');
}

export async function login(_prev, formData) {
  const email = String(formData.get('email') || '').trim().toLowerCase();
  const password = String(formData.get('password') || '');

  const user = await queryOne('SELECT id, password_hash FROM users WHERE email = $1', [email]);
  const ok = await bcrypt.compare(password, user?.password_hash ?? DUMMY_HASH);
  if (!user || !ok) return { error: 'Email or password is incorrect.', values: { email } };

  // Clear this user's expired sessions while we're here.
  await query('DELETE FROM sessions WHERE user_id = $1 AND expires_at < now()', [user.id]);
  await createSession(user.id);
  redirect('/dashboard');
}

export async function logout() {
  await destroySession();
  redirect('/');
}

function parseCodeForm(formData) {
  const values = {
    name: String(formData.get('name') || '').trim().slice(0, 80),
    destination: String(formData.get('destination') || '').trim(),
    fgColor: String(formData.get('fgColor') || '#000000').toLowerCase(),
    bgColor: String(formData.get('bgColor') || '#ffffff').toLowerCase(),
  };
  const destination = normalizeUrl(values.destination);
  if (!values.name) return { error: 'Give your QR code a name.', values };
  if (!destination) return { error: 'Enter a valid website link, like example.com/menu.', values };
  const colorError = colorProblem(values.fgColor, values.bgColor);
  if (colorError) return { error: colorError, values };
  return { data: { ...values, destination } };
}

export async function createCodeAction(_prev, formData) {
  const user = await requireUser();
  const parsed = parseCodeForm(formData);
  if (parsed.error) return parsed;

  if ((await codes.countCodes(user.id)) >= codes.planLimit(user)) {
    return { error: `The free plan includes ${codes.FREE_PLAN_LIMIT} dynamic codes.`, values: parsed.data };
  }

  const code = await codes.createCode(user.id, parsed.data);
  revalidatePath('/dashboard');
  redirect(`/dashboard/codes/${code.id}`);
}

export async function updateCodeAction(id, _prev, formData) {
  const user = await requireUser();
  const parsed = parseCodeForm(formData);
  if (parsed.error) return parsed;

  const code = await codes.updateCode(user.id, id, parsed.data);
  if (!code) return { error: 'This code no longer exists.', values: parsed.data };

  revalidatePath(`/dashboard/codes/${id}`);
  revalidatePath('/dashboard');
  return { ok: true, message: 'Saved. Your printed code now opens the new link.' };
}

export async function toggleCodeAction(id, isActive) {
  const user = await requireUser();
  await codes.setCodeActive(user.id, id, isActive);
  revalidatePath(`/dashboard/codes/${id}`);
  revalidatePath('/dashboard');
}

export async function deleteCodeAction(id) {
  const user = await requireUser();
  await codes.deleteCode(user.id, id);
  revalidatePath('/dashboard');
  redirect('/dashboard');
}
