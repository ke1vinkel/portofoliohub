'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, X, Pencil, Eye, Trash2, FolderKanban, AlertTriangle } from 'lucide-react';
import { usePortfolio } from '@/components/providers/portfolio-provider';
import { formatDate } from '@/lib/utils';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Label } from '@/components/ui/Label';

export default function PortfoliosPage() {
  const {
    db,
    currentUser,
    addPortfolio,
    deletePortfolio,
    setActivePortfolio,
  } = usePortfolio();

  const router = useRouter();

  const [showAddForm, setShowAddForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');
  const [deletePortId, setDeletePortId] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  };

  if (!currentUser) return null;

  const userPortfolios = db.portfolios.filter(
    (p) => (p.user_id || (p as any).user) === currentUser.id
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('Portfolio title is required.');
      return;
    }

    try {
      const newId = await addPortfolio(title.trim(), description.trim(), isPublic);
      if (newId) {
        showToast('Portfolio created');
        setTitle('');
        setDescription('');
        setIsPublic(false);
        setShowAddForm(false);
      } else {
        setError('Failed to create portfolio. Please try again.');
      }
    } catch (err: any) {
      setError(err?.message || 'An unexpected error occurred.');
    }
  };

  const handleConfirmDeletePort = async () => {
    if (deletePortId) {
      await deletePortfolio(deletePortId);
      showToast('Portfolio deleted');
    }
    setDeletePortId(null);
  };

  return (
    <div className="flex-1 flex flex-col gap-6 w-full max-w-7xl mx-auto">
      {/* Header section matching cv-gen */}
      <div className="flex flex-row items-center justify-between gap-4 border-b border-border/80 pb-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            My Portfolios
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Manage your collections of projects and experiences ({userPortfolios.length})
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            size={showAddForm ? 'icon-sm' : 'icon-lg'}
            onClick={() => setShowAddForm(!showAddForm)}
            variant={showAddForm ? 'outline' : 'default'}
            aria-label={showAddForm ? 'Close create form' : 'Create a new portfolio'}
            title={showAddForm ? 'Close' : 'Create new portfolio'}
          >
            {showAddForm ? <X className="size-4" /> : <Plus className="size-5" />}
          </Button>
        </div>
      </div>

      {/* Expandable Inline Create Form Card */}
      {showAddForm && (
        <Card className="animate-in fade-in slide-in-from-top-2 duration-200 border-primary/20 bg-muted/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Create Portfolio</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
              {error && (
                <div className="rounded-lg bg-destructive/10 p-3 text-xs text-destructive">
                  {error}
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="portfolio-title-input">Title</Label>
                <Input
                  id="portfolio-title-input"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Software Engineering & Full-stack"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="portfolio-desc-input">Description</Label>
                <Textarea
                  id="portfolio-desc-input"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief summary of what this portfolio covers"
                  rows={3}
                />
              </div>

              <div className="pt-1">
                <label className="checkbox" htmlFor="portfolio-public-checkbox">
                  <input
                    id="portfolio-public-checkbox"
                    type="checkbox"
                    checked={isPublic}
                    onChange={(e) => setIsPublic(e.target.checked)}
                  />
                  <span className="text-xs">Set as active public live portfolio</span>
                </label>
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddForm(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm">
                  Create Portfolio
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Portfolios Grid */}
      {userPortfolios.length === 0 ? (
        <section className="flex min-h-72 flex-col items-center justify-center rounded-2xl border border-dashed border-border px-6 text-center">
          <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-muted">
            <FolderKanban className="size-5 text-muted-foreground" />
          </div>
          <h2 className="text-lg font-semibold text-foreground">Your portfolio list is empty</h2>
          <p className="mt-2 max-w-sm text-sm text-muted-foreground leading-relaxed">
            Use the plus button above to create your first portfolio collection. You can keep separate versions tailored for different domains.
          </p>
        </section>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {userPortfolios.map((p) => (
            <Card
              key={p.id}
              className="ui-stagger-item shadow-none transition-[border-color,transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:border-foreground/20 hover:shadow-md"
            >
              <CardHeader className="flex flex-row items-start justify-between pb-2">
                <div>
                  <CardTitle className="text-sm">{p.title}</CardTitle>
                  <span className="text-[11px] text-muted-foreground font-mono mt-0.5 block">
                    Created {formatDate(p.created_at)}
                  </span>
                </div>
                <span className={`badge ${p.is_public === 1 ? 'badge-public' : 'badge-private'} text-[9px]`}>
                  {p.is_public === 1 ? 'Public' : 'Private'}
                </span>
              </CardHeader>

              <CardContent className="space-y-4">
                <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                  {p.description || 'No description provided.'}
                </p>

                <div className="grid grid-cols-3 gap-1.5 pt-3 border-t border-border">
                  <Button
                    size="xs"
                    variant="ghost"
                    onClick={() => router.push(`/portfolios/${p.id}/edit`)}
                    className="justify-center"
                  >
                    <Pencil className="size-3" />
                    Edit
                  </Button>
                  <Button
                    size="xs"
                    variant="ghost"
                    onClick={() => {
                      setActivePortfolio(p.id);
                      router.push(`/${currentUser.username}`);
                    }}
                    className="justify-center text-primary hover:text-primary"
                  >
                    <Eye className="size-3" />
                    View
                  </Button>
                  <Button
                    size="xs"
                    variant="ghost"
                    onClick={() => setDeletePortId(p.id)}
                    className="justify-center text-destructive hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="size-3" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletePortId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-destructive">
              <div className="p-2 rounded-xl bg-destructive/10">
                <AlertTriangle className="size-5" />
              </div>
              <h3 className="font-semibold text-base text-foreground">Delete Portfolio</h3>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              Are you sure you want to delete this portfolio? This will remove all associated projects and achievements. This action cannot be undone.
            </p>

            <div className="flex gap-2 justify-end pt-2">
              <Button variant="outline" size="sm" onClick={() => setDeletePortId(null)}>
                Cancel
              </Button>
              <Button variant="destructive" size="sm" onClick={handleConfirmDeletePort}>
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}

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
