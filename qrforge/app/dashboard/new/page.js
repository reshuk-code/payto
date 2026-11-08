import Link from 'next/link';
import { requireUser } from '@/lib/auth';
import { countCodes, getBaseUrl, planLimit, FREE_PLAN_LIMIT } from '@/lib/codes';
import { createCodeAction } from '@/app/actions';
import CodeForm from '@/components/CodeForm';

export const metadata = { title: 'New QR code' };

export default async function NewCodePage() {
  const user = await requireUser();
  const atLimit = (await countCodes(user.id)) >= planLimit(user);
  // Same length as a real short link, so the preview looks like the final code.
  const previewUrl = `${await getBaseUrl()}/r/preview`;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:py-10">
      <Link href="/dashboard" className="text-sm text-stone-500 hover:text-stone-900">← Back to codes</Link>
      <h1 className="mt-3 text-2xl font-bold tracking-tight">New QR code</h1>

      {atLimit ? (
        <div className="card mt-6 p-6">
          <p className="font-semibold">You&apos;ve used all {FREE_PLAN_LIMIT} free codes.</p>
          <p className="mt-1 text-sm text-stone-500">
            Edit an existing code to point it somewhere new, or delete one you no longer need. Pro with unlimited codes is coming soon.
          </p>
        </div>
      ) : (
        <div className="card mt-6 p-5 sm:p-8">
          <CodeForm action={createCodeAction} previewUrl={previewUrl} submitLabel="Create QR code" />
        </div>
      )}
    </div>
  );
}
