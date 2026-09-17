'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { LayoutDashboard, FolderKanban, User, ShieldCheck, Loader2 } from 'lucide-react';
import { usePortfolio } from '@/components/providers/portfolio-provider';
import { IframeGuard } from '@/components/ui/IframeGuard';
import { cn } from '@/lib/utils';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { authLoading, isLoggedIn, currentUser, hasUnsavedChanges, setHasUnsavedChanges } = usePortfolio();
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (authLoading) return;

    if (!isLoggedIn) {
      router.replace('/login');
      return;
    }

    if (currentUser?.role === 'lecturer' && pathname !== '/admin') {
      router.replace('/admin');
    } else if (currentUser?.role === 'student' && pathname === '/admin') {
      router.replace('/dashboard');
    }
  }, [authLoading, isLoggedIn, currentUser, pathname, router]);

  if (!mounted || authLoading || !isLoggedIn || !currentUser) {
    return (
      <div className="flex-1 flex flex-col justify-center items-center bg-muted/30 p-6 min-h-[80vh]">
        <Loader2 className="size-6 text-primary animate-spin" />
        <span className="text-xs text-muted-foreground mt-3 font-mono">Verifying Session...</span>
      </div>
    );
  }

  const isLecturer = currentUser.role === 'lecturer';

  const navItems = isLecturer
    ? [
        {
          label: 'Admin Portal',
          path: '/admin',
          icon: <ShieldCheck className="size-5" />,
        },
      ]
    : [
        {
          label: 'Dashboard',
          path: '/dashboard',
          icon: <LayoutDashboard className="size-5" />,
        },
        {
          label: 'Projects',
          path: '/projects',
          icon: <FolderKanban className="size-5" />,
        },
        {
          label: 'Portfolios',
          path: '/portfolios',
          icon: <FolderKanban className="size-5" />,
        },
        {
          label: 'Profile',
          path: '/profile',
          icon: <User className="size-5" />,
        },
      ];

  return (
    <IframeGuard>
      <div className="flex-1 flex flex-col bg-muted/20 pb-16 sm:pb-0">
        {/* Main Workspace Frame */}
        <div className="ui-page-enter flex-1 w-full px-4 py-6 sm:px-6 sm:py-8 lg:px-10 xl:px-14 2xl:px-16 flex flex-col">
          {children}
        </div>

        {/* Bottom Mobile Navigation */}
        <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur border-t border-border py-2 px-6 flex justify-around items-center">
          {navItems.map((item) => {
            const isActive =
              !!pathname &&
              (pathname === item.path || (item.path !== '/dashboard' && pathname.startsWith(item.path)));
            return (
              <Link
                key={item.path}
                href={item.path}
                onClick={(e) => {
                  if (
                    hasUnsavedChanges &&
                    !window.confirm('You have unsaved changes. Are you sure you want to leave?')
                  ) {
                    e.preventDefault();
                  } else {
                    setHasUnsavedChanges(false);
                  }
                }}
                className={cn(
                  'flex flex-col items-center gap-1 text-center transition-colors py-1 px-3 rounded-lg',
                  isActive
                    ? 'text-primary font-medium'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {item.icon}
                <span className="text-[11px] font-medium tracking-tight">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </IframeGuard>
  );
}
