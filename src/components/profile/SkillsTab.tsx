'use client';

import React, { useState, useEffect } from 'react';
import { usePortfolio } from '@/components/providers/portfolio-provider';
import { useToast } from '@/hooks/useToast';

interface SkillsTabProps {
  setIsDirty: (val: boolean) => void;
  profile: any;
}

export const SkillsTab: React.FC<SkillsTabProps> = ({ setIsDirty, profile }) => {
  const { currentUser, updateProfile } = usePortfolio();
  const { toast, showToast } = useToast();

  const [newSkill, setNewSkill] = useState('');
  const [skillTooltips, setSkillTooltips] = useState<Record<string, string>>(profile?.skill_descriptions || {});

  // Track dirtiness
  const isDirty = profile ? (
    JSON.stringify(skillTooltips) !== JSON.stringify(profile.skill_descriptions || {}) ||
    newSkill !== ''
  ) : false;

  useEffect(() => {
    if (profile) {
      setSkillTooltips(profile.skill_descriptions || {});
    }
  }, [profile]);

  useEffect(() => {
    setIsDirty(isDirty);
    return () => setIsDirty(false);
  }, [isDirty, setIsDirty]);

  if (!currentUser || !profile) return (
    <div className="flex-grow flex flex-col justify-center items-center p-6 min-h-[20vh]">
      <div className="w-8 h-8 rounded-full border-4 border-stone-200 border-t-[var(--accent)] animate-spin" />
      <span className="text-xs text-stone-500 mt-3 font-mono">Loading skills...</span>
    </div>
  );

  const handleAddSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkill.trim()) return;

    const skill = newSkill.trim();
    if (profile.skills.includes(skill)) {
      showToast('Skill already exists.');
      return;
    }

    const updatedSkills = [...profile.skills, skill];
    const updatedTooltips = { ...skillTooltips, [skill]: '' };

    await updateProfile(currentUser.id, {
      skills: updatedSkills,
      skill_descriptions: updatedTooltips,
    });

    setSkillTooltips(updatedTooltips);
    setNewSkill('');
    showToast('Skill added! 🛠️');
  };

  const handleDeleteSkill = async (skill: string) => {
    const updatedSkills = profile.skills.filter(s => s !== skill);
    const updatedTooltips = { ...skillTooltips };
    delete updatedTooltips[skill];

    await updateProfile(currentUser.id, {
      skills: updatedSkills,
      skill_descriptions: updatedTooltips,
    });

    setSkillTooltips(updatedTooltips);
    showToast('Skill removed');
  };

  const handleSaveSkillTooltips = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile(currentUser.id, {
      skill_descriptions: skillTooltips,
    });
    showToast('Tooltip descriptions saved! 💡');
  };

  return (
    <div className="space-y-4">
      {/* Toast Notification Banner */}
      {toast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 bg-[var(--accent)] text-white rounded-full shadow-lg text-xs font-semibold tracking-wide animate-bounce">
          {toast}
        </div>
      )}

      {/* Add Skill form */}
      <div className="glass-card p-4 animate-fadeIn">
        <h3 className="font-semibold text-sm text-stone-950 dark:text-white mb-3">
          Add Skills Tag
        </h3>
        <form onSubmit={handleAddSkill} className="flex gap-2" autoComplete="off">
          <input
            type="text"
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            className="input-field flex-1"
            placeholder="e.g. React"
          />
          <button
            type="submit"
            className="px-5 rounded-2xl font-bold text-white bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-xs shadow-sm"
          >
            Add
          </button>
        </form>

        <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t border-stone-100 dark:border-zinc-700/60">
          {profile.skills.length === 0 ? (
            <span className="text-xs text-stone-400">No skills added yet.</span>
          ) : (
            profile.skills.map(s => (
              <span key={s} className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full bg-stone-100 border border-stone-200 text-stone-700 dark:bg-zinc-700 dark:border-zinc-600 dark:text-zinc-200">
                <span>{s}</span>
                <button
                  type="button"
                  onClick={() => handleDeleteSkill(s)}
                  className="text-red-500 hover:text-red-700 font-bold ml-1 text-sm leading-none"
                >
                  ×
                </button>
              </span>
            ))
          )}
        </div>
      </div>

      {/* Skill descriptions/tooltips manager */}
      {profile.skills.length > 0 && (
        <div className="glass-card p-4 animate-fadeIn">
          <h3 className="font-semibold text-sm text-stone-950 dark:text-white mb-2">
            Skill Descriptions
          </h3>
          <p className="text-[10px] text-stone-500 dark:text-zinc-400 mb-4 font-mono uppercase tracking-wider">
            These populate tooltips when hover over skill pills
          </p>

          <form onSubmit={handleSaveSkillTooltips} className="space-y-3" autoComplete="off">
            {profile.skills.map(skill => {
              const key = skill.replace(/\s+/g, '_');
              return (
                <div key={skill} className="input-group flex flex-col">
                  <label className="text-[11px] font-semibold text-stone-600 dark:text-zinc-300" htmlFor={`skillDesc_${key}`}>{skill}</label>
                  <input
                    id={`skillDesc_${key}`}
                    type="text"
                    value={skillTooltips[skill] || ''}
                    onChange={(e) =>
                      setSkillTooltips({
                        ...skillTooltips,
                        [skill]: e.target.value,
                      })
                    }
                    className="input-field mt-1"
                  />
                </div>
              );
            })}

            <button
              type="submit"
              className="w-full py-2.5 rounded-full font-semibold text-white bg-[var(--accent)] hover:bg-[var(--accent-hover)] shadow-sm text-xs transition-all mt-4"
            >
              Save Descriptions
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
