import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireUser } from '@/lib/auth';
import { getCode, getStats, shortUrlFor } from '@/lib/codes';
import { qrDataUrl } from '@/lib/qr';
import { deleteCodeAction, toggleCodeAction, updateCodeAction } from '@/app/actions';
import CodeForm from '@/components/CodeForm';
import CopyButton from '@/components/CopyButton';
import DeleteButton from '@/components/DeleteButton';

export const metadata = { title: 'QR code' };

export default async function CodePage({ params }) {
  const { id } = await params;
  const user = await requireUser();
  const code = await getCode(user.id, id);
  if (!code) notFound();

  const shortUrl = await shortUrlFor(code.slug);
  const [image, stats] = await Promise.all([qrDataUrl(shortUrl, code, 480), getStats(code.id)]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:py-10">
      <Link href="/dashboard" className="text-sm text-stone-500 hover:text-stone-900">← Back to codes</Link>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-bold tracking-tight">{code.name}</h1>
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
            code.is_active ? 'bg-green-50 text-green-800' : 'bg-stone-100 text-stone-600'
          }`}
        >
          {code.is_active ? 'Active' : 'Paused'}
        </span>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[320px_1fr]">
        {/* Left: the code itself */}
        <aside className="space-y-4">
          <div className="card p-4">
            <img src={image} alt={`QR code for ${code.name}`} className="w-full rounded-lg" />
            <div className="mt-4 grid grid-cols-2 gap-2">
              <a href={`/api/codes/${code.id}/download?format=png`} className="btn-primary">PNG</a>
              <a href={`/api/codes/${code.id}/download?format=svg`} className="btn-secondary">SVG</a>
            </div>
            <p className="mt-2 text-center text-xs text-stone-500">SVG stays sharp at any print size.</p>
          </div>

          <div className="card space-y-3 p-4 text-sm">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-stone-500">Short link</p>
              <div className="mt-1 flex items-center justify-between gap-2">
                <span className="truncate font-mono text-[13px]">{shortUrl.replace(/^https?:\/\//, '')}</span>
                <CopyButton text={shortUrl} />
              </div>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-stone-500">Opens</p>
              <a href={code.destination} target="_blank" rel="noopener noreferrer" className="mt-1 block break-all text-stone-800 underline-offset-4 hover:underline">
                {code.destination}
              </a>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <form action={toggleCodeAction.bind(null, code.id, !code.is_active)}>
              <button className="btn-secondary w-full">{code.is_active ? 'Pause' : 'Resume'}</button>
            </form>
            <DeleteButton action={deleteCodeAction.bind(null, code.id)} />
          </div>
          {!code.is_active && (
            <p className="text-sm text-stone-500">While paused, scans show a &ldquo;paused&rdquo; page instead of your link.</p>
          )}
        </aside>

        {/* Right: analytics and editing */}
        <div className="min-w-0 space-y-6">
          <div className="grid grid-cols-3 gap-3">
            <Stat label="Total scans" value={stats.totals.total} />
            <Stat label="Unique visitors" value={stats.totals.unique_visitors} />
            <Stat label="Last 7 days" value={stats.totals.last_7_days} />
          </div>

          <div className="card p-5">
            <h2 className="font-semibold">Scans, last 30 days</h2>
            <DailyChart daily={stats.daily} />
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <Breakdown title="Devices" rows={stats.devices} total={stats.totals.total} capitalize />
            <Breakdown title="Top countries" rows={stats.countries} total={stats.totals.total} />
          </div>

          <div className="card p-5">
            <h2 className="font-semibold">Recent scans</h2>
            {stats.recent.length === 0 ? (
              <p className="mt-2 text-sm text-stone-500">No scans yet. Point your phone camera at the code to test it.</p>
            ) : (
              <ul className="mt-3 divide-y divide-stone-100 text-sm">
                {stats.recent.map((s, i) => (
                  <li key={i} className="flex justify-between gap-3 py-2">
                    <span className="text-stone-700">
                      {s.os} · {s.browser}
                      {s.country ? ` · ${s.country}` : ''}
                    </span>
                    <time className="shrink-0 text-stone-500" dateTime={new Date(s.scanned_at).toISOString()}>
                      {timeAgo(s.scanned_at)}
                    </time>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="card p-5 sm:p-6">
            <h2 className="font-semibold">Edit code</h2>
            <p className="mt-1 text-sm text-stone-500">Changes apply instantly. No need to reprint.</p>
            <div className="mt-5">
              <CodeForm
                action={updateCodeAction.bind(null, code.id)}
                initial={{ name: code.name, destination: code.destination, fgColor: code.fg_color, bgColor: code.bg_color }}
                previewUrl={shortUrl}
                submitLabel="Save changes"
                showPreview={false}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="card p-4">
      <p className="text-xs text-stone-500 sm:text-sm">{label}</p>
      <p className="mt-1 text-2xl font-bold tabular-nums">{value.toLocaleString()}</p>
    </div>
  );
}

function DailyChart({ daily }) {
  const max = Math.max(1, ...daily.map((d) => d.scans));
  return (
    <div className="mt-4">
      <div className="flex h-36 items-end gap-[3px]" role="img" aria-label="Daily scans for the last 30 days">
        {daily.map((d) => (
          <div key={d.day} className="group relative flex h-full flex-1 items-end">
            <div
              className={`w-full rounded-t-sm ${d.scans ? 'bg-brand-500' : 'bg-stone-100'}`}
              style={{ height: d.scans ? `${Math.max(6, (d.scans / max) * 100)}%` : '3px' }}
            />
            <span className="pointer-events-none absolute bottom-full left-1/2 mb-1 hidden -translate-x-1/2 whitespace-nowrap rounded bg-stone-900 px-1.5 py-0.5 text-[11px] text-white group-hover:block">
              {d.scans} · {d.day.slice(5)}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-2 flex justify-between text-[11px] text-stone-400">
        <span>{daily[0]?.day.slice(5)}</span>
        <span>Today</span>
      </div>
    </div>
  );
}

function Breakdown({ title, rows, total, capitalize }) {
  return (
    <div className="card p-5">
      <h2 className="font-semibold">{title}</h2>
      {rows.length === 0 ? (
        <p className="mt-2 text-sm text-stone-500">No data yet.</p>
      ) : (
        <ul className="mt-3 space-y-2.5 text-sm">
          {rows.map((r) => {
            const pct = total ? Math.round((r.n / total) * 100) : 0;
            return (
              <li key={r.label}>
                <div className="flex justify-between">
                  <span className={capitalize ? 'capitalize' : ''}>{r.label}</span>
                  <span className="tabular-nums text-stone-500">{r.n} · {pct}%</span>
                </div>
                <div className="mt-1 h-1.5 rounded-full bg-stone-100">
                  <div className="h-1.5 rounded-full bg-stone-800" style={{ width: `${pct}%` }} />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function timeAgo(date) {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}
