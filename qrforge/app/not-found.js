import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="mx-auto max-w-md px-4 py-24 text-center">
      <h1 className="text-2xl font-bold tracking-tight">Page not found</h1>
      <p className="mt-2 text-stone-500">We couldn&apos;t find what you were looking for.</p>
      <Link href="/" className="btn-primary mt-6">Go home</Link>
    </div>
  );
}
