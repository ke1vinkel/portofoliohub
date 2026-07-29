'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { usePortfolio } from '@/components/providers/portfolio-provider';
import { DetailsTab } from '@/components/profile/DetailsTab';
import { SkillsTab } from '@/components/profile/SkillsTab';
import { TimelineTab } from '@/components/profile/TimelineTab';

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
      show_contact: true,
    },
  }), [currentUser?.id, currentUser?.name]);

  const dbProfile = currentUser ? db.profiles[currentUser.id] : null;
  const profile = useMemo(() => {
    if (!currentUser) return null;
    return dbProfile || defaultProfile;
  }, [currentUser, dbProfile, defaultProfile]);

  if (!currentUser || !profile) {
    return (
      <div className="flex-grow flex flex-col justify-center items-center p-6 min-h-[50vh]">
        <div className="w-8 h-8 rounded-full border-4 border-stone-200 border-t-[var(--accent)] animate-spin" />
        <span className="text-xs text-stone-500 mt-3 font-mono">Loading Profile Data...</span>
      </div>
    );
  }

  return (
    <div className="flex-grow flex flex-col gap-5 pb-8 max-w-5xl xl:max-w-7xl 2xl:max-w-[1800px] mx-auto w-full relative animate-fadeIn">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold font-display text-stone-950 dark:text-white tracking-tight">
          Edit Profile
        </h2>
        <p className="text-xs text-stone-400 dark:text-zinc-500 font-mono mt-0.5">
          Configure settings, tooltips, and timelines
        </p>
      </div>

      {/* Profile Sections Tab Selectors */}
      <div className="flex border border-[var(--border)] rounded-xl overflow-hidden bg-[var(--surface)] p-1">
        <button
          onClick={() => setActiveTab('details')}
          className={`flex-1 py-2 text-center text-xs font-bold rounded-lg transition-all ${
            activeTab === 'details'
              ? 'bg-[var(--accent)] text-white'
              : 'text-stone-500 hover:text-stone-800 dark:text-zinc-400 dark:hover:text-zinc-200'
          }`}
        >
          Details
        </button>
        <button
          onClick={() => setActiveTab('skills')}
          className={`flex-1 py-2 text-center text-xs font-bold rounded-lg transition-all ${
            activeTab === 'skills'
              ? 'bg-[var(--accent)] text-white'
              : 'text-stone-500 hover:text-stone-800 dark:text-zinc-400 dark:hover:text-zinc-200'
          }`}
        >
          Skills
        </button>
        <button
          onClick={() => setActiveTab('timeline')}
          className={`flex-1 py-2 text-center text-xs font-bold rounded-lg transition-all ${
            activeTab === 'timeline'
              ? 'bg-[var(--accent)] text-white'
              : 'text-stone-500 hover:text-stone-800 dark:text-zinc-400 dark:hover:text-zinc-200'
          }`}
        >
          Timeline
        </button>
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
