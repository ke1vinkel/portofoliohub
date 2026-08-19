'use client';

import React from 'react';
import {
  Star,
  Pencil,
  Trash2,
  ExternalLink,
  Globe,
  Tag,
  Layers,
  FolderKanban,
  Check,
  Plus,
} from 'lucide-react';
import { GithubIcon } from '@/components/ui/SocialIcons';
import { Project, usePortfolio } from '@/components/providers/portfolio-provider';
import { formatExternalUrl } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface ProjectCardProps {
  project: Project;
  onEdit: (project: Project) => void;
  onDelete: (id: string) => void;
  onToggleFeatured?: (project: Project) => void;
  currentPortfolioId?: string;
  isAssignedToCurrentPortfolio?: boolean;
  onTogglePortfolioVisibility?: (project: Project, shouldShow: boolean) => void;
}

export function ProjectCard({
  project,
  onEdit,
  onDelete,
  onToggleFeatured,
  currentPortfolioId,
  isAssignedToCurrentPortfolio,
  onTogglePortfolioVisibility,
}: ProjectCardProps) {
  const { db, currentUser } = usePortfolio();
  const isFeatured = project.featured === 1;

  // Find all portfolios that contain this project
  const userPortfolios = db.portfolios.filter(
    (p) => (p.user_id || (p as any).user) === currentUser?.id
  );
  const assignedPortfolios = userPortfolios.filter((p) =>
    db.projects.some(
      (proj) =>
        proj.portfolio_id === p.id &&
        (proj.id === project.id ||
          proj.title.trim().toLowerCase() === project.title.trim().toLowerCase())
    )
  );

  const isInCurrent = isAssignedToCurrentPortfolio !== undefined
    ? isAssignedToCurrentPortfolio
    : currentPortfolioId
    ? project.portfolio_id === currentPortfolioId ||
      assignedPortfolios.some((p) => p.id === currentPortfolioId)
    : true;

  return (
    <div
      className={cn(
        'group relative flex flex-col justify-between rounded-2xl border bg-card p-5 transition-all duration-300 hover:shadow-md hover:border-primary/40',
        isFeatured
          ? 'border-amber-500/40 bg-gradient-to-b from-amber-500/5 to-transparent'
          : 'border-border/80'
      )}
    >
      <div>
        {/* Card Header Media & Badges */}
        {project.image ? (
          <div className="relative mb-4 overflow-hidden rounded-xl border border-border/60 aspect-video bg-muted">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={project.image}
              alt={project.title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            {isFeatured && (
              <span className="absolute top-2.5 right-2.5 inline-flex items-center gap-1 rounded-full bg-amber-500/90 backdrop-blur-xs px-2.5 py-0.5 text-[10px] font-bold text-white shadow-xs">
                <Star className="size-3 fill-white" /> Featured
              </span>
            )}
            <span className="absolute bottom-2.5 left-2.5 rounded-md bg-black/70 backdrop-blur-xs px-2 py-0.5 text-[10px] font-medium text-white">
              {project.category || 'Project'}
            </span>
          </div>
        ) : (
          <div className="flex items-center justify-between mb-3">
            <span className="inline-flex items-center gap-1 rounded-md border border-border/80 bg-muted/40 px-2 py-0.5 text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
              <Layers className="size-3" /> {project.category || 'Project'}
            </span>
            {isFeatured && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 text-[10px] font-semibold text-amber-500">
                <Star className="size-3 fill-amber-500" /> Featured
              </span>
            )}
          </div>
        )}

        {/* Project Title & Short Description */}
        <h4 className="text-base font-semibold tracking-tight text-foreground group-hover:text-primary transition-colors line-clamp-1">
          {project.title}
        </h4>

        {project.description && (
          <p className="mt-1.5 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
            {project.description}
          </p>
        )}

        {/* Technology Tag Pills */}
        {project.technologies && project.technologies.length > 0 && (
          <div className="mt-3.5 flex flex-wrap gap-1">
            {project.technologies.slice(0, 4).map((tech) => (
              <span
                key={tech}
                className="inline-flex items-center rounded-md bg-muted/60 px-2 py-0.5 text-[10px] font-medium text-foreground/80 border border-border/40"
              >
                {tech}
              </span>
            ))}
            {project.technologies.length > 4 && (
              <span className="inline-flex items-center rounded-md bg-muted/40 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                +{project.technologies.length - 4}
              </span>
            )}
          </div>
        )}

        {/* Assigned Portfolios Badges */}
        {userPortfolios.length > 1 && assignedPortfolios.length > 0 && (
          <div className="mt-3 flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
              <FolderKanban className="size-3 text-muted-foreground" />
              In {assignedPortfolios.length} {assignedPortfolios.length === 1 ? 'portfolio' : 'portfolios'}:
            </span>
            {assignedPortfolios.map((ap) => (
              <span
                key={ap.id}
                className={cn(
                  'inline-flex items-center rounded-md px-1.5 py-0.5 text-[9px] font-medium border',
                  currentPortfolioId && ap.id === currentPortfolioId
                    ? 'border-primary/40 bg-primary/10 text-primary font-semibold'
                    : 'border-border/60 bg-muted/40 text-muted-foreground'
                )}
                title={ap.title}
              >
                {ap.title}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Visibility Toggle Bar (when displayed in library mode or when toggle handler is passed) */}
      {onTogglePortfolioVisibility && (
        <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between">
          <button
            type="button"
            onClick={() => onTogglePortfolioVisibility(project, !isInCurrent)}
            className={cn(
              'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all w-full justify-center',
              isInCurrent
                ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 group/btn'
                : 'bg-primary/10 text-primary border border-primary/20 hover:bg-primary hover:text-primary-foreground'
            )}
          >
            {isInCurrent ? (
              <>
                <Check className="size-3.5 group-hover/btn:hidden" />
                <span className="group-hover/btn:hidden">Showing in this portfolio</span>
                <span className="hidden group-hover/btn:inline">Hide from this portfolio</span>
              </>
            ) : (
              <>
                <Plus className="size-3.5" />
                <span>Show in this portfolio</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Card Footer: Links & Action Buttons */}
      <div className={cn("flex items-center justify-between", onTogglePortfolioVisibility ? "mt-3 pt-2" : "mt-5 pt-3 border-t border-border/60")}>
        {/* External Links */}
        <div className="flex items-center gap-2">
          {project.github_url && (
            <a
              href={formatExternalUrl(project.github_url, 'github')}
              target="_blank"
              rel="noreferrer"
              className="rounded-lg p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              title="GitHub Repo"
            >
              <GithubIcon className="size-4" />
            </a>
          )}
          {project.live_url && (
            <a
              href={formatExternalUrl(project.live_url, 'general')}
              target="_blank"
              rel="noreferrer"
              className="rounded-lg p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
              title="Live Demo"
            >
              <Globe className="size-4" />
            </a>
          )}
          {project.links &&
            project.links
              .filter((l) => l.type === 'custom' && l.url)
              .slice(0, 1)
              .map((l, i) => (
                <a
                  key={i}
                  href={formatExternalUrl(l.url, 'general')}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-lg p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  title={l.label || 'External Link'}
                >
                  <ExternalLink className="size-4" />
                </a>
              ))}
        </div>

        {/* Edit & Delete Action Buttons */}
        <div className="flex items-center gap-1">
          {onToggleFeatured && (
            <button
              type="button"
              onClick={() => onToggleFeatured(project)}
              className={cn(
                'rounded-lg p-1.5 transition-colors',
                isFeatured
                  ? 'text-amber-500 hover:bg-amber-500/10'
                  : 'text-muted-foreground hover:text-amber-500 hover:bg-muted'
              )}
              title={isFeatured ? 'Unfeature project' : 'Feature project'}
            >
              <Star className={cn('size-4', isFeatured && 'fill-amber-500')} />
            </button>
          )}

          <button
            type="button"
            onClick={() => onEdit(project)}
            className="rounded-lg p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            title="Edit project"
          >
            <Pencil className="size-4" />
          </button>

          <button
            type="button"
            onClick={() => onDelete(project.id)}
            className="rounded-lg p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
            title="Delete project"
          >
            <Trash2 className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
