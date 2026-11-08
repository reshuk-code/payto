import Link from 'next/link';
import { requireUser } from '@/lib/auth';
import { listCodes, planLimit, shortUrlFor, FREE_PLAN_LIMIT } from '@/lib/codes';
import { qrDataUrl } from '@/lib/qr';

export const metadata = { title: 'Dashboard' };

export default async function DashboardPage() {
  const user = await requireUser();
  const codes = await listCodes(user.id);
  const limit = planLimit(user);
  const atLimit = codes.length >= limit;

  const rows = await Promise.all(
    codes.map(async (code) => {
      const shortUrl = await shortUrlFor(code.slug);
      return { ...code, shortUrl, image: await qrDataUrl(shortUrl, code, 160) };
    }),
  );
  const totalScans = codes.reduce((sum, c) => sum + c.total_scans, 0);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Your QR codes</h1>
          <p className="mt-1 text-sm text-stone-500">
            {user.plan === 'free' ? `${codes.length} of ${FREE_PLAN_LIMIT} free codes used` : `${codes.length} codes`}
            {' · '}
            {totalScans.toLocaleString()} total scans
          </p>
        </div>
        {atLimit ? (
          <span className="rounded-lg bg-brand-50 px-3 py-2 text-sm text-brand-700">Free limit reached. Pro is coming soon.</span>
        ) : (
          <Link href="/dashboard/new" className="btn-brand">+ New QR code</Link>
        )}
      </div>

      {rows.length === 0 ? (
        <div className="card mt-8 flex flex-col items-center px-6 py-16 text-center">
          <div className="text-4xl" aria-hidden="true">▦</div>
          <h2 className="mt-3 text-lg font-semibold">No QR codes yet</h2>
          <p className="mt-1 max-w-sm text-sm text-stone-500">
            Create your first dynamic code. Print it once, then change where it points whenever you like.
          </p>
          <Link href="/dashboard/new" className="btn-brand mt-6">Create your first code</Link>
        </div>
      ) : (
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((code) => (
            <li key={code.id}>
              <Link href={`/dashboard/codes/${code.id}`} className="card flex gap-4 p-4 transition hover:border-stone-400 hover:shadow-sm">
                <img src={code.image} alt="" className="h-20 w-20 shrink-0 rounded-lg border border-stone-100" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h2 className="truncate font-semibold">{code.name}</h2>
                    {!code.is_active && (
                      <span className="shrink-0 rounded-full bg-stone-100 px-2 py-0.5 text-[11px] font-medium text-stone-600">Paused</span>
                    )}
                  </div>
                  <p className="truncate text-sm text-stone-500">{code.destination.replace(/^https?:\/\//, '')}</p>
                  <p className="mt-2 text-sm">
                    <span className="font-semibold">{code.total_scans.toLocaleString()}</span>{' '}
                    <span className="text-stone-500">scans</span>
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
