'use client';

import React, { useState } from 'react';
import {
  Globe,
  Lock,
  ExternalLink,
  Copy,
  Check,
  Share2,
  Trash2,
  AlertTriangle,
} from 'lucide-react';
import { Portfolio, usePortfolio } from '@/components/providers/portfolio-provider';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Label } from '@/components/ui/Label';
import { useToast } from '@/hooks/useToast';
import { useRouter } from 'next/navigation';

interface PortfolioSettingsProps {
  portfolio: Portfolio;
  onUpdate: (data: { title: string; description: string; isPublic: boolean }) => Promise<void>;
  isDirty?: boolean;
}

export function PortfolioSettings({
  portfolio,
  onUpdate,
  isDirty = false,
}: PortfolioSettingsProps) {
  const { currentUser, deletePortfolio, togglePortfolioPublicStatus } = usePortfolio();
  const { showToast } = useToast();
  const router = useRouter();

  const [title, setTitle] = useState(portfolio.title || '');
  const [description, setDescription] = useState(portfolio.description || '');
  const [isPublic, setIsPublic] = useState(portfolio.is_public === 1);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const publicUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/${currentUser?.username || ''}`
    : `/${currentUser?.username || ''}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(publicUrl).then(() => {
      setCopied(true);
      showToast('Public link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleToggleLive = async () => {
    await togglePortfolioPublicStatus(portfolio.id);
    setIsPublic(!isPublic);
    showToast(!isPublic ? 'Portfolio is now LIVE to recruiters!' : 'Portfolio made Private');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      showToast('Portfolio title is required.');
      return;
    }
    setSaving(true);
    try {
      await onUpdate({
        title: title.trim(),
        description: description.trim(),
        isPublic,
      });
      showToast('Portfolio settings updated');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    await deletePortfolio(portfolio.id);
    showToast('Portfolio deleted');
    router.push('/portfolios');
  };

  return (
    <div className="space-y-6">
      {/* Live Status & Sharing Banner */}
      <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className={`flex size-10 items-center justify-center rounded-xl ${
                portfolio.is_public === 1
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {portfolio.is_public === 1 ? (
                <Globe className="size-5" />
              ) : (
                <Lock className="size-5" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-semibold text-foreground">
                  {portfolio.is_public === 1 ? 'Portfolio is Live' : 'Portfolio is Private'}
                </h4>
                <span
                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                    portfolio.is_public === 1
                      ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {portfolio.is_public === 1 ? 'Public' : 'Draft'}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {portfolio.is_public === 1
                  ? 'Anyone with the link can view your portfolio and contact you'
                  : 'Only you and lecturers can preview your portfolio'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant={portfolio.is_public === 1 ? 'outline' : 'default'}
              size="sm"
              onClick={handleToggleLive}
              className="h-9"
            >
              {portfolio.is_public === 1 ? 'Make Private' : 'Publish Live'}
            </Button>
            {portfolio.is_public === 1 && (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleCopyLink}
                className="h-9 gap-1.5"
              >
                {copied ? <Check className="size-4 text-emerald-500" /> : <Copy className="size-4" />}
                {copied ? 'Copied' : 'Copy Link'}
              </Button>
            )}
            <a
              href={`/${currentUser?.username}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center rounded-lg border border-border bg-background p-2 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              title="Open public page in new tab"
            >
              <ExternalLink className="size-4" />
            </a>
          </div>
        </div>
      </div>

      {/* Details Form */}
      <form onSubmit={handleSave} className="rounded-2xl border border-border/80 bg-card p-6 space-y-5">
        <div className="flex items-center justify-between border-b border-border/80 pb-4">
          <div>
            <h3 className="text-base font-semibold text-foreground">
              General Portfolio Settings
            </h3>
            <p className="text-xs text-muted-foreground">
              Update name and purpose of this portfolio edition
            </p>
          </div>
          <Button type="submit" size="sm" disabled={saving}>
            {saving ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="port-title">Portfolio Title *</Label>
            <Input
              id="port-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Software Engineering & AI Portfolio"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="port-desc">Description / Purpose</Label>
            <Textarea
              id="port-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Internal notes or summary for this portfolio edition..."
              rows={3}
            />
          </div>
        </div>
      </form>

      {/* Danger Zone */}
      <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-semibold text-destructive">Danger Zone</h4>
            <p className="text-xs text-muted-foreground">
              Permanently delete this portfolio and its settings
            </p>
          </div>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={() => setShowDeleteModal(true)}
            className="gap-1.5"
          >
            <Trash2 className="size-4" /> Delete Portfolio
          </Button>
        </div>
      </div>

      {/* Delete confirmation modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-sm bg-card border border-border rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-destructive">
              <div className="flex size-10 items-center justify-center rounded-full bg-destructive/10">
                <AlertTriangle className="size-5" />
              </div>
              <h3 className="font-semibold text-foreground text-base">Delete Portfolio?</h3>
            </div>
            <p className="text-xs text-muted-foreground">
              This will permanently delete this portfolio. This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDelete}
              >
                Delete Permanently
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
