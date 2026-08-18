import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function normalizeEmbedUrl(url: string | null | undefined): string {
  if (!url) return '';
  url = url.trim();

  // YouTube watch URL -> embed
  if (url.includes('watch?v=')) {
    const videoId = url.split('v=')[1]?.split('&')[0];
    if (videoId) return `https://www.youtube.com/embed/${videoId}`;
  }
  // youtu.be short URL -> embed
  if (url.includes('youtu.be/')) {
    const videoId = url.split('youtu.be/')[1]?.split('?')[0];
    if (videoId) return `https://www.youtube.com/embed/${videoId}`;
  }
  // Already embed URL? keep it
  if (url.includes('youtube.com/embed/')) return url;
  
  // Vimeo: https://player.vimeo.com/video/ID
  if (url.includes('vimeo.com/')) {
    const id = url.split('vimeo.com/')[1]?.split('/')[0];
    if (id) return `https://player.vimeo.com/video/${id}`;
  }
  
  // Figma embed: keep as is
  // CodePen: keep as is (https://codepen.io/.../embed)
  return url;
}

export function isValidImageUrl(url: string | null | undefined): boolean {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  if (!trimmed) return false;
  if (trimmed.startsWith('data:image/') || trimmed.startsWith('/')) return true;

  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch (e) {
    return false;
  }
}

export function getRawGitHubUrl(url: string): string {
  if (url.includes('github.com') && url.includes('/blob/')) {
    return url.replace('github.com', 'raw.githubusercontent.com').replace('/blob/', '/');
  }
  return url;
}

export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return 'Present';
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
    });
  } catch (e) {
    return dateStr;
  }
}

/**
 * Normalizes social usernames and URLs to valid, fully-qualified external HTTPS URLs.
 * Ensures clicking social or project links never navigates relative to the local app domain.
 */
export function formatExternalUrl(
  input: string | null | undefined,
  type: 'github' | 'linkedin' | 'twitter' | 'website' | 'general' = 'general'
): string {
  if (!input || typeof input !== 'string') return '';
  let url = input.trim();
  if (!url) return '';

  // Strip duplicate or malformed protocol prefixes (e.g. "https://https:/", "https:/?", "http:/", "https//")
  const cleanedUrl = url.replace(/^(https?:?\/*\?*)+/i, '');

  // Handle specific platforms if user enters just a username or handle
  if (type === 'github') {
    const clean = cleanedUrl.replace(/^@/, '').replace(/^(www\.)?github\.com\//i, '').replace(/^\/+|\/+$/g, '');
    return `https://github.com/${clean}`;
  }

  if (type === 'linkedin') {
    const clean = cleanedUrl.replace(/^(www\.)?linkedin\.com\/(in\/)?/i, '').replace(/^in\//i, '').replace(/^\/+|\/+$/g, '');
    return `https://www.linkedin.com/in/${clean}`;
  }

  if (type === 'twitter') {
    const clean = cleanedUrl.replace(/^@/, '').replace(/^(www\.)?(twitter|x)\.com\//i, '').replace(/^\/+|\/+$/g, '');
    return `https://x.com/${clean}`;
  }

  // General website / custom domain / project link
  return `https://${cleanedUrl.replace(/^\/+/, '')}`;
}
