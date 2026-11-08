'use client';

import Link from 'next/link';
import { useActionState } from 'react';

export default function AuthForm({ mode, action }) {
  const [state, formAction, pending] = useActionState(action, null);
  const isSignup = mode === 'signup';

  return (
    <div className="mx-auto w-full max-w-sm px-4 py-16">
      <h1 className="text-2xl font-bold tracking-tight">{isSignup ? 'Create your account' : 'Welcome back'}</h1>
      <p className="mt-1 text-sm text-stone-500">
        {isSignup ? 'Free forever. Your codes never expire.' : 'Log in to manage your QR codes.'}
      </p>

      <form action={formAction} className="mt-8 space-y-4">
        {isSignup && (
          <div>
            <label htmlFor="name" className="label">Name <span className="font-normal text-stone-400">(optional)</span></label>
            <input id="name" name="name" className="input" autoComplete="name" defaultValue={state?.values?.name} />
          </div>
        )}
        <div>
          <label htmlFor="email" className="label">Email</label>
          <input id="email" name="email" type="email" required className="input" autoComplete="email" defaultValue={state?.values?.email} />
        </div>
        <div>
          <label htmlFor="password" className="label">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={isSignup ? 8 : undefined}
            className="input"
            autoComplete={isSignup ? 'new-password' : 'current-password'}
          />
          {isSignup && <p className="mt-1.5 text-xs text-stone-500">At least 8 characters.</p>}
        </div>

        {state?.error && (
          <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>
        )}

        <button disabled={pending} className="btn-primary w-full">
          {pending ? 'Please wait…' : isSignup ? 'Create account' : 'Log in'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-stone-500">
        {isSignup ? 'Already have an account? ' : 'New to QRForge? '}
        <Link href={isSignup ? '/login' : '/signup'} className="font-semibold text-stone-900 underline-offset-4 hover:underline">
          {isSignup ? 'Log in' : 'Create a free account'}
        </Link>
      </p>
    </div>
  );
}
