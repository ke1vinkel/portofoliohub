'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Users,
  FolderKanban,
  Globe,
  Briefcase,
  Search,
  X,
  ExternalLink,
  Trash2,
  Mail,
  Loader2,
  ShieldCheck,
} from 'lucide-react';
import { usePortfolio } from '@/components/providers/portfolio-provider';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

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
      <div className="flex-1 flex flex-col justify-center items-center p-12 min-h-[50vh] text-center">
        <Loader2 className="size-6 text-primary animate-spin" />
        <span className="text-xs text-muted-foreground mt-3 font-mono">Loading Security Context...</span>
      </div>
    );
  }

  // Get student accounts only
  const studentUsers = db.users.filter((u) => u.role === 'student');

  // Filter students by name query
  const filteredStudents = studentUsers.filter((s) =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Stats calculation
  const totalStudents = studentUsers.length;
  const totalPortfolios = db.portfolios.length;
  const totalProjects = db.projects.length;
  const publicPortfolios = db.portfolios.filter((p) => p.is_public === 1).length;

  const handleInspectPortfolio = (username: string, portfolioId: string) => {
    setActivePortfolio(portfolioId);
    router.push(`/${username}`);
  };

  return (
    <div className="flex-1 flex flex-col gap-8 w-full max-w-7xl mx-auto">
      {/* Header section matching cv-gen lecturer dashboard */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b border-border/80 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1 rounded-md border border-primary/20 bg-primary/10 px-2 py-0.5 text-[10px] font-semibold tracking-wider text-primary uppercase">
              <ShieldCheck className="size-3" />
              Lecturer Portal
            </span>
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Student Portfolios
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Review and supervise the latest portfolios and projects created by students.
          </p>
        </div>

        {/* 4-Col Grid Stats cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-right">
          <div className="rounded-xl border border-border/60 bg-card p-3 sm:p-4 text-center">
            <div className="text-xl sm:text-2xl font-semibold text-foreground">{totalStudents}</div>
            <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mt-0.5 flex items-center justify-center gap-1">
              <Users className="size-3 text-muted-foreground" />
              Students
            </div>
          </div>

          <div className="rounded-xl border border-border/60 bg-card p-3 sm:p-4 text-center">
            <div className="text-xl sm:text-2xl font-semibold text-foreground">{totalPortfolios}</div>
            <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mt-0.5 flex items-center justify-center gap-1">
              <FolderKanban className="size-3 text-muted-foreground" />
              Portfolios
            </div>
          </div>

          <div className="rounded-xl border border-border/60 bg-card p-3 sm:p-4 text-center">
            <div className="text-xl sm:text-2xl font-semibold text-emerald-600 dark:text-emerald-400">
              {publicPortfolios}
            </div>
            <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mt-0.5 flex items-center justify-center gap-1">
              <Globe className="size-3 text-emerald-600 dark:text-emerald-400" />
              Public
            </div>
          </div>

          <div className="rounded-xl border border-border/60 bg-card p-3 sm:p-4 text-center">
            <div className="text-xl sm:text-2xl font-semibold text-foreground">{totalProjects}</div>
            <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mt-0.5 flex items-center justify-center gap-1">
              <Briefcase className="size-3 text-muted-foreground" />
              Projects
            </div>
          </div>
        </div>
      </div>

      {/* Student Registry List */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
          <h2 className="text-sm font-semibold tracking-wider text-muted-foreground uppercase">
            Student Registry ({filteredStudents.length})
          </h2>

          <div className="w-full sm:w-72 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search students..."
              className="pl-8.5 pr-8 h-8 text-xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>
        </div>

        {filteredStudents.length === 0 ? (
          <Card className="p-8 text-center text-muted-foreground text-xs flex flex-col items-center gap-2">
            <Users className="size-8 text-muted-foreground/40" />
            No students found matching &quot;{searchQuery}&quot;.
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredStudents.map((s) => {
              const studentPortfolios = db.portfolios.filter((p) => p.user_id === s.id);
              const majorStr = db.profiles[s.id]?.major || 'Computer Science';
              return (
                <Card
                  key={s.id}
                  className="ui-stagger-item shadow-none transition-[border-color,transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:border-foreground/20 hover:shadow-md"
                >
                  <CardHeader className="pb-3 border-b border-border/70">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="size-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                          {s.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <CardTitle className="text-sm">{s.name}</CardTitle>
                          <span className="text-[11px] font-mono text-muted-foreground">
                            @{s.username}
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] font-semibold text-muted-foreground">
                        {studentPortfolios.length} portfolio{studentPortfolios.length === 1 ? '' : 's'}
                      </span>
                    </div>
                    <div className="text-[10px] uppercase font-semibold text-primary tracking-wider mt-1">
                      {majorStr}
                    </div>
                  </CardHeader>

                  <CardContent className="pt-3 space-y-2">
                    <div className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider mb-1">
                      Auditable Portfolios
                    </div>

                    {studentPortfolios.length === 0 ? (
                      <div className="text-xs text-muted-foreground italic py-2">
                        No portfolios created yet.
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        {studentPortfolios.map((p) => (
                          <div
                            key={p.id}
                            className="flex items-center justify-between bg-muted/40 px-3 py-2 rounded-xl border border-border/50 transition-colors hover:bg-muted/70"
                          >
                            <span className="text-xs text-foreground truncate max-w-[150px] font-medium">
                              {p.title}
                            </span>
                            <div className="flex items-center gap-2">
                              <span
                                className={`badge ${p.is_public === 1 ? 'badge-public' : 'badge-private'} text-[8px] py-0.5 px-1.5`}
                              >
                                {p.is_public === 1 ? 'Public' : 'Private'}
                              </span>
                              <Button
                                size="xs"
                                variant="default"
                                onClick={() => handleInspectPortfolio(s.username, p.id)}
                                className="h-6 text-[10px] px-2 gap-1"
                              >
                                <ExternalLink className="size-2.5" />
                                Inspect
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Global Recruiter Messages Section */}
      <div className="space-y-4 pt-4 border-t border-border">
        <h2 className="text-sm font-semibold tracking-wider text-muted-foreground uppercase">
          Global Recruiter Messages ({db.messages?.length || 0})
        </h2>

        {!db.messages || db.messages.length === 0 ? (
          <Card className="p-8 text-center text-muted-foreground text-xs flex flex-col items-center gap-2">
            <Mail className="size-8 text-muted-foreground/40" />
            No recruiter messages have been submitted yet.
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {db.messages.map((msg) => {
              const studentName =
                db.users.find((u) => u.id === msg.student_id)?.name || 'Unknown Student';
              return (
                <Card
                  key={msg.id}
                  className="p-4 space-y-3 shadow-none hover:border-foreground/20"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold text-xs text-foreground">{msg.name}</h4>
                      <a
                        href={`mailto:${msg.email}`}
                        className="text-[11px] text-primary hover:underline font-medium"
                      >
                        {msg.email}
                      </a>
                    </div>
                    <span className="text-[10px] font-mono text-muted-foreground">
                      {new Date(msg.created_at).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>

                  <div className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">
                    Sent to: <span className="text-foreground normal-case font-semibold">{studentName}</span>
                  </div>

                  <p
                    onClick={() => setActiveViewMessage(msg)}
                    className="text-xs text-muted-foreground bg-muted/40 p-2.5 rounded-xl border border-border/50 leading-relaxed cursor-pointer hover:border-border hover:bg-muted/70 transition-all select-none"
                    title="Click to view full message"
                  >
                    {msg.message.length > 80 ? `${msg.message.substring(0, 80)}...` : msg.message}
                    {msg.message.length > 80 && (
                      <span className="text-[10px] text-primary font-semibold block mt-1">
                        Click to view full message
                      </span>
                    )}
                  </p>

                  <div className="flex justify-end pt-2 border-t border-border">
                    <Button
                      size="xs"
                      variant="ghost"
                      onClick={() => {
                        if (confirm(`Delete message from ${msg.name}?`)) {
                          deleteRecruiterMessage(msg.id);
                          showToast('Message deleted');
                        }
                      }}
                      className="text-destructive hover:bg-destructive/10 hover:text-destructive gap-1"
                    >
                      <Trash2 className="size-3" />
                      Delete
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

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
