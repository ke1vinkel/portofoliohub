'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Plus,
  Pencil,
  Trash2,
  Save,
  X,
  Sparkles,
  Star,
  ExternalLink,
  FolderKanban,
  AlertTriangle,
  Palette,
  Image as ImageIcon,
} from 'lucide-react';
import { usePortfolio, Project } from '@/components/providers/portfolio-provider';
import { isValidImageUrl, formatExternalUrl } from '@/lib/utils';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Label } from '@/components/ui/Label';
import { cn } from '@/lib/utils';

export default function PortfolioEditPage() {
  const params = useParams();
  const router = useRouter();
  const portfolioId = params.id as string;

  const {
    db,
    currentUser,
    updatePortfolio,
    addProject,
    updateProject,
    deleteProject,
    setHasUnsavedChanges,
  } = usePortfolio();

  const [toast, setToast] = useState('');

  // Portfolio details state
  const [portTitle, setPortTitle] = useState('');
  const [portDesc, setPortDesc] = useState('');
  const [portPublic, setPortPublic] = useState(false);
  const [portError, setPortError] = useState('');

  // Theme & Styling state
  const [themePreset, setThemePreset] = useState<
    'obsidian' | 'editorial' | 'neon' | 'monochrome' | 'pastel' | 'custom'
  >('obsidian');
  const [bgColor, setBgColor] = useState('#0d0d11');
  const [surfaceColor, setSurfaceColor] = useState('#16161e');
  const [textColor, setTextColor] = useState('#f3f4f6');
  const [accentColor, setAccentColor] = useState('#10b981');
  const [fontStyle, setFontStyle] = useState<'sans' | 'serif' | 'mono' | 'display'>('sans');
  const [cardStyle, setCardStyle] = useState<'spotlight' | 'minimal' | 'glass' | 'bento'>('spotlight');

  const applyPreset = (presetKey: string) => {
    setThemePreset(presetKey as any);
    if (presetKey === 'obsidian') {
      setBgColor('#0d0d11');
      setSurfaceColor('#16161e');
      setTextColor('#f3f4f6');
      setAccentColor('#10b981');
      setFontStyle('sans');
      setCardStyle('spotlight');
    } else if (presetKey === 'editorial') {
      setBgColor('#faf8f5');
      setSurfaceColor('#ffffff');
      setTextColor('#1c1917');
      setAccentColor('#d97706');
      setFontStyle('serif');
      setCardStyle('minimal');
    } else if (presetKey === 'neon') {
      setBgColor('#05070f');
      setSurfaceColor('#0f172a');
      setTextColor('#f8fafc');
      setAccentColor('#06b6d4');
      setFontStyle('display');
      setCardStyle('glass');
    } else if (presetKey === 'monochrome') {
      setBgColor('#18181b');
      setSurfaceColor('#27272a');
      setTextColor('#ffffff');
      setAccentColor('#e4e4e7');
      setFontStyle('mono');
      setCardStyle('bento');
    } else if (presetKey === 'pastel') {
      setBgColor('#fdf4ff');
      setSurfaceColor('#ffffff');
      setTextColor('#3b0764');
      setAccentColor('#a855f7');
      setFontStyle('sans');
      setCardStyle('glass');
    }
  };

  // Project Editor state
  const [isEditingProject, setIsEditingProject] = useState(false);
  const [projectEditId, setProjectEditId] = useState<string | null>(null);
  const [projTitle, setProjTitle] = useState('');
  const [projDesc, setProjDesc] = useState('');
  const [projDetailedDesc, setProjDetailedDesc] = useState('');
  const [projImage, setProjImage] = useState('');
  const [projImages, setProjImages] = useState<string[]>([]);
  const [projTech, setProjTech] = useState('');
  const [projCategory, setProjCategory] = useState('Web & App Development');
  const [customCategory, setCustomCategory] = useState('');
  const [projEmbed, setProjEmbed] = useState('');
  const [projLinks, setProjLinks] = useState<
    { type: 'github' | 'live' | 'custom'; url: string; label: string }[]
  >([]);
  const [projFeatured, setProjFeatured] = useState(false);
  const [projError, setProjError] = useState('');

  // Find portfolio
  const portfolio = db.portfolios.find((p) => p.id === portfolioId);

  // Unsaved Changes Tracking
  const currentThemeConfig = {
    preset: themePreset,
    bg_color: bgColor,
    surface_color: surfaceColor,
    text_color: textColor,
    accent_color: accentColor,
    font_style: fontStyle,
    card_style: cardStyle,
  };

  const isPortDirty = portfolio
    ? portTitle !== (portfolio.title || '') ||
      portDesc !== (portfolio.description || '') ||
      portPublic !== (portfolio.is_public === 1) ||
      JSON.stringify(currentThemeConfig) !==
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

  const originalProject = projectEditId
    ? db.projects.find((p) => p.id === projectEditId)
    : null;
  const isProjDirty =
    isEditingProject &&
    (originalProject
      ? projTitle !== originalProject.title ||
        projDesc !== (originalProject.description || '') ||
        projDetailedDesc !== (originalProject.detailed_description || '') ||
        projImage !== (originalProject.image || '') ||
        JSON.stringify(projImages) !== JSON.stringify(originalProject.images || []) ||
        projTech !== originalProject.technologies.join(', ') ||
        projCategory !== (originalProject.category || 'Web & App Development') ||
        projEmbed !== (originalProject.embed_url || '') ||
        projFeatured !== (originalProject.featured === 1) ||
        JSON.stringify(projLinks) !==
          JSON.stringify(
            originalProject.links || [
              ...(originalProject.github_url
                ? [{ type: 'github', url: originalProject.github_url, label: '' }]
                : []),
              ...(originalProject.live_url
                ? [{ type: 'live', url: originalProject.live_url, label: '' }]
                : []),
            ]
          )
      : projTitle !== '' ||
        projDesc !== '' ||
        projDetailedDesc !== '' ||
        projImage !== '' ||
        projImages.length > 0 ||
        projTech !== '' ||
        projCategory !== 'Web & App Development' ||
        projEmbed !== '' ||
        projLinks.length > 0 ||
        projFeatured);

  const isDirty = isPortDirty || isProjDirty;

  useEffect(() => {
    setHasUnsavedChanges(isDirty);
    return () => setHasUnsavedChanges(false);
  }, [isDirty, setHasUnsavedChanges]);

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

  useEffect(() => {
    if (portfolio) {
      setPortTitle(portfolio.title);
      setPortDesc(portfolio.description || '');
      setPortPublic(portfolio.is_public === 1);

      if (portfolio.theme_config) {
        const tc = portfolio.theme_config;
        setThemePreset((tc.preset as any) || 'custom');
        setBgColor(tc.bg_color || '#0d0d11');
        setSurfaceColor(tc.surface_color || '#16161e');
        setTextColor(tc.text_color || '#f3f4f6');
        setAccentColor(tc.accent_color || '#10b981');
        setFontStyle(tc.font_style || 'sans');
        setCardStyle(tc.card_style || 'spotlight');
      }
    }
  }, [portfolio]);

  if (!portfolio) {
    return (
      <div className="flex-1 flex flex-col justify-center items-center p-12 min-h-[50vh] text-center">
        <AlertTriangle className="size-8 text-amber-500 mb-2" />
        <h3 className="font-semibold text-foreground text-base">Portfolio Not Found</h3>
        <Button onClick={() => router.push('/portfolios')} size="sm" className="mt-4">
          Back to Portfolios
        </Button>
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

    const themeConfig = {
      preset: themePreset,
      bg_color: bgColor,
      surface_color: surfaceColor,
      text_color: textColor,
      accent_color: accentColor,
      font_style: fontStyle,
      card_style: cardStyle,
    };

    updatePortfolio(portfolioId, portTitle.trim(), portDesc.trim(), portPublic, themeConfig);
    showToast('Portfolio & Theme settings saved');
  };

  const handleOpenAddProject = () => {
    setProjectEditId(null);
    setProjTitle('');
    setProjDesc('');
    setProjDetailedDesc('');
    setProjImage('');
    setProjImages([]);
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
    setProjDetailedDesc(pr.detailed_description || '');
    setProjImage(pr.image || '');
    setProjImages(Array.isArray(pr.images) ? pr.images : []);
    setProjTech(pr.technologies.join(', '));
    setProjCategory(pr.category || 'Web & App Development');
    if (pr.category && !categoryOptions.includes(pr.category)) {
      setProjCategory('Other Creative Works');
      setCustomCategory(pr.category);
    } else {
      setCustomCategory('');
    }
    setProjEmbed(pr.embed_url || '');

    const projectLinks =
      pr.links && Array.isArray(pr.links) && pr.links.length > 0
        ? (pr.links as any[]).map((l) => ({
            type: l.type || 'custom',
            url: l.url || '',
            label: l.label || '',
          }))
        : [
            ...(pr.github_url
              ? [{ type: 'github' as const, url: pr.github_url, label: '' }]
              : []),
            ...(pr.live_url
              ? [{ type: 'live' as const, url: pr.live_url, label: '' }]
              : []),
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
      setProjError('Preview description is required.');
      return;
    }

    if (projImage.trim() && !isValidImageUrl(projImage.trim())) {
      setProjError('Please enter a valid cover image URL (http://, https://, or data:image/).');
      return;
    }

    const techArray = projTech
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const finalCategory =
      projCategory === 'Other Creative Works'
        ? customCategory.trim() || 'Other Creative Works'
        : projCategory;

    const projectData = {
      title: projTitle.trim(),
      description: projDesc.trim(),
      detailed_description: projDetailedDesc.trim() || null,
      image: projImage.trim() || null,
      images: projImages.map((i) => i.trim()).filter((i) => i.length > 0),
      technologies: techArray,
      category: finalCategory,
      embed_url: projEmbed.trim(),
      link_type: (projLinks.length > 0 ? projLinks[0].type : 'none') as
        | 'github'
        | 'live'
        | 'custom'
        | 'none',
      github_url: projLinks.find((l) => l.type === 'github')?.url.trim() || null,
      live_url:
        projLinks.find((l) => l.type === 'live')?.url.trim() ||
        projLinks.find((l) => l.type === 'custom')?.url.trim() ||
        null,
      links: projLinks.map((l) => ({ type: l.type, url: l.url.trim(), label: l.label.trim() })),
      featured: projFeatured ? 1 : 0,
    };

    if (projectEditId) {
      const success = await updateProject(projectEditId, projectData);
      if (success) {
        showToast('Project updated');
        setIsEditingProject(false);
      } else {
        setProjError('Failed to update project. Please try again.');
      }
    } else {
      const success = await addProject(portfolioId, projectData);
      if (success) {
        showToast('Project added');
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

  const portfolioProjects = db.projects.filter((p) => p.portfolio_id === portfolioId);

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
    'Other Creative Works',
  ];

  return (
    <div className="flex-1 flex flex-col gap-6 w-full max-w-5xl mx-auto">
      {/* Header */}
      <div className="border-b border-border/80 pb-6">
        <div className="flex items-center gap-2 text-muted-foreground text-xs mb-2 font-mono">
          <button
            type="button"
            onClick={() => {
              if (
                isDirty &&
                !window.confirm('You have unsaved changes. Are you sure you want to leave?')
              )
                return;
              router.push('/portfolios');
            }}
            className="hover:text-foreground transition-colors"
          >
            Portfolios
          </button>
          <span>/</span>
          <span className="text-foreground">Workspace Editor</span>
        </div>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Portfolio Workspace
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Edit portfolio settings, custom appearance theme, and showcase projects.
        </p>
      </div>

      {/* 1. Portfolio Settings & Theme Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Portfolio Settings & Appearance</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSavePortfolioDetails} className="space-y-6" autoComplete="off">
            {portError && (
              <div className="rounded-lg bg-destructive/10 p-3 text-xs text-destructive">
                {portError}
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="port-title-input">Title</Label>
              <Input
                id="port-title-input"
                type="text"
                value={portTitle}
                onChange={(e) => setPortTitle(e.target.value)}
                placeholder="e.g. Full-Stack Web Engineering"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="port-desc-input">Description</Label>
              <Textarea
                id="port-desc-input"
                value={portDesc}
                onChange={(e) => setPortDesc(e.target.value)}
                rows={3}
                placeholder="Summary of this portfolio showcase"
              />
            </div>

            <div>
              <label className="checkbox" htmlFor="port-public-checkbox">
                <input
                  id="port-public-checkbox"
                  type="checkbox"
                  checked={portPublic}
                  onChange={(e) => setPortPublic(e.target.checked)}
                />
                <span className="text-xs font-medium">Publish this portfolio as active public showcase</span>
              </label>
            </div>

            {/* Appearance & Theme Styling Controls with Live Preview */}
            <div className="border-t border-border pt-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Palette className="size-4 text-primary" />
                  <h3 className="text-sm font-semibold text-foreground">Theme & Visual Styling</h3>
                </div>
                <span className="text-[11px] font-mono text-muted-foreground uppercase flex items-center gap-1">
                  <Sparkles className="size-3 text-primary" />
                  {themePreset} preset
                </span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Left side: Controls (7 cols on lg) */}
                <div className="lg:col-span-7 space-y-4">
                  {/* 1-Click Preset Shortcuts */}
                  <div className="space-y-2">
                    <Label>1-Click Aesthetic Presets</Label>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { key: 'obsidian', label: 'Obsidian Dark', bg: '#0d0d11', accent: '#10b981' },
                        { key: 'editorial', label: 'Warm Editorial', bg: '#faf8f5', accent: '#d97706' },
                        { key: 'neon', label: 'Cyber Neon', bg: '#05070f', accent: '#06b6d4' },
                        { key: 'monochrome', label: 'Monochrome', bg: '#18181b', accent: '#e4e4e7' },
                        { key: 'pastel', label: 'Studio Pastel', bg: '#fdf4ff', accent: '#a855f7' },
                      ].map((p) => (
                        <button
                          key={p.key}
                          type="button"
                          onClick={() => applyPreset(p.key)}
                          className={cn(
                            'px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 border transition-all cursor-pointer active:scale-95',
                            themePreset === p.key
                              ? 'border-primary bg-primary/10 text-primary shadow-xs font-medium'
                              : 'border-border bg-muted/40 text-muted-foreground hover:text-foreground'
                          )}
                        >
                          <span
                            className="size-2.5 rounded-full border border-black/20"
                            style={{ backgroundColor: p.accent }}
                          />
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Custom Color Pickers */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-muted/40 p-3.5 rounded-xl border border-border">
                    <div className="space-y-1">
                      <Label>Background</Label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={bgColor}
                          onChange={(e) => {
                            setBgColor(e.target.value);
                            setThemePreset('custom');
                          }}
                          className="size-7 rounded border-0 cursor-pointer p-0 bg-transparent"
                        />
                        <input
                          type="text"
                          value={bgColor}
                          onChange={(e) => {
                            setBgColor(e.target.value);
                            setThemePreset('custom');
                          }}
                          className="input-field py-1 text-xs font-mono w-20 h-7"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <Label>Surface</Label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={surfaceColor}
                          onChange={(e) => {
                            setSurfaceColor(e.target.value);
                            setThemePreset('custom');
                          }}
                          className="size-7 rounded border-0 cursor-pointer p-0 bg-transparent"
                        />
                        <input
                          type="text"
                          value={surfaceColor}
                          onChange={(e) => {
                            setSurfaceColor(e.target.value);
                            setThemePreset('custom');
                          }}
                          className="input-field py-1 text-xs font-mono w-20 h-7"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <Label>Text</Label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={textColor}
                          onChange={(e) => {
                            setTextColor(e.target.value);
                            setThemePreset('custom');
                          }}
                          className="size-7 rounded border-0 cursor-pointer p-0 bg-transparent"
                        />
                        <input
                          type="text"
                          value={textColor}
                          onChange={(e) => {
                            setTextColor(e.target.value);
                            setThemePreset('custom');
                          }}
                          className="input-field py-1 text-xs font-mono w-20 h-7"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <Label>Accent</Label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={accentColor}
                          onChange={(e) => {
                            setAccentColor(e.target.value);
                            setThemePreset('custom');
                          }}
                          className="size-7 rounded border-0 cursor-pointer p-0 bg-transparent"
                        />
                        <input
                          type="text"
                          value={accentColor}
                          onChange={(e) => {
                            setAccentColor(e.target.value);
                            setThemePreset('custom');
                          }}
                          className="input-field py-1 text-xs font-mono w-20 h-7"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Typography & Card Style Dropdowns */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label>Typography Style</Label>
                      <select
                        value={fontStyle}
                        onChange={(e) => {
                          setFontStyle(e.target.value as any);
                          setThemePreset('custom');
                        }}
                        className="input-field py-1.5 text-xs"
                      >
                        <option value="sans">Modern Sans-Serif (Geist / Outfit)</option>
                        <option value="serif">Elegant Serif (Editorial)</option>
                        <option value="mono">Minimal Technical Mono</option>
                        <option value="display">Bold Geometric Display</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <Label>Card Layout Style</Label>
                      <select
                        value={cardStyle}
                        onChange={(e) => {
                          setCardStyle(e.target.value as any);
                          setThemePreset('custom');
                        }}
                        className="input-field py-1.5 text-xs"
                      >
                        <option value="spotlight">Spotlight Refraction Glow</option>
                        <option value="minimal">Minimal Hairline Border</option>
                        <option value="glass">Translucent Glassmorphism</option>
                        <option value="bento">Bold Editorial Bento</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Right side: Interactive Live Theme Preview Canvas (5 cols on lg) */}
                <div className="lg:col-span-5 space-y-2">
                  <Label className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 font-medium">
                      <Sparkles className="size-3.5 text-primary" />
                      Live Recruiter Canvas Preview
                    </span>
                    <span className="text-[10px] font-mono text-muted-foreground uppercase">
                      {fontStyle} · {cardStyle}
                    </span>
                  </Label>

                  {/* Real-time Theme Simulator Box */}
                  <div
                    className={cn(
                      'rounded-2xl p-4 transition-all duration-300 border shadow-lg space-y-3 overflow-hidden relative',
                      fontStyle === 'serif' && 'font-serif',
                      fontStyle === 'mono' && 'font-mono',
                      fontStyle === 'display' && 'font-sans tracking-tight',
                      fontStyle === 'sans' && 'font-sans'
                    )}
                    style={{
                      backgroundColor: bgColor,
                      color: textColor,
                      borderColor: `${accentColor}33`,
                    }}
                  >
                    {/* Mini Window Topbar */}
                    <div
                      className="flex items-center justify-between pb-2 border-b"
                      style={{ borderColor: `${textColor}1a` }}
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="size-2 rounded-full" style={{ backgroundColor: `${accentColor}99` }} />
                        <span className="text-[11px] font-bold tracking-tight" style={{ color: textColor }}>
                          Preview<span style={{ color: `${textColor}80`, fontWeight: 400 }}> · portfolio</span>
                        </span>
                      </div>
                      <span
                        className="text-[9px] font-semibold px-2 py-0.5 rounded-full border"
                        style={{
                          borderColor: `${accentColor}40`,
                          backgroundColor: `${accentColor}18`,
                          color: accentColor,
                        }}
                      >
                        ● Active Live
                      </span>
                    </div>

                    {/* Mini Headline */}
                    <div className="space-y-0.5">
                      <h4 className="text-sm font-bold leading-tight" style={{ color: textColor }}>
                        Hi, I&apos;m {currentUser?.name || 'Kelvin'}
                      </h4>
                      <div className="text-xs font-bold leading-tight" style={{ color: accentColor }}>
                        Software Developer
                      </div>
                    </div>

                    {/* Sample Project Card styled dynamically */}
                    <div
                      className={cn(
                        'p-3 rounded-xl transition-all space-y-2 border',
                        cardStyle === 'spotlight' && 'shadow-md',
                        cardStyle === 'minimal' && 'border-dashed shadow-none',
                        cardStyle === 'glass' && 'backdrop-blur-md shadow-lg',
                        cardStyle === 'bento' && 'border-2 shadow-sm font-medium'
                      )}
                      style={{
                        backgroundColor: surfaceColor,
                        borderColor: `${accentColor}40`,
                        color: textColor,
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[8px] font-bold uppercase tracking-wider" style={{ color: accentColor }}>
                          Featured Project
                        </span>
                        <span className="text-[8px] font-mono" style={{ color: `${textColor}70` }}>
                          ★ Featured
                        </span>
                      </div>

                      <div className="space-y-0.5">
                        <h5 className="text-xs font-semibold" style={{ color: textColor }}>
                          Project 1 · Analytics Dashboard
                        </h5>
                        <p className="text-[9px] leading-relaxed line-clamp-1" style={{ color: `${textColor}99` }}>
                          Modern telemetry platform with real-time analytics.
                        </p>
                      </div>

                      <div
                        className="flex items-center justify-between pt-1.5 border-t text-[9px]"
                        style={{ borderColor: `${textColor}15` }}
                      >
                        <div className="flex gap-1">
                          <span
                            className="text-[8px] font-mono px-1.5 py-0.2 rounded border"
                            style={{
                              backgroundColor: `${bgColor}80`,
                              borderColor: `${accentColor}30`,
                              color: textColor,
                            }}
                          >
                            React
                          </span>
                          <span
                            className="text-[8px] font-mono px-1.5 py-0.2 rounded border"
                            style={{
                              backgroundColor: `${bgColor}80`,
                              borderColor: `${accentColor}30`,
                              color: textColor,
                            }}
                          >
                            Next.js
                          </span>
                        </div>

                        <span className="font-semibold flex items-center gap-0.5" style={{ color: accentColor }}>
                          View on GitHub →
                        </span>
                      </div>
                    </div>

                    {/* Color Swatch Footer */}
                    <div
                      className="flex items-center justify-between pt-2 border-t text-[8px] font-mono"
                      style={{ borderColor: `${textColor}15`, color: `${textColor}80` }}
                    >
                      <span className="flex items-center gap-1">
                        <span className="size-2 rounded-full" style={{ backgroundColor: bgColor }} />
                        {bgColor}
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="size-2 rounded-full" style={{ backgroundColor: surfaceColor }} />
                        {surfaceColor}
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="size-2 rounded-full" style={{ backgroundColor: accentColor }} />
                        {accentColor}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button type="submit" size="md">
                <Save className="size-4" />
                Save Settings
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* 2. Portfolio Projects Section */}
      <div className="space-y-4 pt-4 border-t border-border">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <FolderKanban className="size-4 text-primary" />
            <h2 className="text-sm font-semibold tracking-wider text-muted-foreground uppercase">
              Showcase Projects ({portfolioProjects.length})
            </h2>
          </div>

          <Button size="xs" onClick={handleOpenAddProject} variant="default">
            <Plus className="size-3" />
            Add Project
          </Button>
        </div>

        {/* Project Edit / Add Form */}
        {isEditingProject && (
          <Card className="animate-in fade-in slide-in-from-top-2 duration-200 border-primary/20 bg-muted/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">
                {projectEditId ? 'Edit Project' : 'Add New Project'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveProject} className="space-y-4" autoComplete="off">
                {projError && (
                  <div className="rounded-lg bg-destructive/10 p-3 text-xs text-destructive">
                    {projError}
                  </div>
                )}

                <div className="space-y-1.5">
                  <Label htmlFor="proj-title-input">Project Title</Label>
                  <Input
                    id="proj-title-input"
                    type="text"
                    value={projTitle}
                    onChange={(e) => setProjTitle(e.target.value)}
                    placeholder="e.g. Next.js SaaS Platform"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="proj-desc-input">Card Preview Summary (Short)</Label>
                  <Textarea
                    id="proj-desc-input"
                    value={projDesc}
                    onChange={(e) => setProjDesc(e.target.value)}
                    rows={2}
                    placeholder="Short 1-2 sentence description shown on project cards..."
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="proj-detailed-desc-input">Detailed Overview & Background</Label>
                  <Textarea
                    id="proj-detailed-desc-input"
                    value={projDetailedDesc}
                    onChange={(e) => setProjDetailedDesc(e.target.value)}
                    rows={4}
                    placeholder="In-depth methodology, architecture, and project outcomes shown in modal..."
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="proj-category-select">Category</Label>
                    <select
                      id="proj-category-select"
                      value={projCategory}
                      onChange={(e) => setProjCategory(e.target.value)}
                      className="input-field py-1.5 text-xs"
                    >
                      {categoryOptions.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                    {projCategory === 'Other Creative Works' && (
                      <Input
                        type="text"
                        value={customCategory}
                        onChange={(e) => setCustomCategory(e.target.value)}
                        placeholder="Specify custom category"
                        className="mt-2"
                        required
                      />
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="proj-tech-input">Skills & Technologies (comma separated)</Label>
                    <Input
                      id="proj-tech-input"
                      type="text"
                      value={projTech}
                      onChange={(e) => setProjTech(e.target.value)}
                      placeholder="React, TypeScript, Tailwind CSS, PostgreSQL"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="proj-image-input">Cover Image URL</Label>
                  <Input
                    id="proj-image-input"
                    type="text"
                    value={projImage}
                    onChange={(e) => setProjImage(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                  />
                </div>

                {/* Gallery Images */}
                <div className="space-y-3 p-4 rounded-xl border border-border bg-muted/40">
                  <div className="flex justify-between items-center">
                    <Label className="flex items-center gap-1.5">
                      <ImageIcon className="size-3.5 text-primary" />
                      Visualization Gallery (Multi-Image)
                    </Label>
                    <Button
                      type="button"
                      size="xs"
                      variant="outline"
                      onClick={() => setProjImages([...projImages, ''])}
                    >
                      <Plus className="size-3" />
                      Add Image URL
                    </Button>
                  </div>

                  {projImages.length > 0 && (
                    <div className="space-y-2">
                      {projImages.map((imgUrl, index) => (
                        <div key={index} className="flex gap-2 items-center">
                          <Input
                            type="text"
                            placeholder="https://..."
                            value={imgUrl}
                            onChange={(e) => {
                              const newImgs = [...projImages];
                              newImgs[index] = e.target.value;
                              setProjImages(newImgs);
                            }}
                            className="text-xs"
                          />
                          <Button
                            type="button"
                            size="icon-xs"
                            variant="ghost"
                            onClick={() =>
                              setProjImages(projImages.filter((_, i) => i !== index))
                            }
                            className="text-destructive hover:bg-destructive/10 shrink-0"
                          >
                            <Trash2 className="size-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="proj-embed-input">Embed URL (YouTube, Vimeo, Figma)</Label>
                  <Input
                    id="proj-embed-input"
                    type="text"
                    value={projEmbed}
                    onChange={(e) => setProjEmbed(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                  />
                </div>

                {/* Project Links */}
                <div className="space-y-3 p-4 rounded-xl border border-border bg-muted/40">
                  <div className="flex justify-between items-center">
                    <Label className="flex items-center gap-1.5">
                      <ExternalLink className="size-3.5 text-primary" />
                      Project Links
                    </Label>
                    <Button
                      type="button"
                      size="xs"
                      variant="outline"
                      onClick={() =>
                        setProjLinks([...projLinks, { type: 'live', url: '', label: '' }])
                      }
                    >
                      <Plus className="size-3" />
                      Add Link
                    </Button>
                  </div>

                  {projLinks.length > 0 && (
                    <div className="space-y-2">
                      {projLinks.map((link, index) => (
                        <div key={index} className="flex flex-col sm:flex-row gap-2 items-center">
                          <select
                            value={link.type}
                            onChange={(e) => {
                              const newLinks = [...projLinks];
                              newLinks[index].type = e.target.value as any;
                              setProjLinks(newLinks);
                            }}
                            className="input-field py-1 text-xs sm:w-32"
                          >
                            <option value="live">Live Demo</option>
                            <option value="github">GitHub</option>
                            <option value="custom">Custom</option>
                          </select>
                          <Input
                            type="text"
                            placeholder="Label (optional)"
                            value={link.label}
                            onChange={(e) => {
                              const newLinks = [...projLinks];
                              newLinks[index].label = e.target.value;
                              setProjLinks(newLinks);
                            }}
                            className="text-xs sm:w-36"
                          />
                          <Input
                            type="text"
                            placeholder="https://..."
                            value={link.url}
                            onChange={(e) => {
                              const newLinks = [...projLinks];
                              newLinks[index].url = e.target.value;
                              setProjLinks(newLinks);
                            }}
                            className="text-xs flex-1"
                            required
                          />
                          <Button
                            type="button"
                            size="icon-xs"
                            variant="ghost"
                            onClick={() =>
                              setProjLinks(projLinks.filter((_, i) => i !== index))
                            }
                            className="text-destructive hover:bg-destructive/10 shrink-0"
                          >
                            <Trash2 className="size-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="checkbox" htmlFor="proj-featured-checkbox">
                    <input
                      id="proj-featured-checkbox"
                      type="checkbox"
                      checked={projFeatured}
                      onChange={(e) => setProjFeatured(e.target.checked)}
                    />
                    <span className="text-xs font-medium">Mark as Featured Highlight Project</span>
                  </label>
                </div>

                <div className="flex gap-2 justify-end pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditingProject(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" size="sm">
                    Save Project
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Projects list */}
        <div className="flex flex-col gap-4">
          {portfolioProjects.length === 0 ? (
            <Card className="p-8 text-center text-muted-foreground text-xs flex flex-col items-center gap-2">
              <FolderKanban className="size-8 text-muted-foreground/40" />
              No projects added to this portfolio yet. Click &quot;+ Add Project&quot; above.
            </Card>
          ) : (
            portfolioProjects.map((pr) => {
              return (
                <Card
                  key={pr.id}
                  className="p-4 flex flex-col md:flex-row gap-4 justify-between items-start shadow-none hover:border-foreground/20"
                >
                  <div className="flex-1 space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-sm text-foreground">{pr.title}</h4>
                          {pr.featured === 1 && (
                            <span className="inline-flex items-center gap-1 rounded-md border border-amber-500/20 bg-amber-500/10 px-1.5 py-0.5 text-[9px] font-semibold text-amber-600 dark:text-amber-400">
                              <Star className="size-2.5 fill-current" />
                              Featured
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider block mt-0.5">
                          {pr.category}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <Button
                          size="icon-xs"
                          variant="ghost"
                          onClick={() => handleOpenEditProject(pr)}
                          title="Edit project"
                        >
                          <Pencil className="size-3" />
                        </Button>
                        <Button
                          size="icon-xs"
                          variant="ghost"
                          onClick={() => handleDeleteProject(pr.id)}
                          className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                          title="Delete project"
                        >
                          <Trash2 className="size-3" />
                        </Button>
                      </div>
                    </div>

                    {pr.description && (
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {pr.description}
                      </p>
                    )}

                    {pr.technologies.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {pr.technologies.map((t) => (
                          <span
                            key={t}
                            className="text-[10px] font-mono px-2 py-0.5 rounded-md border border-border bg-muted/40 text-muted-foreground"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {pr.image && (
                    <div className="md:w-48 w-full h-28 shrink-0 rounded-xl overflow-hidden border border-border bg-muted/40">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={pr.image}
                        alt={pr.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </Card>
              );
            })
          )}
        </div>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div
          className="fixed right-4 bottom-4 left-4 z-50 mx-auto flex max-w-md items-center gap-3 rounded-2xl border border-border bg-popover p-3 pl-4 text-popover-foreground shadow-xl sm:left-auto sm:mx-0 animate-in fade-in slide-in-from-bottom-2 duration-200"
          role="status"
          aria-live="polite"
        >
          <p className="min-w-0 flex-1 truncate text-xs font-medium">{toast}</p>
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            onClick={() => setToast('')}
            aria-label="Dismiss"
          >
            <X className="size-3.5" />
          </Button>
        </div>
      )}
    </div>
  );
}
