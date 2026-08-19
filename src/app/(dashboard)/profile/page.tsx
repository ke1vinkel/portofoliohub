'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Loader2 } from 'lucide-react';
import { usePortfolio } from '@/components/providers/portfolio-provider';
import { DetailsTab } from '@/components/profile/DetailsTab';
import { SkillsTab } from '@/components/profile/SkillsTab';
import { TimelineTab } from '@/components/profile/TimelineTab';
import { cn } from '@/lib/utils';

export default function ProfilePage() {
  const {
    db,
    currentUser,
    setHasUnsavedChanges,
  } = usePortfolio();

  const [activeTab, setActiveTab] = useState<'details' | 'skills' | 'timeline'>('details');

  const [isDetailsDirty, setIsDetailsDirty] = useState(false);
  const [isSkillsDirty, setIsSkillsDirty] = useState(false);
  const [isTimelineDirty, setIsTimelineDirty] = useState(false);

  const isDirty = isDetailsDirty || isSkillsDirty || isTimelineDirty;

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

  const defaultProfile = useMemo(() => ({
    user_id: currentUser?.id || '',
    bio: `Hello! I'm ${currentUser?.name || 'User'}, welcome to my portfolio.`,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop',
    show_avatar: true,
    major: 'Computer Science',
    university: 'Binus University',
    location: 'Jakarta, Indonesia',
    skills: ['React', 'Next.js', 'TypeScript', 'Node.js', 'Tailwind CSS'],
    skill_descriptions: {
      'Next.js': 'App Router & Web Development',
      TypeScript: 'Strong type safety and clean code',
    },
    github: '',
    linkedin: '',
    twitter: '',
    website: '',
    hero_badge_text: '✦ Available for opportunities',
    typing_words: ['Software Developer', 'Engineering Student'],
    sections: {
      show_skills: true,
      show_projects: true,
      show_experience: true,
      show_education: true,
      show_contact: false,
    },
  }), [currentUser?.id, currentUser?.name]);

  const dbProfile = currentUser ? db.profiles[currentUser.id] : null;
  const profile = useMemo(() => {
    if (!currentUser) return null;
    return dbProfile || defaultProfile;
  }, [currentUser, dbProfile, defaultProfile]);

  if (!currentUser || !profile) {
    return (
      <div className="flex-1 flex flex-col justify-center items-center p-12 min-h-[50vh]">
        <Loader2 className="size-6 text-primary animate-spin" />
        <span className="text-xs text-muted-foreground mt-3 font-mono">Loading profile data...</span>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col gap-6 w-full max-w-5xl mx-auto">
      {/* Header matching cv-gen */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border/80 pb-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Edit Profile
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Configure settings, skills, tooltips, and timeline milestones.
          </p>
        </div>

        {/* Segmented Control Tabs */}
        <div className="inline-flex h-9 items-center rounded-xl bg-muted p-1 text-xs font-semibold text-muted-foreground">
          <button
            type="button"
            onClick={() => setActiveTab('details')}
            className={cn(
              'px-3.5 py-1 rounded-lg transition-all',
              activeTab === 'details'
                ? 'bg-background text-foreground shadow-xs font-medium'
                : 'hover:text-foreground'
            )}
          >
            Details
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('skills')}
            className={cn(
              'px-3.5 py-1 rounded-lg transition-all',
              activeTab === 'skills'
                ? 'bg-background text-foreground shadow-xs font-medium'
                : 'hover:text-foreground'
            )}
          >
            Skills
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('timeline')}
            className={cn(
              'px-3.5 py-1 rounded-lg transition-all',
              activeTab === 'timeline'
                ? 'bg-background text-foreground shadow-xs font-medium'
                : 'hover:text-foreground'
            )}
          >
            Timeline
          </button>
        </div>
      </div>

      {/* Render Active Tab Component */}
      <div className="mt-2">
        {activeTab === 'details' && (
          <DetailsTab setIsDirty={setIsDetailsDirty} profile={profile} />
        )}
        {activeTab === 'skills' && (
          <SkillsTab setIsDirty={setIsSkillsDirty} profile={profile} />
        )}
        {activeTab === 'timeline' && (
          <TimelineTab setIsDirty={setIsTimelineDirty} />
        )}
      </div>
    </div>
  );
}
