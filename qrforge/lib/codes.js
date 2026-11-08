import 'server-only';
import { headers } from 'next/headers';
import { query, queryOne } from './db';
import { generateSlug } from './utils';

export const FREE_PLAN_LIMIT = Number(process.env.FREE_PLAN_LIMIT || 3);

// The URL printed inside every QR code. Set APP_URL in production so it never changes.
export async function getBaseUrl() {
  if (process.env.APP_URL) return process.env.APP_URL.replace(/\/+$/, '');
  const h = await headers();
  const host = h.get('x-forwarded-host') || h.get('host') || 'localhost:3000';
  const proto = h.get('x-forwarded-proto') || (host.startsWith('localhost') ? 'http' : 'https');
  return `${proto}://${host}`;
}

export async function shortUrlFor(slug) {
  return `${await getBaseUrl()}/r/${slug}`;
}

export function planLimit(user) {
  return user.plan === 'free' ? FREE_PLAN_LIMIT : Infinity;
}

export async function listCodes(userId) {
  return query(
    `SELECT c.*,
            COUNT(s.id) FILTER (WHERE NOT s.is_bot)::int AS total_scans,
            MAX(s.scanned_at) FILTER (WHERE NOT s.is_bot) AS last_scan_at
       FROM qr_codes c
       LEFT JOIN scans s ON s.qr_code_id = c.id
      WHERE c.user_id = $1
      GROUP BY c.id
      ORDER BY c.created_at DESC`,
    [userId],
  );
}

export async function countCodes(userId) {
  const row = await queryOne('SELECT COUNT(*)::int AS n FROM qr_codes WHERE user_id = $1', [userId]);
  return row.n;
}

// Always scoped to the owner, so one user can never read another user's code.
export async function getCode(userId, id) {
  if (!/^[0-9a-f-]{36}$/i.test(String(id))) return null;
  return queryOne('SELECT * FROM qr_codes WHERE id = $1 AND user_id = $2', [id, userId]);
}

export async function createCode(userId, { name, destination, fgColor, bgColor }) {
  // 55^7 possible slugs, so a collision is rare; retry a few times anyway.
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      return await queryOne(
        `INSERT INTO qr_codes (user_id, slug, name, destination, fg_color, bg_color)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [userId, generateSlug(), name, destination, fgColor, bgColor],
      );
    } catch (err) {
      if (err.code !== '23505') throw err; // 23505 = unique violation
    }
  }
  throw new Error('Could not generate a unique short link. Please try again.');
}

export async function updateCode(userId, id, { name, destination, fgColor, bgColor }) {
  return queryOne(
    `UPDATE qr_codes
        SET name = $3, destination = $4, fg_color = $5, bg_color = $6, updated_at = now()
      WHERE id = $1 AND user_id = $2
      RETURNING *`,
    [id, userId, name, destination, fgColor, bgColor],
  );
}

export async function setCodeActive(userId, id, isActive) {
  return queryOne(
    'UPDATE qr_codes SET is_active = $3, updated_at = now() WHERE id = $1 AND user_id = $2 RETURNING *',
    [id, userId, isActive],
  );
}

export async function deleteCode(userId, id) {
  await query('DELETE FROM qr_codes WHERE id = $1 AND user_id = $2', [id, userId]);
}

export async function findBySlug(slug) {
  if (!/^[A-Za-z0-9]{4,16}$/.test(slug)) return null;
  return queryOne('SELECT id, destination, is_active FROM qr_codes WHERE slug = $1', [slug]);
}

export async function recordScan(codeId, scan) {
  await query(
    `INSERT INTO scans (qr_code_id, device, os, browser, country, referrer, visitor_hash, is_bot)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
    [codeId, scan.device, scan.os, scan.browser, scan.country, scan.referrer, scan.visitorHash, scan.isBot],
  );
}

export async function getStats(codeId) {
  const [totals, daily, devices, countries, recent] = await Promise.all([
    queryOne(
      `SELECT COUNT(*)::int AS total,
              COUNT(DISTINCT visitor_hash)::int AS unique_visitors,
              COUNT(*) FILTER (WHERE scanned_at >= now() - interval '7 days')::int AS last_7_days
         FROM scans WHERE qr_code_id = $1 AND NOT is_bot`,
      [codeId],
    ),
    query(
      `SELECT to_char(d, 'YYYY-MM-DD') AS day, COUNT(s.id)::int AS scans
         FROM generate_series(current_date - 29, current_date, interval '1 day') AS d
         LEFT JOIN scans s
           ON s.qr_code_id = $1 AND NOT s.is_bot
          AND s.scanned_at >= d AND s.scanned_at < d + interval '1 day'
        GROUP BY d ORDER BY d`,
      [codeId],
    ),
    query(
      `SELECT COALESCE(device, 'unknown') AS label, COUNT(*)::int AS n
         FROM scans WHERE qr_code_id = $1 AND NOT is_bot
        GROUP BY 1 ORDER BY n DESC`,
      [codeId],
    ),
    query(
      `SELECT COALESCE(country, 'Unknown') AS label, COUNT(*)::int AS n
         FROM scans WHERE qr_code_id = $1 AND NOT is_bot
        GROUP BY 1 ORDER BY n DESC LIMIT 5`,
      [codeId],
    ),
    query(
      `SELECT scanned_at, device, os, browser, country
         FROM scans WHERE qr_code_id = $1 AND NOT is_bot
        ORDER BY scanned_at DESC LIMIT 10`,
      [codeId],
    ),
  ]);
  return { totals, daily, devices, countries, recent };
}
