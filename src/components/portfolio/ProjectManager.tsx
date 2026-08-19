'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Plus,
  Search,
  FolderKanban,
  Filter,
  Layers,
  Star,
  AlertTriangle,
  Library,
  CheckCircle2,
  Eye,
  EyeOff,
  Sparkles,
} from 'lucide-react';
import { Project, usePortfolio } from '@/components/providers/portfolio-provider';
import { ProjectCard } from './ProjectCard';
import { ProjectModal } from './ProjectModal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/hooks/useToast';
import { cn } from '@/lib/utils';

interface ProjectManagerProps {
  portfolioId: string;
}

export function ProjectManager({ portfolioId }: ProjectManagerProps) {
  const router = useRouter();
  const {
    db,
    currentUser,
    addProject,
    updateProject,
    deleteProject,
    toggleProjectInPortfolio,
    syncProjectPortfolios,
  } = usePortfolio();
  const { showToast } = useToast();

  const [viewMode, setViewMode] = useState<'current' | 'library'>('current');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [deleteModalState, setDeleteModalState] = useState<{
    project: Project;
    assignedCount: number;
  } | null>(null);

  // User's portfolios
  const userPortfolios = db.portfolios.filter(
    (p) => (p.user_id || (p as any).user) === currentUser?.id
  );
  const userPortfolioIds = userPortfolios.map((p) => p.id);
  const currentPortfolio = userPortfolios.find((p) => p.id === portfolioId);

  // Projects strictly belonging to this portfolio
  const portfolioProjects = db.projects.filter((p) => p.portfolio_id === portfolioId);

  // All user projects across all their portfolios (deduplicated by title/id for the Library view)
  const allUserProjects = db.projects.filter((p) =>
    userPortfolioIds.includes(p.portfolio_id)
  );

  const uniqueUserProjects: Project[] = [];
  const seenTitles = new Set<string>();
  for (const p of allUserProjects) {
    const normTitle = p.title.trim().toLowerCase();
    if (!seenTitles.has(normTitle)) {
      seenTitles.add(normTitle);
      uniqueUserProjects.push(p);
    }
  }

  // Active dataset depending on view mode
  const activeProjectsList = viewMode === 'current' ? portfolioProjects : uniqueUserProjects;

  // Unique categories
  const categories = [
    'all',
    ...Array.from(new Set(activeProjectsList.map((p) => p.category || 'Other'))),
  ];

  // Search & category filtered
  const filteredProjects = activeProjectsList.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.technologies && p.technologies.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())));

    const matchesCategory =
      selectedCategory === 'all' || (p.category || 'Other') === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  // Sort featured first, then newest
  const sortedProjects = [...filteredProjects].sort((a, b) => {
    if ((b.featured || 0) !== (a.featured || 0)) {
      return (b.featured || 0) - (a.featured || 0);
    }
    return new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime();
  });

  const handleOpenAdd = () => {
    if (userPortfolios.length === 0) {
      showToast('You must create a portfolio first before adding projects.');
      router.push('/portfolios');
      return;
    }
    setEditingProject(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (proj: Project) => {
    setEditingProject(proj);
    setModalOpen(true);
  };

  const handleSaveProject = async (projectData: any, selectedPortfolioIds?: string[]) => {
    if (selectedPortfolioIds && selectedPortfolioIds.length > 0) {
      await syncProjectPortfolios(projectData, selectedPortfolioIds, editingProject);
      showToast(`Project saved to ${selectedPortfolioIds.length} portfolio(s)!`);
    } else if (editingProject) {
      await updateProject(editingProject.id, projectData);
      showToast('Project updated successfully!');
    } else {
      await addProject(portfolioId, projectData);
      showToast('Project created successfully!');
    }
  };

  const handleToggleFeatured = async (proj: Project) => {
    const newFeatured = proj.featured === 1 ? 0 : 1;
    await updateProject(proj.id, { featured: newFeatured });
    showToast(newFeatured === 1 ? 'Project featured!' : 'Project unfeatured');
  };

  const handleToggleVisibility = async (proj: Project, shouldShow: boolean) => {
    await toggleProjectInPortfolio(proj, portfolioId, shouldShow);
    showToast(
      shouldShow
        ? `"${proj.title}" added to ${currentPortfolio?.title || 'this portfolio'}!`
        : `"${proj.title}" removed from ${currentPortfolio?.title || 'this portfolio'}.`
    );
  };

  const handleOpenDeleteConfirm = (projectId: string) => {
    const proj = db.projects.find((p) => p.id === projectId);
    if (!proj) return;

    // Count how many portfolios have this project
    const assignedCount = userPortfolios.filter((p) =>
      db.projects.some(
        (pr) =>
          pr.portfolio_id === p.id &&
          (pr.id === proj.id || pr.title.trim().toLowerCase() === proj.title.trim().toLowerCase())
      )
    ).length;

    setDeleteModalState({ project: proj, assignedCount });
  };

  const handleRemoveFromThisPortfolioOnly = async () => {
    if (!deleteModalState) return;
    await toggleProjectInPortfolio(deleteModalState.project, portfolioId, false);
    showToast(`Removed from ${currentPortfolio?.title || 'this portfolio'}`);
    setDeleteModalState(null);
  };

  const handleDeleteGlobally = async () => {
    if (!deleteModalState) return;
    const normTitle = deleteModalState.project.title.trim().toLowerCase();
    // Delete from all user portfolios
    const allMatches = db.projects.filter(
      (p) =>
        userPortfolioIds.includes(p.portfolio_id) &&
        (p.id === deleteModalState.project.id || p.title.trim().toLowerCase() === normTitle)
    );

    for (const match of allMatches) {
      await deleteProject(match.id);
    }
    showToast('Project deleted permanently');
    setDeleteModalState(null);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Top Banner & View Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-card border border-border/80 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
            <FolderKanban className="size-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-sm text-foreground">
                {currentPortfolio?.title || 'Portfolio'} Projects
              </h3>
              <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                {portfolioProjects.length} showing
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Select which projects appear in this portfolio or import from your global project library.
            </p>
          </div>
        </div>

        {/* View Mode Toggle Switcher */}
        {userPortfolios.length > 1 && (
          <div className="inline-flex h-9 items-center rounded-xl bg-muted p-1 text-xs font-semibold text-muted-foreground shrink-0">
            <button
              type="button"
              onClick={() => setViewMode('current')}
              className={cn(
                'px-3 py-1 rounded-lg transition-all flex items-center gap-1.5',
                viewMode === 'current'
                  ? 'bg-background text-foreground shadow-xs font-medium'
                  : 'hover:text-foreground'
              )}
            >
              <Eye className="size-3.5" />
              <span>In this Portfolio ({portfolioProjects.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('library')}
              className={cn(
                'px-3 py-1 rounded-lg transition-all flex items-center gap-1.5',
                viewMode === 'library'
                  ? 'bg-background text-foreground shadow-xs font-medium'
                  : 'hover:text-foreground'
              )}
            >
              <Library className="size-3.5" />
              <span>All Projects Library ({uniqueUserProjects.length})</span>
            </button>
          </div>
        )}
      </div>

      {/* Action Bar: Search, Category Filters, New Button */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex flex-1 items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search projects by name, tech..."
              className="pl-9 text-xs h-9"
            />
          </div>

          {categories.length > 2 && (
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="h-9 rounded-lg border border-input bg-card px-3 text-xs text-foreground focus:outline-hidden"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c === 'all' ? 'All Categories' : c}
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="flex items-center gap-2">
          {viewMode === 'current' && userPortfolios.length > 1 && uniqueUserProjects.length > portfolioProjects.length && (
            <Button
              onClick={() => setViewMode('library')}
              variant="outline"
              size="sm"
              className="h-9 gap-1.5 shrink-0 text-xs"
            >
              <Library className="size-3.5" /> Link Existing Projects
            </Button>
          )}

          <Button onClick={handleOpenAdd} size="sm" className="h-9 gap-1.5 shrink-0 text-xs">
            <Plus className="size-4" /> Add Project
          </Button>
        </div>
      </div>

      {/* Projects Grid */}
      {sortedProjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {sortedProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              currentPortfolioId={portfolioId}
              onEdit={handleOpenEdit}
              onDelete={handleOpenDeleteConfirm}
              onToggleFeatured={handleToggleFeatured}
              onTogglePortfolioVisibility={
                viewMode === 'library'
                  ? handleToggleVisibility
                  : undefined
              }
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-border/80 rounded-2xl bg-card/40">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-muted/60 text-muted-foreground mb-3">
            <FolderKanban className="size-6" />
          </div>
          <h4 className="text-base font-semibold text-foreground">
            {searchQuery
              ? 'No matching projects found'
              : viewMode === 'current'
              ? 'No projects in this portfolio yet'
              : 'No projects created yet'}
          </h4>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm">
            {searchQuery
              ? 'Try changing your search term or category filter.'
              : viewMode === 'current' && uniqueUserProjects.length > 0
              ? 'You have projects in your library. Click below to choose which ones to show in this portfolio.'
              : 'Add your first project to showcase your technical skills and impact.'}
          </p>
          {!searchQuery && (
            <div className="flex items-center gap-3 mt-4">
              {viewMode === 'current' && uniqueUserProjects.length > 0 ? (
                <Button
                  onClick={() => setViewMode('library')}
                  size="sm"
                  className="gap-1.5"
                >
                  <Library className="size-4" /> Browse Project Library
                </Button>
              ) : (
                <Button onClick={handleOpenAdd} size="sm" className="gap-1.5">
                  <Plus className="size-4" /> Add Your First Project
                </Button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Project Modal with Portfolio Checkboxes */}
      <ProjectModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingProject(null);
        }}
        onSave={handleSaveProject}
        project={editingProject}
        currentPortfolioId={portfolioId}
      />

      {/* Delete / Remove Confirmation Modal */}
      {deleteModalState && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-md bg-card border border-border rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-destructive">
              <div className="flex size-10 items-center justify-center rounded-full bg-destructive/10">
                <AlertTriangle className="size-5" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground text-base">
                  {deleteModalState.assignedCount > 1
                    ? 'Manage Project Removal'
                    : 'Delete Project'}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  "{deleteModalState.project.title}"
                </p>
              </div>
            </div>

            {deleteModalState.assignedCount > 1 ? (
              <div className="space-y-2 text-xs text-muted-foreground">
                <p>
                  This project is currently displayed in{' '}
                  <strong className="text-foreground">
                    {deleteModalState.assignedCount} portfolios
                  </strong>
                  .
                </p>
                <p>
                  You can choose to remove it from{' '}
                  <strong className="text-foreground">
                    {currentPortfolio?.title || 'this portfolio'} only
                  </strong>
                  , or delete it permanently across all portfolios.
                </p>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">
                Are you sure you want to delete this project? This action cannot be undone.
              </p>
            )}

            <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDeleteModalState(null)}
              >
                Cancel
              </Button>

              {deleteModalState.assignedCount > 1 && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleRemoveFromThisPortfolioOnly}
                  className="text-xs"
                >
                  <EyeOff className="size-3.5 mr-1" />
                  Remove from this Portfolio Only
                </Button>
              )}

              <Button
                variant="destructive"
                size="sm"
                onClick={handleDeleteGlobally}
                className="text-xs"
              >
                {deleteModalState.assignedCount > 1
                  ? 'Delete Permanently from All'
                  : 'Delete Project'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
