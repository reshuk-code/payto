// Pure helpers with no framework imports, so they run in plain `node --test`.
import { randomInt, createHash } from 'node:crypto';

export { isHexColor, contrastRatio, colorProblem } from './colors.js';

// No 0/O, 1/l/I, so short links are easy to read off a poster.
const SLUG_ALPHABET = '23456789abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ';

export function generateSlug(length = 7) {
  let slug = '';
  for (let i = 0; i < length; i++) slug += SLUG_ALPHABET[randomInt(SLUG_ALPHABET.length)];
  return slug;
}

// Accepts "example.com/menu" or a full URL. Returns a clean http(s) URL, or null if invalid.
export function normalizeUrl(input) {
  const raw = String(input ?? '').trim();
  if (!raw || raw.length > 2048) return null;

  const withScheme = /^[a-z][a-z0-9+.-]*:/i.test(raw) ? raw : `https://${raw}`;
  let url;
  try {
    url = new URL(withScheme);
  } catch {
    return null;
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;
  if (!url.hostname.includes('.') && url.hostname !== 'localhost') return null;
  return url.toString();
}

export function parseUserAgent(ua = '') {
  const s = ua.toLowerCase();
  const isBot = /bot|crawl|spider|slurp|preview|facebookexternalhit|whatsapp|telegram|discord|curl|wget|python|headless/.test(s);

  let device = 'desktop';
  if (/ipad|tablet|(android(?!.*mobile))/.test(s)) device = 'tablet';
  else if (/mobi|iphone|ipod|android/.test(s)) device = 'mobile';

  let os = 'Other';
  if (/iphone|ipad|ipod/.test(s)) os = 'iOS';
  else if (/android/.test(s)) os = 'Android';
  else if (/windows/.test(s)) os = 'Windows';
  else if (/mac os x|macintosh/.test(s)) os = 'macOS';
  else if (/linux/.test(s)) os = 'Linux';

  let browser = 'Other';
  if (/edg\//.test(s)) browser = 'Edge';
  else if (/samsungbrowser/.test(s)) browser = 'Samsung Internet';
  else if (/opr\/|opera/.test(s)) browser = 'Opera';
  else if (/firefox|fxios/.test(s)) browser = 'Firefox';
  else if (/chrome|crios/.test(s)) browser = 'Chrome';
  else if (/safari/.test(s)) browser = 'Safari';

  return { device, os, browser, isBot };
}

// Rough "unique visitor" key: same person + device on the same day counts once.
// The raw IP is never stored.
export function visitorHash(ip, ua, day) {
  return createHash('sha256').update(`${ip}|${ua}|${day}`).digest('hex').slice(0, 32);
}

export function referrerHost(referrer) {
  try {
    return referrer ? new URL(referrer).hostname : null;
  } catch {
    return null;
  }
}
