'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePortfolio } from '@/components/providers/portfolio-provider';

export default function LoginPage() {
  const { login, isLoggedIn, currentUser } = usePortfolio();
  const router = useRouter();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isShaking, setIsShaking] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (isLoggedIn && currentUser) {
      if (currentUser.role === 'lecturer') {
        router.replace('/admin');
      } else {
        router.replace('/dashboard');
      }
    }
  }, [isLoggedIn, currentUser, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsShaking(false);

    if (!username.trim() || !password.trim()) {
      setError('Please fill in all fields.');
      triggerShake();
      return;
    }

    setLoading(true);
    const success = await login(username.trim(), password.trim());
    setLoading(false);
    if (!success) {
      setError('Invalid Email or Password. Please try again.');
      triggerShake();
    }
  };

  const triggerShake = () => {
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 400);
  };

  return (
    <div className="login-premium-root font-outfit min-h-screen flex flex-col justify-between p-6">
      
      {/* Styles Injected Locally for Perfect Theme Cohesion */}
      <style dangerouslySetInnerHTML={{ __html: `
        .login-theme-root {
          --bg-body: #faf9f6;
          --bg-card: #ffffff;
          --border-color: #e5e7eb;
          --text-primary: #111827;
          --text-secondary: #4b5563;
          --accent: #0d766e;
          --accent-hover: #0f766e;
          --accent-light: rgba(13, 118, 110, 0.1);
        }

        .login-premium-root {
          background-color: #faf9f6;
          color: #111827;
        }

        .login-card-premium {
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 20px;
          padding: 2.5rem;
          box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.07);
          width: 100%;
          max-width: 420px;
          transition: transform 0.3s ease;
        }

        .shake-animation {
          animation: shake 0.4s ease-in-out;
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-6px); }
          40%, 80% { transform: translateX(6px); }
        }

        .input-premium {
          width: 100%;
          padding: 0.8rem 1.2rem;
          border-radius: 12px;
          border: 1px solid #d1d5db;
          background: #f9fafb;
          color: #111827;
          outline: none;
          transition: all 0.2s ease;
          font-size: 0.9rem;
          font-weight: 500;
        }

        .input-premium:focus {
          border-color: #0d766e;
          background: #ffffff;
          box-shadow: 0 0 0 3px rgba(13, 118, 110, 0.15);
        }

        .btn-submit-premium {
          width: 100%;
          padding: 0.9rem;
          border-radius: 9999px;
          background: #0d766e;
          color: #ffffff !important;
          font-weight: 700;
          font-size: 0.95rem;
          border: 1px solid #0d766e;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 4px 14px rgba(13, 118, 110, 0.25);
        }

        .btn-submit-premium:hover {
          background: #0f766e;
          border-color: #0f766e;
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(13, 118, 110, 0.35);
        }

        .btn-submit-premium:active {
          transform: translateY(0);
        }

        .brand-hand {
          font-family: var(--font-outfit), var(--font-sans), system-ui, -apple-system, sans-serif;
          color: #111827;
          font-weight: 800;
          font-size: 1.15rem;
          letter-spacing: -0.025em;
        }
      ` }} />

      {/* Top Header Row */}
      <header className="flex justify-between items-center w-full max-w-5xl mx-auto mb-8">
        <div className="flex items-center gap-2">
          <span className="font-outfit font-extrabold text-[1.15rem] tracking-tight text-[var(--text-primary)]">
            Portfolio<span className="text-[var(--accent)] font-extrabold">Hub</span>
          </span>
          <span className="text-xs uppercase tracking-widest text-[var(--text-secondary)] font-semibold mt-0.5">· Portal</span>
        </div>
      </header>

      {/* Centered Login Card */}
      <main className="flex-1 flex justify-center items-center w-full">
        <div className={`login-card-premium ${isShaking ? 'shake-animation' : ''}`}>
          
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-extrabold tracking-tight mb-2 text-stone-900">Welcome</h1>
            <p className="text-sm text-stone-600">Sign in to <b className="text-stone-800">MANAGE</b> and <b className="text-stone-800">CUSTOMIZE</b> your professional Portfolio.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5" autoComplete="off">
            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 text-red-600 text-xs rounded-xl font-medium">
                <i className="fas fa-exclamation-circle mr-1"></i> {error}
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-700" htmlFor="username-input">Email</label>
              <input
                id="username-input"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="input-premium"
                placeholder="user@domain.com"
                disabled={loading}
                autoComplete="off"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-700" htmlFor="password-input">Password</label>
              <div className="relative flex items-center">
                <input
                  id="password-input"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-premium pr-10"
                  placeholder="Enter your password"
                  disabled={loading}
                  autoComplete="off"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 text-stone-400 hover:text-stone-700 transition-colors"
                  tabIndex={-1}
                >
                  <i className={showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'}></i>
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-submit-premium flex items-center justify-center gap-2">
              {loading ? (
                <span className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
              ) : (
                <>Sign In <i className="fas fa-sign-in-alt"></i></>
              )}
            </button>
          </form>

        </div>
      </main>

      {/* Footer copyright */}
      <footer className="text-center text-[10px] font-mono text-[var(--text-secondary)] opacity-60 mt-8">
        PortfolioHub Admin Portal v1.2 · Active Server Session
      </footer>

    </div>
  );
}
