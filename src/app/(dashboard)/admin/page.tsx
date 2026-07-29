'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePortfolio } from '@/components/providers/portfolio-provider';

export default function AdminDashboardPage() {
  const { db, currentUser, setActivePortfolio, deleteRecruiterMessage } = usePortfolio();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState('');
  const [activeViewMessage, setActiveViewMessage] = useState<any | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  };

  const isLecturer = currentUser?.role === 'lecturer';

  useEffect(() => {
    setMounted(true);
    if (currentUser && !isLecturer) {
      router.replace('/dashboard');
    }
  }, [currentUser, isLecturer, router]);

  if (!mounted || !currentUser || !isLecturer) {
    return (
      <div className="flex-1 flex flex-col justify-center items-center bg-stone-50 dark:bg-zinc-900 p-6 min-h-screen">
        <div className="w-8 h-8 rounded-full border-4 border-stone-200 border-t-[var(--accent)] animate-spin" />
        <span className="text-xs text-stone-500 mt-3 font-mono">Loading Security Context...</span>
      </div>
    );
  }

  // Get student accounts only
  const studentUsers = db.users.filter(u => u.role === 'student');

  // Filter students by name query
  const filteredStudents = studentUsers.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Stats calculation
  const totalStudents = studentUsers.length;
  const totalPortfolios = db.portfolios.length;
  const totalProjects = db.projects.length;
  const publicPortfolios = db.portfolios.filter(p => p.is_public === 1).length;

  const handleInspectPortfolio = (username: string, portfolioId: string) => {
    setActivePortfolio(portfolioId);
    router.push(`/${username}`);
  };

  return (
    <div className="flex-grow flex flex-col gap-6 pb-8 max-w-5xl xl:max-w-7xl 2xl:max-w-[1800px] mx-auto w-full relative">
      
      {/* Toast Notification Banner */}
      {toast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 bg-[var(--accent)] text-white rounded-full shadow-lg text-xs font-semibold tracking-wide animate-bounce">
          {toast}
        </div>
      )}
      
      {/* Header */}
      <div>
        <div className="flex items-center gap-1">
          <span className="text-[9px] uppercase tracking-widest bg-[var(--accent-light)] text-[var(--accent)] px-1.5 py-0.5 rounded font-mono font-bold border border-[var(--border)]">
            Administrative Access
          </span>
        </div>
        <h2 className="text-2xl font-bold font-display text-stone-950 dark:text-white tracking-tight mt-1">
          Admin Dashboard
        </h2>
        <p className="text-xs text-stone-400 dark:text-zinc-500 font-mono">
          Course supervision and student reviews
        </p>
      </div>

      {/* 4-Col Grid Stats cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="glass-card p-3.5 bg-white dark:bg-zinc-800 flex flex-col">
          <span className="text-2xl font-bold font-display text-stone-950 dark:text-white">{totalStudents}</span>
          <span className="text-[10px] text-stone-400 dark:text-zinc-500 uppercase tracking-widest mt-0.5">Students</span>
        </div>

        <div className="glass-card p-3.5 bg-white dark:bg-zinc-800 flex flex-col">
          <span className="text-2xl font-bold font-display text-stone-950 dark:text-white">{totalPortfolios}</span>
          <span className="text-[10px] text-stone-400 dark:text-zinc-500 uppercase tracking-widest mt-0.5">Portfolios</span>
        </div>

        <div className="glass-card p-3.5 bg-white dark:bg-zinc-800 flex flex-col">
          <span className="text-2xl font-bold font-display text-[var(--accent)]">{publicPortfolios}</span>
          <span className="text-[10px] text-stone-400 dark:text-zinc-500 uppercase tracking-widest mt-0.5">Public live</span>
        </div>

        <div className="glass-card p-3.5 bg-white dark:bg-zinc-800 flex flex-col">
          <span className="text-2xl font-bold font-display text-stone-950 dark:text-white">{totalProjects}</span>
          <span className="text-[10px] text-stone-400 dark:text-zinc-500 uppercase tracking-widest mt-0.5">Projects</span>
        </div>
      </div>

      {/* Student Registry List */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between border-b border-stone-200/40 dark:border-zinc-800 pb-2">
          <h3 className="text-xs font-bold text-stone-400 dark:text-zinc-500 uppercase tracking-widest">
            Student Registry ({filteredStudents.length})
          </h3>
          <div className="w-full md:w-72 relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field py-1.5 px-3.5 pr-8 text-xs font-medium w-full"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 dark:text-zinc-500 dark:hover:text-zinc-300 text-xs font-bold"
              >
                ✕
              </button>
            )}
          </div>
        </div>
        
        {filteredStudents.length === 0 ? (
          <div className="glass-card p-8 bg-white dark:bg-zinc-800 text-center text-stone-400 dark:text-zinc-500 text-xs flex flex-col items-center gap-2">
            <span className="text-2xl">🔍</span>
            No students found matching &quot;{searchQuery}&quot;.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredStudents.map(s => {
              const studentPortfolios = db.portfolios.filter(p => p.user_id === s.id);
              const majorStr = db.profiles[s.id]?.major || 'Computer Science';
              return (
                <div key={s.id} className="glass-card p-4 bg-white dark:bg-zinc-800 flex flex-col gap-3">
                  <div>
                    <h4 className="font-semibold text-sm text-stone-900 dark:text-zinc-100">{s.name}</h4>
                    <div className="text-[10px] font-mono text-stone-400 dark:text-zinc-500 mt-0.5">
                      @{s.username}
                    </div>
                    <div className="text-[9px] uppercase tracking-wider text-[var(--accent)] font-bold mt-1">
                      {majorStr} • {studentPortfolios.length} portfolios
                    </div>
                  </div>

                  {/* Portfolios list for inspection */}
                  <div className="space-y-2 border-t border-stone-100 dark:border-zinc-700/60 pt-3">
                    <div className="text-[9px] uppercase font-bold text-stone-400 dark:text-zinc-500 tracking-wider">
                      Auditable Portfolios
                    </div>
                    {studentPortfolios.length === 0 ? (
                      <div className="text-[10px] text-stone-400 dark:text-zinc-500 italic py-1">
                        No portfolios created yet.
                      </div>
                    ) : (
                      studentPortfolios.map(p => (
                        <div key={p.id} className="flex justify-between items-center bg-stone-50 dark:bg-zinc-900/50 px-3 py-2 rounded-xl border border-stone-200/40 dark:border-zinc-800">
                          <span className="text-xs text-stone-800 dark:text-zinc-200 truncate max-w-[180px] font-medium">
                            {p.title}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className={`badge ${p.is_public === 1 ? 'badge-public' : 'badge-private'} text-[8px] py-0.5 px-1.5`}>
                              {p.is_public === 1 ? 'Public' : 'Private'}
                            </span>
                            <button
                              onClick={() => handleInspectPortfolio(s.username, p.id)}
                              className="px-2.5 py-1 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white rounded text-[9px] font-bold transition-all active:scale-95 shadow-sm"
                            >
                              Inspect
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Recruiter Messages Inbox (Admin view of all messages) */}
      <div className="flex flex-col gap-4 mt-8">
        <div className="border-b border-stone-200/40 dark:border-zinc-800 pb-2">
          <h3 className="text-xs font-bold text-stone-400 dark:text-zinc-500 uppercase tracking-widest">
            Global Recruiter Messages ({db.messages?.length || 0})
          </h3>
        </div>
        
        {(!db.messages || db.messages.length === 0) ? (
          <div className="glass-card p-8 bg-white dark:bg-zinc-800 text-center text-stone-400 dark:text-zinc-500 text-xs flex flex-col items-center gap-2">
            <span className="text-xl">✉️</span>
            No recruiter messages have been sent to any student yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {db.messages.map(msg => {
              const studentName = db.users.find(u => u.id === msg.student_id)?.name || 'Unknown Student';
              return (
                <div key={msg.id} className="glass-card p-4 bg-white dark:bg-zinc-800 flex flex-col justify-between gap-3 animate-fadeIn">
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold text-sm text-stone-900 dark:text-zinc-100">
                          {msg.name}
                        </h4>
                        <a href={`mailto:${msg.email}`} className="text-xs text-[var(--accent)] hover:underline font-medium">
                          {msg.email}
                        </a>
                      </div>
                      <span className="text-[10px] font-mono text-stone-400 dark:text-zinc-500">
                        {new Date(msg.created_at).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })}
                      </span>
                    </div>

                    <div className="text-[10px] uppercase font-bold text-stone-400 dark:text-zinc-500 tracking-wider">
                      Sent to: <span className="text-stone-800 dark:text-zinc-300 font-semibold normal-case">{studentName}</span>
                    </div>
                    
                    <p 
                      onClick={() => setActiveViewMessage(msg)}
                      className="text-xs text-stone-600 dark:text-zinc-300 bg-stone-50 dark:bg-zinc-900/40 p-3 rounded-xl border border-stone-200/30 dark:border-zinc-800/50 mt-1 cursor-pointer hover:border-[var(--accent)] hover:bg-stone-100 dark:hover:bg-zinc-900/80 transition-all select-none"
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

                  <div className="flex justify-end pt-2 border-t border-stone-100 dark:border-zinc-700/60">
                    <button
                      onClick={() => {
                        if (window.confirm(`Are you sure you want to delete the message from ${msg.name}?`)) {
                          deleteRecruiterMessage(msg.id);
                          showToast('Message deleted successfully 🗑️');
                        }
                      }}
                      className="px-3 py-1.5 text-center text-[10px] font-bold rounded-lg border border-red-200 dark:border-red-950 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all active:scale-95 flex items-center gap-1"
                    >
                      <i className="fas fa-trash-alt text-[9px]"></i> Delete Message
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

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
