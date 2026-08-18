'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { usePortfolio } from '@/components/providers/portfolio-provider';

export default function HomePage() {
  const { isLoggedIn } = usePortfolio();
  const router = useRouter();

  useEffect(() => {
    if (isLoggedIn) {
      router.replace('/dashboard');
    } else {
      router.replace('/login');
    }
  }, [isLoggedIn, router]);

  return (
    <div className="flex-1 flex flex-col justify-center items-center bg-background p-6 min-h-[70vh]">
      <Loader2 className="size-6 text-primary animate-spin" />
      <span className="text-xs text-muted-foreground mt-3 font-mono">Routing...</span>
    </div>
  );
}