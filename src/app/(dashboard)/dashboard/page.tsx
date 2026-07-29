'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { usePortfolio } from '@/components/providers/portfolio-provider';
import { formatDate } from '@/lib/utils';
import { useToast } from '@/hooks/useToast';

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

  useEffect(() => {
    setMounted(true);
  }, []);

  // Delete message custom modal states
  const [deleteMsgId, setDeleteMsgId] = useState<string | null>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [activeViewMessage, setActiveViewMessage] = useState<any | null>(null);

  // Delete portfolio custom modal state
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
        showToast('Message deleted successfully 🗑️');
      }
      setDeleteMsgId(null);
    } else {
      setDeleteError('Incorrect confirmation text.');
    }
  };



  if (!currentUser) return null;

  if (!dbLoaded) {
    return (
      <div className="flex-grow flex flex-col justify-center items-center bg-stone-50 dark:bg-zinc-900 p-6 min-h-[50vh] text-center text-stone-900 dark:text-zinc-100">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--text-primary)] dark:border-[var(--accent)]"></div>
        <p className="text-xs text-stone-400 mt-3 font-mono animate-pulse">Loading dashboard...</p>
      </div>
    );
  }

  // Filter portfolios owned by user
  const userPortfolios = db.portfolios.filter(p => p.user_id === currentUser.id);
  const activePortfolio = db.portfolios.find(p => p.id === activePortfolioId) || userPortfolios[0];

  // Count metrics
  const totalPortfolios = userPortfolios.length;
  const publicPortfolios = userPortfolios.filter(p => p.is_public === 1).length;

  const userPortfolioIds = userPortfolios.map(p => p.id);
  const totalProjects = db.projects.filter(p => userPortfolioIds.includes(p.portfolio_id)).length;
  const recruiterMessages = db.messages?.filter(m => m.student_id === currentUser.id) || [];

  // Generate recruiter link
  const getRecruiterUrl = () => {
    if (!mounted || typeof window === 'undefined') return '';
    const origin = window.location.origin;
    const profile = db.profiles[currentUser.id];
    if (profile?.custom_domain) {
      return `https://${profile.custom_domain}`;
    }
    return `${origin}/${currentUser.username}`;
  };

  const copyUrlToClipboard = () => {
    const url = getRecruiterUrl();
    if (!url) return;
    navigator.clipboard.writeText(url)
      .then(() => showToast('Copied to clipboard!'))
      .catch(() => showToast('Failed to copy.'));
  };

  const handleShare = () => {
    const url = getRecruiterUrl();
    if (navigator.share) {
      navigator.share({
        title: `${currentUser.name}'s Portfolio`,
        text: 'Check out my professional portfolio:',
        url,
      }).catch(() => {});
    } else {
      copyUrlToClipboard();
    }
  };

  // Switch public selection dropdown
  const handleActivePortfolioChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setActivePortfolio(id);
    showToast('Public portfolio updated!');
  };

  // Make public/private toggle
  const handleStatusToggle = () => {
    if (activePortfolio) {
      togglePortfolioPublicStatus(activePortfolio.id);
      showToast(activePortfolio.is_public === 1 ? 'Portfolio made Private' : 'Portfolio made Live!');
    }
  };

  const handleDelete = (id: string) => {
    setDeletePortId(id);
  };

  const handleConfirmDeletePort = async () => {
    if (deletePortId) {
      await deletePortfolio(deletePortId);
      showToast('Portfolio deleted 🗑️');
    }
    setDeletePortId(null);
  };

  const recentPortfolios = [...userPortfolios]
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .slice(0, 2);

  return (
    <div className="flex-grow flex flex-col gap-5 pb-8 max-w-5xl xl:max-w-7xl 2xl:max-w-[1800px] mx-auto w-full relative">
      
      {/* Toast Notification Banner */}
      {toast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 bg-[var(--accent)] text-white rounded-full shadow-lg text-xs font-semibold tracking-wide animate-bounce">
          {toast}
        </div>
      )}

      {/* Hero Welcome Banner */}
      <div>
        <h2 className="text-2xl lg:text-3.5xl font-bold font-display text-stone-950 dark:text-white tracking-tight">
          Hello, {currentUser.name.split(' ')[0]}
        </h2>
        <p className="text-xs lg:text-sm text-stone-500 dark:text-zinc-400 font-mono mt-1">
          {db.profiles[currentUser.id]?.major || 'Student'} • {db.profiles[currentUser.id]?.university || 'University'}
        </p>
      </div>

      {/* 3-Col Bento Metrics Grid */}
      <div className="grid grid-cols-3 gap-4">
        <div className="glass-card p-4 lg:p-6 flex flex-col items-center justify-center text-center transition-all hover:scale-[1.02]">
          <span className="text-2xl lg:text-4xl font-bold font-display text-[var(--text-primary)]">{totalPortfolios}</span>
          <span className="text-[10px] lg:text-xs text-[var(--text-muted)] uppercase tracking-widest mt-1.5 font-bold">Portfolios</span>
        </div>
        
        <div className="glass-card p-4 lg:p-6 flex flex-col items-center justify-center text-center transition-all hover:scale-[1.02]">
          <span className="text-2xl lg:text-4xl font-bold font-display text-emerald-600 dark:text-emerald-400">{publicPortfolios}</span>
          <span className="text-[10px] lg:text-xs text-[var(--text-muted)] uppercase tracking-widest mt-1.5 font-bold">Public</span>
        </div>

        <div className="glass-card p-4 lg:p-6 flex flex-col items-center justify-center text-center transition-all hover:scale-[1.02]">
          <span className="text-2xl lg:text-4xl font-bold font-display text-[var(--text-primary)]">{totalProjects}</span>
          <span className="text-[10px] lg:text-xs text-[var(--text-muted)] uppercase tracking-widest mt-1.5 font-bold">Projects</span>
        </div>
      </div>

      {/* Grid columns section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Columns (2/3 width on desktop): Active Portfolio and Recent Portfolios */}
        <div className="lg:col-span-2 flex flex-col gap-6 w-full">
          {/* Live Status Control Card */}
          {activePortfolio ? (
            <div className="glass-card p-4 flex flex-col gap-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className={`status-dot ${activePortfolio.is_public === 1 ? 'public' : 'private'}`} />
                  <h3 className="font-semibold text-sm text-stone-900 dark:text-zinc-100">
                    {activePortfolio.title}
                  </h3>
                </div>
                
                <button
                  onClick={handleStatusToggle}
                  className={`px-3 py-1 text-[11px] font-bold rounded-full transition-all active:scale-95 ${
                    activePortfolio.is_public === 1
                      ? 'bg-stone-100 text-stone-700 border border-stone-200 dark:bg-zinc-700 dark:text-zinc-300 dark:border-zinc-600'
                      : 'bg-emerald-500 text-white shadow-sm hover:bg-emerald-600'
                  }`}
                >
                  {activePortfolio.is_public === 1 ? 'Make Private' : 'Make Public'}
                </button>
              </div>

              <p className="text-xs text-stone-500 dark:text-zinc-400 line-clamp-2">
                {activePortfolio.description || 'No description for this portfolio.'}
              </p>

              <div className="pt-2.5 border-t border-stone-100 dark:border-zinc-700/60 flex items-center justify-between">
                <label className="text-[10px] font-bold text-stone-400 dark:text-zinc-500 uppercase tracking-wider" htmlFor="active-portfolio-select">
                  Active Public Portfolio
                </label>
                <select
                  id="active-portfolio-select"
                  value={activePortfolio.id}
                  onChange={(e) => {
                    setActivePortfolio(e.target.value);
                    showToast('Active portfolio updated');
                  }}
                  className="input-field text-xs py-1 px-3 w-auto max-w-[200px]"
                >
                  {userPortfolios.map(p => (
                    <option key={p.id} value={p.id} className="bg-white dark:bg-zinc-900">
                      {p.title} {p.is_public === 1 ? '• Public' : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ) : (
            <div className="glass-card p-6 text-center flex flex-col items-center gap-3">
              <svg className="w-10 h-10 text-stone-300 dark:text-zinc-600" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0a2 2 0 01-2 2H6a2 2 0 01-2-2m16 0V9a2 2 0 00-2-2H6a2 2 0 00-2 2v4m16 0h-3.86a2 2 0 01-1.896 1.333H7.757a2 2 0 01-1.896-1.333H2" />
              </svg>
              <h3 className="font-semibold text-stone-900 dark:text-zinc-100">No portfolios created</h3>
              <p className="text-xs text-stone-500">Setup your first portfolio page to display on your public profile.</p>
              <Link
                href="/portfolios"
                className="mt-2 px-4 py-2 bg-stone-950 text-white rounded-full text-xs font-semibold shadow"
              >
                Create Portfolio
              </Link>
            </div>
          )}

          {/* Recruiter Live Link Panel */}
          {activePortfolio && (
            <div className="glass-card p-4 bg-[var(--accent-light)] border-[var(--border)] flex flex-col gap-3 animate-fadeIn">
              <div>
                <h4 className="text-[10px] font-bold text-[var(--accent)] uppercase tracking-widest">
                  Live Recruiter URL
                </h4>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="text-xs font-mono font-medium truncate text-stone-700 dark:text-zinc-300">
                    {getRecruiterUrl()}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={copyUrlToClipboard}
                  className="py-2 rounded-xl bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 text-[11px] font-semibold text-stone-800 dark:text-zinc-200 transition-all hover:bg-stone-50 active:scale-95 flex items-center justify-center gap-1 shadow-sm"
                >
                  Copy
                </button>
                <button
                  onClick={handleShare}
                  className="py-2 rounded-xl bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 text-[11px] font-semibold text-stone-800 dark:text-zinc-200 transition-all hover:bg-stone-50 active:scale-95 flex items-center justify-center gap-1 shadow-sm"
                >
                  Share
                </button>
                <a
                  href={`/${currentUser.username}`}
                  target="_blank"
                  rel="noreferrer"
                  className="py-2 rounded-xl bg-[var(--accent)] text-white text-[11px] font-semibold text-center hover:bg-[var(--accent-hover)] transition-all active:scale-95 flex items-center justify-center gap-1 shadow-sm"
                >
                  Preview
                </a>
              </div>
            </div>
          )}

          {/* Recent Portfolios registry */}
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <h4 className="text-[10px] font-bold text-stone-400 dark:text-zinc-500 uppercase tracking-widest">
                Recent Portfolios
              </h4>
              <Link
                href="/portfolios"
                className="text-[10px] font-semibold text-[var(--accent)] uppercase tracking-wide hover:underline"
              >
                View All
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recentPortfolios.map(p => (
                <div key={p.id} className="glass-card p-4 flex flex-col justify-between gap-3">
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <h5 className="font-semibold text-sm text-stone-900 dark:text-zinc-100">{p.title}</h5>
                        <span className="text-[9px] font-mono text-stone-400 block mt-0.5">
                          Updated {formatDate(p.updated_at)}
                        </span>
                      </div>
                      <span className={`badge ${p.is_public === 1 ? 'badge-public' : 'badge-private'}`}>
                        {p.is_public === 1 ? 'Public' : 'Private'}
                      </span>
                    </div>
                    
                    <p className="text-xs text-stone-500 dark:text-zinc-400 line-clamp-2">
                      {p.description || 'No description provided.'}
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-stone-100 dark:border-zinc-700/60">
                    <button
                      onClick={() => router.push(`/portfolios/${p.id}/edit`)}
                      className="py-1.5 text-center text-[10px] font-bold rounded-lg border border-stone-200 dark:border-zinc-800 bg-stone-50 dark:bg-zinc-900 text-stone-700 dark:text-zinc-300 hover:bg-stone-100 transition-all active:scale-95"
                    >
                      Edit Projects
                    </button>
                    <button
                      onClick={() => {
                        setActivePortfolio(p.id);
                        router.push(`/${currentUser.username}`);
                      }}
                      className="py-1.5 text-center text-[10px] font-bold rounded-lg bg-[var(--accent)] text-white transition-all active:scale-95"
                    >
                      View Public
                    </button>
                    <button
                      onClick={() => handleDelete(p.id)}
                      className="py-1.5 text-center text-[10px] font-bold rounded-lg border border-red-200 dark:border-red-950 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all active:scale-95"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right column (1/3 width on desktop): Quick Actions and Recruiter Inbox */}
        <div className="flex flex-col gap-6 w-full">
          {/* Quick Actions */}
          <div>
            <h4 className="text-[10px] font-bold text-stone-400 dark:text-zinc-500 uppercase tracking-widest mb-2.5">
              Quick Actions
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <Link
                href="/portfolios"
                className="p-4 glass-card flex flex-col gap-2 transition-all hover:translate-y-[-2px] hover:shadow-md active:translate-y-0 active:shadow-none"
              >
                <i className="fas fa-folder-open text-[var(--accent)] text-xl shrink-0"></i>
                <div>
                  <div className="text-xs font-bold text-[var(--text-primary)]">New Portfolio</div>
                  <div className="text-[9px] text-[var(--text-muted)] mt-0.5">Create title & settings</div>
                </div>
              </Link>
              <Link
                href="/profile"
                className="p-4 glass-card flex flex-col gap-2 transition-all hover:translate-y-[-2px] hover:shadow-md active:translate-y-0 active:shadow-none"
              >
                <i className="fas fa-user-cog text-[var(--accent)] text-xl shrink-0"></i>
                <div>
                  <div className="text-xs font-bold text-[var(--text-primary)]">Edit Profile</div>
                  <div className="text-[9px] text-[var(--text-muted)] mt-0.5">Bio, Skills & Education</div>
                </div>
              </Link>
            </div>
          </div>

          {/* Recruiter Messages Inbox */}
          <div className="flex flex-col gap-3">
            <h4 className="text-[10px] font-bold text-stone-400 dark:text-zinc-500 uppercase tracking-widest">
              Recruiter Inbox
            </h4>
            {recruiterMessages.length === 0 ? (
              <div className="glass-card p-6 text-center text-[var(--text-muted)] text-xs flex flex-col items-center gap-2">
                <svg className="w-6 h-6 text-stone-300 dark:text-zinc-655" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                No recruiter messages received yet.
              </div>
            ) : (
              <div className="flex flex-col gap-3 max-h-[500px] overflow-y-auto pr-1">
                {recruiterMessages.map(msg => (
                  <div key={msg.id} className="glass-card p-4 flex flex-col gap-2 relative animate-fadeIn animate-duration-300">
                    <div className="flex justify-between items-start">
                      <div>
                        <h5 className="font-semibold text-xs text-stone-900 dark:text-zinc-100">
                          {msg.name}
                        </h5>
                        <a href={`mailto:${msg.email}`} className="text-[10px] text-[var(--accent)] hover:underline">
                          {msg.email}
                        </a>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[8px] font-mono text-stone-400 dark:text-zinc-500">
                          {new Date(msg.created_at).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })}
                        </span>
                        <button
                          onClick={() => handleOpenDeleteModal(msg.id)}
                          className="p-1 text-stone-400 hover:text-red-500 dark:text-zinc-500 dark:hover:text-red-400 transition-colors"
                          title="Delete message"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    <p 
                      onClick={() => setActiveViewMessage(msg)}
                      className="text-xs text-[var(--text-secondary)] bg-[var(--accent-light)] p-2.5 rounded-xl border border-[var(--border)] leading-relaxed font-sans cursor-pointer hover:border-[var(--accent)] hover:bg-[var(--accent-light)]/80 transition-all select-none"
                      title="Click to view full message"
                    >
                      {msg.message.length > 80 ? `${msg.message.substring(0, 80)}...` : msg.message}
                      {msg.message.length > 80 && (
                        <span className="text-[9px] text-[var(--accent)] font-semibold block mt-1">
                          Click to view full message <i className="fas fa-external-link-alt text-[8px] ml-0.5"></i>
                        </span>
                      )}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Message Deletion Modal Overlay */}
      {deleteMsgId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="glass-card max-w-md w-full mx-4 p-6 flex flex-col gap-4">
            <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
              <div className="p-2 bg-red-500/10 dark:bg-red-500/20 rounded-xl shrink-0">
                <svg className="w-6 h-6 animate-pulse" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="font-bold text-base tracking-tight text-stone-900 dark:text-white leading-tight">Delete Recruiter Message</h3>
            </div>
            
            <p className="text-xs text-stone-500 dark:text-zinc-400 leading-relaxed">
              This action is permanent and cannot be undone. To verify, please type the following confirmation phrase exactly:
            </p>
            
            <div 
              draggable="false"
              className="p-2.5 bg-stone-50 dark:bg-zinc-900/60 rounded-xl border border-stone-200/50 dark:border-zinc-700/40 text-center select-none pointer-events-none font-mono text-[10px] font-bold text-stone-700 dark:text-zinc-300"
            >
              I am deleting this with full awareness.
            </div>

            <div className="flex flex-col gap-1.5">
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => {
                  setDeleteConfirmText(e.target.value);
                  setDeleteError('');
                }}
                onPaste={(e) => e.preventDefault()}
                className="input-field"
                autoFocus
              />
              {deleteError && (
                <span className="text-[10px] font-semibold text-red-600 dark:text-red-400">
                  {deleteError}
                </span>
              )}
            </div>

            <div className="flex gap-2.5 justify-end mt-2">
              <button
                onClick={() => setDeleteMsgId(null)}
                className="px-4 py-2 bg-stone-200 hover:bg-stone-300 text-stone-700 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-zinc-300 rounded-xl text-xs font-bold transition-all active:scale-95"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDeleteMessage}
                disabled={deleteConfirmText !== 'I am deleting this with full awareness.'}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:pointer-events-none text-white rounded-xl text-xs font-bold transition-all active:scale-95 shadow-sm"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Portfolio Deletion Modal Overlay */}
      {deletePortId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="glass-card max-w-sm w-full mx-4 p-6 flex flex-col gap-4">
            <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
              <div className="p-2 bg-red-500/10 dark:bg-red-500/20 rounded-xl shrink-0">
                <svg className="w-6 h-6 animate-pulse" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="font-bold text-base tracking-tight text-stone-900 dark:text-white leading-tight">Delete Portfolio</h3>
            </div>
            
            <p className="text-xs text-stone-500 dark:text-zinc-400 leading-relaxed">
              Are you sure you want to delete this portfolio? This will remove all associated projects, work experiences, and academic achievements. This action cannot be undone.
            </p>

            <div className="flex gap-2.5 justify-end mt-2">
              <button
                onClick={() => setDeletePortId(null)}
                className="px-4 py-2 bg-stone-200 hover:bg-stone-300 text-stone-700 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-zinc-300 rounded-xl text-xs font-bold transition-all active:scale-95"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDeletePort}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-all active:scale-95 shadow-sm"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Message Modal Overlay */}
      {activeViewMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="glass-card max-w-lg w-full mx-4 p-6 flex flex-col gap-4 bg-white dark:bg-zinc-800">
            <div className="flex justify-between items-start border-b border-stone-100 dark:border-zinc-700/60 pb-3">
              <div>
                <h3 className="font-bold text-sm text-stone-900 dark:text-zinc-100">
                  Message from {activeViewMessage.name}
                </h3>
                <a href={`mailto:${activeViewMessage.email}`} className="text-xs text-[var(--accent)] hover:underline font-medium mt-0.5 block">
                  {activeViewMessage.email}
                </a>
              </div>
              <span className="text-[10px] font-mono text-stone-400 dark:text-zinc-500">
                {new Date(activeViewMessage.created_at).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
              </span>
            </div>
            
            <p className="text-xs text-stone-600 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap max-h-[300px] overflow-y-auto bg-stone-50 dark:bg-zinc-900/40 p-4 rounded-2xl border border-stone-200/30 dark:border-zinc-800/50 select-text">
              {activeViewMessage.message}
            </p>

            <div className="flex justify-end mt-2">
              <button
                onClick={() => setActiveViewMessage(null)}
                className="px-5 py-2 rounded-full font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 dark:bg-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-600 text-xs transition-all active:scale-95 border border-stone-200/40 dark:border-zinc-600"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
