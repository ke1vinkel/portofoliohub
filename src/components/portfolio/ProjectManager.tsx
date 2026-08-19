'use client';

import React, { useState } from 'react';
import {
  Plus,
  Search,
  FolderKanban,
  Filter,
  Layers,
  Star,
  AlertTriangle,
} from 'lucide-react';
import { Project, usePortfolio } from '@/components/providers/portfolio-provider';
import { ProjectCard } from './ProjectCard';
import { ProjectModal } from './ProjectModal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/hooks/useToast';

interface ProjectManagerProps {
  portfolioId: string;
}

export function ProjectManager({ portfolioId }: ProjectManagerProps) {
  const { db, addProject, updateProject, deleteProject } = usePortfolio();
  const { showToast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Filter projects belonging to this portfolio
  const projects = db.projects.filter((p) => p.portfolio_id === portfolioId);

  // Unique categories
  const categories = [
    'all',
    ...Array.from(new Set(projects.map((p) => p.category || 'Other'))),
  ];

  // Search & category filtered
  const filteredProjects = projects.filter((p) => {
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
    setEditingProject(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (proj: Project) => {
    setEditingProject(proj);
    setModalOpen(true);
  };

  const handleSaveProject = async (projectData: any) => {
    if (editingProject) {
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

  const handleConfirmDelete = async () => {
    if (deleteConfirmId) {
      await deleteProject(deleteConfirmId);
      showToast('Project deleted');
      setDeleteConfirmId(null);
    }
  };

  return (
    <div className="flex flex-col gap-6">
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

        <Button onClick={handleOpenAdd} size="sm" className="h-9 gap-1.5 shrink-0">
          <Plus className="size-4" /> Add Project
        </Button>
      </div>

      {/* Projects Grid */}
      {sortedProjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {sortedProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onEdit={handleOpenEdit}
              onDelete={(id) => setDeleteConfirmId(id)}
              onToggleFeatured={handleToggleFeatured}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-border/80 rounded-2xl bg-card/40">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-muted/60 text-muted-foreground mb-3">
            <FolderKanban className="size-6" />
          </div>
          <h4 className="text-base font-semibold text-foreground">
            {searchQuery ? 'No matching projects found' : 'No projects yet'}
          </h4>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm">
            {searchQuery
              ? 'Try changing your search term or category filter.'
              : 'Add your first project to showcase your technical skills and impact.'}
          </p>
          {!searchQuery && (
            <Button onClick={handleOpenAdd} size="sm" className="mt-4 gap-1.5">
              <Plus className="size-4" /> Add Your First Project
            </Button>
          )}
        </div>
      )}

      {/* Project Modal */}
      <ProjectModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingProject(null);
        }}
        onSave={handleSaveProject}
        project={editingProject}
      />

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-sm bg-card border border-border rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-destructive">
              <div className="flex size-10 items-center justify-center rounded-full bg-destructive/10">
                <AlertTriangle className="size-5" />
              </div>
              <h3 className="font-semibold text-foreground text-base">Delete Project</h3>
            </div>
            <p className="text-xs text-muted-foreground">
              Are you sure you want to delete this project? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDeleteConfirmId(null)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleConfirmDelete}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
