'use client';

import React, { useState, useEffect } from 'react';
import { Plus, X, Pencil, Trash2, Briefcase, GraduationCap } from 'lucide-react';
import { usePortfolio, Experience, Education } from '@/components/providers/portfolio-provider';
import { formatDate } from '@/lib/utils';
import { useToast } from '@/hooks/useToast';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Label } from '@/components/ui/Label';

interface TimelineTabProps {
  setIsDirty: (val: boolean) => void;
}

export const TimelineTab: React.FC<TimelineTabProps> = ({ setIsDirty }) => {
  const {
    db,
    currentUser,
    activePortfolioId,
    addExperience,
    updateExperience,
    deleteExperience,
    addEducation,
    updateEducation,
    deleteEducation,
  } = usePortfolio();

  const { toast, showToast } = useToast();

  // Work Experience Form State
  const [isEditingExp, setIsEditingExp] = useState(false);
  const [expEditId, setExpEditId] = useState<string | null>(null);
  const [expCompany, setExpCompany] = useState('');
  const [expPosition, setExpPosition] = useState('');
  const [expLocation, setExpLocation] = useState('');
  const [expStart, setExpStart] = useState('');
  const [expEnd, setExpEnd] = useState('');
  const [expCurrent, setExpCurrent] = useState(false);
  const [expDesc, setExpDesc] = useState('');
  const [expError, setExpError] = useState('');

  // Education Form State
  const [isEditingEdu, setIsEditingEdu] = useState(false);
  const [eduEditId, setEduEditId] = useState<string | null>(null);
  const [eduInstitution, setEduInstitution] = useState('');
  const [eduDegree, setEduDegree] = useState('');
  const [eduField, setEduField] = useState('');
  const [eduStart, setEduStart] = useState('');
  const [eduEnd, setEduEnd] = useState('');
  const [eduCurrent, setEduCurrent] = useState(false);
  const [eduDesc, setEduDesc] = useState('');
  const [eduError, setEduError] = useState('');

  const activePortId =
    activePortfolioId ||
    (currentUser ? db.portfolios.find((p) => p.user_id === currentUser.id)?.id : null) ||
    null;
  const userExperiences = db.experiences.filter((e) => e.portfolio_id === activePortId);
  const userEducation = db.education.filter((e) => e.portfolio_id === activePortId);

  // Track dirtiness
  const isDirty = isEditingExp || isEditingEdu;
  useEffect(() => {
    setIsDirty(isDirty);
    return () => setIsDirty(false);
  }, [isDirty, setIsDirty]);

  // ------------------------------------------
  // Experience Handlers
  // ------------------------------------------
  const handleOpenAddExp = () => {
    setExpEditId(null);
    setExpCompany('');
    setExpPosition('');
    setExpLocation('');
    setExpStart('');
    setExpEnd('');
    setExpCurrent(false);
    setExpDesc('');
    setExpError('');
    setIsEditingExp(true);
  };

  const handleOpenEditExp = (exp: Experience) => {
    setExpEditId(exp.id);
    setExpCompany(exp.company);
    setExpPosition(exp.position);
    setExpLocation(exp.location || '');
    setExpStart(exp.start_date.split('T')[0]);
    setExpEnd(exp.end_date ? exp.end_date.split('T')[0] : '');
    setExpCurrent(exp.current === 1);
    setExpDesc(exp.description || '');
    setExpError('');
    setIsEditingExp(true);
  };

  const handleSaveExp = async (e: React.FormEvent) => {
    e.preventDefault();
    setExpError('');

    if (!expCompany.trim() || !expPosition.trim()) {
      setExpError('Company and Position are required.');
      return;
    }

    const expData = {
      company: expCompany.trim(),
      position: expPosition.trim(),
      location: expLocation.trim(),
      start_date: expStart ? new Date(expStart).toISOString() : new Date().toISOString(),
      end_date: expEnd && !expCurrent ? new Date(expEnd).toISOString() : null,
      current: expCurrent ? 1 : 0,
      description: expDesc.trim(),
    };

    if (!activePortId) {
      setExpError('Please create a portfolio first.');
      return;
    }

    try {
      if (expEditId) {
        await updateExperience(expEditId, expData);
        showToast('Experience updated');
      } else {
        await addExperience(activePortId, expData);
        showToast('Experience added');
      }
      setIsEditingExp(false);
    } catch (err: any) {
      setExpError(err?.message || 'Failed to save experience details.');
    }
  };

  const handleDeleteExp = (id: string) => {
    if (confirm('Delete this work experience entry?')) {
      deleteExperience(id);
      showToast('Experience removed');
    }
  };

  // ------------------------------------------
  // Education Handlers
  // ------------------------------------------
  const handleOpenAddEdu = () => {
    setEduEditId(null);
    setEduInstitution('');
    setEduDegree('');
    setEduField('');
    setEduStart('');
    setEduEnd('');
    setEduCurrent(false);
    setEduDesc('');
    setEduError('');
    setIsEditingEdu(true);
  };

  const handleOpenEditEdu = (edu: Education) => {
    setEduEditId(edu.id);
    setEduInstitution(edu.institution);
    setEduDegree(edu.degree);
    setEduField(edu.field || '');
    setEduStart(edu.start_date.split('T')[0]);
    setEduEnd(edu.end_date ? edu.end_date.split('T')[0] : '');
    setEduCurrent(edu.current === 1);
    setEduDesc(edu.description || '');
    setEduError('');
    setIsEditingEdu(true);
  };

  const handleSaveEdu = async (e: React.FormEvent) => {
    e.preventDefault();
    setEduError('');

    if (!eduInstitution.trim() || !eduDegree.trim()) {
      setEduError('Institution and Degree are required.');
      return;
    }

    const eduData = {
      institution: eduInstitution.trim(),
      degree: eduDegree.trim(),
      field: eduField.trim(),
      start_date: eduStart ? new Date(eduStart).toISOString() : new Date().toISOString(),
      end_date: eduEnd && !eduCurrent ? new Date(eduEnd).toISOString() : null,
      current: eduCurrent ? 1 : 0,
      description: eduDesc.trim(),
    };

    if (!activePortId) {
      setEduError('Please create a portfolio first.');
      return;
    }

    try {
      if (eduEditId) {
        await updateEducation(eduEditId, eduData);
        showToast('Education updated');
      } else {
        await addEducation(activePortId, eduData);
        showToast('Education added');
      }
      setIsEditingEdu(false);
    } catch (err: any) {
      setEduError(err?.message || 'Failed to save education entry.');
    }
  };

  const handleDeleteEdu = (id: string) => {
    if (confirm('Delete this education entry?')) {
      deleteEducation(id);
      showToast('Education removed');
    }
  };

  return (
    <div className="space-y-8">
      {/* ========================================== */}
      {/* WORK EXPERIENCE PORTION */}
      {/* ========================================== */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Briefcase className="size-3.5 text-primary" />
            Work Experience
          </h3>
          <Button size="xs" onClick={handleOpenAddExp} variant="default">
            <Plus className="size-3" />
            Add Experience
          </Button>
        </div>

        {/* Experience Edit Form */}
        {isEditingExp && (
          <Card className="animate-in fade-in slide-in-from-top-2 duration-200 border-primary/20 bg-muted/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">
                {expEditId ? 'Edit Work Experience' : 'Add Work Experience'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveExp} className="space-y-4" autoComplete="off">
                {expError && (
                  <div className="rounded-lg bg-destructive/10 p-3 text-xs text-destructive">
                    {expError}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="exp-company-input">Company</Label>
                    <Input
                      id="exp-company-input"
                      type="text"
                      value={expCompany}
                      onChange={(e) => setExpCompany(e.target.value)}
                      placeholder="e.g. Google"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="exp-pos-input">Position</Label>
                    <Input
                      id="exp-pos-input"
                      type="text"
                      value={expPosition}
                      onChange={(e) => setExpPosition(e.target.value)}
                      placeholder="e.g. Software Engineer"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="exp-loc-input">Location</Label>
                    <Input
                      id="exp-loc-input"
                      type="text"
                      value={expLocation}
                      onChange={(e) => setExpLocation(e.target.value)}
                      placeholder="e.g. San Francisco, CA"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="exp-start-input">Start Date</Label>
                    <Input
                      id="exp-start-input"
                      type="date"
                      value={expStart}
                      onChange={(e) => setExpStart(e.target.value)}
                      required
                    />
                  </div>

                  {!expCurrent && (
                    <div className="space-y-1.5">
                      <Label htmlFor="exp-end-input">End Date</Label>
                      <Input
                        id="exp-end-input"
                        type="date"
                        value={expEnd}
                        onChange={(e) => setExpEnd(e.target.value)}
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label className="checkbox" htmlFor="exp-current-checkbox">
                    <input
                      id="exp-current-checkbox"
                      type="checkbox"
                      checked={expCurrent}
                      onChange={(e) => setExpCurrent(e.target.checked)}
                    />
                    <span className="text-xs">Currently working in this role</span>
                  </label>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="exp-desc-input">Job Description</Label>
                  <Textarea
                    id="exp-desc-input"
                    value={expDesc}
                    onChange={(e) => setExpDesc(e.target.value)}
                    rows={3}
                    placeholder="e.g. Developed and maintained cloud-native web services..."
                  />
                </div>

                <div className="flex gap-2 justify-end pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditingExp(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" size="sm">
                    Save Experience
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Experiences list registry */}
        <div className="flex flex-col gap-3">
          {userExperiences.length === 0 ? (
            <Card className="p-5 text-center text-muted-foreground text-xs">
              No work experience entries recorded yet.
            </Card>
          ) : (
            userExperiences.map((exp) => (
              <Card
                key={exp.id}
                className="p-4 space-y-2 shadow-none hover:border-foreground/20"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold text-sm text-foreground">{exp.position}</h4>
                    <div className="text-xs text-muted-foreground font-medium">
                      {exp.company} {exp.location && `· ${exp.location}`}
                    </div>
                    <span className="text-[11px] font-mono text-muted-foreground block mt-0.5">
                      {formatDate(exp.start_date)} -{' '}
                      {exp.current === 1 ? 'Present' : formatDate(exp.end_date)}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Button
                      size="icon-xs"
                      variant="ghost"
                      onClick={() => handleOpenEditExp(exp)}
                      title="Edit experience"
                    >
                      <Pencil className="size-3" />
                    </Button>
                    <Button
                      size="icon-xs"
                      variant="ghost"
                      onClick={() => handleDeleteExp(exp.id)}
                      className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      title="Delete experience"
                    >
                      <Trash2 className="size-3" />
                    </Button>
                  </div>
                </div>

                {exp.description && (
                  <p className="text-xs text-muted-foreground border-t border-border pt-2 mt-1 leading-relaxed">
                    {exp.description}
                  </p>
                )}
              </Card>
            ))
          )}
        </div>
      </div>

      {/* ========================================== */}
      {/* EDUCATION PORTION */}
      {/* ========================================== */}
      <div className="space-y-4 pt-4 border-t border-border">
        <div className="flex justify-between items-center">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <GraduationCap className="size-3.5 text-primary" />
            Education Registry
          </h3>
          <Button size="xs" onClick={handleOpenAddEdu} variant="default">
            <Plus className="size-3" />
            Add Education
          </Button>
        </div>

        {/* Education Edit Form */}
        {isEditingEdu && (
          <Card className="animate-in fade-in slide-in-from-top-2 duration-200 border-primary/20 bg-muted/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">
                {eduEditId ? 'Edit Education Details' : 'Add Education'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveEdu} className="space-y-4" autoComplete="off">
                {eduError && (
                  <div className="rounded-lg bg-destructive/10 p-3 text-xs text-destructive">
                    {eduError}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="edu-inst-input">Institution</Label>
                    <Input
                      id="edu-inst-input"
                      type="text"
                      value={eduInstitution}
                      onChange={(e) => setEduInstitution(e.target.value)}
                      placeholder="e.g. Binus University"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="edu-degree-input">Degree</Label>
                    <Input
                      id="edu-degree-input"
                      type="text"
                      value={eduDegree}
                      onChange={(e) => setEduDegree(e.target.value)}
                      placeholder="e.g. Bachelor of Computer Science"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="edu-field-input">Field of Study</Label>
                    <Input
                      id="edu-field-input"
                      type="text"
                      value={eduField}
                      onChange={(e) => setEduField(e.target.value)}
                      placeholder="e.g. Computer Science"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="edu-start-input">Start Date</Label>
                    <Input
                      id="edu-start-input"
                      type="date"
                      value={eduStart}
                      onChange={(e) => setEduStart(e.target.value)}
                      required
                    />
                  </div>

                  {!eduCurrent && (
                    <div className="space-y-1.5">
                      <Label htmlFor="edu-end-input">End Date</Label>
                      <Input
                        id="edu-end-input"
                        type="date"
                        value={eduEnd}
                        onChange={(e) => setEduEnd(e.target.value)}
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label className="checkbox" htmlFor="edu-current-checkbox">
                    <input
                      id="edu-current-checkbox"
                      type="checkbox"
                      checked={eduCurrent}
                      onChange={(e) => setEduCurrent(e.target.checked)}
                    />
                    <span className="text-xs">Currently studying here</span>
                  </label>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="edu-desc-input">Details / GPA</Label>
                  <Textarea
                    id="edu-desc-input"
                    value={eduDesc}
                    onChange={(e) => setEduDesc(e.target.value)}
                    rows={3}
                    placeholder="e.g. GPA: 3.9/4.0 · Dean's List..."
                  />
                </div>

                <div className="flex gap-2 justify-end pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditingEdu(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" size="sm">
                    Save Education
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Education registry list */}
        <div className="flex flex-col gap-3">
          {userEducation.length === 0 ? (
            <Card className="p-5 text-center text-muted-foreground text-xs">
              No education history recorded yet.
            </Card>
          ) : (
            userEducation.map((edu) => (
              <Card
                key={edu.id}
                className="p-4 space-y-2 shadow-none hover:border-foreground/20"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold text-sm text-foreground">
                      {edu.degree} {edu.field && `in ${edu.field}`}
                    </h4>
                    <div className="text-xs text-muted-foreground font-medium">
                      {edu.institution}
                    </div>
                    <span className="text-[11px] font-mono text-muted-foreground block mt-0.5">
                      {formatDate(edu.start_date)} -{' '}
                      {edu.current === 1 ? 'Present' : formatDate(edu.end_date)}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Button
                      size="icon-xs"
                      variant="ghost"
                      onClick={() => handleOpenEditEdu(edu)}
                      title="Edit education"
                    >
                      <Pencil className="size-3" />
                    </Button>
                    <Button
                      size="icon-xs"
                      variant="ghost"
                      onClick={() => handleDeleteEdu(edu.id)}
                      className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      title="Delete education"
                    >
                      <Trash2 className="size-3" />
                    </Button>
                  </div>
                </div>

                {edu.description && (
                  <p className="text-xs text-muted-foreground border-t border-border pt-2 mt-1 leading-relaxed">
                    {edu.description}
                  </p>
                )}
              </Card>
            ))
          )}
        </div>
      </div>

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
