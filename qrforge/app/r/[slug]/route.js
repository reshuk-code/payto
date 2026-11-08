import { after } from 'next/server';
import { findBySlug, recordScan } from '@/lib/codes';
import { parseUserAgent, referrerHost, visitorHash } from '@/lib/utils';

// The URL inside every printed QR code. It must stay fast and must never be cached,
// otherwise phones could keep opening an old destination after the owner edits it.
const NO_CACHE = { 'Cache-Control': 'no-store, max-age=0' };

export async function GET(request, { params }) {
  const { slug } = await params;
  const code = await findBySlug(slug);

  if (!code || !code.is_active) {
    const reason = code ? 'paused' : 'missing';
    return Response.redirect(new URL(`/unavailable?reason=${reason}`, request.url), 302);
  }

  const h = request.headers;
  const ua = h.get('user-agent') || '';
  const ip = (h.get('x-forwarded-for') || '').split(',')[0].trim() || h.get('x-real-ip') || '';
  const country = h.get('x-vercel-ip-country') || h.get('cf-ipcountry') || null;
  const referrer = referrerHost(h.get('referer'));

  // Log the scan after the redirect is sent, so the visitor never waits on the database.
  after(async () => {
    try {
      const { device, os, browser, isBot } = parseUserAgent(ua);
      const day = new Date().toISOString().slice(0, 10);
      await recordScan(code.id, {
        device,
        os,
        browser,
        country: country && country !== 'XX' ? country : null,
        referrer,
        visitorHash: visitorHash(ip, ua, day),
        isBot,
      });
    } catch (err) {
      console.error('Failed to record scan', err);
    }
  });

  return new Response(null, { status: 302, headers: { Location: code.destination, ...NO_CACHE } });
}
