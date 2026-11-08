import { redirect } from 'next/navigation';
import AuthForm from '@/components/AuthForm';
import { getCurrentUser } from '@/lib/auth';
import { signup } from '@/app/actions';

export const metadata = { title: 'Create account' };

export default async function SignupPage() {
  if (await getCurrentUser()) redirect('/dashboard');
  return <AuthForm mode="signup" action={signup} />;
}
