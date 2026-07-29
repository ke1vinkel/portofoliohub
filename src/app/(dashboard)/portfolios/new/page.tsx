'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function NewPortfolioPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/portfolios');
  }, [router]);

  return (
    <div className="flex-grow flex flex-col justify-center items-center p-6 text-stone-400">
      <div className="w-6 h-6 rounded-full border-2 border-stone-200 border-t-amber-600 animate-spin" />
    </div>
  );
}
