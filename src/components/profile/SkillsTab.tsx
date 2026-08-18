'use client';

import React, { useState, useEffect } from 'react';
import { Plus, X, Save, Loader2, Wrench } from 'lucide-react';
import { usePortfolio } from '@/components/providers/portfolio-provider';
import { useToast } from '@/hooks/useToast';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';

interface SkillsTabProps {
  setIsDirty: (val: boolean) => void;
  profile: any;
}

export const SkillsTab: React.FC<SkillsTabProps> = ({ setIsDirty, profile }) => {
  const { currentUser, updateProfile } = usePortfolio();
  const { toast, showToast } = useToast();

  const [newSkill, setNewSkill] = useState('');
  const [skillTooltips, setSkillTooltips] = useState<Record<string, string>>(
    profile?.skill_descriptions || {}
  );
  const [savingTooltips, setSavingTooltips] = useState(false);

  // Track dirtiness
  const isDirty = profile
    ? JSON.stringify(skillTooltips) !== JSON.stringify(profile.skill_descriptions || {}) ||
      newSkill !== ''
    : false;

  useEffect(() => {
    if (profile) {
      setSkillTooltips(profile.skill_descriptions || {});
    }
  }, [profile]);

  useEffect(() => {
    setIsDirty(isDirty);
    return () => setIsDirty(false);
  }, [isDirty, setIsDirty]);

  if (!currentUser || !profile) {
    return (
      <div className="flex flex-col justify-center items-center p-8">
        <Loader2 className="size-6 text-primary animate-spin" />
        <span className="text-xs text-muted-foreground mt-3 font-mono">Loading skills...</span>
      </div>
    );
  }

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
    showToast('Skill added');
  };

  const handleDeleteSkill = async (skill: string) => {
    const updatedSkills = profile.skills.filter((s: string) => s !== skill);
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
    setSavingTooltips(true);
    await updateProfile(currentUser.id, {
      skill_descriptions: skillTooltips,
    });
    setSavingTooltips(false);
    showToast('Skill tooltips saved');
  };

  return (
    <div className="space-y-6">
      {/* Add Skills Tag */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Wrench className="size-4 text-primary" />
            Skills & Competencies
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleAddSkill} className="flex gap-2" autoComplete="off">
            <Input
              type="text"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              className="flex-1"
              placeholder="e.g. Next.js, TypeScript, PostgreSQL"
            />
            <Button type="submit" size="md">
              <Plus className="size-4" />
              Add
            </Button>
          </form>

          <div className="flex flex-wrap gap-2 pt-3 border-t border-border">
            {profile.skills.length === 0 ? (
              <span className="text-xs text-muted-foreground">No skills added yet.</span>
            ) : (
              profile.skills.map((s: string) => (
                <span
                  key={s}
                  className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-lg border border-border bg-muted/50 text-foreground transition-colors hover:border-foreground/20"
                >
                  <span>{s}</span>
                  <button
                    type="button"
                    onClick={() => handleDeleteSkill(s)}
                    className="text-muted-foreground hover:text-destructive transition-colors ml-0.5"
                    aria-label={`Remove ${s}`}
                  >
                    <X className="size-3" />
                  </button>
                </span>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Skill Descriptions & Tooltips */}
      {profile.skills.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Skill Descriptions & Tooltips</CardTitle>
            <p className="text-xs text-muted-foreground">
              These descriptions appear when visitors hover over your skill pills on the live portfolio.
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaveSkillTooltips} className="space-y-4" autoComplete="off">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {profile.skills.map((skill: string) => {
                  const key = skill.replace(/\s+/g, '_');
                  return (
                    <div key={skill} className="space-y-1.5">
                      <Label htmlFor={`skillDesc_${key}`}>{skill}</Label>
                      <Input
                        id={`skillDesc_${key}`}
                        type="text"
                        value={skillTooltips[skill] || ''}
                        onChange={(e) =>
                          setSkillTooltips({
                            ...skillTooltips,
                            [skill]: e.target.value,
                          })
                        }
                        placeholder={`Brief description of your experience in ${skill}`}
                      />
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-end pt-3 border-t border-border">
                <Button type="submit" disabled={savingTooltips} size="md">
                  {savingTooltips ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="size-4" />
                      Save Descriptions
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
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
            onClick={() => showToast('')}
            aria-label="Dismiss"
          >
            <X className="size-3.5" />
          </Button>
        </div>
      )}
    </div>
  );
};
