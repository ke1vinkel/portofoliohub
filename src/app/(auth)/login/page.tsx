'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePortfolio } from '@/components/providers/portfolio-provider';

export default function LoginPage() {
  const { login, isLoggedIn, currentUser, theme, toggleTheme } = usePortfolio();
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
        :root {
          --bg-body: var(--bg);
          --bg-surface: var(--surface);
          --bg-surface-solid: var(--surface-alt);
          --bg-card: var(--surface-card);
          --border-color: var(--border);
          --text-primary: var(--text);
          --text-secondary: var(--text-muted);
          --accent: var(--accent);
          --accent-hover: var(--accent-hover);
          --accent-light: var(--accent-light);
          --border-radius-outer: var(--radius);
          --border-radius-inner: var(--radius-inner);
        }

        [data-theme="dark"] {
          --bg-body: var(--bg);
          --bg-surface: var(--surface);
          --bg-surface-solid: var(--surface-alt);
          --bg-card: var(--surface-card);
          --border-color: var(--border);
          --text-primary: var(--text);
          --text-secondary: var(--text-muted);
          --accent: var(--accent);
          --accent-hover: var(--accent-hover);
          --accent-light: var(--accent-light);
        }

        .login-premium-root {
          background-color: var(--bg-body);
          color: var(--text-primary);
          transition: background-color 0.3s, color 0.3s;
        }

        .login-card-premium {
          background: var(--bg-surface);
          backdrop-filter: blur(16px) saturate(180%);
          -webkit-backdrop-filter: blur(16px) saturate(180%);
          border: 1px solid var(--border-color);
          border-radius: var(--border-radius-outer);
          padding: 2.5rem;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.03);
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
          border-radius: var(--border-radius-inner);
          border: 1px solid var(--border-color);
          background: var(--bg-body);
          color: var(--text-primary);
          outline: none;
          transition: all 0.2s ease;
          font-size: 0.9rem;
        }

        .input-premium:focus {
          border-color: var(--accent);
          box-shadow: 0 0 0 3px var(--accent-light);
        }

        .btn-submit-premium {
          width: 100%;
          padding: 0.9rem;
          border-radius: 9999px;
          background: var(--accent);
          color: #ffffff;
          font-weight: 600;
          font-size: 0.95rem;
          border: 1px solid var(--accent);
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 4px 12px rgba(43, 110, 110, 0.15);
        }

        .btn-submit-premium:hover {
          background: var(--accent-hover);
          border-color: var(--accent-hover);
          transform: translateY(-1px);
        }

        .btn-submit-premium:active {
          transform: translateY(0);
        }

        .brand-hand {
          font-family: 'Edu SA Hand', cursive;
          color: var(--accent);
          font-weight: 700;
          font-size: 1.4rem;
        }
      ` }} />

      {/* Top Header Row */}
      <header className="flex justify-between items-center w-full max-w-5xl mx-auto mb-8">
        <div className="flex items-center gap-2">
          <span className="brand-hand">PortfolioHub</span>
          <span className="text-xs uppercase tracking-widest text-[var(--text-secondary)] font-semibold mt-1">· Portal</span>
        </div>
        
        <button
          onClick={toggleTheme}
          className="w-10 h-10 rounded-full flex items-center justify-center border border-[var(--border-color)] bg-[var(--bg-card)] hover:scale-105 active:scale-95 transition-all shadow-sm"
          aria-label="Toggle light/dark theme"
        >
          <i className={theme === 'dark' ? 'fas fa-sun text-amber-500' : 'fas fa-moon text-[var(--text-secondary)]'}></i>
        </button>
      </header>

      {/* Centered Login Card */}
      <main className="flex-1 flex justify-center items-center w-full">
        <div className={`login-card-premium ${isShaking ? 'shake-animation' : ''}`}>
          
          <div className="text-center mb-8">
            <h1 className="text-2xl font-extrabold tracking-tight mb-2">Welcome</h1>
            <p className="text-sm text-[var(--text-secondary)]">Sign in to <b>MANAGE</b> and <b>CUSTOMIZE</b> your professional Portfolio.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5" autoComplete="off">
            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 text-red-600 text-xs rounded-xl font-medium">
                <i className="fas fa-exclamation-circle mr-1"></i> {error}
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]" htmlFor="username-input">Email</label>
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
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]" htmlFor="password-input">Password</label>
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
