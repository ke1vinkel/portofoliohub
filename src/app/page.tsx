'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePortfolio } from '@/components/providers/portfolio-provider';

export default function HomePage() {
  const { isLoggedIn, currentUser } = usePortfolio();
  const router = useRouter();

  useEffect(() => {
    if (isLoggedIn) {
      router.replace('/dashboard');
    } else {
      router.replace('/login');
    }
  }, [isLoggedIn, router]);

  // Loading spinner while routing
  return (
    <div className="flex-1 flex flex-col justify-center items-center bg-stone-50 dark:bg-zinc-900 p-6">
      <div className="w-8 h-8 rounded-full border-4 border-stone-200 border-t-amber-600 animate-spin" />
      <span className="text-xs text-stone-500 mt-3 font-mono">Routing...</span>
    </div>
  );
}