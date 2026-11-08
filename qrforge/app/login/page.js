import { redirect } from 'next/navigation';
import AuthForm from '@/components/AuthForm';
import { getCurrentUser } from '@/lib/auth';
import { login } from '@/app/actions';

export const metadata = { title: 'Log in' };

export default async function LoginPage() {
  if (await getCurrentUser()) redirect('/dashboard');
  return <AuthForm mode="login" action={login} />;
}
