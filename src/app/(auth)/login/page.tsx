'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Eye, EyeOff, Loader2, Sparkles, FolderKanban, CheckCircle2, Globe } from 'lucide-react';
import { usePortfolio } from '@/components/providers/portfolio-provider';
import { Brand } from '@/components/ui/Brand';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';

export default function LoginPage() {
  const { login, isLoggedIn, currentUser } = usePortfolio();
  const router = useRouter();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
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

    if (!username.trim() || !password.trim()) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);
    const success = await login(username.trim(), password.trim());
    setLoading(false);
    if (!success) {
      setError('Invalid Email or Password. Please try again.');
    }
  };

  return (
    <main className="grid min-h-[100dvh] lg:grid-cols-[0.78fr_1.22fr]">
      {/* Left Column: Sign-in form */}
      <section className="ui-page-enter flex min-h-[100dvh] flex-col px-5 py-5 sm:px-10 sm:py-8 lg:px-12">
        <div className="flex items-center justify-between">
          <Brand />
          <div className="flex items-center gap-2">
            <ThemeToggle />
          </div>
        </div>

        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-12">
          <p className="mb-3 text-sm font-medium text-primary">
            Internal access
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            Sign in to PortfolioHub
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign in to manage and customize your professional portfolios.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5" autoComplete="off">
            {error && (
              <div
                className="animate-in fade-in slide-in-from-top-1 rounded-lg bg-destructive/10 px-3.5 py-2.5 text-sm text-destructive"
                role="alert"
              >
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="student@domain.com"
                disabled={loading}
                required
                autoComplete="email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative flex items-center">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  disabled={loading}
                  required
                  autoComplete="current-password"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 text-muted-foreground hover:text-foreground transition-colors p-1"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            <Button className="w-full" size="lg" type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Please wait...
                </>
              ) : (
                <>
                  Sign in
                  <ArrowRight className="size-4 ml-1" />
                </>
              )}
            </Button>
          </form>
        </div>

        <p className="text-xs text-muted-foreground">
          Accounts are managed internally.
        </p>
      </section>

      {/* Right Column: Interactive Decorative Preview Panel */}
      <aside className="ui-page-enter ui-page-enter-delayed relative hidden max-h-[100dvh] min-h-[100dvh] overflow-hidden border-l border-border bg-muted/40 lg:flex flex-col justify-between p-10">
        <div className="flex items-center justify-between border-b border-border/80 pb-4">
          <div>
            <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
              Portfolio Preview
            </p>
            <p className="mt-1 text-sm font-medium text-foreground">
              Dynamic Showcase & Verified Credentials
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background/80 px-2.5 py-1 text-xs font-medium text-foreground shadow-xs">
            <Sparkles className="size-3 text-primary" />
            Live Preview
          </span>
        </div>

        {/* Floating Mockup Preview Stack */}
        <div className="relative my-auto flex items-center justify-center py-8">
          <div className="absolute h-80 w-[420px] rotate-[-4deg] rounded-2xl border border-border bg-card/60 shadow-sm" />
          <div className="absolute h-84 w-[430px] rotate-[2.5deg] rounded-2xl border border-border bg-card/80 shadow-md" />

          {/* Main Card */}
          <div className="login-preview-hitbox relative z-10 w-[440px]">
            <div className="login-preview-card rounded-2xl border border-border bg-card p-6 shadow-xl space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="size-11 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                    JL
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground text-sm">Jordan Lee</h3>
                    <p className="text-xs text-muted-foreground">Computer Science · Binus</p>
                  </div>
                </div>
                <span className="badge badge-public text-[10px]">
                  Public Live
                </span>
              </div>

              <div className="space-y-2 rounded-xl bg-muted/40 p-3.5 border border-border/50">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-foreground flex items-center gap-1.5">
                    <FolderKanban className="size-3.5 text-primary" />
                    Interactive Portfolio
                  </span>
                  <span className="text-[11px] text-muted-foreground font-mono">3 Projects</span>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                  Full-stack applications with Next.js, real-time messaging, and verified academic milestones.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="rounded-lg border border-border/60 bg-background/60 p-2">
                  <div className="font-semibold text-foreground text-sm">12</div>
                  <div className="text-[10px] text-muted-foreground">Skills</div>
                </div>
                <div className="rounded-lg border border-border/60 bg-background/60 p-2">
                  <div className="font-semibold text-primary text-sm">3.9</div>
                  <div className="text-[10px] text-muted-foreground">GPA</div>
                </div>
                <div className="rounded-lg border border-border/60 bg-background/60 p-2">
                  <div className="font-semibold text-emerald-600 dark:text-emerald-400 text-sm flex items-center justify-center gap-0.5">
                    <CheckCircle2 className="size-3" /> Ready
                  </div>
                  <div className="text-[10px] text-muted-foreground">Status</div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-border/60 text-xs text-muted-foreground">
                <span className="flex items-center gap-1 font-mono text-[11px]">
                  <Globe className="size-3" />
                  portfoliohub.app/jordanlee
                </span>
                <span className="text-[10px]">Updated today</span>
              </div>
            </div>
          </div>
        </div>

        <p className="text-center text-xs leading-5 text-muted-foreground">
          Build a focused portfolio with clear structure, projects, and verified achievements.
        </p>
      </aside>
    </main>
  );
}
