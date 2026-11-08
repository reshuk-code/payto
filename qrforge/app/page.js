import Link from 'next/link';
import { getBaseUrl } from '@/lib/codes';
import { qrDataUrl } from '@/lib/qr';

const FEATURES = [
  {
    title: 'Edit after printing',
    body: 'Menu changed? New promo? Point the same printed code to a new link in seconds. No reprints.',
  },
  {
    title: 'See every scan',
    body: 'Scans per day, unique visitors, devices and countries. Know which poster or table actually works.',
  },
  {
    title: 'Never expires',
    body: 'Free codes keep working forever. No surprise "upgrade or your code dies" emails. Ever.',
  },
];

const STEPS = [
  ['Paste a link', 'Your menu, Wi-Fi page, booking form, Instagram, anything.'],
  ['Download & print', 'Get a crisp PNG or SVG in your colors, ready for print.'],
  ['Change it anytime', 'Update the destination and watch scans roll in.'],
];

export default async function Home() {
  const heroQr = await qrDataUrl(`${await getBaseUrl()}/signup`, { fg_color: '#1c1917', bg_color: '#ffffff' }, 400);

  return (
    <>
      {/* Hero */}
      <section className="mx-auto grid max-w-6xl items-center gap-12 px-4 pb-16 pt-12 sm:pt-20 lg:grid-cols-2">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white px-3 py-1 text-xs font-medium text-stone-600">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-500" /> Dynamic QR codes, honest pricing
          </p>
          <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-stone-900 sm:text-6xl">
            QR codes that <span className="text-brand-600">never die.</span>
          </h1>
          <p className="mt-5 max-w-lg text-lg text-stone-600">
            Print once, change the link anytime, and see exactly who scans. Free codes keep working forever.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/signup" className="btn-brand px-5 py-3 text-base">Create a free QR code</Link>
            <a href="#how" className="btn-secondary px-5 py-3 text-base">How it works</a>
          </div>
          <p className="mt-4 text-sm text-stone-500">No credit card. 3 dynamic codes free.</p>
        </div>

        {/* The stats card only overlaps the QR card's padding, so the demo code stays scannable. */}
        <div className="relative mx-auto w-full max-w-sm pb-10">
          <div className="card rotate-[-2deg] px-6 pb-24 pt-6 shadow-xl shadow-stone-900/5">
            <p className="mb-3 text-center text-sm font-medium text-stone-700">Scan me with your phone</p>
            <img src={heroQr} alt="Scan to try QRForge" className="w-full rounded-lg" />
          </div>
          <div className="card absolute bottom-0 left-4 w-52 rotate-[3deg] p-4 shadow-lg shadow-stone-900/5 sm:-left-8">
            <p className="text-xs text-stone-500">Lunch menu · this week</p>
            <p className="mt-1 text-2xl font-bold tabular-nums">1,284 <span className="text-sm font-medium text-stone-500">scans</span></p>
            <div className="mt-2 flex h-8 items-end gap-1">
              {[30, 45, 38, 60, 52, 80, 100].map((h, i) => (
                <div key={i} className="flex-1 rounded-t-sm bg-brand-500" style={{ height: `${h}%` }} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-y border-stone-200 bg-white">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-16 sm:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.title}>
              <h3 className="font-semibold text-stone-900">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-stone-600">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="mx-auto max-w-6xl scroll-mt-8 px-4 py-16">
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Live in under a minute</h2>
        <ol className="mt-8 grid gap-4 sm:grid-cols-3">
          {STEPS.map(([title, body], i) => (
            <li key={title} className="card p-5">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-stone-900 text-sm font-bold text-white">{i + 1}</span>
              <h3 className="mt-4 font-semibold">{title}</h3>
              <p className="mt-1 text-sm text-stone-600">{body}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Pricing */}
      <section className="mx-auto max-w-6xl px-4 pb-20">
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Simple pricing</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <div className="card p-6">
            <h3 className="font-semibold">Free</h3>
            <p className="mt-2 text-4xl font-extrabold">$0</p>
            <ul className="mt-5 space-y-2 text-sm text-stone-700">
              <li>✓ 3 dynamic QR codes</li>
              <li>✓ Unlimited scans</li>
              <li>✓ Edit destination anytime</li>
              <li>✓ Scan analytics</li>
              <li>✓ PNG & SVG downloads</li>
              <li>✓ Codes never expire</li>
            </ul>
            <Link href="/signup" className="btn-primary mt-6 w-full">Start free</Link>
          </div>
          <div className="card border-stone-900 p-6 ring-1 ring-stone-900">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Pro</h3>
              <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-medium text-brand-700">Coming soon</span>
            </div>
            <p className="mt-2 text-4xl font-extrabold">$5<span className="text-base font-medium text-stone-500">/month</span></p>
            <ul className="mt-5 space-y-2 text-sm text-stone-700">
              <li>✓ Unlimited dynamic codes</li>
              <li>✓ Your logo in the code</li>
              <li>✓ Custom short domain</li>
              <li>✓ Bulk create & CSV export</li>
              <li>✓ Full analytics history</li>
            </ul>
            <button disabled className="btn-secondary mt-6 w-full">Join the waitlist soon</button>
          </div>
        </div>
      </section>

      <footer className="border-t border-stone-200 py-8 text-center text-sm text-stone-500">
        © {new Date().getFullYear()} QRForge. Made for small businesses everywhere.
      </footer>
    </>
  );
}
