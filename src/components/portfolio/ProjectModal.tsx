'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  X,
  Star,
  ExternalLink,
  Globe,
  Plus,
  Trash2,
  Image as ImageIcon,
  Sparkles,
  Layers,
  Code2,
  FolderKanban,
  Check,
  AlertCircle,
} from 'lucide-react';
import { Project, ProjectLink, usePortfolio } from '@/components/providers/portfolio-provider';
import { isValidImageUrl, formatExternalUrl } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Label } from '@/components/ui/Label';
import { cn } from '@/lib/utils';

const POPULAR_TECHS = [
  'React',
  'Next.js',
  'TypeScript',
  'JavaScript',
  'Tailwind CSS',
  'Node.js',
  'Python',
  'PostgreSQL',
  'Supabase',
  'Prisma',
  'Docker',
  'GraphQL',
  'Flutter',
  'Figma',
];

const CATEGORIES = [
  'Web & App Development',
  'Mobile Application',
  'Artificial Intelligence / ML',
  'UI/UX Design',
  'Data Science & Analytics',
  'Cloud & DevOps',
  'Game Development',
  'Open Source',
  'Other',
];

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (projectData: any, selectedPortfolioIds?: string[]) => Promise<void>;
  project?: Project | null;
  currentPortfolioId?: string;
}

