'use client';

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { LogOut, AlertCircle } from 'lucide-react';
import { usePortfolio } from '../providers/portfolio-provider';
import { Brand } from './Brand';
import { ThemeToggle } from './ThemeToggle';
import { Button } from './Button';
import { cn } from '@/lib/utils';

export const LayoutShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isLoggedIn, currentUser, logout, hasUnsavedChanges, setHasUnsavedChanges } = usePortfolio();
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    if (hasUnsavedChanges && !window.confirm('You have unsaved changes. Are you sure you want to leave?')) return;
    setHasUnsavedChanges(false);
    logout();
    router.push('/login');
  };

  const isLecturer = currentUser?.role === 'lecturer';
  const isDashboardRoute =
    !!pathname &&
    (pathname === '/dashboard' ||
      pathname.startsWith('/projects') ||
      pathname.startsWith('/portfolios') ||
      pathname.startsWith('/profile') ||
      pathname === '/admin');

  return (
    <div className="min-h-screen w-full flex flex-col bg-background text-foreground">
      {/* Top Navigation Bar only for authenticated dashboard sessions */}
      {isLoggedIn && currentUser && isDashboardRoute && (
        <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
          <div className="flex h-16 w-full items-center justify-between px-4 sm:px-6 lg:px-10 xl:px-14 2xl:px-16">
            <div className="flex items-center gap-6 lg:gap-8">
              <Brand />

              <nav className="hidden sm:flex items-center gap-5">
                {isLecturer ? (
                  <Link
                    href="/admin"
                    onClick={(e) => {
                      if (hasUnsavedChanges && !window.confirm('You have unsaved changes. Are you sure you want to leave?')) {
                        e.preventDefault();
                      } else {
                        setHasUnsavedChanges(false);
                      }
                    }}
                    className={cn(
                      'text-sm transition-colors',
                      pathname === '/admin'
                        ? 'text-foreground font-semibold'
                        : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    Admin Portal
                  </Link>
                ) : (
                  <>
                    <Link
                      href="/dashboard"
                      onClick={(e) => {
                        if (hasUnsavedChanges && !window.confirm('You have unsaved changes. Are you sure you want to leave?')) {
                          e.preventDefault();
                        } else {
                          setHasUnsavedChanges(false);
                        }
                      }}
                      className={cn(
                        'text-sm transition-colors',
                        pathname === '/dashboard'
                          ? 'text-foreground font-semibold'
                          : 'text-muted-foreground hover:text-foreground'
                      )}
                    >
                      Dashboard
                    </Link>
                    <Link
                      href="/projects"
                      onClick={(e) => {
                        if (hasUnsavedChanges && !window.confirm('You have unsaved changes. Are you sure you want to leave?')) {
                          e.preventDefault();
                        } else {
                          setHasUnsavedChanges(false);
                        }
                      }}
                      className={cn(
                        'text-sm transition-colors',
                        pathname === '/projects'
                          ? 'text-foreground font-semibold'
                          : 'text-muted-foreground hover:text-foreground'
                      )}
                    >
                      Projects
                    </Link>
                    <Link
                      href="/portfolios"
                      onClick={(e) => {
                        if (hasUnsavedChanges && !window.confirm('You have unsaved changes. Are you sure you want to leave?')) {
                          e.preventDefault();
                        } else {
                          setHasUnsavedChanges(false);
                        }
                      }}
                      className={cn(
                        'text-sm transition-colors',
                        pathname.startsWith('/portfolios')
                          ? 'text-foreground font-semibold'
                          : 'text-muted-foreground hover:text-foreground'
                      )}
                    >
                      Portfolios
                    </Link>
                    <Link
                      href="/profile"
                      onClick={(e) => {
                        if (hasUnsavedChanges && !window.confirm('You have unsaved changes. Are you sure you want to leave?')) {
                          e.preventDefault();
                        } else {
                          setHasUnsavedChanges(false);
                        }
                      }}
                      className={cn(
                        'text-sm transition-colors',
                        pathname === '/profile'
                          ? 'text-foreground font-semibold'
                          : 'text-muted-foreground hover:text-foreground'
                      )}
                    >
                      Profile
                    </Link>
                  </>
                )}
              </nav>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <span className="hidden max-w-64 truncate text-xs text-muted-foreground md:inline-block font-medium">
                {currentUser.name} · {isLecturer ? 'Lecturer' : 'Student'}
              </span>

              <ThemeToggle />

              <Button
                variant="destructive"
                size="sm"
                onClick={handleLogout}
                className="gap-1.5"
                title="Sign out"
              >
                <LogOut className="size-3.5" />
                <span className="hidden sm:inline">Sign out</span>
              </Button>
            </div>
          </div>
        </header>
      )}

      {/* Main Content Area */}
      <main id="main-content" className="flex-1 flex flex-col w-full relative z-10">
        {children}
      </main>

      {/* Floating Unsaved Changes Warning Banner */}
      {hasUnsavedChanges && (
        <div
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 rounded-2xl border bg-popover px-4 py-3 text-popover-foreground shadow-xl animate-in fade-in slide-in-from-bottom-2 duration-200"
          role="status"
          aria-live="polite"
        >
          <AlertCircle className="size-4 text-amber-500 shrink-0" />
          <span className="text-xs font-medium">You have unsaved changes. Make sure to click save!</span>
        </div>
      )}
    </div>
  );
};
