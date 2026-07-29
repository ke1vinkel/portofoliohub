'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { usePortfolio } from '@/components/providers/portfolio-provider';

let isInitialAppLoad = true;

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { authLoading, isLoggedIn, currentUser, theme, toggleTheme, logout, hasUnsavedChanges, setHasUnsavedChanges } = usePortfolio();
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
      <div className="flex-grow flex flex-col justify-center items-center bg-stone-50 dark:bg-zinc-900 p-6 min-h-screen">
        <div className="w-8 h-8 rounded-full border-4 border-stone-200 border-t-[var(--accent)] animate-spin" />
        <span className="text-xs text-stone-500 mt-3 font-mono">Verifying Session...</span>
      </div>
    );
  }

  const isLecturer = currentUser.role === 'lecturer';

  // Navigation Items: Lecturer gets ONLY Admin Portal. Student gets Dashboard, Portfolios, Profile.
  const navItems = isLecturer
    ? [
        {
          label: 'Admin Portal',
          path: '/admin',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          ),
        },
      ]
    : [
        {
          label: 'Dashboard',
          path: '/dashboard',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <rect x="3" y="3" width="7" height="9" rx="1" />
              <rect x="14" y="3" width="7" height="5" rx="1" />
              <rect x="14" y="12" width="7" height="9" rx="1" />
              <rect x="3" y="16" width="7" height="5" rx="1" />
            </svg>
          ),
        },
        {
          label: 'Portfolios',
          path: '/portfolios',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
            </svg>
          ),
        },
        {
          label: 'Profile',
          path: '/profile',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          ),
        },
      ];

  const handleLogout = () => {
    if (hasUnsavedChanges && !window.confirm('You have unsaved changes. Are you sure you want to leave?')) return;
    setHasUnsavedChanges(false);
    logout();
    router.push('/login');
  };

  return (
    <div className="flex-grow flex flex-col bg-[var(--bg)] min-h-screen text-[var(--text)] pb-20 sm:pb-12 relative font-outfit">
      




      {/* Top Navbar Header (Mobile Only) */}
      <header className="sm:hidden sticky top-0 z-30 w-full px-5 py-4 bg-white/70 dark:bg-zinc-950/70 backdrop-blur-md border-b border-[var(--border)] flex justify-between items-center">
        <div className="flex items-center gap-1.5 animate-fadeIn">
          <svg className="w-5 h-5 text-[var(--accent)]" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
          </svg>
          <span className="font-semibold text-[var(--text)] text-sm tracking-tight">PortfolioHub</span>
          {currentUser.role === 'lecturer' && (
            <span className="text-[9px] uppercase tracking-widest bg-[var(--accent-light)] text-[var(--accent)] px-1.5 py-0.5 rounded font-mono font-bold">
              Lecturer
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-3">
          {/* Theme Selector */}
          <button
            onClick={toggleTheme}
            className="w-8 h-8 rounded-full border border-[var(--border)] bg-[var(--bg-card)] flex items-center justify-center shadow-sm hover:scale-105 active:scale-95 transition-all"
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? (
              <i className="fas fa-sun text-amber-500 text-xs"></i>
            ) : (
              <i className="fas fa-moon text-[var(--text-secondary)] text-xs"></i>
            )}
          </button>

          {/* Quick Logout Button */}
          <button
            onClick={handleLogout}
            className="w-8 h-8 rounded-full border border-red-200 dark:border-red-950 bg-red-50 dark:bg-red-950/40 text-red-600 flex items-center justify-center shadow-sm hover:scale-105 active:scale-95 transition-all"
            aria-label="Log Out"
          >
            <i className="fas fa-sign-out-alt text-xs"></i>
          </button>
        </div>
      </header>

      {/* Main Workspace Frame */}
      <div className="flex-1 w-full max-w-[1200px] lg:max-w-[1400px] xl:max-w-[1600px] 2xl:max-w-[1800px] mx-auto px-4 lg:px-8 py-5 lg:py-8 flex flex-col z-10 animate-fadeIn">
        {children}
      </div>

      {/* Bottom Sticky Mobile Navigation */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 max-w-[480px] mx-auto z-40 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md border-t border-[var(--border)] py-2.5 px-4 flex justify-around items-center">
        {navItems.map((item) => {
          const isActive = !!pathname && (pathname === item.path || (item.path !== '/dashboard' && pathname.startsWith(item.path)));
          return (
            <Link
              key={item.path}
              href={item.path}
              onClick={(e) => {
                if (hasUnsavedChanges && !window.confirm('You have unsaved changes. Are you sure you want to leave?')) {
                  e.preventDefault();
                } else {
                  setHasUnsavedChanges(false);
                }
              }}
              className={`flex flex-col items-center gap-0.5 text-center transition-all ${
                isActive 
                  ? 'text-[var(--accent)] scale-105 font-medium' 
                  : 'text-stone-400 dark:text-zinc-500 hover:text-stone-600'
              }`}
            >
              {item.icon}
              <span className="text-[10px] tracking-tight">{item.label}</span>
            </Link>
          );
        })}
      </nav>

    </div>
  );
}
