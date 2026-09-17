'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowRight,
  Eye,
  EyeOff,
  Loader2,
  Sparkles,
  MapPin,
  FileText,
  Settings,
  ExternalLink,
  Star,
  Globe,
  Mail,
} from 'lucide-react';
import { usePortfolio } from '@/components/providers/portfolio-provider';
import { Brand } from '@/components/ui/Brand';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { GithubIcon, LinkedinIcon } from '@/components/ui/SocialIcons';
import { IframeGuard } from '@/components/ui/IframeGuard';

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
    <IframeGuard>
      <main className="grid min-h-[100dvh] lg:grid-cols-[0.7fr_1.3fr] xl:grid-cols-[0.66fr_1.34fr]">
      {/* Left Column: Sign-in form */}
      <section className="ui-page-enter flex min-h-[100dvh] flex-col px-6 py-6 sm:px-10 sm:py-8 lg:px-12">
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
            Sign in to Portfolio App
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

      {/* Right Column: Interactive Animated Multi-Project Live Portfolio Showcase */}
      <aside className="ui-page-enter ui-page-enter-delayed relative hidden max-h-[100dvh] min-h-[100dvh] overflow-hidden border-l border-border bg-muted/20 lg:flex flex-col justify-between p-6 xl:p-8">
        {/* Top bar */}
        <div className="flex items-center justify-between border-b border-border/70 pb-3.5 shrink-0">
          <div>
            <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase font-mono">
              Live Showcase Preview
            </p>
            <p className="text-xs font-medium text-foreground mt-0.5">
              Public Recruiter Canvas · Interactive View
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary shadow-xs transition-all hover:bg-primary/20 hover:scale-105 cursor-default">
            <Sparkles className="size-3 animate-pulse" />
            Live Preview
          </span>
        </div>

        {/* Floating Interactive Portfolio Canvas */}
        <div className="relative my-auto flex items-center justify-center py-2 w-full">
          {/* Main Card with Subtle Hover Lift & Shadow */}
          <div className="relative z-10 w-full max-w-[660px]">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-xl hover:shadow-2xl hover:border-primary/30 transition-all duration-300 ease-out space-y-4.5">
              
              {/* Mockup Topbar */}
              <div className="flex items-center justify-between border-b border-border/70 pb-3.5">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <span className="size-2.5 rounded-full bg-red-400/80 hover:scale-125 transition-transform cursor-pointer" />
                    <span className="size-2.5 rounded-full bg-amber-400/80 hover:scale-125 transition-transform cursor-pointer" />
                    <span className="size-2.5 rounded-full bg-emerald-400/80 hover:scale-125 transition-transform cursor-pointer" />
                  </div>
                  <span className="text-sm font-bold tracking-tight text-foreground ml-1.5">
                    Jordan<span className="text-muted-foreground font-normal"> · portfolio</span>
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground border border-border px-2.5 py-1 rounded-md bg-muted/40 hover:text-primary hover:border-primary/40 hover:bg-primary/5 transition-all duration-200 cursor-pointer active:scale-95">
                    <FileText className="size-3" /> CV
                  </span>
                  <span className="inline-flex items-center justify-center size-7 text-muted-foreground border border-border rounded-md bg-muted/40 hover:text-primary hover:border-primary/40 hover:bg-primary/5 transition-all duration-200 cursor-pointer active:scale-95">
                    <Settings className="size-3 hover:rotate-90 transition-transform duration-300" />
                  </span>
                </div>
              </div>

              {/* Hero Presentation */}
              <div className="space-y-3">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <div>
                    <h2 className="text-2xl font-bold tracking-tight text-foreground leading-tight">
                      Hi, I&apos;m Jordan
                    </h2>
                    <div className="text-xl font-bold text-primary tracking-tight">
                      Software Developer
                    </div>
                  </div>

                  {/* Metadata & Pulsing Availability Indicator */}
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1 hover:text-foreground transition-colors cursor-default">
                      <MapPin className="size-3 text-primary" /> Remote / Global
                    </span>
                    <span className="flex items-center gap-1.5 text-primary font-medium bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20 hover:bg-primary/15 transition-all cursor-default">
                      <span className="relative flex size-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full size-2 bg-emerald-500"></span>
                      </span>
                      <span>Available</span>
                    </span>
                  </div>
                </div>

                {/* Social Icons & Brief intro */}
                <div className="flex items-center justify-between gap-4 pt-0.5">
                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 max-w-[420px]">
                    I enjoy building robust backends, clean frontends, and verified software architectures. Focused on maintainable code that solves real problems.
                  </p>
                  
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="size-7 rounded-lg border border-border bg-muted/40 flex items-center justify-center text-foreground hover:text-primary hover:border-primary/50 hover:bg-primary/10 hover:scale-110 active:scale-95 transition-all duration-200 cursor-pointer">
                      <GithubIcon className="size-3.5" />
                    </span>
                    <span className="size-7 rounded-lg border border-border bg-muted/40 flex items-center justify-center text-foreground hover:text-primary hover:border-primary/50 hover:bg-primary/10 hover:scale-110 active:scale-95 transition-all duration-200 cursor-pointer">
                      <LinkedinIcon className="size-3.5" />
                    </span>
                    <span className="size-7 rounded-lg border border-border bg-muted/40 flex items-center justify-center text-foreground hover:text-primary hover:border-primary/50 hover:bg-primary/10 hover:scale-110 active:scale-95 transition-all duration-200 cursor-pointer">
                      <Globe className="size-3.5" />
                    </span>
                    <span className="size-7 rounded-lg border border-border bg-muted/40 flex items-center justify-center text-foreground hover:text-primary hover:border-primary/50 hover:bg-primary/10 hover:scale-110 active:scale-95 transition-all duration-200 cursor-pointer">
                      <Mail className="size-3.5" />
                    </span>
                  </div>
                </div>
              </div>

              {/* Projects Section with Animated Hover Cards */}
              <div className="space-y-2.5 pt-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <span className="text-primary font-bold text-sm">+</span> Projects
                  </span>
                  <span className="text-[10px] text-muted-foreground font-mono">
                    Selected works
                  </span>
                </div>

                <div className="space-y-2.5 max-h-[290px] overflow-y-auto pr-0.5">
                  
                  {/* Project Card 1: Featured Analytics Platform */}
                  <div className="group/card rounded-2xl border border-border/80 bg-muted/30 p-3.5 shadow-xs transition-all duration-200 hover:bg-muted/50 hover:border-primary/40 hover:-translate-y-0.5 hover:shadow-md space-y-2.5 cursor-pointer">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-0.5">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-primary group-hover/card:text-primary/90 transition-colors">
                          Web & App Development
                        </span>
                        <h4 className="text-xs font-semibold text-foreground group-hover/card:text-primary transition-colors">
                          Project 1 · Analytics Platform
                        </h4>
                        <p className="text-[10px] text-muted-foreground leading-relaxed">
                          Full-stack analytics dashboard with real-time telemetry and modular component architecture.
                        </p>
                      </div>

                      <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/20 bg-amber-500/10 px-2 py-0.5 text-[9px] font-semibold text-amber-600 dark:text-amber-400 shrink-0 group-hover/card:scale-105 transition-transform">
                        <Star className="size-2 fill-current" />
                        Featured
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1.5 border-t border-border/60">
                      <div className="flex gap-1">
                        <span className="text-[9px] font-mono px-1.5 py-0.2 rounded border border-border bg-background/80 text-muted-foreground group-hover/card:border-primary/30 transition-colors">
                          React
                        </span>
                        <span className="text-[9px] font-mono px-1.5 py-0.2 rounded border border-border bg-background/80 text-muted-foreground group-hover/card:border-primary/30 transition-colors">
                          Next.js
                        </span>
                        <span className="text-[9px] font-mono px-1.5 py-0.2 rounded border border-border bg-background/80 text-muted-foreground group-hover/card:border-primary/30 transition-colors">
                          TypeScript
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-[10px]">
                        <span className="font-semibold text-primary flex items-center gap-1 group-hover/card:underline">
                          <GithubIcon className="size-2.5" />
                          <span>View on GitHub</span>
                          <span className="group-hover/card:translate-x-1 transition-transform duration-200">→</span>
                        </span>
                        <span className="text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors">
                          View Details <ExternalLink className="size-2 group-hover/card:scale-110 transition-transform" />
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Project Card 2: Workspace Platform */}
                  <div className="group/card rounded-2xl border border-border/80 bg-muted/30 p-3.5 shadow-xs transition-all duration-200 hover:bg-muted/50 hover:border-primary/40 hover:-translate-y-0.5 hover:shadow-md space-y-2.5 cursor-pointer">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-0.5">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-primary group-hover/card:text-primary/90 transition-colors">
                          Cloud & Infrastructure
                        </span>
                        <h4 className="text-xs font-semibold text-foreground group-hover/card:text-primary transition-colors">
                          Project 2 · Workspace Platform
                        </h4>
                        <p className="text-[10px] text-muted-foreground leading-relaxed">
                          Collaborative real-time workspace with document sync, presence indicators, and role permissions.
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1.5 border-t border-border/60">
                      <div className="flex gap-1">
                        <span className="text-[9px] font-mono px-1.5 py-0.2 rounded border border-border bg-background/80 text-muted-foreground group-hover/card:border-primary/30 transition-colors">
                          Node.js
                        </span>
                        <span className="text-[9px] font-mono px-1.5 py-0.2 rounded border border-border bg-background/80 text-muted-foreground group-hover/card:border-primary/30 transition-colors">
                          PostgreSQL
                        </span>
                        <span className="text-[9px] font-mono px-1.5 py-0.2 rounded border border-border bg-background/80 text-muted-foreground group-hover/card:border-primary/30 transition-colors">
                          Tailwind
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-[10px]">
                        <span className="font-semibold text-primary flex items-center gap-1 group-hover/card:underline">
                          <ExternalLink className="size-2.5" />
                          <span>View Live Demo</span>
                          <span className="group-hover/card:translate-x-1 transition-transform duration-200">→</span>
                        </span>
                        <span className="text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors">
                          View Details <ExternalLink className="size-2 group-hover/card:scale-110 transition-transform" />
                        </span>
                      </div>
                    </div>
                  </div>

                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Footer caption */}
        <p className="text-center text-xs leading-relaxed text-muted-foreground shrink-0">
          Build a focused portfolio with clear structure, project highlights, and verified credentials.
        </p>
      </aside>
    </main>
    </IframeGuard>
  );
}