export function ProjectModal({
  isOpen,
  onClose,
  onSave,
  project,
  currentPortfolioId,
}: ProjectModalProps) {
  const { db, currentUser } = usePortfolio();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [detailedDescription, setDetailedDescription] = useState('');
  const [category, setCategory] = useState('Web & App Development');
  const [customCategory, setCustomCategory] = useState('');
  const [image, setImage] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [techInput, setTechInput] = useState('');
  const [technologies, setTechnologies] = useState<string[]>([]);
  const [featured, setFeatured] = useState(false);
  const [links, setLinks] = useState<ProjectLink[]>([]);
  const [embedUrl, setEmbedUrl] = useState('');
  const [selectedPortfolioIds, setSelectedPortfolioIds] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'basics' | 'media' | 'links'>('basics');

  const userPortfolios = db.portfolios.filter(
    (p) => (p.user_id || (p as any).user) === currentUser?.id
  );

  useEffect(() => {
    if (project) {
      setTitle(project.title || '');
      setDescription(project.description || '');
      setDetailedDescription(project.detailed_description || '');
      
      if (CATEGORIES.includes(project.category)) {
        setCategory(project.category);
        setCustomCategory('');
      } else if (project.category) {
        setCategory('Other');
        setCustomCategory(project.category);
      } else {
        setCategory('Web & App Development');
        setCustomCategory('');
      }

      setImage(project.image || '');
      setImages(project.images || []);
      setTechnologies(project.technologies || []);
      setFeatured(project.featured === 1);
      setEmbedUrl(project.embed_url || '');

      const initialLinks: ProjectLink[] = project.links && project.links.length > 0
        ? [...project.links]
        : [
            ...(project.github_url ? [{ type: 'github' as const, url: project.github_url, label: 'GitHub' }] : []),
            ...(project.live_url ? [{ type: 'live' as const, url: project.live_url, label: 'Live Demo' }] : []),
          ];
      setLinks(initialLinks);

      // Find which portfolios currently contain this project
      const existingPortfolioIds = userPortfolios
        .filter((p) =>
          db.projects.some(
            (proj) =>
              proj.portfolio_id === p.id &&
              (proj.id === project.id ||
                proj.title.trim().toLowerCase() === project.title.trim().toLowerCase())
          )
        )
        .map((p) => p.id);

      setSelectedPortfolioIds(
        existingPortfolioIds.length > 0
          ? existingPortfolioIds
          : [currentPortfolioId || project.portfolio_id || userPortfolios[0]?.id].filter(Boolean) as string[]
      );
    } else {
      setTitle('');
      setDescription('');
      setDetailedDescription('');
      setCategory('Web & App Development');
      setCustomCategory('');
      setImage('');
      setImages([]);
      setTechnologies([]);
      setFeatured(false);
      setEmbedUrl('');
      setLinks([
        { type: 'github', url: '', label: 'Source Code' },
        { type: 'live', url: '', label: 'Live Preview' },
      ]);
      setSelectedPortfolioIds(
        [currentPortfolioId || userPortfolios[0]?.id].filter(Boolean) as string[]
      );
    }
    setError('');
    setActiveTab('basics');
  }, [project, isOpen, currentPortfolioId, currentUser?.id]);

  if (!isOpen) return null;

  const handleTogglePortfolio = (portId: string) => {
    if (selectedPortfolioIds.includes(portId)) {
      if (selectedPortfolioIds.length === 1) {
        // Keep at least one selected or inform user
        setError('A project must be assigned to at least one portfolio.');
        return;
      }
      setError('');
      setSelectedPortfolioIds(selectedPortfolioIds.filter((id) => id !== portId));
    } else {
      setError('');
      setSelectedPortfolioIds([...selectedPortfolioIds, portId]);
    }
  };

  const handleAddTech = (tech: string) => {
    const trimmed = tech.trim();
    if (trimmed && !technologies.includes(trimmed)) {
      setTechnologies([...technologies, trimmed]);
      setTechInput('');
    }
  };

  const handleRemoveTech = (techToRemove: string) => {
    setTechnologies(technologies.filter((t) => t !== techToRemove));
  };

  const handleKeyDownTech = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      handleAddTech(techInput);
    }
  };

  const handleAddLink = () => {
    setLinks([...links, { type: 'custom', url: '', label: 'Link' }]);
  };

  const handleRemoveLink = (index: number) => {
    setLinks(links.filter((_, idx) => idx !== index));
  };

  const handleLinkChange = (index: number, field: keyof ProjectLink, val: string) => {
    const updated = [...links];
    updated[index] = { ...updated[index], [field]: val };
    setLinks(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('Project title is required.');
      setActiveTab('basics');
      return;
    }

    if (userPortfolios.length === 0) {
      setError('You must create a portfolio first before adding projects.');
      return;
    }

    if (selectedPortfolioIds.length === 0) {
      setError('Please select at least one portfolio to show this project in.');
      setActiveTab('basics');
      return;
    }

    const finalCategory = category === 'Other' && customCategory.trim()
      ? customCategory.trim()
      : category;

    const validLinks = links.filter((l) => l.url.trim() !== '');
    const githubLink = validLinks.find((l) => l.type === 'github')?.url || null;
    const liveLink = validLinks.find((l) => l.type === 'live')?.url || null;

    setSaving(true);
    try {
      await onSave(
        {
          title: title.trim(),
          description: description.trim(),
          detailed_description: detailedDescription.trim() || null,
          category: finalCategory,
          image: image.trim() || null,
          images,
          technologies,
          featured: featured ? 1 : 0,
          links: validLinks,
          github_url: githubLink,
          live_url: liveLink,
          embed_url: embedUrl.trim(),
        },
        selectedPortfolioIds
      );
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to save project');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col bg-card border border-border/80 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/80 bg-muted/20">
          <div className="flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Code2 className="size-4" />
            </div>
            <div>
              <h3 className="font-semibold text-base text-foreground">
                {project ? 'Edit Project' : 'New Project'}
              </h3>
              <p className="text-xs text-muted-foreground">
                Showcase your work with rich details, images, and live links
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
          >
            <X className="size-5" />
          </button>
        </div>

        {userPortfolios.length === 0 ? (
          <div className="p-8 flex flex-col items-center justify-center text-center space-y-4">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500">
              <AlertCircle className="size-7" />
            </div>
            <div className="space-y-1.5 max-w-sm">
              <h4 className="text-base font-semibold text-foreground">Portfolio Required</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                You must have at least one portfolio available before you can add new projects. Create a portfolio first to get started!
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onClose}
              >
                Close
              </Button>
              <Link
                href="/portfolios"
                onClick={onClose}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold shadow-xs hover:bg-primary/90 transition-colors"
              >
                <Plus className="size-4" /> Create Portfolio
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Tab switcher */}
            <div className="flex border-b border-border/80 px-6 bg-muted/10 gap-4">
              <button
                type="button"
                onClick={() => setActiveTab('basics')}
                className={cn(
                  'py-3 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5',
                  activeTab === 'basics'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                )}
              >
                <Layers className="size-3.5" />
                Basics & Tech
              </button>
          <button
            type="button"
            onClick={() => setActiveTab('media')}
            className={cn(
              'py-3 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5',
              activeTab === 'media'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            )}
          >
            <ImageIcon className="size-3.5" />
            Media & Images
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('links')}
            className={cn(
              'py-3 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5',
              activeTab === 'links'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            )}
          >
            <ExternalLink className="size-3.5" />
            Links & URLs
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {error && (
            <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-xs font-medium text-destructive">
              {error}
            </div>
          )}

          {activeTab === 'basics' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2 space-y-1.5">
                  <Label htmlFor="proj-title">Project Title *</Label>
                  <Input
                    id="proj-title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. AI Portfolio Generator"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="proj-cat">Category</Label>
                  <select
                    id="proj-cat"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full h-9 rounded-lg border border-input bg-background px-3 py-1 text-xs text-foreground focus:outline-hidden focus:ring-2 focus:ring-ring"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {category === 'Other' && (
                <div className="space-y-1.5">
                  <Label htmlFor="custom-cat">Custom Category Name</Label>
                  <Input
                    id="custom-cat"
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    placeholder="e.g. Blockchain / Web3"
                  />
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="proj-desc">Short Summary</Label>
                <Textarea
                  id="proj-desc"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief 1-2 sentence description of what the project solves..."
                  rows={2}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="proj-detailed">Detailed Description (Optional)</Label>
                <Textarea
                  id="proj-detailed"
                  value={detailedDescription}
                  onChange={(e) => setDetailedDescription(e.target.value)}
                  placeholder="Elaborate on architectural decisions, problems solved, impact, and features..."
                  rows={4}
                />
              </div>

              {/* Technologies Tags */}
              <div className="space-y-2">
                <Label>Technologies & Skills Used</Label>
                <div className="flex gap-2">
                  <Input
                    value={techInput}
                    onChange={(e) => setTechInput(e.target.value)}
                    onKeyDown={handleKeyDownTech}
                    placeholder="Type technology and press Enter (e.g. Next.js, Redis)"
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => handleAddTech(techInput)}
                  >
                    Add
                  </Button>
                </div>

                {/* Selected Tags */}
                {technologies.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {technologies.map((tech) => (
                      <span
                        key={tech}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-primary/10 text-primary border border-primary/20"
                      >
                        {tech}
                        <button
                          type="button"
                          onClick={() => handleRemoveTech(tech)}
                          className="hover:text-destructive transition-colors ml-0.5"
                        >
                          <X className="size-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                {/* Popular Tags Quick-Add */}
                <div className="pt-2">
                  <span className="text-[11px] text-muted-foreground mr-1.5">Quick add:</span>
                  <div className="inline-flex flex-wrap gap-1 mt-1">
                    {POPULAR_TECHS.map((tech) => (
                      <button
                        key={tech}
                        type="button"
                        onClick={() => handleAddTech(tech)}
                        disabled={technologies.includes(tech)}
                        className={cn(
                          'text-[10px] px-2 py-0.5 rounded-sm border transition-colors',
                          technologies.includes(tech)
                            ? 'opacity-40 border-border text-muted-foreground cursor-not-allowed'
                            : 'border-border/80 bg-background hover:bg-muted text-foreground'
                        )}
                      >
                        + {tech}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Featured toggle */}
              <div className="flex items-center justify-between p-3 rounded-xl border border-border/80 bg-muted/10">
                <div className="flex items-center gap-2.5">
                  <div className="flex size-7 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500">
                    <Star className="size-4 fill-amber-500/20" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-foreground">Feature this project</div>
                    <div className="text-[11px] text-muted-foreground">
                      Featured projects appear enlarged at the top of your portfolio
                    </div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  id="featured-toggle"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                  className="size-4 rounded-sm border-input text-primary focus:ring-primary"
                />
              </div>

              {/* Portfolios & Visibility */}
              <div className="space-y-2.5 pt-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FolderKanban className="size-4 text-primary" />
                    <Label className="text-xs font-semibold text-foreground">
                      Show in Portfolios ({selectedPortfolioIds.length} of {userPortfolios.length || 1} selected)
                    </Label>
                  </div>
                  <span className="text-[11px] text-muted-foreground">
                    Choose which portfolio(s) display this project
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {userPortfolios.map((p) => {
                    const isSelected = selectedPortfolioIds.includes(p.id);
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => handleTogglePortfolio(p.id)}
                        className={cn(
                          'flex items-center justify-between p-3 rounded-xl border text-left transition-all',
                          isSelected
                            ? 'border-primary/50 bg-primary/5 shadow-xs'
                            : 'border-border/80 bg-background/50 hover:bg-muted/40 opacity-70 hover:opacity-100'
                        )}
                      >
                        <div className="flex items-center gap-2.5 min-w-0 pr-2">
                          <div
                            className={cn(
                              'flex size-5 shrink-0 items-center justify-center rounded-md border text-xs transition-colors',
                              isSelected
                                ? 'border-primary bg-primary text-primary-foreground'
                                : 'border-muted-foreground/40 bg-background'
                            )}
                          >
                            {isSelected && <Check className="size-3.5 stroke-[2.5]" />}
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-semibold text-foreground truncate">
                              {p.title}
                            </div>
                            <div className="text-[10px] text-muted-foreground truncate">
                              /{p.slug || 'portfolio'}
                            </div>
                          </div>
                        </div>
                        <span
                          className={cn(
                            'text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0',
                            p.is_public === 1
                              ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                              : 'bg-muted text-muted-foreground'
                          )}
                        >
                          {p.is_public === 1 ? 'Live' : 'Private'}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {userPortfolios.length <= 1 && (
                  <p className="text-[11px] text-muted-foreground">
                    Tip: You can create multiple tailored portfolios from the Portfolios page and choose which projects appear in each.
                  </p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'media' && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="proj-cover">Cover Image URL</Label>
                <Input
                  id="proj-cover"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  placeholder="https://images.unsplash.com/... or direct image link"
                />
                <p className="text-[11px] text-muted-foreground">
                  Paste a direct link to a screenshot or banner for your project.
                </p>
              </div>

              {/* Cover Image Preview */}
              {image && isValidImageUrl(image) && (
                <div className="relative rounded-xl overflow-hidden border border-border aspect-video max-h-48 bg-muted">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={image}
                    alt="Project preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-black/70 text-white text-[10px] font-mono">
                    Cover Preview
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="proj-embed">Interactive Demo / Embed URL (Optional)</Label>
                <Input
                  id="proj-embed"
                  value={embedUrl}
                  onChange={(e) => setEmbedUrl(e.target.value)}
                  placeholder="https://codesandbox.io/embed/... or YouTube URL"
                />
              </div>
            </div>
          )}

          {activeTab === 'links' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-semibold text-foreground">Project Links</h4>
                  <p className="text-[11px] text-muted-foreground">
                    Add GitHub repository, live web app, Figma designs, or custom URLs
                  </p>
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={handleAddLink}
                  className="h-7 text-xs gap-1"
                >
                  <Plus className="size-3" /> Add Link
                </Button>
              </div>

              <div className="space-y-2.5">
                {links.map((link, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 p-2.5 rounded-xl border border-border/80 bg-background"
                  >
                    <select
                      value={link.type}
                      onChange={(e) =>
                        handleLinkChange(idx, 'type', e.target.value as any)
                      }
                      className="h-8 rounded-md border border-input bg-muted/40 px-2 text-xs text-foreground focus:outline-hidden"
                    >
                      <option value="github">GitHub</option>
                      <option value="live">Live App</option>
                      <option value="custom">Custom</option>
                    </select>

                    <Input
                      value={link.label || ''}
                      onChange={(e) => handleLinkChange(idx, 'label', e.target.value)}
                      placeholder="Label (e.g. Live Demo)"
                      className="h-8 text-xs w-32 shrink-0"
                    />

                    <Input
                      value={link.url}
                      onChange={(e) => handleLinkChange(idx, 'url', e.target.value)}
                      placeholder="https://..."
                      className="h-8 text-xs flex-1"
                    />

                    <button
                      type="button"
                      onClick={() => handleRemoveLink(idx)}
                      className="p-1 text-muted-foreground hover:text-destructive transition-colors"
                      title="Remove link"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                ))}

                {links.length === 0 && (
                  <div className="text-center py-6 border border-dashed border-border rounded-xl text-xs text-muted-foreground">
                    No links added yet. Click "Add Link" above.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/80">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={saving}>
              {saving ? 'Saving...' : project ? 'Update Project' : 'Create Project'}
            </Button>
          </div>
        </form>
        </>
        )}
      </div>
    </div>
  );
}
