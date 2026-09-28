'use client';

import { useRouter, useSearchParams } from 'next/navigation';

export function FilterToggle() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isRankedOnly = searchParams.get('ranked') === 'true';
  const accountId = searchParams.get('id');

  const toggle = () => {
    if (!accountId) return;
    if (isRankedOnly) {
      router.push(`/?id=${accountId}`);
    } else {
      router.push(`/?id=${accountId}&ranked=true`);
    }
  };

  if (!accountId) return null;

  return (
    <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-300 hover:text-white transition-colors">
      <div className="relative">
        <input type="checkbox" className="sr-only" checked={isRankedOnly} onChange={toggle} />
        <div className={`block w-10 h-6 rounded-full transition-colors ${isRankedOnly ? 'bg-red-500' : 'bg-slate-700'}`}></div>
        <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${isRankedOnly ? 'translate-x-4' : ''}`}></div>
      </div>
      Somente Rankeadas
    </label>
  );
}
