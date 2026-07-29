'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { usePortfolio, Project } from '@/components/providers/portfolio-provider';
import { isValidImageUrl, formatExternalUrl } from '@/lib/utils';

export default function PortfolioEditPage() {
  const params = useParams();
  const router = useRouter();
  const portfolioId = params.id as string;

  const {
    db,
    updatePortfolio,
    addProject,
    updateProject,
    deleteProject,
    hasUnsavedChanges,
    setHasUnsavedChanges,
  } = usePortfolio();

  const [toast, setToast] = useState('');
  
  // Portfolio details state
  const [portTitle, setPortTitle] = useState('');
  const [portDesc, setPortDesc] = useState('');
  const [portPublic, setPortPublic] = useState(false);
  const [portError, setPortError] = useState('');

  // Project Editor state (handles both Add and Edit)
  const [isEditingProject, setIsEditingProject] = useState(false);
  const [projectEditId, setProjectEditId] = useState<string | null>(null); // null = Add, string = Edit
  const [projTitle, setProjTitle] = useState('');
  const [projDesc, setProjDesc] = useState('');
  const [projImage, setProjImage] = useState('');
  const [projTech, setProjTech] = useState('');
  const [projCategory, setProjCategory] = useState('Web & App Development');
  const [customCategory, setCustomCategory] = useState('');
  const [projEmbed, setProjEmbed] = useState('');
  const [projLinks, setProjLinks] = useState<{ type: 'github' | 'live' | 'custom'; url: string; label: string }[]>([]);
  const [projFeatured, setProjFeatured] = useState(false);
  const [projError, setProjError] = useState('');

  // Find portfolio
  const portfolio = db.portfolios.find(p => p.id === portfolioId);

  // Unsaved Changes Tracking
  const isPortDirty = portfolio ? (
    portTitle !== (portfolio.title || '') ||
    portDesc !== (portfolio.description || '') ||
    portPublic !== (portfolio.is_public === 1)
  ) : false;

  const originalProject = projectEditId ? db.projects.find(p => p.id === projectEditId) : null;
  const isProjDirty = isEditingProject && (
    originalProject 
      ? (
          projTitle !== originalProject.title ||
          projDesc !== (originalProject.description || '') ||
          projImage !== (originalProject.image || '') ||
          projTech !== originalProject.technologies.join(', ') ||
          projCategory !== (originalProject.category || 'Web & App Development') ||
          projEmbed !== (originalProject.embed_url || '') ||
          projFeatured !== (originalProject.featured === 1) ||
          JSON.stringify(projLinks) !== JSON.stringify(originalProject.links || [
            ...(originalProject.github_url ? [{ type: 'github', url: originalProject.github_url, label: '' }] : []),
            ...(originalProject.live_url ? [{ type: 'live', url: originalProject.live_url, label: '' }] : [])
          ])
        )
      : (
          projTitle !== '' ||
          projDesc !== '' ||
          projImage !== '' ||
          projTech !== '' ||
          projCategory !== 'Web & App Development' ||
          projEmbed !== '' ||
          projLinks.length > 0 ||
          projFeatured
        )
  );

  const isDirty = isPortDirty || isProjDirty;

  useEffect(() => {
    setHasUnsavedChanges(isDirty);
    return () => setHasUnsavedChanges(false);
  }, [isDirty, setHasUnsavedChanges]);

  // Warn on browser unload
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
        return e.returnValue;
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  // Pre-fill portfolio form on load
  useEffect(() => {
    if (portfolio) {
      setPortTitle(portfolio.title);
      setPortDesc(portfolio.description || '');
      setPortPublic(portfolio.is_public === 1);
    }
  }, [portfolio]);

  if (!portfolio) {
    return (
      <div className="flex-1 flex flex-col justify-center items-center bg-stone-50 dark:bg-zinc-900 p-6 min-h-screen text-center">
        <svg className="w-10 h-10 text-[var(--accent)] mb-2" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <h3 className="font-semibold text-[var(--text-primary)] mt-2">Portfolio Not Found</h3>
        <button
          onClick={() => router.push('/portfolios')}
          className="mt-4 px-4 py-2 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white rounded-full text-xs font-semibold"
        >
          Back to Portfolios
        </button>
      </div>
    );
  }

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  };

  const handleSavePortfolioDetails = (e: React.FormEvent) => {
    e.preventDefault();
    setPortError('');

    if (!portTitle.trim()) {
      setPortError('Title is required.');
      return;
    }

    updatePortfolio(portfolioId, portTitle.trim(), portDesc.trim(), portPublic);
    showToast('Portfolio details saved! ✅');
  };
  const handleOpenAddProject = () => {
    setProjectEditId(null);
    setProjTitle('');
    setProjDesc('');
    setProjImage('');
    setProjTech('');
    setProjCategory('Web & App Development');
    setCustomCategory('');
    setProjEmbed('');
    setProjLinks([]);
    setProjFeatured(false);
    setProjError('');
    setIsEditingProject(true);
  };

  const handleOpenEditProject = (pr: Project) => {
    setProjectEditId(pr.id);
    setProjTitle(pr.title);
    setProjDesc(pr.description || '');
    setProjImage(pr.image || '');
    setProjTech(pr.technologies.join(', '));
    setProjCategory(pr.category || 'Web & App Development');
    if (pr.category && !categoryOptions.includes(pr.category)) {
      setProjCategory('Other Creative Works');
      setCustomCategory(pr.category);
    } else {
      setCustomCategory('');
    }
    setProjEmbed(pr.embed_url || '');
    
    const projectLinks = pr.links && Array.isArray(pr.links) && pr.links.length > 0
      ? (pr.links as any[]).map(l => ({ type: l.type || 'custom', url: l.url || '', label: l.label || '' }))
      : [
          ...(pr.github_url ? [{ type: 'github' as const, url: pr.github_url, label: '' }] : []),
          ...(pr.live_url ? [{ type: 'live' as const, url: pr.live_url, label: '' }] : [])
        ];
    setProjLinks(projectLinks);
    setProjFeatured(pr.featured === 1);
    setProjError('');
    setIsEditingProject(true);
  };

  const handleSaveProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setProjError('');

    if (!projTitle.trim()) {
      setProjError('Project title is required.');
      return;
    }

    if (!projDesc.trim()) {
      setProjError('Project description is required.');
      return;
    }

    if (projImage.trim() && !isValidImageUrl(projImage.trim())) {
      setProjError('Please enter a valid image URL (http://, https://, or data:image/).');
      return;
    }

    const techArray = projTech
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0);

    const finalCategory = projCategory === 'Other Creative Works' ? (customCategory.trim() || 'Other Creative Works') : projCategory;

    const projectData = {
      title: projTitle.trim(),
      description: projDesc.trim(),
      image: projImage.trim() || null,
      technologies: techArray,
      category: finalCategory,
      embed_url: projEmbed.trim(),
      link_type: (projLinks.length > 0 ? projLinks[0].type : 'none') as 'github' | 'live' | 'custom' | 'none',
      github_url: projLinks.find(l => l.type === 'github')?.url.trim() || null,
      live_url: projLinks.find(l => l.type === 'live')?.url.trim() || projLinks.find(l => l.type === 'custom')?.url.trim() || null,
      links: projLinks.map(l => ({ type: l.type, url: l.url.trim(), label: l.label.trim() })),
      featured: projFeatured ? 1 : 0,
    };

    if (projectEditId) {
      // Edit mode
      const success = await updateProject(projectEditId, projectData);
      if (success) {
        showToast('Project updated! ⭐');
        setIsEditingProject(false);
      } else {
        setProjError('Failed to update project. Please try again.');
      }
    } else {
      // Add mode
      const success = await addProject(portfolioId, projectData);
      if (success) {
        showToast('Project added successfully! 🚀');
        setIsEditingProject(false);
      } else {
        setProjError('Failed to add project. Please check required fields.');
      }
    }
  };

  const handleDeleteProject = async (id: string) => {
    if (confirm('Delete this project? This cannot be undone.')) {
      const success = await deleteProject(id);
      if (success) {
        showToast('Project deleted');
      } else {
        showToast('Failed to delete project.');
      }
    }
  };

  const portfolioProjects = db.projects.filter(p => p.portfolio_id === portfolioId);

  const categoryOptions = [
    'Visual Arts & Painting',
    'Graphic Design & Branding',
    'Industrial & Product Design',
    'Architectural Design',
    'Scientific Research & Writing',
    'Biological & Life Sciences',
    'Physics & Earth Sciences',
    'Literature & Creative Writing',
    'Performing Arts & Music',
    'Web & App Development',
    'UI/UX & Interaction Design',
    'Data Analytics & ML',
    'Business & Entrepreneurship',
    'Other Creative Works'
  ];

  return (
    <div className="flex-grow flex flex-col gap-6 pb-8 max-w-5xl xl:max-w-7xl 2xl:max-w-[1800px] mx-auto w-full relative">
      
      {/* Toast Notification Banner */}
      {toast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 bg-[var(--accent)] text-white rounded-full shadow-lg text-xs font-semibold tracking-wide animate-bounce">
          {toast}
        </div>
      )}

      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2 text-stone-400 text-xs mb-1 font-mono">
          <button
            onClick={() => {
              if (isDirty && !window.confirm('You have unsaved changes. Are you sure you want to leave?')) return;
              router.push('/portfolios');
            }}
            className="hover:underline"
          >
            Portfolios
          </button>
          <span>/</span>
          <span className="text-stone-500">Edit</span>
        </div>
        <h2 className="text-2xl font-bold font-display text-stone-950 dark:text-white tracking-tight">
          Portfolio Workspace
        </h2>
      </div>

      {/* 1. Portfolio Metadata Form */}
      <div className="glass-card p-4 bg-white dark:bg-zinc-800 flex flex-col gap-4">
        <h3 className="font-semibold text-sm text-stone-950 dark:text-white border-b border-stone-100 dark:border-zinc-700/60 pb-2">
          Portfolio Settings
        </h3>

        <form onSubmit={handleSavePortfolioDetails} className="space-y-4" autoComplete="off">
          {portError && (
            <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 text-xs rounded-xl font-medium">
              {portError}
            </div>
          )}

          <div className="input-group flex flex-col">
            <label className="input-label" htmlFor="port-title-input">Title</label>
            <input
              id="port-title-input"
              type="text"
              value={portTitle}
              onChange={(e) => setPortTitle(e.target.value)}
              className="input-field"
            />
          </div>

          <div className="input-group flex flex-col">
            <label className="input-label" htmlFor="port-desc-input">Description</label>
            <textarea
              id="port-desc-input"
              value={portDesc}
              onChange={(e) => setPortDesc(e.target.value)}
              className="input-field"
              rows={3}
            />
          </div>

          <div className="input-group">
            <label className="checkbox" htmlFor="port-public-checkbox">
              <input
                id="port-public-checkbox"
                type="checkbox"
                checked={portPublic}
                onChange={(e) => setPortPublic(e.target.checked)}
              />
              <span>Publish this portfolio</span>
            </label>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-full font-semibold text-white bg-[var(--accent)] hover:bg-[var(--accent-hover)] shadow-sm text-xs transition-all active:scale-95"
          >
            Save Settings
          </button>
        </form>
      </div>

      {/* 2. Portfolio Projects Registry List */}
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <h3 className="text-xs font-bold text-stone-400 dark:text-zinc-500 uppercase tracking-widest">
            Projects ({portfolioProjects.length})
          </h3>
          <button
            onClick={handleOpenAddProject}
            className="px-3 py-1 bg-[var(--accent)] text-white text-[10px] font-bold rounded-lg transition-all active:scale-95 shadow-sm"
          >
            + Add Project
          </button>
        </div>

        {isEditingProject && (
          <div className="glass-card p-4 bg-[var(--accent-light)] border-[var(--border)] animate-fadeIn">
            <h4 className="font-semibold text-sm text-stone-950 dark:text-white mb-4">
              {projectEditId ? 'Edit Project Details' : 'Add New Project'}
            </h4>

            <form onSubmit={handleSaveProject} className="space-y-4" autoComplete="off">
              {projError && (
                <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 text-xs rounded-xl font-medium">
                  {projError}
                </div>
              )}

              <div className="input-group flex flex-col">
                <label className="input-label" htmlFor="proj-title-input">Project Title</label>
                <input
                  id="proj-title-input"
                  type="text"
                  value={projTitle}
                  onChange={(e) => setProjTitle(e.target.value)}
                  className="input-field"
                />
              </div>

              <div className="input-group flex flex-col">
                <label className="input-label flex justify-between items-center" htmlFor="proj-desc-input">
                  <span>Project Description & Detailed Explanation</span>
                  <span className="text-[10px] text-stone-400 dark:text-zinc-500 font-mono">Displayed in &apos;View Details&apos; Modal</span>
                </label>
                <textarea
                  id="proj-desc-input"
                  value={projDesc}
                  onChange={(e) => setProjDesc(e.target.value)}
                  className="input-field leading-relaxed font-outfit"
                  rows={5}
                  placeholder="Write a comprehensive description of this project, including what you built, architecture decisions, key features, and impact..."
                />
                <div className="input-hint">
                  This detailed text will be shown when recruiters and visitors click &quot;View Details&quot; on your public portfolio.
                </div>
              </div>

              <div className="input-group flex flex-col">
                <label className="input-label" htmlFor="proj-image-input">Image URL</label>
                <input
                  id="proj-image-input"
                  type="text"
                  value={projImage}
                  onChange={(e) => setProjImage(e.target.value)}
                  className="input-field"
                />
                <div className="input-hint">Direct link to JPG/PNG image files. Supports Unsplash or Picsum.</div>
                {projImage && isValidImageUrl(projImage) && (
                  <div className="mt-2.5 rounded-lg overflow-hidden border border-stone-200 dark:border-zinc-700">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={projImage} alt="Preview" className="w-full h-24 object-cover" />
                  </div>
                )}
              </div>

              <div className="input-group flex flex-col">
                <label className="input-label" htmlFor="proj-tech-input">Technologies (comma separated)</label>
                <input
                  id="proj-tech-input"
                  type="text"
                  value={projTech}
                  onChange={(e) => setProjTech(e.target.value)}
                  className="input-field"
                />
              </div>

              <div className="input-group flex flex-col">
                <label className="input-label" htmlFor="proj-category-select">Category</label>
                <select
                  id="proj-category-select"
                  value={projCategory}
                  onChange={(e) => setProjCategory(e.target.value)}
                  className="input-field"
                >
                  {categoryOptions.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                {projCategory === 'Other Creative Works' && (
                  <input
                    type="text"
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    className="input-field mt-2 animate-fadeIn"
                    required
                  />
                )}
              </div>

              <div className="input-group flex flex-col">
                <label className="input-label" htmlFor="proj-embed-input">Embed URL (YouTube, Vimeo, Figma)</label>
                <input
                  id="proj-embed-input"
                  type="text"
                  value={projEmbed}
                  onChange={(e) => setProjEmbed(e.target.value)}
                  className="input-field"
                />
                <div className="input-hint flex flex-col gap-0.5 mt-1 text-[10px] text-stone-400 dark:text-zinc-500">
                  <span>YouTube, Vimeo watch or embed link (automatically normalized).</span>
                  <span className="font-mono bg-stone-100 dark:bg-zinc-800/80 px-1.5 py-0.5 rounded text-[9px] w-fit border border-stone-200/40 dark:border-zinc-700/40 text-stone-500 dark:text-zinc-400">
                    Must contain watch/video ID link: youtube.com/watch?v=ID or youtu.be/ID
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="input-label">Project Links</label>
                  <button
                    type="button"
                    onClick={() => setProjLinks([...projLinks, { type: 'live', url: '', label: '' }])}
                    className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-stone-900 dark:text-zinc-100 rounded text-[10px] font-bold transition-all active:scale-95"
                  >
                    + Add Link
                  </button>
                </div>
                
                {projLinks.length === 0 ? (
                  <p className="text-[10px] text-stone-400 dark:text-zinc-500 italic">No links added. Click "+ Add Link" to add one.</p>
                ) : (
                  <div className="space-y-3 p-3 bg-stone-50/50 dark:bg-zinc-800/40 rounded-xl border border-stone-200/50 dark:border-zinc-700/50">
                    {projLinks.map((link, index) => (
                      <div key={index} className="flex flex-col sm:flex-row gap-2.5 items-end sm:items-center pb-3 border-b border-stone-200/40 last:border-b-0 last:pb-0 dark:border-zinc-700/40">
                        {/* Type Select */}
                        <div className="flex-1 w-full">
                          <label className="text-[9px] font-bold text-stone-400 dark:text-zinc-500 uppercase tracking-wider block mb-1">Type</label>
                          <select
                            value={link.type}
                            onChange={(e) => {
                              const newLinks = [...projLinks];
                              newLinks[index].type = e.target.value as any;
                              setProjLinks(newLinks);
                            }}
                            className="input-field py-1.5 text-xs"
                          >
                            <option value="live">Live Demo</option>
                            <option value="github">GitHub</option>
                            <option value="custom">Custom Link</option>
                          </select>
                        </div>

                        {/* Label (Optional) */}
                        <div className="flex-1 w-full">
                          <label className="text-[9px] font-bold text-stone-400 dark:text-zinc-500 uppercase tracking-wider block mb-1">Label (Optional)</label>
                          <input
                            type="text"
                            placeholder={link.type === 'github' ? 'GitHub' : link.type === 'live' ? 'Live Demo' : 'e.g. Figma'}
                            value={link.label}
                            onChange={(e) => {
                              const newLinks = [...projLinks];
                              newLinks[index].label = e.target.value;
                              setProjLinks(newLinks);
                            }}
                            className="input-field py-1.5 text-xs"
                          />
                        </div>

                        {/* URL */}
                        <div className="flex-[2] w-full">
                          <label className="text-[9px] font-bold text-stone-400 dark:text-zinc-500 uppercase tracking-wider block mb-1">URL</label>
                          <input
                            type="text"
                            placeholder="https://..."
                            value={link.url}
                            onChange={(e) => {
                              const newLinks = [...projLinks];
                              newLinks[index].url = e.target.value;
                              setProjLinks(newLinks);
                            }}
                            className="input-field py-1.5 text-xs"
                            required
                          />
                        </div>

                        {/* Remove Button */}
                        <button
                          type="button"
                          onClick={() => setProjLinks(projLinks.filter((_, i) => i !== index))}
                          className="px-2.5 py-1.5 bg-red-50 text-red-600 dark:bg-red-950/20 dark:text-red-400 rounded text-xs font-bold transition-all hover:bg-red-100 active:scale-95 sm:mt-5"
                          title="Remove link"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="input-group">
                <label className="checkbox" htmlFor="proj-featured-checkbox">
                  <input
                    id="proj-featured-checkbox"
                    type="checkbox"
                    checked={projFeatured}
                    onChange={(e) => setProjFeatured(e.target.checked)}
                  />
                  <span>Mark as Featured Project</span>
                </label>
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-full font-semibold text-white bg-[var(--accent)] hover:bg-[var(--accent-hover)] shadow-sm text-xs transition-all"
                >
                  Save Project
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditingProject(false)}
                  className="flex-1 py-3 rounded-full font-semibold text-stone-700 bg-stone-100 border border-stone-200/60 dark:bg-zinc-700 dark:text-zinc-300 dark:border-zinc-600 text-xs transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="flex flex-col gap-4">
          {portfolioProjects.length === 0 ? (
            <div className="glass-card p-6 text-center text-[var(--text-muted)] flex flex-col items-center gap-3">
              <svg className="w-8 h-8 text-stone-300 dark:text-zinc-600" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0a2 2 0 01-2 2H6a2 2 0 01-2-2m16 0V9a2 2 0 00-2-2H6a2 2 0 00-2 2v4m16 0h-3.86a2 2 0 01-1.896 1.333H7.757a2 2 0 01-1.896-1.333H2" />
              </svg>
              <p className="text-xs">No projects added to this portfolio yet.</p>
            </div>
          ) : (
            portfolioProjects.map(pr => {
              return (
                <div key={pr.id} className="glass-card p-4 flex flex-col md:flex-row gap-4 relative justify-between items-start animate-fadeIn">
                  <div className="flex-1 flex flex-col gap-2 w-full">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-semibold text-sm text-stone-900 dark:text-zinc-100">{pr.title}</h4>
                          {pr.featured === 1 && (
                            <svg className="w-3.5 h-3.5 text-amber-500 fill-current" viewBox="0 0 24 24">
                              <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                            </svg>
                          )}
                        </div>
                        <span className="text-[9px] uppercase tracking-wider font-semibold text-stone-400 block mt-0.5">
                          {pr.category}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 z-10">
                        <button
                          onClick={() => handleOpenEditProject(pr)}
                          className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 dark:bg-zinc-700 dark:hover:bg-zinc-600 dark:text-zinc-200 rounded text-[10px] font-bold transition-all"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteProject(pr.id)}
                          className="w-6 h-6 flex items-center justify-center bg-red-50 text-red-600 dark:bg-red-950/20 dark:text-red-400 rounded text-sm font-bold transition-all hover:bg-red-100 active:scale-90"
                        >
                          ×
                        </button>
                      </div>
                    </div>

                    {pr.description && (
                      <p className="text-xs text-stone-500 dark:text-zinc-400 leading-relaxed">
                        {pr.description}
                      </p>
                    )}

                    {pr.technologies.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 my-1">
                        {pr.technologies.map(t => (
                          <span key={t} className="text-[9px] font-mono px-2 py-0.5 rounded bg-stone-50 border border-stone-200 text-stone-600 dark:bg-zinc-700 dark:border-zinc-600 dark:text-zinc-300">
                            {t}
                          </span>
                        ))}
                      </div>
                    )}

                    {pr.embed_url && (
                      <div className="project-embed mt-2 max-w-lg w-full">
                        <iframe src={pr.embed_url} allowFullScreen title={`${pr.title} embed`} />
                      </div>
                    )}

                    {(() => {
                      const projectLinks = pr.links && Array.isArray(pr.links) && pr.links.length > 0
                        ? (pr.links as any[])
                        : [
                            ...(pr.github_url ? [{ type: 'github', url: pr.github_url, label: '' }] : []),
                            ...(pr.live_url ? [{ type: 'live', url: pr.live_url, label: '' }] : [])
                          ];
                      return projectLinks.length > 0 && (
                        <div className="flex flex-col gap-1 mt-1">
                          {projectLinks.map((link, idx) => (
                            <div key={idx} className="text-[10px] text-[var(--accent)] font-mono flex items-center gap-1.5 truncate">
                              <span className="capitalize font-bold font-sans">[{link.type}]:</span>
                              <a href={formatExternalUrl(link.url, link.type === 'github' ? 'github' : 'general')} target="_blank" rel="noreferrer" className="hover:underline truncate">
                                {link.url}
                              </a>
                              {link.label && <span className="text-stone-400 dark:text-zinc-500 text-[9px]">({link.label})</span>}
                            </div>
                          ))}
                        </div>
                      );
                    })()}
                  </div>

                  {pr.image && (
                    <div className="md:w-56 w-full h-32 shrink-0 rounded-xl overflow-hidden border border-stone-100 dark:border-zinc-700/80 my-1 self-center md:self-start md:order-last">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={pr.image} alt={pr.title} className="w-full h-full object-cover transition-transform duration-300 hover:scale-105" />
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

    </div>
  );
}
