import { getCurrentUser } from '@/lib/auth';
import { getCode, shortUrlFor } from '@/lib/codes';
import { qrPng, qrSvg } from '@/lib/qr';

export async function GET(request, { params }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) return new Response('Not logged in', { status: 401 });

  const code = await getCode(user.id, id);
  if (!code) return new Response('Not found', { status: 404 });

  const format = new URL(request.url).searchParams.get('format') === 'svg' ? 'svg' : 'png';
  const shortUrl = await shortUrlFor(code.slug);
  const filename = `qrforge-${code.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || code.slug}.${format}`;

  const body = format === 'svg' ? await qrSvg(shortUrl, code) : await qrPng(shortUrl, code, 1024);
  return new Response(body, {
    headers: {
      'Content-Type': format === 'svg' ? 'image/svg+xml' : 'image/png',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'private, no-store',
    },
  });
}
