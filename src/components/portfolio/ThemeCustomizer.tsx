'use client';

import React, { useState } from 'react';
import {
  Palette,
  Sparkles,
  Type,
  Layout,
  Check,
  RotateCcw,
  Sliders,
} from 'lucide-react';
import { ThemeConfig } from '@/components/providers/portfolio-provider';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Label } from '@/components/ui/Label';
import { cn } from '@/lib/utils';

export interface PresetTheme {
  id: string;
  name: string;
  description: string;
  bg_color: string;
  surface_color: string;
  text_color: string;
  accent_color: string;
  font_style: 'sans' | 'serif' | 'mono' | 'display';
  card_style: 'spotlight' | 'minimal' | 'glass' | 'bento';
}

export const THEME_PRESETS: PresetTheme[] = [
  {
    id: 'obsidian',
    name: 'Obsidian Slate',
    description: 'Sleek dark slate with vibrant emerald accents and spotlight glows',
    bg_color: '#131722',
    surface_color: '#1e2538',
    text_color: '#f3f4f6',
    accent_color: '#10b981',
    font_style: 'sans',
    card_style: 'spotlight',
  },
  {
    id: 'editorial',
    name: 'Warm Editorial',
    description: 'Sophisticated light paper palette with serif typography and warm amber accents',
    bg_color: '#faf8f5',
    surface_color: '#ffffff',
    text_color: '#1c1917',
    accent_color: '#d97706',
    font_style: 'serif',
    card_style: 'minimal',
  },
  {
    id: 'neon',
    name: 'Cyber Navy',
    description: 'Deep midnight navy with glowing cyan accents and glassmorphism',
    bg_color: '#0f172a',
    surface_color: '#1e293b',
    text_color: '#f8fafc',
    accent_color: '#06b6d4',
    font_style: 'display',
    card_style: 'glass',
  },
  {
    id: 'monochrome',
    name: 'Charcoal Minimal',
    description: 'Minimalist high-contrast charcoal palette with monospace typography',
    bg_color: '#1e2029',
    surface_color: '#2b2e3b',
    text_color: '#ffffff',
    accent_color: '#e4e4e7',
    font_style: 'mono',
    card_style: 'bento',
  },
  {
    id: 'pastel',
    name: 'Lavender Clean',
    description: 'Clean light theme with delicate purple accents and glass effects',
    bg_color: '#fdf4ff',
    surface_color: '#ffffff',
    text_color: '#3b0764',
    accent_color: '#a855f7',
    font_style: 'sans',
    card_style: 'glass',
  },
];

interface ThemeCustomizerProps {
  themeConfig: ThemeConfig;
  onChange: (newConfig: ThemeConfig) => void;
  onSave: () => Promise<void>;
  isDirty?: boolean;
}

