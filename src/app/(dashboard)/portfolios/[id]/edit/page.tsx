'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Palette,
  FolderKanban,
  Settings,
  ExternalLink,
  ArrowLeft,
  Loader2,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';
import { usePortfolio, ThemeConfig } from '@/components/providers/portfolio-provider';
import { ThemeCustomizer } from '@/components/portfolio/ThemeCustomizer';
import { ProjectManager } from '@/components/portfolio/ProjectManager';
import { PortfolioSettings } from '@/components/portfolio/PortfolioSettings';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/hooks/useToast';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function PortfolioEditPage() {
  const params = useParams();
  const router = useRouter();
  const portfolioId = params.id as string;

  const {
    db,
    dbLoaded,
    currentUser,
    updatePortfolio,
    setHasUnsavedChanges,
  } = usePortfolio();

  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'theme' | 'projects' | 'settings'>('theme');

  // Find portfolio
  const portfolio = db.portfolios.find((p) => p.id === portfolioId);

  // Local theme state for dirty tracking
  const [localThemeConfig, setLocalThemeConfig] = useState<ThemeConfig>({
    preset: 'obsidian',
    bg_color: '#0d0d11',
    surface_color: '#16161e',
    text_color: '#f3f4f6',
    accent_color: '#10b981',
    font_style: 'sans',
    card_style: 'spotlight',
  });

  useEffect(() => {
    if (portfolio?.theme_config) {
      setLocalThemeConfig(portfolio.theme_config);
    }
  }, [portfolio]);

  const isThemeDirty = portfolio
    ? JSON.stringify(localThemeConfig) !==
      JSON.stringify(
        portfolio.theme_config || {
          preset: 'obsidian',
          bg_color: '#0d0d11',
          surface_color: '#16161e',
          text_color: '#f3f4f6',
          accent_color: '#10b981',
          font_style: 'sans',
          card_style: 'spotlight',
        }
      )
    : false;

  useEffect(() => {
    setHasUnsavedChanges(isThemeDirty);
    return () => setHasUnsavedChanges(false);
  }, [isThemeDirty, setHasUnsavedChanges]);

  if (!currentUser) return null;

  if (!dbLoaded) {
    return (
      <div className="flex-1 flex flex-col justify-center items-center p-12 min-h-[50vh] text-center">
        <Loader2 className="size-6 text-primary animate-spin" />
        <span className="text-xs text-muted-foreground mt-3 font-mono">Loading studio...</span>
      </div>
    );
  }

  if (!portfolio) {
    return (
      <div className="flex-1 flex flex-col justify-center items-center p-12 min-h-[50vh] text-center">
        <AlertTriangle className="size-8 text-amber-500 mb-2" />
        <h3 className="font-semibold text-foreground text-base">Portfolio Not Found</h3>
        <p className="text-xs text-muted-foreground mt-1">
          The requested portfolio could not be found or has been removed.
        </p>
        <Button onClick={() => router.push('/portfolios')} size="sm" className="mt-4">
          Back to Portfolios
        </Button>
      </div>
    );
  }

  const handleSaveTheme = async () => {
    await updatePortfolio(
      portfolio.id,
      portfolio.title,
      portfolio.description || '',
      portfolio.is_public === 1,
      localThemeConfig
    );
    showToast('Theme styling saved!');
  };

  const handleUpdateSettings = async (data: {
    title: string;
    description: string;
    isPublic: boolean;
  }) => {
    await updatePortfolio(
      portfolio.id,
      data.title,
      data.description,
      data.isPublic,
      localThemeConfig
    );
  };

  return (
    <div className="flex-1 flex flex-col gap-6 w-full max-w-6xl mx-auto">
      {/* Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border/80 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1.5">
            <Link
              href="/portfolios"
              className="hover:text-foreground transition-colors flex items-center gap-1"
            >
              <ArrowLeft className="size-3.5" /> Portfolios
            </Link>
            <span>/</span>
            <span className="text-foreground font-medium truncate max-w-xs">
              {portfolio.title}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground">
              Portfolio Studio
            </h1>
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                portfolio.is_public === 1
                  ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {portfolio.is_public === 1 ? '● Live' : '○ Private'}
            </span>
          </div>
        </div>

        {/* View public page & Segmented Tabs */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex h-9 items-center rounded-xl bg-muted p-1 text-xs font-semibold text-muted-foreground">
            <button
              type="button"
              onClick={() => setActiveTab('theme')}
              className={cn(
                'px-3.5 py-1 rounded-lg transition-all flex items-center gap-1.5',
                activeTab === 'theme'
                  ? 'bg-background text-foreground shadow-xs font-medium'
                  : 'hover:text-foreground'
              )}
            >
              <Palette className="size-3.5" /> Theme & Styling
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('projects')}
              className={cn(
                'px-3.5 py-1 rounded-lg transition-all flex items-center gap-1.5',
                activeTab === 'projects'
                  ? 'bg-background text-foreground shadow-xs font-medium'
                  : 'hover:text-foreground'
              )}
            >
              <FolderKanban className="size-3.5" /> Projects
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('settings')}
              className={cn(
                'px-3.5 py-1 rounded-lg transition-all flex items-center gap-1.5',
                activeTab === 'settings'
                  ? 'bg-background text-foreground shadow-xs font-medium'
                  : 'hover:text-foreground'
              )}
            >
              <Settings className="size-3.5" /> Settings
            </button>
          </div>

          <a
            href={`/${currentUser.username}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted transition-colors shadow-xs h-9"
          >
            <ExternalLink className="size-3.5 text-muted-foreground" />
            <span>Public Page</span>
          </a>
        </div>
      </div>

      {/* Tab Content */}
      <div className="mt-1">
        {activeTab === 'theme' && (
          <ThemeCustomizer
            themeConfig={localThemeConfig}
            onChange={setLocalThemeConfig}
            onSave={handleSaveTheme}
            isDirty={isThemeDirty}
          />
        )}

        {activeTab === 'projects' && (
          <ProjectManager portfolioId={portfolio.id} />
        )}

        {activeTab === 'settings' && (
          <PortfolioSettings
            portfolio={portfolio}
            onUpdate={handleUpdateSettings}
          />
        )}
      </div>
    </div>
  );
}
