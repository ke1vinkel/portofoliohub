'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import {
  Code2,
  ExternalLink,
  Plus,
  Layers,
  Sparkles,
  Loader2,
} from 'lucide-react';
import { usePortfolio } from '@/components/providers/portfolio-provider';
import { ProjectManager } from '@/components/portfolio/ProjectManager';
import { Button } from '@/components/ui/Button';

export default function ProjectsPage() {
  const { db, dbLoaded, currentUser, activePortfolioId, setActivePortfolio } = usePortfolio();
  const router = useRouter();

  if (!currentUser) return null;

  if (!dbLoaded) {
    return (
      <div className="flex-1 flex flex-col justify-center items-center p-12 min-h-[50vh] text-center">
        <Loader2 className="size-6 text-primary animate-spin" />
        <span className="text-xs text-muted-foreground mt-3 font-mono">Loading projects...</span>
      </div>
    );
  }

  // Get current user's portfolios and active portfolio
  const userPortfolios = db.portfolios.filter(
    (p) => (p.user_id || (p as any).user) === currentUser.id
  );
  const activePortfolio =
    db.portfolios.find((p) => p.id === activePortfolioId) || userPortfolios[0];

  const totalUserProjects = userPortfolios.reduce((acc, p) => {
    return acc + db.projects.filter((proj) => proj.portfolio_id === p.id).length;
  }, 0);

  const featuredProjects = userPortfolios.reduce((acc, p) => {
    return acc + db.projects.filter((proj) => proj.portfolio_id === p.id && proj.featured === 1).length;
  }, 0);

  return (
    <div className="flex-1 flex flex-col gap-6 w-full max-w-7xl mx-auto">
      {/* Header matching App Design System */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border/80 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Projects
            </h1>
            <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
              {totalUserProjects} Total
            </span>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            Manage, tag, and feature your technical projects, case studies, and live apps.
          </p>
        </div>

        {/* Quick actions & stats */}
        <div className="flex flex-wrap items-center gap-3">
          {userPortfolios.length > 1 && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground font-medium">Portfolio:</span>
              <select
                value={activePortfolio?.id || ''}
                onChange={(e) => setActivePortfolio(e.target.value)}
                className="h-9 rounded-xl border border-input bg-card px-3 text-xs font-semibold text-foreground focus:outline-hidden shadow-xs"
              >
                {userPortfolios.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title} ({p.is_public === 1 ? 'Live' : 'Private'})
                  </option>
                ))}
              </select>
            </div>
          )}

          {featuredProjects > 0 && (
            <div className="hidden sm:flex items-center gap-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs font-medium text-amber-500">
              <Sparkles className="size-3.5" />
              <span>{featuredProjects} Featured</span>
            </div>
          )}

          <a
            href={`/${currentUser.username}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3.5 py-2 text-xs font-semibold text-foreground hover:bg-muted transition-colors shadow-xs"
          >
            <ExternalLink className="size-3.5 text-muted-foreground" />
            <span>View Public Page</span>
          </a>
        </div>
      </div>

      {/* Main Project Manager */}
      {activePortfolio ? (
        <ProjectManager portfolioId={activePortfolio.id} />
      ) : (
        <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-border rounded-2xl bg-card">
          <Code2 className="size-8 text-muted-foreground mb-3" />
          <h3 className="text-base font-semibold text-foreground">No portfolio found</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm">
            Create a portfolio first to start adding and showcasing your projects.
          </p>
          <Button
            onClick={() => router.push('/portfolios')}
            size="sm"
            className="mt-4"
          >
            Go to Portfolios
          </Button>
        </div>
      )}
    </div>
  );
}