export function ThemeCustomizer({
  themeConfig,
  onChange,
  onSave,
  isDirty = false,
}: ThemeCustomizerProps) {
  const [activePreset, setActivePreset] = useState<string>(
    themeConfig.preset || 'obsidian'
  );
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [saving, setSaving] = useState(false);

  const applyPreset = (preset: PresetTheme) => {
    setActivePreset(preset.id);
    onChange({
      preset: preset.id,
      bg_color: preset.bg_color,
      surface_color: preset.surface_color,
      text_color: preset.text_color,
      accent_color: preset.accent_color,
      font_style: preset.font_style,
      card_style: preset.card_style,
    });
  };

  const handleFieldChange = (field: keyof ThemeConfig, val: any) => {
    setActivePreset('custom');
    onChange({
      ...themeConfig,
      preset: 'custom',
      [field]: val,
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave();
    } finally {
      setSaving(false);
    }
  };

  const currentBg = themeConfig.bg_color || '#0d0d11';
  const currentSurface = themeConfig.surface_color || '#16161e';
  const currentText = themeConfig.text_color || '#f3f4f6';
  const currentAccent = themeConfig.accent_color || '#10b981';
  const currentFont = themeConfig.font_style || 'sans';
  const currentCard = themeConfig.card_style || 'spotlight';

  return (
    <div className="space-y-6">
      {/* Header with Save Button */}
      <div className="flex items-center justify-between border-b border-border/80 pb-4">
        <div>
          <h3 className="text-base font-semibold text-foreground">
            Theme & Appearance
          </h3>
          <p className="text-xs text-muted-foreground">
            Choose a curated preset or customize colors and typography for your public portfolio
          </p>
        </div>
        <Button
          onClick={handleSave}
          size="sm"
          disabled={!isDirty || saving}
          className="h-8 gap-1.5"
        >
          {saving ? 'Saving...' : isDirty ? 'Save Theme' : 'Saved'}
        </Button>
      </div>

      {/* Preset Cards */}
      <div className="space-y-3">
        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Curated Presets
        </Label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {THEME_PRESETS.map((preset) => {
            const isSelected = activePreset === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => applyPreset(preset)}
                className={cn(
                  'group relative flex flex-col text-left p-4 rounded-xl border transition-all duration-200',
                  isSelected
                    ? 'border-primary ring-2 ring-primary/20 shadow-sm bg-card'
                    : 'border-border/80 bg-card/60 hover:border-border hover:bg-card'
                )}
              >
                {/* Color swatches preview */}
                <div className="flex items-center justify-between mb-3 w-full">
                  <div className="flex items-center gap-1.5 p-1 rounded-lg bg-muted/50 border border-border/40">
                    <span
                      className="size-4 rounded-full border border-black/20"
                      style={{ backgroundColor: preset.bg_color }}
                    />
                    <span
                      className="size-4 rounded-full border border-black/20"
                      style={{ backgroundColor: preset.surface_color }}
                    />
                    <span
                      className="size-4 rounded-full border border-black/20"
                      style={{ backgroundColor: preset.accent_color }}
                    />
                  </div>
                  {isSelected && (
                    <span className="flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <Check className="size-3" strokeWidth={3} />
                    </span>
                  )}
                </div>

                <div className="font-medium text-xs text-foreground group-hover:text-primary transition-colors">
                  {preset.name}
                </div>
                <div className="text-[11px] text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                  {preset.description}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Live Mini Preview Box */}
      <div className="rounded-2xl border border-border/80 p-5 bg-card space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Live Preview Snippet
          </Label>
          <span className="text-[11px] font-mono text-muted-foreground">
            Font: {currentFont} · Card: {currentCard}
          </span>
        </div>

        <div
          className="rounded-xl p-5 transition-all duration-300 border"
          style={{
            backgroundColor: currentBg,
            borderColor: currentAccent + '40',
            color: currentText,
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <span
              className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
              style={{
                backgroundColor: currentAccent + '20',
                color: currentAccent,
              }}
            >
              ✦ Featured Project
            </span>
            <span
              className="size-2 rounded-full animate-ping"
              style={{ backgroundColor: currentAccent }}
            />
          </div>
          <h4
            className="text-base font-semibold"
            style={{
              fontFamily:
                currentFont === 'serif'
                  ? 'Georgia, serif'
                  : currentFont === 'mono'
                  ? 'monospace'
                  : 'inherit',
            }}
          >
            AI Agent Workflow Engine
          </h4>
          <p className="text-xs mt-1 opacity-80">
            Autonomous multi-agent task execution system with memory persistence and real-time streaming.
          </p>
          <div className="flex items-center gap-2 mt-4">
            <span
              className="text-[10px] font-medium px-2 py-0.5 rounded border"
              style={{
                backgroundColor: currentSurface,
                borderColor: currentAccent + '30',
              }}
            >
              Next.js
            </span>
            <span
              className="text-[10px] font-medium px-2 py-0.5 rounded border"
              style={{
                backgroundColor: currentSurface,
                borderColor: currentAccent + '30',
              }}
            >
              TypeScript
            </span>
          </div>
        </div>
      </div>

      {/* Advanced Customizer Controls */}
      <div className="border border-border/80 rounded-2xl p-5 bg-card space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders className="size-4 text-primary" />
            <h4 className="text-xs font-semibold text-foreground">
              Fine-tune Colors & Styling
            </h4>
          </div>
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-xs text-primary hover:underline font-medium"
          >
            {showAdvanced ? 'Hide options' : 'Show options'}
          </button>
        </div>

        {showAdvanced && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-3 border-t border-border/60">
            <div className="space-y-1.5">
              <Label className="text-[11px]">Background</Label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={currentBg}
                  onChange={(e) => handleFieldChange('bg_color', e.target.value)}
                  className="size-8 rounded-md border border-input cursor-pointer bg-transparent"
                />
                <span className="font-mono text-xs text-muted-foreground">{currentBg}</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-[11px]">Surface / Card</Label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={currentSurface}
                  onChange={(e) => handleFieldChange('surface_color', e.target.value)}
                  className="size-8 rounded-md border border-input cursor-pointer bg-transparent"
                />
                <span className="font-mono text-xs text-muted-foreground">{currentSurface}</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-[11px]">Text Color</Label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={currentText}
                  onChange={(e) => handleFieldChange('text_color', e.target.value)}
                  className="size-8 rounded-md border border-input cursor-pointer bg-transparent"
                />
                <span className="font-mono text-xs text-muted-foreground">{currentText}</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-[11px]">Accent Highlight</Label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={currentAccent}
                  onChange={(e) => handleFieldChange('accent_color', e.target.value)}
                  className="size-8 rounded-md border border-input cursor-pointer bg-transparent"
                />
                <span className="font-mono text-xs text-muted-foreground">{currentAccent}</span>
              </div>
            </div>

            <div className="sm:col-span-2 space-y-1.5 pt-2">
              <Label className="text-[11px]">Typography Font Family</Label>
              <select
                value={currentFont}
                onChange={(e) => handleFieldChange('font_style', e.target.value)}
                className="w-full h-8 rounded-md border border-input bg-background px-2.5 text-xs text-foreground focus:outline-hidden"
              >
                <option value="sans">Outfit Sans (Modern & Clean)</option>
                <option value="serif">Editorial Serif (Classic & Elegant)</option>
                <option value="mono">Developer Monospace (Technical)</option>
                <option value="display">Plus Jakarta Display (Bold)</option>
              </select>
            </div>

            <div className="sm:col-span-2 space-y-1.5 pt-2">
              <Label className="text-[11px]">Project Card Presentation Style</Label>
              <select
                value={currentCard}
                onChange={(e) => handleFieldChange('card_style', e.target.value)}
                className="w-full h-8 rounded-md border border-input bg-background px-2.5 text-xs text-foreground focus:outline-hidden"
              >
                <option value="spotlight">Spotlight Hover Glow</option>
                <option value="minimal">Minimal Clean Outline</option>
                <option value="glass">Glassmorphism Frosted</option>
                <option value="bento">Rounded Bento Box</option>
              </select>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
