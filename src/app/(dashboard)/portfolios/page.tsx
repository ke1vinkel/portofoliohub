'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePortfolio } from '@/components/providers/portfolio-provider';
import { formatDate } from '@/lib/utils';

export default function PortfoliosPage() {
  const {
    db,
    currentUser,
    addPortfolio,
    deletePortfolio,
    setActivePortfolio,
  } = usePortfolio();

  const router = useRouter();
  
  // Local state for inline creation form
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

  const userPortfolios = db.portfolios.filter(p => (p.user_id || (p as any).user) === currentUser.id);

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
        showToast('Portfolio created! 📁');
        // Reset Form
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

  return (
    <div className="flex-grow flex flex-col gap-5 pb-8 max-w-5xl xl:max-w-7xl 2xl:max-w-[1800px] mx-auto w-full relative">
      
      {/* Toast Notification Banner */}
      {toast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 bg-[var(--accent)] text-white rounded-full shadow-lg text-xs font-semibold tracking-wide animate-bounce">
          {toast}
        </div>
      )}

      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold font-display text-stone-950 dark:text-white tracking-tight">
            My Portfolios
          </h2>
          <p className="text-xs text-stone-400 dark:text-zinc-500 font-mono mt-0.5">
            Manage your collections of work ({userPortfolios.length})
          </p>
        </div>
        
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="w-10 h-10 rounded-full bg-[var(--accent)] text-white flex items-center justify-center font-bold text-lg hover:scale-105 active:scale-95 transition-all shadow-md"
          aria-label={showAddForm ? 'Close create form' : 'Create new portfolio'}
        >
          {showAddForm ? '×' : '+'}
        </button>
      </div>

      {/* Expandable Inline Create Form Card */}
      {showAddForm && (
        <div className="glass-card p-4 bg-[var(--accent-light)] border-[var(--border)] animate-fadeIn">
          <h3 className="font-semibold text-sm text-stone-950 dark:text-white mb-4">
            Create Portfolio
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 text-xs rounded-xl font-medium">
                {error}
              </div>
            )}

            <div className="input-group flex flex-col">
              <label className="input-label" htmlFor="portfolio-title-input">Title</label>
              <input
                id="portfolio-title-input"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="input-field"
              />
            </div>

            <div className="input-group flex flex-col">
              <label className="input-label" htmlFor="portfolio-desc-input">Description</label>
              <textarea
                id="portfolio-desc-input"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="input-field"
                rows={3}
              />
            </div>

            <div className="input-group">
              <label className="checkbox" htmlFor="portfolio-public-checkbox">
                <input
                  id="portfolio-public-checkbox"
                  type="checkbox"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                />
                <span>Set as active public portfolio</span>
              </label>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 py-3 rounded-full font-semibold text-white bg-[var(--accent)] hover:bg-[var(--accent-hover)] shadow text-xs transition-all"
              >
                Create
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="flex-1 py-3 rounded-full font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 border border-stone-200/60 dark:bg-zinc-700 dark:text-zinc-300 dark:border-zinc-600 text-xs transition-all"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Portfolios registry */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {userPortfolios.length === 0 ? (
          <div className="glass-card p-8 text-center flex flex-col items-center gap-3 md:col-span-2 lg:col-span-3">
            <svg className="w-10 h-10 text-stone-300 dark:text-zinc-600" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0a2 2 0 01-2 2H6a2 2 0 01-2-2m16 0V9a2 2 0 00-2-2H6a2 2 0 00-2 2v4m16 0h-3.86a2 2 0 01-1.896 1.333H7.757a2 2 0 01-1.896-1.333H2" />
            </svg>
            <h3 className="font-semibold text-stone-900 dark:text-zinc-100">No portfolios yet</h3>
            <p className="text-xs text-stone-400">Click the "+" icon above to set up your first workspace portfolio.</p>
          </div>
        ) : (
          userPortfolios.map(p => (
            <div key={p.id} className="glass-card p-4 flex flex-col justify-between gap-3">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-semibold text-sm text-stone-900 dark:text-zinc-100">{p.title}</h4>
                  <span className="text-[9px] font-mono text-stone-400 block mt-0.5">
                    Created {formatDate(p.created_at)}
                  </span>
                </div>
                <span className={`badge ${p.is_public === 1 ? 'badge-public' : 'badge-private'}`}>
                  {p.is_public === 1 ? 'Public' : 'Private'}
                </span>
              </div>
              
              <p className="text-xs text-stone-500 dark:text-zinc-400 line-clamp-2">
                {p.description || 'No description provided.'}
              </p>



              <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-stone-100 dark:border-zinc-700/60">
                <button
                  onClick={() => router.push(`/portfolios/${p.id}/edit`)}
                  className="py-1.5 text-center text-[10px] font-bold rounded-lg border border-stone-200 dark:border-zinc-800 bg-stone-50 dark:bg-zinc-900 text-stone-700 dark:text-zinc-300 hover:bg-stone-100 transition-all active:scale-95 shadow-sm"
                >
                  Edit Projects
                </button>
                <button
                  onClick={() => {
                    setActivePortfolio(p.id);
                    router.push(`/${currentUser.username}`);
                  }}
                  className="py-1.5 text-center text-[10px] font-bold rounded-lg bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] transition-all active:scale-95 shadow-sm"
                >
                  View Public
                </button>
                <button
                  onClick={() => handleDelete(p.id)}
                  className="py-1.5 text-center text-[10px] font-bold rounded-lg border border-red-200 dark:border-red-950 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all active:scale-95 shadow-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

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
    </div>
  );
}
