import Link from 'next/link';

export const metadata = { title: 'QR code unavailable', robots: { index: false } };

export default async function UnavailablePage({ searchParams }) {
  const { reason } = await searchParams;
  const paused = reason === 'paused';

  return (
    <div className="mx-auto max-w-md px-4 py-20 text-center">
      <div className="text-5xl" aria-hidden="true">{paused ? '⏸' : '∅'}</div>
      <h1 className="mt-4 text-2xl font-bold tracking-tight">
        {paused ? 'This QR code is paused' : 'This QR code doesn’t exist'}
      </h1>
      <p className="mt-2 text-stone-500">
        {paused
          ? 'Its owner has turned it off for now. Try again later.'
          : 'The link may be mistyped, or the code was deleted by its owner.'}
      </p>
      <div className="card mt-10 p-5 text-left">
        <p className="font-semibold">Need QR codes for your business?</p>
        <p className="mt-1 text-sm text-stone-500">Make codes you can edit after printing. Free, and they never expire.</p>
        <Link href="/signup" className="btn-brand mt-4">Try QRForge free</Link>
      </div>
    </div>
  );
}
