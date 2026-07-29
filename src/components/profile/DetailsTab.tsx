'use client';

import React, { useState, useEffect } from 'react';
import { usePortfolio } from '@/components/providers/portfolio-provider';
import { useToast } from '@/hooks/useToast';

interface DetailsTabProps {
  setIsDirty: (val: boolean) => void;
  profile: any;
}

export const DetailsTab: React.FC<DetailsTabProps> = ({ setIsDirty, profile }) => {
  const { currentUser, updateProfile } = usePortfolio();
  const { toast, showToast } = useToast();

  const [bio, setBio] = useState(profile?.bio || '');
  const [avatar, setAvatar] = useState(profile?.avatar || '');
  const [showAvatar, setShowAvatar] = useState(profile?.show_avatar !== false);
  const [major, setMajor] = useState(profile?.major || '');
  const [university, setUniversity] = useState(profile?.university || '');
  const [location, setLocation] = useState(profile?.location || 'Jakarta');
  const [customDomain, setCustomDomain] = useState(profile?.custom_domain || '');
  const [cvUrl, setCvUrl] = useState(profile?.cv_url || '');
  const [heroBadge, setHeroBadge] = useState(profile?.hero_badge_text || '✦ Available for opportunities');
  
  // Typing Effect
  const [typingWords, setTypingWords] = useState((profile?.typing_words || []).join(', '));
  const [typingSpeed, setTypingSpeed] = useState(profile?.typing_speed || 100);
  const [typingDeleteSpeed, setTypingDeleteSpeed] = useState(profile?.typing_delete_speed || 50);
  const [typingPause, setTypingPause] = useState(profile?.typing_pause_duration || 2000);

  // Sections
  const [secSkills, setSecSkills] = useState(profile?.sections?.show_skills !== false);
  const [secProjects, setSecProjects] = useState(profile?.sections?.show_projects !== false);
  const [secExperience, setSecExperience] = useState(profile?.sections?.show_experience !== false);
  const [secEducation, setSecEducation] = useState(profile?.sections?.show_education !== false);
  const [secContact, setSecContact] = useState(profile?.sections?.show_contact !== false);

  // Social Links
  const [github, setGithub] = useState(profile?.github || '');
  const [linkedin, setLinkedin] = useState(profile?.linkedin || '');
  const [twitter, setTwitter] = useState(profile?.twitter || '');
  const [website, setWebsite] = useState(profile?.website || '');
  const [contactEmail, setContactEmail] = useState(profile?.contact_email || '');

  // Track dirtiness
  const isDirty = profile ? (
    bio !== (profile.bio || '') ||
    avatar !== (profile.avatar || '') ||
    showAvatar !== (profile.show_avatar !== false) ||
    major !== (profile.major || '') ||
    university !== (profile.university || '') ||
    location !== (profile.location || 'Jakarta') ||
    customDomain !== (profile.custom_domain || '') ||
    cvUrl !== (profile.cv_url || '') ||
    heroBadge !== (profile.hero_badge_text || '') ||
    typingWords !== (profile.typing_words?.join(', ') || '') ||
    Number(typingSpeed) !== (profile.typing_speed || 100) ||
    Number(typingDeleteSpeed) !== (profile.typing_delete_speed || 50) ||
    Number(typingPause) !== (profile.typing_pause_duration || 2000) ||
    secSkills !== (profile.sections?.show_skills !== false) ||
    secProjects !== (profile.sections?.show_projects !== false) ||
    secExperience !== (profile.sections?.show_experience !== false) ||
    secEducation !== (profile.sections?.show_education !== false) ||
    secContact !== (profile.sections?.show_contact !== false) ||
    github !== (profile.github || '') ||
    linkedin !== (profile.linkedin || '') ||
    twitter !== (profile.twitter || '') ||
    website !== (profile.website || '') ||
    contactEmail !== (profile.contact_email || '')
  ) : false;

  // Pre-fill profile form on load or when saved profile changes from DB
  useEffect(() => {
    if (profile) {
      setBio(profile.bio || '');
      setAvatar(profile.avatar || '');
      setShowAvatar(profile.show_avatar !== false);
      setMajor(profile.major || '');
      setUniversity(profile.university || '');
      setLocation(profile.location || 'Jakarta');
      setCustomDomain(profile.custom_domain || '');
      setCvUrl(profile.cv_url || '');
      setHeroBadge(profile.hero_badge_text || '✦ Available for opportunities');
      
      setTypingWords((profile.typing_words || []).join(', '));
      setTypingSpeed(profile.typing_speed || 100);
      setTypingDeleteSpeed(profile.typing_delete_speed || 50);
      setTypingPause(profile.typing_pause_duration || 2000);

      setSecSkills(profile.sections?.show_skills !== false);
      setSecProjects(profile.sections?.show_projects !== false);
      setSecExperience(profile.sections?.show_experience !== false);
      setSecEducation(profile.sections?.show_education !== false);
      setSecContact(profile.sections?.show_contact !== false);

      setGithub(profile.github || '');
      setLinkedin(profile.linkedin || '');
      setTwitter(profile.twitter || '');
      setWebsite(profile.website || '');
      setContactEmail(profile.contact_email || '');
    }
  }, [profile]);

  useEffect(() => {
    setIsDirty(isDirty);
    return () => setIsDirty(false);
  }, [isDirty, setIsDirty]);

  if (!currentUser || !profile) return (
    <div className="flex-grow flex flex-col justify-center items-center p-6 min-h-[20vh]">
      <div className="w-8 h-8 rounded-full border-4 border-stone-200 border-t-[var(--accent)] animate-spin" />
      <span className="text-xs text-stone-500 mt-3 font-mono">Loading profile...</span>
    </div>
  );

  const handleSaveDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const wordsArray = typingWords
      .split(',')
      .map(w => w.trim())
      .filter(w => w.length > 0);

    await updateProfile(currentUser.id, {
      bio,
      avatar,
      show_avatar: showAvatar,
      major,
      university,
      location,
      custom_domain: customDomain.trim(),
      cv_url: cvUrl.trim(),
      hero_badge_text: heroBadge.trim(),
      typing_words: wordsArray.length > 0 ? wordsArray : [currentUser.name],
      typing_speed: Number(typingSpeed),
      typing_delete_speed: Number(typingDeleteSpeed),
      typing_pause_duration: Number(typingPause),
      sections: {
        show_skills: secSkills,
        show_projects: secProjects,
        show_experience: secExperience,
        show_education: secEducation,
        show_contact: secContact,
      },
      github,
      linkedin,
      twitter,
      website,
      contact_email: contactEmail,
    });

    showToast('Profile settings saved! ✅');
  };

  return (
    <form onSubmit={handleSaveDetails} className="space-y-6" autoComplete="off">
      {/* Toast Notification Banner */}
      {toast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 bg-[var(--accent)] text-white rounded-full shadow-lg text-xs font-semibold tracking-wide animate-bounce">
          {toast}
        </div>
      )}

      {/* Academic Profile Card */}
      <div className="glass-card p-4 space-y-4">
        <h3 className="font-semibold text-sm text-stone-950 dark:text-white border-b border-stone-100 dark:border-zinc-700/60 pb-2">
          Academic Profile
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="input-label">Major</label>
            <input
              type="text"
              value={major}
              onChange={(e) => setMajor(e.target.value)}
              className="input-field"
              placeholder="e.g. Computer Science"
              required
            />
          </div>
          <div>
            <label className="input-label">University</label>
            <input
              type="text"
              value={university}
              onChange={(e) => setUniversity(e.target.value)}
              className="input-field"
              placeholder="e.g. Stanford University"
              required
            />
          </div>
          <div>
            <label className="input-label">Location</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="input-field"
              placeholder="e.g. Jakarta, Indonesia"
              required
            />
          </div>
        </div>
      </div>

      {/* About & Avatar Settings */}
      <div className="glass-card p-4 space-y-4">
        <h3 className="font-semibold text-sm text-stone-950 dark:text-white border-b border-stone-100 dark:border-zinc-700/60 pb-2">
          About & Avatar
        </h3>
        <div className="space-y-3">
          <div>
            <label className="input-label">Bio / Introduction</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="input-field"
              placeholder="e.g. I am a software engineer focused on product design..."
              rows={4}
              required
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="input-label">Avatar Image URL (Optional)</label>
              <input
                type="text"
                value={avatar}
                onChange={(e) => setAvatar(e.target.value)}
                className="input-field"
                placeholder="https://example.com/avatar.jpg"
              />
            </div>
            <div className="flex items-center gap-3 pt-6">
              <input
                type="checkbox"
                id="showAvatar"
                checked={showAvatar}
                onChange={(e) => setShowAvatar(e.target.checked)}
                className="w-4 h-4 rounded border-stone-300 dark:border-zinc-700 text-[var(--accent)] focus:ring-[var(--accent)]"
              />
              <label htmlFor="showAvatar" className="text-xs font-semibold text-stone-700 dark:text-zinc-300 cursor-pointer select-none">
                Show Avatar Picture on Public Page
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Header Customization */}
      <div className="glass-card p-4 space-y-4">
        <h3 className="font-semibold text-sm text-stone-950 dark:text-white border-b border-stone-100 dark:border-zinc-700/60 pb-2">
          Hero Customization
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="input-label">Status Badge Text</label>
            <input
              type="text"
              value={heroBadge}
              onChange={(e) => setHeroBadge(e.target.value)}
              className="input-field"
              placeholder="e.g. ✦ Open to opportunities"
            />
          </div>
          <div>
            <label className="input-label">CV Document URL (Optional)</label>
            <input
              type="text"
              value={cvUrl}
              onChange={(e) => setCvUrl(e.target.value)}
              className="input-field"
              placeholder="https://example.com/cv.pdf"
            />
          </div>
        </div>

        {/* Dynamic Typing Title */}
        <div className="space-y-3 pt-2">
          <h4 className="text-xs font-bold text-stone-900 dark:text-zinc-300">Typing Effect Carousel</h4>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <label className="input-label">Typing Words (separated by comma)</label>
              <input
                type="text"
                value={typingWords}
                onChange={(e) => setTypingWords(e.target.value)}
                className="input-field"
                placeholder="e.g. Developer, Designer, Student"
              />
            </div>
            <div>
              <label className="input-label">Typing Speed (ms)</label>
              <input
                type="number"
                value={typingSpeed}
                onChange={(e) => setTypingSpeed(Number(e.target.value))}
                className="input-field"
              />
            </div>
            <div>
              <label className="input-label">Pause Duration (ms)</label>
              <input
                type="number"
                value={typingPause}
                onChange={(e) => setTypingPause(Number(e.target.value))}
                className="input-field"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Social Links & Custom domain */}
      <div className="glass-card p-4 space-y-4">
        <h3 className="font-semibold text-sm text-stone-950 dark:text-white border-b border-stone-100 dark:border-zinc-700/60 pb-2">
          Social Links & Domain
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="input-label">Custom Domain (Optional)</label>
            <input
              type="text"
              value={customDomain}
              onChange={(e) => setCustomDomain(e.target.value)}
              className="input-field"
              placeholder="e.g. johndoe.me"
            />
          </div>
          <div>
            <label className="input-label">Contact Email (Optional)</label>
            <input
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              className="input-field"
              placeholder="johndoe@example.com"
            />
          </div>
          <div>
            <label className="input-label">GitHub Username</label>
            <input
              type="text"
              value={github}
              onChange={(e) => setGithub(e.target.value)}
              className="input-field"
              placeholder="e.g. johndoe"
            />
          </div>
          <div>
            <label className="input-label">LinkedIn URL (Username/ID)</label>
            <input
              type="text"
              value={linkedin}
              onChange={(e) => setLinkedin(e.target.value)}
              className="input-field"
              placeholder="e.g. johndoe"
            />
          </div>
          <div>
            <label className="input-label">X (Twitter) Username</label>
            <input
              type="text"
              value={twitter}
              onChange={(e) => setTwitter(e.target.value)}
              className="input-field"
              placeholder="e.g. johndoe"
            />
          </div>
          <div>
            <label className="input-label">Personal Website URL</label>
            <input
              type="text"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              className="input-field"
              placeholder="https://johndoe.com"
            />
          </div>
        </div>
      </div>

      {/* Visibility Sections Toggles */}
      <div className="glass-card p-4 space-y-4">
        <h3 className="font-semibold text-sm text-stone-950 dark:text-white border-b border-stone-100 dark:border-zinc-700/60 pb-2">
          Page Section Visibility Settings
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          <label className="checkbox py-2 px-3 justify-start" htmlFor="secSkills">
            <input
              id="secSkills"
              type="checkbox"
              checked={secSkills}
              onChange={(e) => setSecSkills(e.target.checked)}
            />
            <span>Skills Block</span>
          </label>
          <label className="checkbox py-2 px-3 justify-start" htmlFor="secProjects">
            <input
              id="secProjects"
              type="checkbox"
              checked={secProjects}
              onChange={(e) => setSecProjects(e.target.checked)}
            />
            <span>Projects Block</span>
          </label>
          <label className="checkbox py-2 px-3 justify-start" htmlFor="secExperience">
            <input
              id="secExperience"
              type="checkbox"
              checked={secExperience}
              onChange={(e) => setSecExperience(e.target.checked)}
            />
            <span>Experience Block</span>
          </label>
          <label className="checkbox py-2 px-3 justify-start" htmlFor="secEducation">
            <input
              id="secEducation"
              type="checkbox"
              checked={secEducation}
              onChange={(e) => setSecEducation(e.target.checked)}
            />
            <span>Education Block</span>
          </label>
          <label className="checkbox py-2 px-3 justify-start" htmlFor="secContact">
            <input
              id="secContact"
              type="checkbox"
              checked={secContact}
              onChange={(e) => setSecContact(e.target.checked)}
            />
            <span>Contact Block</span>
          </label>
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <button
          type="submit"
          className="px-8 py-3 rounded-full font-semibold text-white bg-[var(--accent)] hover:bg-[var(--accent-hover)] shadow-md text-xs transition-all active:scale-95 flex items-center gap-1.5"
        >
          Save Settings <i className="fas fa-save"></i>
        </button>
      </div>
    </form>
  );
};
