import Link from 'next/link';
import Logo from './Logo';
import { getCurrentUser } from '@/lib/auth';
import { logout } from '@/app/actions';

export default async function Header() {
  const user = await getCurrentUser();

  return (
    <header className="border-b border-stone-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Logo />
        <nav className="flex items-center gap-2 text-sm">
          {user ? (
            <>
              <Link href="/dashboard" className="rounded-lg px-3 py-2 font-medium text-stone-700 hover:bg-stone-100">
                Dashboard
              </Link>
              <form action={logout}>
                <button className="rounded-lg px-3 py-2 font-medium text-stone-500 hover:bg-stone-100">Log out</button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className="rounded-lg px-3 py-2 font-medium text-stone-700 hover:bg-stone-100">
                Log in
              </Link>
              <Link href="/signup" className="btn-primary py-2">
                Get started
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
