import Link from 'next/link';

export default function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2 font-bold tracking-tight text-stone-900">
      <svg viewBox="0 0 24 24" className="h-7 w-7" aria-hidden="true">
        <rect width="24" height="24" rx="6" fill="#1c1917" />
        <rect x="5" y="5" width="6" height="6" rx="1.5" fill="#fff" />
        <rect x="13" y="5" width="6" height="6" rx="1.5" fill="#fff" />
        <rect x="5" y="13" width="6" height="6" rx="1.5" fill="#fff" />
        <rect x="14" y="14" width="4" height="4" rx="1" fill="#f97316" />
      </svg>
      <span className="text-lg">QRForge</span>
    </Link>
  );
}
