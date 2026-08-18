'use client';

import React, { useState, useEffect } from 'react';
import { Save, Loader2, X } from 'lucide-react';
import { usePortfolio } from '@/components/providers/portfolio-provider';
import { useToast } from '@/hooks/useToast';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Label } from '@/components/ui/Label';

interface DetailsTabProps {
  setIsDirty: (val: boolean) => void;
  profile: any;
}

export const DetailsTab: React.FC<DetailsTabProps> = ({ setIsDirty, profile }) => {
  const { currentUser, updateProfile } = usePortfolio();
  const { toast, showToast } = useToast();
  const [saving, setSaving] = useState(false);

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
  const isDirty = profile
    ? bio !== (profile.bio || '') ||
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
    : false;

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

  if (!currentUser || !profile) {
    return (
      <div className="flex flex-col justify-center items-center p-8">
        <Loader2 className="size-6 text-primary animate-spin" />
        <span className="text-xs text-muted-foreground mt-3 font-mono">Loading profile...</span>
      </div>
    );
  }

  const handleSaveDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const wordsArray = typingWords
      .split(',')
      .map((w) => w.trim())
      .filter((w) => w.length > 0);

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

    setSaving(false);
    showToast('Profile settings saved successfully');
  };

  return (
    <form onSubmit={handleSaveDetails} className="space-y-6" autoComplete="off">
      {/* Academic Profile Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Academic Profile</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="major-input">Major</Label>
            <Input
              id="major-input"
              type="text"
              value={major}
              onChange={(e) => setMajor(e.target.value)}
              placeholder="e.g. Computer Science"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="university-input">University</Label>
            <Input
              id="university-input"
              type="text"
              value={university}
              onChange={(e) => setUniversity(e.target.value)}
              placeholder="e.g. Binus University"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="location-input">Location</Label>
            <Input
              id="location-input"
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Jakarta, Indonesia"
              required
            />
          </div>
        </CardContent>
      </Card>

      {/* About & Avatar Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">About & Avatar</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="bio-input">Bio / Introduction</Label>
            <Textarea
              id="bio-input"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Brief professional summary about yourself..."
              rows={4}
              required
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
            <div className="space-y-1.5">
              <Label htmlFor="avatar-input">Avatar Image URL (Optional)</Label>
              <Input
                id="avatar-input"
                type="text"
                value={avatar}
                onChange={(e) => setAvatar(e.target.value)}
                placeholder="https://images.unsplash.com/..."
              />
            </div>
            <div className="pt-5">
              <label className="checkbox" htmlFor="showAvatar">
                <input
                  type="checkbox"
                  id="showAvatar"
                  checked={showAvatar}
                  onChange={(e) => setShowAvatar(e.target.checked)}
                />
                <span className="text-xs">Show avatar picture on public profile</span>
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Hero Header Customization */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Hero Customization</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="badge-input">Status Badge Text</Label>
              <Input
                id="badge-input"
                type="text"
                value={heroBadge}
                onChange={(e) => setHeroBadge(e.target.value)}
                placeholder="e.g. ✦ Available for opportunities"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cv-input">CV Document URL (Optional)</Label>
              <Input
                id="cv-input"
                type="text"
                value={cvUrl}
                onChange={(e) => setCvUrl(e.target.value)}
                placeholder="https://example.com/cv.pdf"
              />
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Typing Effect Carousel
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2 space-y-1.5">
                <Label htmlFor="typing-input">Words (separated by comma)</Label>
                <Input
                  id="typing-input"
                  type="text"
                  value={typingWords}
                  onChange={(e) => setTypingWords(e.target.value)}
                  placeholder="Software Developer, CS Student"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="speed-input">Typing Speed (ms)</Label>
                <Input
                  id="speed-input"
                  type="number"
                  value={typingSpeed}
                  onChange={(e) => setTypingSpeed(Number(e.target.value))}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="pause-input">Pause (ms)</Label>
                <Input
                  id="pause-input"
                  type="number"
                  value={typingPause}
                  onChange={(e) => setTypingPause(Number(e.target.value))}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Social Links & Domain */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Social Links & Domain</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="domain-input">Custom Domain (Optional)</Label>
            <Input
              id="domain-input"
              type="text"
              value={customDomain}
              onChange={(e) => setCustomDomain(e.target.value)}
              placeholder="e.g. johndoe.me"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="contact-email-input">Contact Email (Optional)</Label>
            <Input
              id="contact-email-input"
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              placeholder="johndoe@example.com"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="github-input">GitHub Username</Label>
            <Input
              id="github-input"
              type="text"
              value={github}
              onChange={(e) => setGithub(e.target.value)}
              placeholder="e.g. johndoe"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="linkedin-input">LinkedIn Username / URL</Label>
            <Input
              id="linkedin-input"
              type="text"
              value={linkedin}
              onChange={(e) => setLinkedin(e.target.value)}
              placeholder="e.g. johndoe"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="twitter-input">X (Twitter) Username</Label>
            <Input
              id="twitter-input"
              type="text"
              value={twitter}
              onChange={(e) => setTwitter(e.target.value)}
              placeholder="e.g. johndoe"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="website-input">Personal Website URL</Label>
            <Input
              id="website-input"
              type="text"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://johndoe.com"
            />
          </div>
        </CardContent>
      </Card>

      {/* Visibility Sections Toggles */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Section Visibility</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          <label className="checkbox" htmlFor="secSkills">
            <input
              id="secSkills"
              type="checkbox"
              checked={secSkills}
              onChange={(e) => setSecSkills(e.target.checked)}
            />
            <span className="text-xs">Skills Block</span>
          </label>
          <label className="checkbox" htmlFor="secProjects">
            <input
              id="secProjects"
              type="checkbox"
              checked={secProjects}
              onChange={(e) => setSecProjects(e.target.checked)}
            />
            <span className="text-xs">Projects Block</span>
          </label>
          <label className="checkbox" htmlFor="secExperience">
            <input
              id="secExperience"
              type="checkbox"
              checked={secExperience}
              onChange={(e) => setSecExperience(e.target.checked)}
            />
            <span className="text-xs">Experience Block</span>
          </label>
          <label className="checkbox" htmlFor="secEducation">
            <input
              id="secEducation"
              type="checkbox"
              checked={secEducation}
              onChange={(e) => setSecEducation(e.target.checked)}
            />
            <span className="text-xs">Education Block</span>
          </label>
          <label className="checkbox" htmlFor="secContact">
            <input
              id="secContact"
              type="checkbox"
              checked={secContact}
              onChange={(e) => setSecContact(e.target.checked)}
            />
            <span className="text-xs">Contact Block</span>
          </label>
        </CardContent>
      </Card>

      <div className="flex justify-end pt-2">
        <Button type="submit" disabled={saving} size="lg">
          {saving ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="size-4" />
              Save Details
            </>
          )}
        </Button>
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
    </form>
  );
};
