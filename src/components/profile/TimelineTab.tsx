'use client';

import React, { useState, useEffect } from 'react';
import { usePortfolio, Experience, Education } from '@/components/providers/portfolio-provider';
import { formatDate } from '@/lib/utils';
import { useToast } from '@/hooks/useToast';

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

  const activePortId = activePortfolioId || (currentUser ? db.portfolios.find(p => p.user_id === currentUser.id)?.id : null) || null;
  const userExperiences = db.experiences.filter(e => e.portfolio_id === activePortId);
  const userEducation = db.education.filter(e => e.portfolio_id === activePortId);

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
      end_date: (expEnd && !expCurrent) ? new Date(expEnd).toISOString() : null,
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
        showToast('Experience updated! 💼');
      } else {
        await addExperience(activePortId, expData);
        showToast('Experience added! 💼');
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
      end_date: (eduEnd && !eduCurrent) ? new Date(eduEnd).toISOString() : null,
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
        showToast('Education updated! 🎓');
      } else {
        await addEducation(activePortId, eduData);
        showToast('Education entry added! 🎓');
      }
      setIsEditingEdu(false);
    } catch (err: any) {
      setEduError(err?.message || 'Failed to save education entry.');
    }
  };

  const handleDeleteEdu = (id: string) => {
    if (confirm('Delete this education entry?')) {
      deleteEducation(id);
      showToast('Education entry removed');
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification Banner */}
      {toast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 bg-[var(--accent)] text-white rounded-full shadow-lg text-xs font-semibold tracking-wide animate-bounce">
          {toast}
        </div>
      )}

      {/* ========================================== */}
      {/* WORK EXPERIENCE PORTION */}
      {/* ========================================== */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-xs font-bold text-stone-400 dark:text-zinc-500 uppercase tracking-widest">
            Work Experience
          </h3>
          <button
            onClick={handleOpenAddExp}
            className="px-2.5 py-1 bg-[var(--accent)] text-white text-[10px] font-bold rounded-lg transition-all active:scale-95 shadow-sm"
          >
            + Add Experience
          </button>
        </div>

        {/* Experience Edit Form */}
        {isEditingExp && (
          <div className="glass-card p-4 bg-[var(--accent-light)] border-[var(--border)] animate-fadeIn">
            <h4 className="font-semibold text-sm text-stone-950 dark:text-white mb-4">
              {expEditId ? 'Edit Work Experience' : 'Add Work Experience'}
            </h4>
            
            <form onSubmit={handleSaveExp} className="space-y-4" autoComplete="off">
              {expError && (
                <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 text-xs rounded-xl font-medium">
                  {expError}
                </div>
              )}

              <div className="input-group flex flex-col">
                <label className="input-label" htmlFor="exp-company-input">Company</label>
                <input
                  id="exp-company-input"
                  type="text"
                  value={expCompany}
                  onChange={(e) => setExpCompany(e.target.value)}
                  className="input-field"
                  placeholder="e.g. Google"
                  required
                />
              </div>

              <div className="input-group flex flex-col">
                <label className="input-label" htmlFor="exp-pos-input">Position</label>
                <input
                  id="exp-pos-input"
                  type="text"
                  value={expPosition}
                  onChange={(e) => setExpPosition(e.target.value)}
                  className="input-field"
                  placeholder="e.g. Software Engineer"
                  required
                />
              </div>

              <div className="input-group flex flex-col">
                <label className="input-label" htmlFor="exp-loc-input">Location</label>
                <input
                  id="exp-loc-input"
                  type="text"
                  value={expLocation}
                  onChange={(e) => setExpLocation(e.target.value)}
                  className="input-field"
                  placeholder="e.g. San Francisco, CA"
                />
              </div>

              <div className="input-group flex flex-col">
                <label className="input-label" htmlFor="exp-start-input">Start Date</label>
                <input
                  id="exp-start-input"
                  type="date"
                  value={expStart}
                  onChange={(e) => setExpStart(e.target.value)}
                  className="input-field"
                  required
                />
              </div>

              {!expCurrent && (
                <div className="input-group flex flex-col">
                  <label className="input-label" htmlFor="exp-end-input">End Date</label>
                  <input
                    id="exp-end-input"
                    type="date"
                    value={expEnd}
                    onChange={(e) => setExpEnd(e.target.value)}
                    className="input-field"
                  />
                </div>
              )}

              <div className="input-group">
                <label className="checkbox" htmlFor="exp-current-checkbox">
                  <input
                    id="exp-current-checkbox"
                    type="checkbox"
                    checked={expCurrent}
                    onChange={(e) => setExpCurrent(e.target.checked)}
                  />
                  <span>Currently working in this role</span>
                </label>
              </div>

              <div className="input-group flex flex-col">
                <label className="input-label" htmlFor="exp-desc-input">Job Description</label>
                <textarea
                  id="exp-desc-input"
                  value={expDesc}
                  onChange={(e) => setExpDesc(e.target.value)}
                  className="input-field"
                  rows={3}
                  placeholder="e.g. Developed and maintained cloud-native web services..."
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-full font-semibold text-white bg-[var(--accent)] hover:bg-[var(--accent-hover)] shadow text-xs transition-all"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditingExp(false)}
                  className="flex-1 py-2.5 rounded-full font-semibold text-stone-700 bg-stone-100 border border-stone-200/60 dark:bg-zinc-700 dark:text-zinc-300 dark:border-zinc-600 text-xs transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Experiences list registry */}
        <div className="flex flex-col gap-3">
          {userExperiences.length === 0 ? (
            <div className="glass-card p-4 text-center text-[var(--text-muted)] text-xs">
              No work experience entries recorded.
            </div>
          ) : (
            userExperiences.map(exp => (
              <div key={exp.id} className="glass-card p-4 flex flex-col gap-2 animate-fadeIn">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold text-sm text-stone-900 dark:text-zinc-100">{exp.position}</h4>
                    <div className="text-xs text-stone-500 dark:text-zinc-400 font-medium">
                      {exp.company} {exp.location && `· ${exp.location}`}
                    </div>
                    <span className="text-[10px] font-mono text-stone-400 block mt-0.5">
                      {formatDate(exp.start_date)} - {exp.current === 1 ? 'Present' : formatDate(exp.end_date)}
                    </span>
                  </div>

                  <div className="flex gap-1.5">
                    <button
                      onClick={() => handleOpenEditExp(exp)}
                      className="px-2 py-0.5 bg-stone-100 hover:bg-stone-200 text-stone-700 dark:bg-zinc-700 dark:hover:bg-zinc-600 dark:text-zinc-200 rounded text-[9px] font-bold"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteExp(exp.id)}
                      className="w-5 h-5 flex items-center justify-center bg-red-50 text-red-600 dark:bg-red-950/20 dark:text-red-400 rounded text-xs font-bold"
                    >
                      ×
                    </button>
                  </div>
                </div>
                {exp.description && (
                  <p className="text-xs text-stone-500 dark:text-zinc-400 border-t border-stone-100 dark:border-zinc-700/60 pt-1.5 mt-1">
                    {exp.description}
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* ========================================== */}
      {/* EDUCATION PORTION */}
      {/* ========================================== */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-xs font-bold text-stone-400 dark:text-zinc-500 uppercase tracking-widest">
            Education Registry
          </h3>
          <button
            onClick={handleOpenAddEdu}
            className="px-2.5 py-1 bg-[var(--accent)] text-white text-[10px] font-bold rounded-lg transition-all active:scale-95 shadow-sm"
          >
            + Add Education
          </button>
        </div>

        {/* Education Edit Form */}
        {isEditingEdu && (
          <div className="glass-card p-4 bg-[var(--accent-light)] border-[var(--border)] animate-fadeIn">
            <h4 className="font-semibold text-sm text-stone-950 dark:text-white mb-4">
              {eduEditId ? 'Edit Education Details' : 'Add Education'}
            </h4>
            
            <form onSubmit={handleSaveEdu} className="space-y-4" autoComplete="off">
              {eduError && (
                <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 text-xs rounded-xl font-medium">
                  {eduError}
                </div>
              )}

              <div className="input-group flex flex-col">
                <label className="input-label" htmlFor="edu-inst-input">Institution</label>
                <input
                  id="edu-inst-input"
                  type="text"
                  value={eduInstitution}
                  onChange={(e) => setEduInstitution(e.target.value)}
                  className="input-field"
                  placeholder="e.g. Stanford University"
                  required
                />
              </div>

              <div className="input-group flex flex-col">
                <label className="input-label" htmlFor="edu-degree-input">Degree</label>
                <input
                  id="edu-degree-input"
                  type="text"
                  value={eduDegree}
                  onChange={(e) => setEduDegree(e.target.value)}
                  className="input-field"
                  placeholder="e.g. Bachelor of Science"
                  required
                />
              </div>

              <div className="input-group flex flex-col">
                <label className="input-label" htmlFor="edu-field-input">Field of Study</label>
                <input
                  id="edu-field-input"
                  type="text"
                  value={eduField}
                  onChange={(e) => setEduField(e.target.value)}
                  className="input-field"
                  placeholder="e.g. Computer Science"
                />
              </div>

              <div className="input-group flex flex-col">
                <label className="input-label" htmlFor="edu-start-input">Start Date</label>
                <input
                  id="edu-start-input"
                  type="date"
                  value={eduStart}
                  onChange={(e) => setEduStart(e.target.value)}
                  className="input-field"
                  required
                />
              </div>

              {!eduCurrent && (
                <div className="input-group flex flex-col">
                  <label className="input-label" htmlFor="edu-end-input">End Date</label>
                  <input
                    id="edu-end-input"
                    type="date"
                    value={eduEnd}
                    onChange={(e) => setEduEnd(e.target.value)}
                    className="input-field"
                  />
                </div>
              )}

              <div className="input-group">
                <label className="checkbox" htmlFor="edu-current-checkbox">
                  <input
                    id="edu-current-checkbox"
                    type="checkbox"
                    checked={eduCurrent}
                    onChange={(e) => setEduCurrent(e.target.checked)}
                  />
                  <span>Currently studying here</span>
                </label>
              </div>

              <div className="input-group flex flex-col">
                <label className="input-label" htmlFor="edu-desc-input">Details / GPA</label>
                <textarea
                  id="edu-desc-input"
                  value={eduDesc}
                  onChange={(e) => setEduDesc(e.target.value)}
                  className="input-field"
                  rows={3}
                  placeholder="e.g. GPA: 3.8/4.0, relevant coursework..."
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-full font-semibold text-white bg-[var(--accent)] hover:bg-[var(--accent-hover)] shadow text-xs transition-all"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditingEdu(false)}
                  className="flex-1 py-2.5 rounded-full font-semibold text-stone-700 bg-stone-100 border border-stone-200/60 dark:bg-zinc-700 dark:text-zinc-300 dark:border-zinc-600 text-xs transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Education registry list */}
        <div className="flex flex-col gap-3">
          {userEducation.length === 0 ? (
            <div className="glass-card p-4 text-center text-[var(--text-muted)] text-xs">
              No education history recorded.
            </div>
          ) : (
            userEducation.map(edu => (
              <div key={edu.id} className="glass-card p-4 flex flex-col gap-2 animate-fadeIn">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold text-sm text-stone-900 dark:text-zinc-100">
                      {edu.degree} {edu.field && `in ${edu.field}`}
                    </h4>
                    <div className="text-xs text-stone-500 dark:text-zinc-400 font-medium">
                      {edu.institution}
                    </div>
                    <span className="text-[10px] font-mono text-stone-400 block mt-0.5">
                      {formatDate(edu.start_date)} - {edu.current === 1 ? 'Present' : formatDate(edu.end_date)}
                    </span>
                  </div>

                  <div className="flex gap-1.5">
                    <button
                      onClick={() => handleOpenEditEdu(edu)}
                      className="px-2 py-0.5 bg-stone-100 hover:bg-stone-200 text-stone-700 dark:bg-zinc-700 dark:hover:bg-zinc-600 dark:text-zinc-200 rounded text-[9px] font-bold"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteEdu(edu.id)}
                      className="w-5 h-5 flex items-center justify-center bg-red-50 text-red-600 dark:bg-red-950/20 dark:text-red-400 rounded text-xs font-bold"
                    >
                      ×
                    </button>
                  </div>
                </div>
                {edu.description && (
                  <p className="text-xs text-stone-500 dark:text-zinc-400 border-t border-stone-100 dark:border-zinc-700/60 pt-1.5 mt-1">
                    {edu.description}
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
