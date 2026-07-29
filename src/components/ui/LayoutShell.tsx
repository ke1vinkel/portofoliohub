'use client';

import React, { useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { usePortfolio } from '../providers/portfolio-provider';

export const LayoutShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isLoggedIn, currentUser, logout, hasUnsavedChanges, setHasUnsavedChanges } = usePortfolio();
  const pathname = usePathname();
  const router = useRouter();
  const glowRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const [showFab, setShowFab] = useState(false);

  // Check if current route is a public recruiter view
  const isPublicRoute =
    !!pathname &&
    pathname !== '/' &&
    pathname !== '/login' &&
    pathname !== '/dashboard' &&
    pathname !== '/portfolios' &&
    pathname !== '/profile' &&
    pathname !== '/admin' &&
    !pathname.startsWith('/portfolios/') &&
    !pathname.startsWith('/api/');

  useEffect(() => {
    // 1. Cursor glow handler (only on public pages)
    const handleMouseMove = (e: MouseEvent) => {
      if (!isPublicRoute || !glowRef.current) return;
      glowRef.current.style.left = `${e.clientX}px`;
      glowRef.current.style.top = `${e.clientY}px`;
      glowRef.current.style.opacity = '1';
    };

    const handleMouseLeave = () => {
      if (glowRef.current) {
        glowRef.current.style.opacity = '0';
      }
    };

    if (isPublicRoute) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseleave', handleMouseLeave);
    }

    // 2. Scroll handler for scroll progress & FAB
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      
      if (progressBarRef.current) {
        progressBarRef.current.style.width = `${progress}%`;
      }
      
      setShowFab(window.scrollY > 400);
    };

    window.addEventListener('scroll', handleScroll);

    // Initial check
    handleScroll();

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isPublicRoute]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen w-full bg-stone-950 sm:bg-[var(--bg)] flex justify-center sm:block overflow-x-hidden relative">
      {/* Skip to Content for Keyboard accessibility */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2.5 focus:bg-[var(--accent)] focus:text-white focus:rounded-xl focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs font-semibold"
      >
        Skip to main content
      </a>

      {/* Scroll Progress Indicator */}
      <div ref={progressBarRef} className="scroll-progress-bar" style={{ width: '0%' }} />

      {/* Dynamic Cursor Glow (only on public recruiter screen) */}
      {isPublicRoute && (
        <div
          ref={glowRef}
          className="cursor-glow-element active"
          style={{ opacity: 0 }}
        />
      )}

      {/* Outer wrapper that models a mobile device layout */}
      <div className="phone-container shadow-[0_0_120px_rgba(0,0,0,0.85)]">
        {/* Desktop Top Navigation Bar */}
        {/* Desktop Top Navigation Bar */}
        {isLoggedIn && currentUser && (
          <header className="hidden sm:flex w-full bg-[var(--surface)] backdrop-blur-md border-b border-[var(--border)] sticky top-0 z-30 font-outfit transition-all">
            <div className="max-w-[1200px] lg:max-w-[1400px] xl:max-w-[1600px] 2xl:max-w-[1800px] w-full mx-auto px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-8">
                <span 
                  className="flex items-center gap-2 cursor-pointer transition-transform hover:scale-[1.02]" 
                  onClick={() => {
                    if (hasUnsavedChanges && !window.confirm('You have unsaved changes. Are you sure you want to leave?')) return;
                    router.push(currentUser.role === 'lecturer' ? '/admin' : '/dashboard');
                  }}
                >
                  <span className="font-outfit font-extrabold text-[1.15rem] tracking-tight text-[var(--text)]">
                    Portfolio<span className="text-[var(--accent)] font-extrabold">Hub</span>
                  </span>
                  <span className="text-xs uppercase tracking-widest text-[var(--text-secondary)] font-semibold mt-0.5">
                    · {currentUser.role === 'lecturer' ? 'Admin Portal' : 'Portal'}
                  </span>
                </span>
                
                <nav className="flex items-center gap-1.5">
                  {currentUser.role === 'lecturer' ? (
                    <Link 
                      href="/admin" 
                      onClick={(e) => {
                        if (hasUnsavedChanges && !window.confirm('You have unsaved changes. Are you sure you want to leave?')) {
                          e.preventDefault();
                        } else {
                          setHasUnsavedChanges(false);
                        }
                      }}
                      className={`text-[13px] lg:text-[14px] font-bold transition-all px-4 py-2 rounded-xl border ${pathname === '/admin' ? 'bg-[var(--accent-light)] text-[var(--accent)] border-[var(--border)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--accent-light)] border-transparent'}`}
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
                        className={`text-[13px] lg:text-[14px] font-bold transition-all px-4 py-2 rounded-xl border ${pathname === '/dashboard' ? 'bg-[var(--accent-light)] text-[var(--accent)] border-[var(--border)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--accent-light)] border-transparent'}`}
                      >
                        Dashboard
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
                        className={`text-[13px] lg:text-[14px] font-bold transition-all px-4 py-2 rounded-xl border ${pathname.startsWith('/portfolios') ? 'bg-[var(--accent-light)] text-[var(--accent)] border-[var(--border)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--accent-light)] border-transparent'}`}
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
                        className={`text-[13px] lg:text-[14px] font-bold transition-all px-4 py-2 rounded-xl border ${pathname === '/profile' ? 'bg-[var(--accent-light)] text-[var(--accent)] border-[var(--border)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--accent-light)] border-transparent'}`}
                      >
                        Profile
                      </Link>
                    </>
                  )}
                </nav>
              </div>
 
              <div className="flex items-center gap-4">
 
                <div className="flex items-center gap-2">
                  <span className="text-xs lg:text-sm font-semibold text-[var(--text-secondary)]">
                    {currentUser.name}
                  </span>
                  {currentUser.role === 'lecturer' && (
                    <span className="text-[10px] uppercase tracking-wider bg-[var(--accent-light)] text-[var(--accent)] px-2 py-0.5 rounded font-mono font-bold border border-[var(--border)]">
                      Lecturer
                    </span>
                  )}
                </div>
                  <button
                    onClick={() => {
                      if (hasUnsavedChanges && !window.confirm('You have unsaved changes. Are you sure you want to leave?')) return;
                      setHasUnsavedChanges(false);
                      logout();
                      router.push('/login');
                    }}
                    className="px-4 py-2 rounded-full border border-red-200/50 dark:border-red-950/50 bg-red-50 dark:bg-red-950/20 text-red-600 flex items-center gap-1.5 text-xs font-semibold shadow-sm hover:scale-105 active:scale-95 transition-all"
                    title="Sign Out"
                  >
                    Logout <i className="fas fa-sign-out-alt"></i>
                  </button>
                </div>
              </div>
            </header>
          )}

        {/* Main page content area */}
        <main id="main-content" className="flex-1 flex flex-col w-full relative z-10">
          {children}
        </main>
      </div>

      {/* Floating Action Button (FAB) */}
      <button
        onClick={scrollToTop}
        className={`fab-button ${showFab ? 'visible' : ''}`}
        aria-label="Scroll to top"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-5 h-5"
        >
          <path d="m18 15-6-6-6 6" />
        </svg>
      </button>

      {/* Floating Unsaved Changes Warning Banner */}
      {hasUnsavedChanges && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-3 bg-amber-600 dark:bg-amber-700 text-white rounded-2xl shadow-xl flex items-center gap-2.5 text-xs font-semibold animate-bounce border border-amber-500/30">
          <svg className="w-4 h-4 shrink-0 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>You have unsaved changes. Make sure to click save!</span>
        </div>
      )}
    </div>
  );
};
