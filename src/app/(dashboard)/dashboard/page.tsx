'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Copy,
  Share2,
  ExternalLink,
  Pencil,
  Trash2,
  FolderKanban,
  UserCog,
  Mail,
  Globe,
  Check,
  Loader2,
  AlertTriangle,
  X,
  Radio,
  Eye,
} from 'lucide-react';
import { usePortfolio } from '@/components/providers/portfolio-provider';
import { formatDate, formatExternalUrl } from '@/lib/utils';
import { useToast } from '@/hooks/useToast';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function DashboardPage() {
  const {
    db,
    dbLoaded,
    currentUser,
    activePortfolioId,
    setActivePortfolio,
    togglePortfolioPublicStatus,
    deletePortfolio,
    deleteRecruiterMessage,
  } = usePortfolio();

  const router = useRouter();
  const { toast, showToast } = useToast();
  const [mounted, setMounted] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Delete message modal state
  const [deleteMsgId, setDeleteMsgId] = useState<string | null>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [activeViewMessage, setActiveViewMessage] = useState<any | null>(null);

  // Delete portfolio modal state
  const [deletePortId, setDeletePortId] = useState<string | null>(null);

  const handleOpenDeleteModal = (id: string) => {
    setDeleteMsgId(id);
    setDeleteConfirmText('');
    setDeleteError('');
  };

  const handleConfirmDeleteMessage = () => {
    if (deleteConfirmText === 'I am deleting this with full awareness.') {
      if (deleteMsgId) {
        deleteRecruiterMessage(deleteMsgId);
        showToast('Message deleted successfully');
      }
      setDeleteMsgId(null);
    } else {
      setDeleteError('Incorrect confirmation text.');
    }
  };

  if (!currentUser) return null;

  if (!dbLoaded) {
    return (
      <div className="flex-1 flex flex-col justify-center items-center p-12 min-h-[50vh] text-center">
        <Loader2 className="size-6 text-primary animate-spin" />
        <p className="text-xs text-muted-foreground mt-3 font-mono">Loading dashboard...</p>
      </div>
    );
  }

  // Filter portfolios owned by user
  const userPortfolios = db.portfolios.filter((p) => p.user_id === currentUser.id);
  const activePortfolio = db.portfolios.find((p) => p.id === activePortfolioId) || userPortfolios[0];

  // Count metrics
  const totalPortfolios = userPortfolios.length;
  const publicPortfolios = userPortfolios.filter((p) => p.is_public === 1).length;
  const userPortfolioIds = userPortfolios.map((p) => p.id);
  const totalProjects = db.projects.filter((p) => userPortfolioIds.includes(p.portfolio_id)).length;
  const recruiterMessages = db.messages?.filter((m) => m.student_id === currentUser.id) || [];

  // Generate recruiter link
  const getRecruiterUrl = () => {
    if (!mounted || typeof window === 'undefined') return '';
    const origin = window.location.origin;
    const profile = db.profiles[currentUser.id];
    if (profile?.custom_domain && profile.custom_domain.trim()) {
      return formatExternalUrl(profile.custom_domain);
    }
    return `${origin}/${currentUser.username}`;
  };

  const copyUrlToClipboard = () => {
    const url = getRecruiterUrl();
    if (!url) return;
    navigator.clipboard
      .writeText(url)
      .then(() => {
        setCopied(true);
        showToast('Copied to clipboard!');
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => showToast('Failed to copy.'));
  };

  const handleShare = () => {
    const url = getRecruiterUrl();
    if (navigator.share) {
      navigator
        .share({
          title: `${currentUser.name}'s Portfolio`,
          text: 'Check out my professional portfolio:',
          url,
        })
        .catch(() => {});
    } else {
      copyUrlToClipboard();
    }
  };

  const handleStatusToggle = () => {
    if (activePortfolio) {
      togglePortfolioPublicStatus(activePortfolio.id);
      showToast(activePortfolio.is_public === 1 ? 'Portfolio made Private' : 'Portfolio made Live!');
    }
  };

  const handleConfirmDeletePort = async () => {
    if (deletePortId) {
      await deletePortfolio(deletePortId);
      showToast('Portfolio deleted');
    }
    setDeletePortId(null);
  };

  const recentPortfolios = [...userPortfolios]
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .slice(0, 2);

  return (
    <div className="flex-1 flex flex-col gap-8 w-full max-w-7xl mx-auto">
      {/* Hero Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border/80 pb-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Hello, {currentUser.name.split(' ')[0]}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {db.profiles[currentUser.id]?.major || 'Student'} · {db.profiles[currentUser.id]?.university || 'University'}
          </p>
        </div>

        {/* 3-Col Bento Metrics */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4 text-right">
          <div className="rounded-xl border border-border/60 bg-card p-3 sm:p-4 text-center">
            <div className="text-xl sm:text-2xl font-semibold text-foreground">{totalPortfolios}</div>
            <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mt-0.5">
              Portfolios
            </div>
          </div>
          <div className="rounded-xl border border-border/60 bg-card p-3 sm:p-4 text-center">
            <div className="text-xl sm:text-2xl font-semibold text-emerald-600 dark:text-emerald-400">
              {publicPortfolios}
            </div>
            <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mt-0.5">
              Public
            </div>
          </div>
          <div className="rounded-xl border border-border/60 bg-card p-3 sm:p-4 text-center">
            <div className="text-xl sm:text-2xl font-semibold text-foreground">{totalProjects}</div>
            <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mt-0.5">
              Projects
            </div>
          </div>
        </div>
      </div>

      {/* Main 2-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column (2/3 width) */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Active Live Portfolio Control Card */}
          {activePortfolio ? (
            <Card className="hover:border-border/80">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <div className="flex items-center gap-2.5">
                  <span className={`status-dot ${activePortfolio.is_public === 1 ? 'public' : 'private'}`} />
                  <CardTitle>{activePortfolio.title}</CardTitle>
                </div>

                <Button
                  size="xs"
                  variant={activePortfolio.is_public === 1 ? 'outline' : 'default'}
                  onClick={handleStatusToggle}
                >
                  <Radio className="size-3" />
                  {activePortfolio.is_public === 1 ? 'Make Private' : 'Make Public'}
                </Button>
              </CardHeader>

              <CardContent className="space-y-4">
                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                  {activePortfolio.description || 'No description provided for this portfolio.'}
                </p>

                {/* Recruiter Live Link Panel */}
                <div className="rounded-xl border border-border/70 bg-muted/40 p-3.5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <Globe className="size-3.5 text-primary" />
                      Live Recruiter URL
                    </span>
                    <span className="badge badge-public text-[9px]">Live Active</span>
                  </div>

                  <div className="font-mono text-xs text-foreground bg-background/80 px-3 py-2 rounded-lg border border-border/60 truncate select-all">
                    {getRecruiterUrl()}
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <Button size="sm" variant="outline" onClick={copyUrlToClipboard} className="flex-1">
                      {copied ? <Check className="size-3.5 text-emerald-500" /> : <Copy className="size-3.5" />}
                      {copied ? 'Copied' : 'Copy link'}
                    </Button>
                    <Button size="sm" variant="outline" onClick={handleShare} className="flex-1">
                      <Share2 className="size-3.5" />
                      Share
                    </Button>
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => window.open(`/${currentUser.username}`, '_blank')}
                      className="flex-1"
                    >
                      <ExternalLink className="size-3.5" />
                      Preview
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-border text-xs">
                  <label htmlFor="active-portfolio-select" className="text-muted-foreground font-medium">
                    Active public selection
                  </label>
                  <select
                    id="active-portfolio-select"
                    value={activePortfolio.id}
                    onChange={(e) => {
                      setActivePortfolio(e.target.value);
                      showToast('Active portfolio updated');
                    }}
                    className="input-field text-xs py-1 px-2.5 w-auto max-w-[220px]"
                  >
                    {userPortfolios.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.title} {p.is_public === 1 ? '· Public' : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="p-8 text-center flex flex-col items-center gap-3">
              <FolderKanban className="size-10 text-muted-foreground/60" />
              <CardTitle>No portfolios created</CardTitle>
              <p className="text-xs text-muted-foreground max-w-sm">
                Set up your first portfolio workspace to present on your live link.
              </p>
              <Button onClick={() => router.push('/portfolios')} size="sm">
                Create Portfolio
              </Button>
            </Card>
          )}

          {/* Recent Portfolios Section */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-sm font-semibold tracking-wider text-muted-foreground uppercase">
                Recent Portfolios
              </h2>
              <Link
                href="/portfolios"
                className="text-xs font-medium text-primary hover:underline"
              >
                View all ({userPortfolios.length})
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recentPortfolios.map((p) => (
                <Card
                  key={p.id}
                  className="ui-stagger-item shadow-none transition-[border-color,transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:border-foreground/20 hover:shadow-md"
                >
                  <CardHeader className="flex flex-row items-start justify-between pb-2">
                    <div>
                      <CardTitle className="text-sm">{p.title}</CardTitle>
                      <span className="text-[11px] text-muted-foreground font-mono mt-0.5 block">
                        Updated {formatDate(p.updated_at)}
                      </span>
                    </div>
                    <span className={`badge ${p.is_public === 1 ? 'badge-public' : 'badge-private'} text-[9px]`}>
                      {p.is_public === 1 ? 'Public' : 'Private'}
                    </span>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
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
          </div>
        </div>

        {/* Right Column (1/3 width): Quick Actions & Recruiter Inbox */}
        <div className="flex flex-col gap-6">
          {/* Quick Actions */}
          <div className="space-y-3">
            <h2 className="text-sm font-semibold tracking-wider text-muted-foreground uppercase">
              Quick Actions
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-2.5">
              <Link
                href="/projects"
                className="group rounded-2xl border border-border bg-card p-3.5 transition-all duration-200 hover:-translate-y-0.5 hover:border-foreground/20 hover:shadow-xs flex items-center gap-3"
              >
                <div className="size-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors shrink-0">
                  <FolderKanban className="size-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-foreground">Projects Hub</div>
                  <div className="text-[11px] text-muted-foreground">Add, tag & feature projects</div>
                </div>
              </Link>

              <Link
                href="/profile"
                className="group rounded-2xl border border-border bg-card p-3.5 transition-all duration-200 hover:-translate-y-0.5 hover:border-foreground/20 hover:shadow-xs flex items-center gap-3"
              >
                <div className="size-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors shrink-0">
                  <UserCog className="size-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-foreground">Profile & Timeline</div>
                  <div className="text-[11px] text-muted-foreground">Bio, skills, work & study</div>
                </div>
              </Link>

              {activePortfolio && (
                <Link
                  href={`/portfolios/${activePortfolio.id}/edit`}
                  className="group rounded-2xl border border-border bg-card p-3.5 transition-all duration-200 hover:-translate-y-0.5 hover:border-foreground/20 hover:shadow-xs flex items-center gap-3"
                >
                  <div className="size-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors shrink-0">
                    <Radio className="size-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-foreground">Portfolio Studio</div>
                    <div className="text-[11px] text-muted-foreground">Customize theme & layout</div>
                  </div>
                </Link>
              )}
            </div>
          </div>

          {/* Recruiter Inbox */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold tracking-wider text-muted-foreground uppercase">
                Recruiter Inbox
              </h2>
              <span className="text-xs text-muted-foreground font-mono">
                {recruiterMessages.length} message{recruiterMessages.length === 1 ? '' : 's'}
              </span>
            </div>

            {recruiterMessages.length === 0 ? (
              <Card className="p-6 text-center text-muted-foreground text-xs flex flex-col items-center gap-2">
                <Mail className="size-6 text-muted-foreground/40" />
                No recruiter messages received yet.
              </Card>
            ) : (
              <div className="flex flex-col gap-3 max-h-[520px] overflow-y-auto pr-1">
                {recruiterMessages.map((msg) => (
                  <Card key={msg.id} className="p-4 space-y-2.5 shadow-none hover:border-foreground/20">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold text-xs text-foreground">{msg.name}</h4>
                        <a
                          href={`mailto:${msg.email}`}
                          className="text-[11px] text-primary hover:underline"
                        >
                          {msg.email}
                        </a>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-[10px] font-mono text-muted-foreground">
                          {new Date(msg.created_at).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                        <Button
                          size="icon-xs"
                          variant="ghost"
                          onClick={() => handleOpenDeleteModal(msg.id)}
                          className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                          title="Delete message"
                        >
                          <Trash2 className="size-3" />
                        </Button>
                      </div>
                    </div>

                    <p
                      onClick={() => setActiveViewMessage(msg)}
                      className="text-xs text-muted-foreground bg-muted/40 p-2.5 rounded-xl border border-border/50 leading-relaxed cursor-pointer hover:border-border hover:bg-muted/70 transition-all select-none"
                      title="Click to view full message"
                    >
                      {msg.message.length > 85 ? `${msg.message.substring(0, 85)}...` : msg.message}
                      {msg.message.length > 85 && (
                        <span className="text-[10px] text-primary font-semibold block mt-1">
                          Click to view full message
                        </span>
                      )}
                    </p>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Message Deletion Modal */}
      {deleteMsgId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-destructive">
              <div className="p-2 rounded-xl bg-destructive/10">
                <AlertTriangle className="size-5" />
              </div>
              <h3 className="font-semibold text-base text-foreground">Delete Recruiter Message</h3>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              This action is permanent and cannot be undone. To verify, please type the confirmation phrase exactly:
            </p>

            <div className="p-2.5 bg-muted rounded-xl border border-border text-center select-none font-mono text-[11px] font-semibold text-foreground">
              I am deleting this with full awareness.
            </div>

            <div className="space-y-1.5">
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => {
                  setDeleteConfirmText(e.target.value);
                  setDeleteError('');
                }}
                className="input-field"
                placeholder="Type confirmation phrase"
                autoFocus
              />
              {deleteError && <p className="text-xs text-destructive">{deleteError}</p>}
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <Button variant="outline" size="sm" onClick={() => setDeleteMsgId(null)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleConfirmDeleteMessage}
                disabled={deleteConfirmText !== 'I am deleting this with full awareness.'}
              >
                Confirm Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Portfolio Deletion Modal */}
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
              Are you sure you want to delete this portfolio? This will remove all associated projects and achievements.
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

      {/* View Message Modal */}
      {activeViewMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-start border-b border-border pb-3">
              <div>
                <h3 className="font-semibold text-sm text-foreground">
                  Message from {activeViewMessage.name}
                </h3>
                <a
                  href={`mailto:${activeViewMessage.email}`}
                  className="text-xs text-primary hover:underline font-medium mt-0.5 block"
                >
                  {activeViewMessage.email}
                </a>
              </div>
              <span className="text-[10px] font-mono text-muted-foreground">
                {new Date(activeViewMessage.created_at).toLocaleString(undefined, {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                })}
              </span>
            </div>

            <p className="text-xs text-foreground leading-relaxed whitespace-pre-wrap max-h-[300px] overflow-y-auto bg-muted/40 p-4 rounded-xl border border-border select-text">
              {activeViewMessage.message}
            </p>

            <div className="flex justify-end pt-2">
              <Button variant="outline" size="sm" onClick={() => setActiveViewMessage(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Snack Toast Notification */}
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
            onClick={() => showToast('')}
            aria-label="Dismiss"
          >
            <X className="size-3.5" />
          </Button>
        </div>
      )}
    </div>
  );
}
