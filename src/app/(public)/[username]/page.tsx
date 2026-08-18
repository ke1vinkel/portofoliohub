'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Lock,
  EyeOff,
  FileText,
  Settings,
  MapPin,
  GraduationCap,
  Send,
  Globe,
  Mail,
  ArrowRight,
  Maximize2,
  ExternalLink,
  Link as LinkIcon,
  X,
  Star,
} from 'lucide-react';
import { GithubIcon, LinkedinIcon, TwitterIcon } from '@/components/ui/SocialIcons';
import { usePortfolio } from '@/components/providers/portfolio-provider';
import { formatDate, formatExternalUrl, normalizeEmbedUrl } from '@/lib/utils';



// Helper component for animated numbers
function AnimatedCounter({ target }: { target: number }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (target <= 0) return;
    let start = 0;
    const duration = 1000;
    const frameRate = 16;
    const totalFrames = duration / frameRate;
    const increment = target / totalFrames;
    
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, frameRate);

    return () => clearInterval(timer);
  }, [target]);

  return <span>{count}</span>;
}

function SpotlightCard({ 
  children, 
  className = '', 
  isFeatured = false,
  cardStyle = 'spotlight'
}: { 
  children: React.ReactNode; 
  className?: string; 
  isFeatured?: boolean;
  cardStyle?: string;
}) {
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setCoords({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const styleClasses = cardStyle === 'glass' 
    ? 'backdrop-blur-md bg-white/70 border border-black/10 shadow-md' 
    : cardStyle === 'bento' 
    ? 'rounded-3xl border-2 border-[var(--border-color)] shadow-md bg-white/90' 
    : cardStyle === 'minimal' 
    ? 'shadow-none border border-[var(--border-color)] rounded-lg bg-white/90' 
    : '';

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      className={`project-card-premium animate-fadeIn group/card relative overflow-hidden transition-all duration-500 hover:scale-[1.01] ${styleClasses} ${className}`}
    >
      {/* Spotlight border refraction mask */}
      {cardStyle !== 'minimal' && (
        <div
          className="pointer-events-none absolute -inset-px opacity-0 group-hover/card:opacity-100 transition-opacity duration-500 z-0"
          style={{
            background: `radial-gradient(280px circle at ${coords.x}px ${coords.y}px, var(--accent), transparent 65%)`,
            padding: '1px',
            WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            WebkitMaskComposite: 'xor',
            maskComposite: 'exclude',
          }}
        />
      )}
      <div className={`relative z-10 flex w-full h-full ${
        isFeatured ? 'flex-col md:flex-row gap-6' : 'flex-col gap-4'
      }`}>
        {children}
      </div>
    </div>
  );
}

export default function RecruiterViewPage() {
  const params = useParams();
  const router = useRouter();
  const username = params.username as string;

  const { db, dbLoaded, currentUser, addRecruiterMessage } = usePortfolio();

  // Find user by username, email prefix, nim, or id
  const student = db.users.find(u => 
    u.username === username || 
    u.email.split('@')[0] === username || 
    u.nim === username || 
    u.id === username
  );
  
  // Contact Form State
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [contactSuccess, setContactSuccess] = useState(false);
  const [contactError, setContactError] = useState('');
  
  // Category Filter State
  const [activeCategory, setActiveCategory] = useState('all');
  
  // Toast state
  const [toast, setToast] = useState('');

  // Selected project state for modal
  const [selectedProject, setSelectedProject] = useState<any | null>(null);
  const [activeModalImage, setActiveModalImage] = useState<string | null>(null);

  useEffect(() => {
    if (selectedProject) {
      setActiveModalImage(selectedProject.image || (selectedProject.images?.[0] ?? null));
    } else {
      setActiveModalImage(null);
    }
  }, [selectedProject]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedProject(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Active Portfolio State to avoid hydration mismatch
  const [activePortfolioId, setActivePortfolioId] = useState<string | null>(null);

  useEffect(() => {
    if (student) {
      const savedActive = localStorage.getItem(`active_portfolio_${student.id}`);
      if (savedActive) {
        setActivePortfolioId(savedActive);
      }
    }
  }, [student]);

  // Derive student portfolios and active public portfolio before early returns
  const studentPortfolios = useMemo(() => {
    if (!student) return [];
    return db.portfolios.filter(p => p.user_id === student.id);
  }, [student, db.portfolios]);

  const activePublicPortfolio = useMemo(() => {
    if (studentPortfolios.length === 0) return null;
    return (
      studentPortfolios.find(p => p.id === activePortfolioId) || 
      studentPortfolios.find(p => p.is_public === 1) || 
      studentPortfolios[0] || 
      null
    );
  }, [studentPortfolios, activePortfolioId]);

  const themeConfig = activePublicPortfolio?.theme_config;

  const fontStyleFamily = useMemo(() => {
    if (!themeConfig?.font_style) return 'var(--font-outfit), sans-serif';
    switch (themeConfig.font_style) {
      case 'serif': return 'Georgia, Cambria, "Times New Roman", Times, serif';
      case 'mono': return 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace';
      case 'display': return '"Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, sans-serif';
      default: return 'var(--font-outfit), sans-serif';
    }
  }, [themeConfig]);

  const customThemeVars = useMemo(() => {
    const defaultBg = '#faf9f6';
    const defaultSurface = '#ffffff';
    const defaultText = '#18181b';
    const defaultAccent = '#10b981';

    if (!themeConfig) {
      return {
        '--bg-body': defaultBg,
        '--bg-surface': defaultSurface,
        '--bg-card': defaultSurface,
        '--text-primary': defaultText,
        '--text-secondary': '#52525b',
        '--text-muted': '#71717a',
        '--accent': defaultAccent,
        '--accent-hover': defaultAccent,
        '--accent-light': defaultAccent + '15',
        '--border-color': '#e4e4e7',
        '--border-color-glow': defaultAccent,
      } as React.CSSProperties;
    }

    return {
      '--bg-body': themeConfig.bg_color || defaultBg,
      '--bg-surface': themeConfig.surface_color || defaultSurface,
      '--bg-card': themeConfig.surface_color || defaultSurface,
      '--text-primary': themeConfig.text_color || defaultText,
      '--text-secondary': themeConfig.text_color ? themeConfig.text_color + 'dd' : '#52525b',
      '--text-muted': themeConfig.text_color ? themeConfig.text_color + 'a0' : '#71717a',
      '--accent': themeConfig.accent_color || defaultAccent,
      '--accent-hover': themeConfig.accent_color || defaultAccent,
      '--border-color-glow': themeConfig.accent_color || defaultAccent,
      '--accent-light': (themeConfig.accent_color || defaultAccent) + '20',
      '--border-color': (themeConfig.accent_color || defaultAccent) + '35',
    } as React.CSSProperties;
  }, [themeConfig]);

  // Load student profile & define typing words before early returns
  const profile = student ? db.profiles[student.id] : null;
  const typingWords = profile?.typing_words || [];



  const glowRef = useRef<HTMLDivElement>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  };

  // Cursor glow effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!glowRef.current) return;
      glowRef.current.style.left = `${e.clientX}px`;
      glowRef.current.style.top = `${e.clientY}px`;
      glowRef.current.style.opacity = '1';
    };

    const handleMouseLeave = () => {
      if (glowRef.current) {
        glowRef.current.style.opacity = '0';
      }
    };

    if (typeof window !== 'undefined' && !('ontouchstart' in window)) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseleave', handleMouseLeave);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  // Update Page Title dynamically
  useEffect(() => {
    if (student) {
      const profile = db.profiles[student.id];
      document.title = `${student.name} · ${profile?.major || 'Software Developer'} Portfolio`;
    }
  }, [student, db.profiles]);

  // Fix Viewport Height on Safari Mobile
  useEffect(() => {
    const adjustDynamicViewport = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };
    window.addEventListener('resize', adjustDynamicViewport);
    adjustDynamicViewport();
    return () => window.removeEventListener('resize', adjustDynamicViewport);
  }, []);

  // Force persistent light mode on public showcase page regardless of dashboard theme
  useEffect(() => {
    const prevDataTheme = document.documentElement.getAttribute('data-theme');
    const hasDarkClass = document.documentElement.classList.contains('dark');

    document.documentElement.setAttribute('data-theme', 'light');
    document.documentElement.classList.remove('dark');

    return () => {
      if (prevDataTheme) {
        document.documentElement.setAttribute('data-theme', prevDataTheme);
      }
      if (hasDarkClass) {
        document.documentElement.classList.add('dark');
      }
    };
  }, []);

  // Memoized style tag to avoid stylesheet re-injection on typing animation updates
  const styleElement = useMemo(() => (
    <style dangerouslySetInnerHTML={{ __html: `
      .portfolio-premium-root {
        --bg-body: var(--bg);
        --bg-surface: var(--surface);
        --bg-surface-solid: var(--surface-alt);
        --bg-card: var(--surface-card);
        --bg-card-hover: var(--surface-alt);
        --border-color: var(--border);
        --border-color-glow: var(--accent);
        --text-primary: var(--text);
        --text-secondary: var(--text-muted);
        --text-muted: var(--text-light);
        --accent: var(--accent);
        --accent-hover: var(--accent-hover);
        --accent-light: var(--accent-light);
        
        background-color: var(--bg-body);
        color: var(--text-primary);
        transition: background-color 0.3s, color 0.3s;
        font-family: var(--font-sans), -apple-system, sans-serif;
        line-height: 1.5;
      }

      .container-premium {
        max-width: 1440px;
        margin: 0 auto;
        padding: 0 clamp(1.2rem, 4vw, 5rem);
        width: 100%;
      }

      .nav-premium {
        position: sticky;
        top: 0;
        z-index: 30;
        background: var(--bg-body);
        border-bottom: 1px solid var(--border-color);
        height: 64px;
        display: flex;
        align-items: center;
        transition: background 0.3s, border-color 0.3s;
      }

      .nav-premium .container-premium {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .logo-premium {
        font-size: clamp(1.1rem, 1.5vw, 1.25rem);
        font-weight: 600;
        letter-spacing: -0.02em;
        color: var(--text-primary);
      }

      .logo-premium span {
        font-weight: 700;
      }

      .logo-premium .logo-dot-muted {
        color: var(--text-muted);
        margin: 0 0.2rem;
      }

      .logo-premium .logo-sub-muted {
        color: var(--text-muted);
        font-weight: 300;
      }

      .theme-toggle-premium {
        background: none;
        border: none;
        font-size: clamp(1rem, 1.2vw, 1.1rem);
        color: var(--text-secondary);
        cursor: pointer;
        padding: 0.3rem;
        transition: color 0.2s;
      }

      .theme-toggle-premium:hover {
        color: var(--text-primary);
      }

      .settings-btn-premium {
        background: var(--bg-surface);
        border: 1px solid var(--border-color);
        padding: 0.4rem 0.55rem;
        border-radius: 6px;
        color: var(--text-secondary);
        cursor: pointer;
        transition: all 0.2s;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        font-size: 0.85rem;
      }

      .settings-btn-premium:hover {
        border-color: var(--text-secondary);
        color: var(--text-primary);
      }

      .main-premium {
        display: flex;
        align-items: flex-start;
        padding: clamp(2rem, 5vh, 4rem) 0;
      }

      .main-grid-premium {
        display: grid;
        grid-template-columns: 1fr;
        gap: clamp(2.5rem, 5vw, 4rem);
        align-items: start;
        width: 100%;
      }

      @media (min-width: 768px) {
        .main-grid-premium {
          grid-template-columns: 1fr 1.3fr;
          gap: clamp(2rem, 4vw, 3rem);
        }
      }

      @media (min-width: 1024px) {
        .main-grid-premium {
          grid-template-columns: 1fr 1.6fr;
          gap: clamp(2rem, 5vw, 4rem);
        }
      }

      .left-col-premium {
        display: flex;
        flex-direction: column;
        gap: clamp(1.5rem, 3vh, 2.5rem);
      }

      @media (min-width: 768px) {
        .left-col-premium {
          position: sticky;
          top: 96px;
          max-height: calc(100vh - 140px);
          overflow-y: auto;
          padding-right: 1.25rem;
        }
        .left-col-premium::-webkit-scrollbar {
          width: 4px;
        }
        .left-col-premium::-webkit-scrollbar-track {
          background: transparent;
        }
        .left-col-premium::-webkit-scrollbar-thumb {
          background: var(--border-color);
          border-radius: 9999px;
        }
      }

      .intro-premium {
        display: flex;
        flex-direction: column;
      }

      .intro-premium h1.main-title {
        font-size: clamp(2.2rem, 4.5vw, 3.6rem);
        font-weight: 700;
        letter-spacing: -0.04em;
        line-height: 1.05;
        color: var(--text-primary);
        margin: 0;
      }

      .intro-premium .role-line {
        display: block;
        font-weight: 300;
        color: var(--text-secondary);
        margin-top: 0.2rem;
        min-height: 1.15em;
      }

      .intro-premium .role-accent {
        color: var(--accent);
        font-weight: 600;
      }

      .intro-premium .tagline-premium {
        font-size: clamp(0.95rem, 1.15vw, 1.1rem);
        color: var(--text-secondary);
        margin-top: 0.8rem;
        line-height: 1.5;
        max-width: 480px;
      }

      .intro-meta-premium {
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        align-items: center;
        gap: 0.5rem 1.25rem;
        margin-top: 1.2rem;
        font-size: clamp(0.85rem, 1vw, 0.95rem);
        color: var(--text-secondary);
      }

      .intro-meta-premium span {
        display: flex;
        align-items: center;
        gap: 0.6rem;
      }

      .intro-meta-premium i {
        color: var(--text-muted);
        font-size: 0.95rem;
        width: 1.2rem;
        text-align: center;
      }

      .intro-meta-premium .status-meta {
        color: var(--accent);
        font-weight: 500;
      }

      .intro-meta-premium .status-meta i {
        color: var(--accent);
      }

      .intro-social-premium {
        display: flex;
        gap: 1.2rem;
        margin-top: 1.2rem;
      }

      .intro-social-premium a {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        color: var(--text-secondary);
        font-size: 1.2rem;
        text-decoration: none;
        transition: color 0.2s;
        background: none !important;
        border: none !important;
        width: auto;
        height: auto;
        padding: 0;
      }

      .intro-social-premium a:hover {
        color: var(--accent);
      }

      .about-section-premium p {
        font-size: clamp(0.9rem, 1vw, 1rem);
        color: var(--text-secondary);
        max-width: 520px;
        line-height: 1.6;
        margin: 0;
      }

      .section-block {
        display: flex;
        flex-direction: column;
        gap: 0.8rem;
      }

      .section-label-premium {
        font-size: clamp(0.7rem, 0.8vw, 0.75rem);
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.15em;
        color: var(--text-muted);
      }

      .skills-tags-premium {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
      }

      .skills-tags-premium span {
        font-size: clamp(0.75rem, 0.85vw, 0.85rem);
        font-weight: 500;
        color: var(--text-secondary);
        background: var(--bg-surface);
        padding: 0.35rem 0.85rem;
        border-radius: 9999px;
        border: 1px solid var(--border-color);
        transition: border-color 0.2s, color 0.2s, background-color 0.2s;
      }

      .skills-tags-premium span:hover {
        border-color: var(--accent);
        color: var(--accent);
        background: var(--accent-light);
      }

      .contact-email {
        font-size: clamp(0.95rem, 1.05vw, 1.1rem);
        color: var(--accent);
        text-decoration: none;
        font-weight: 500;
        transition: color 0.2s;
        width: fit-content;
      }

      .contact-email:hover {
        color: var(--accent-hover);
        text-decoration: underline;
      }

      .timeline-premium {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      .timeline-item-premium {
        border-left: 1px solid var(--border-color);
        padding-left: 1.2rem;
        position: relative;
      }

      .timeline-item-premium::before {
        content: "";
        position: absolute;
        left: -4.5px;
        top: 6px;
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: var(--border-color-glow);
      }

      .timeline-meta-premium {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 0.85rem;
      }

      .timeline-role-premium {
        font-size: 0.8rem;
        font-weight: 600;
        color: var(--text-secondary);
        margin-top: 0.1rem;
      }

      .timeline-desc-premium {
        font-size: 0.75rem;
        color: var(--text-muted);
        margin-top: 0.3rem;
        line-height: 1.5;
      }

      .contact-form-premium {
        display: flex;
        flex-direction: column;
        gap: 0.8rem;
        max-width: 500px;
        width: 100%;
      }

      .contact-form-premium .input-field {
        background-color: var(--bg-surface);
        color: var(--text-primary);
        border: 1px solid var(--border-color);
        border-radius: var(--border-radius-inner);
        padding: 0.65rem 0.85rem;
        font-size: 0.85rem;
        transition: border-color 0.2s;
        width: 100%;
      }

      .contact-form-premium .input-field:focus {
        border-color: var(--border-color-glow);
        outline: none;
      }

      .contact-form-premium textarea.input-field {
        resize: none;
      }

      .btn-primary-premium {
        background: var(--text-primary);
        color: var(--bg-body);
        border: none;
        padding: 0.65rem 1.2rem;
        border-radius: 9999px;
        font-size: 0.85rem;
        font-weight: 600;
        cursor: pointer;
        transition: background 0.2s, transform 0.1s;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
      }

      .btn-primary-premium:hover {
        background: var(--text-secondary);
      }

      .btn-primary-premium:active {
        transform: scale(0.98);
      }

      .right-col-premium {
        display: flex;
        flex-direction: column;
        gap: clamp(1.2rem, 2.5vh, 2rem);
      }

      .projects-header-premium h2 {
        font-size: clamp(1.3rem, 1.8vw, 1.8rem);
        font-weight: 700;
        letter-spacing: -0.02em;
        color: var(--text-primary);
        margin: 0;
      }

      .projects-header-premium p {
        color: var(--text-muted);
        font-size: clamp(0.85rem, 1vw, 0.95rem);
        margin-top: 0.1rem;
      }

      .category-filters-premium {
        display: flex;
        flex-wrap: wrap;
        gap: 0.4rem;
        margin-top: 0.2rem;
      }

      .category-filters-premium button {
        font-size: clamp(0.65rem, 0.8vw, 0.7rem);
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: var(--text-secondary);
        background: var(--bg-surface);
        border: 1px solid var(--border-color);
        padding: 0.25rem 0.8rem;
        border-radius: 40px;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .category-filters-premium button.active {
        border-color: var(--accent);
        color: var(--bg-body);
        background: var(--accent);
      }

      .project-grid-premium {
        display: grid;
        grid-template-columns: 1fr;
        gap: clamp(1rem, 1.5vw, 1.5rem);
      }

      @media (min-width: 640px) {
        .project-grid-premium {
          grid-template-columns: repeat(2, 1fr);
        }
      }

      .project-card-premium {
        background: var(--bg-surface);
        border-radius: var(--radius);
        padding: 1.25rem;
        border: 1px solid var(--border-color);
        box-shadow: var(--shadow-sm);
        transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        display: flex;
        position: relative;
        overflow: hidden;
      }

      .project-card-premium:hover {
        border-color: var(--border-color);
        transform: translateY(-2px);
        box-shadow: var(--shadow);
      }

      .project-card-premium .card-image-premium {
        width: 100%;
        height: 140px;
        object-fit: cover;
        border-radius: var(--radius-inner);
        background: var(--bg-body);
        margin-bottom: 0.3rem;
      }

      .project-card-premium .tag-premium {
        font-size: 0.65rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: var(--accent);
        display: block;
        margin-bottom: 0.1rem;
        background: none !important;
        border: none !important;
        padding: 0;
      }

      .project-card-premium h3 {
        font-size: 1.1rem;
        font-weight: 700;
        margin: 0;
        letter-spacing: -0.01em;
        color: var(--text-primary);
      }

      .project-card-premium .sub-premium {
        font-size: 0.8rem;
        color: var(--text-secondary);
        margin: 0;
        line-height: 1.45;
      }

      .project-card-premium .metric-premium {
        font-size: 0.75rem;
        font-weight: 600;
        color: var(--accent);
        margin-top: 0.2rem;
        background: none !important;
        border: none !important;
        padding: 0;
        display: block;
      }

      .project-card-premium .nda-premium {
        font-size: 0.7rem;
        color: var(--text-muted);
        font-style: italic;
        margin-top: 0.2rem;
        display: block;
      }

      .project-github-premium {
        display: inline-flex;
        align-items: center;
        gap: 0.4rem;
        font-size: 0.75rem;
        font-weight: 600;
        color: var(--accent);
        text-decoration: none;
        transition: color 0.2s;
        margin-top: auto;
        padding-top: 0.4rem;
        width: fit-content;
      }

      .project-github-premium:hover {
        color: var(--accent-hover);
        text-decoration: underline;
      }

      .footer-premium {
        padding: clamp(1.5rem, 3vh, 2rem) 0;
        border-top: 1px solid var(--border-color);
        text-align: center;
        font-size: clamp(0.75rem, 0.8vw, 0.85rem);
        color: var(--text-muted);
        background: var(--bg-body);
        width: 100%;
        margin-top: auto;
      }

      .footer-premium a {
        color: var(--accent);
        text-decoration: none;
        font-weight: 550;
      }

      .footer-premium a:hover {
        text-decoration: underline;
      }

      .footer-premium .dot-premium {
        margin: 0 0.5rem;
        color: var(--border-color);
      }

      .mobile-only {
        display: none !important;
      }

      .desktop-only {
        display: block !important;
      }

      @media (max-width: 768px) {
        .mobile-only {
          display: block !important;
        }
        .desktop-only {
          display: none !important;
        }
      }
    ` }} />
  ), []);

  if (!dbLoaded) {
    return (
      <div className="portfolio-premium-root w-full min-h-screen flex flex-col">
        <nav className="h-16 border-b border-[var(--border-color)] flex items-center">
          <div className="container-premium flex justify-between items-center w-full">
            <div className="h-6 w-32 bg-stone-200 dark:bg-zinc-800 rounded animate-pulse" />
            <div className="h-6 w-20 bg-stone-200 dark:bg-zinc-800 rounded animate-pulse" />
          </div>
        </nav>
        <main className="container-premium py-12 flex-grow">
          <div className="main-grid-premium">
            {/* Left Column Skeleton */}
            <div className="flex flex-col gap-8">
              <div className="flex flex-col gap-4">
                <div className="w-24 h-24 rounded-[28%] bg-stone-200 dark:bg-zinc-800 animate-pulse" />
                <div className="h-10 w-3/4 bg-stone-200 dark:bg-zinc-800 rounded animate-pulse" />
                <div className="h-4 w-1/2 bg-stone-200 dark:bg-zinc-800 rounded animate-pulse" />
              </div>
              <div className="flex flex-col gap-3 mt-4">
                <div className="h-4 w-full bg-stone-200 dark:bg-zinc-800 rounded animate-pulse" />
                <div className="h-4 w-5/6 bg-stone-200 dark:bg-zinc-800 rounded animate-pulse" />
                <div className="h-4 w-4/5 bg-stone-200 dark:bg-zinc-800 rounded animate-pulse" />
              </div>
            </div>
            {/* Right Column Skeleton */}
            <div className="flex flex-col gap-6">
              <div className="h-8 w-40 bg-stone-200 dark:bg-zinc-800 rounded animate-pulse" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                <div className="h-44 bg-stone-200 dark:bg-zinc-800 rounded-xl animate-pulse md:col-span-2" />
                <div className="h-44 bg-stone-200 dark:bg-zinc-800 rounded-xl animate-pulse" />
                <div className="h-44 bg-stone-200 dark:bg-zinc-800 rounded-xl animate-pulse" />
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="flex-grow flex flex-col justify-center items-center bg-stone-50 p-6 min-h-screen text-center text-stone-900">
        <span className="text-4xl">🕵️‍♂️</span>
        <h3 className="text-xl font-bold font-display mt-3">Profile Not Found</h3>
        <p className="text-xs text-stone-400 mt-1">This user account does not exist or has been disabled.</p>
      </div>
    );
  }

  // Lecturer or Owner access validation override
  const isLecturer = currentUser?.role === 'lecturer';
  const isOwner = currentUser?.id === student.id;
  const isPrivate = !activePublicPortfolio || activePublicPortfolio.is_public !== 1;

  if (isPrivate && !isLecturer && !isOwner) {
    return (
      <div className="flex-grow flex flex-col justify-center items-center bg-stone-50 p-6 min-h-screen text-center text-stone-950">
        <svg className="w-12 h-12 text-stone-400 mb-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4M12 15v3" />
        </svg>
        <h3 className="text-xl font-bold font-display">Portfolio Private</h3>
        <p className="text-xs text-stone-500 mt-1">This student portfolio has not been published yet.</p>
      </div>
    );
  }

  // Fetch related datasets
  const portfolioId = activePublicPortfolio?.id || '';
  const projects = db.projects.filter(p => p.portfolio_id === portfolioId);
  const experiences = db.experiences.filter(e => e.portfolio_id === portfolioId);
  const education = db.education.filter(e => e.portfolio_id === portfolioId);

  // Filter projects by category
  const categories = ['all', ...Array.from(new Set(projects.map(p => p.category || 'Other')))];
  const filteredProjects = activeCategory === 'all' 
    ? projects 
    : projects.filter(p => (p.category || 'Other') === activeCategory);

  // Prioritize featured projects at the top of the list
  const sortedProjects = [...filteredProjects].sort((a, b) => (b.featured || 0) - (a.featured || 0));

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setContactError('');
    setContactSuccess(false);

    if (!contactName.trim() || !contactEmail.trim() || !contactMessage.trim()) {
      setContactError('Please complete all contact fields.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(contactEmail.trim())) {
      setContactError('Please enter a valid email address.');
      return;
    }

    addRecruiterMessage(
      student.id,
      contactName.trim(),
      contactEmail.trim(),
      contactMessage.trim()
    );

    setContactSuccess(true);
    setContactName('');
    setContactEmail('');
    setContactMessage('');
    showToast('Message sent! ✉️');
  };

  const sections = profile?.sections || {
    show_skills: true,
    show_projects: true,
    show_experience: true,
    show_education: true,
    show_contact: true,
  };

  const avatarUrl = profile?.avatar || "https://sm.ign.com/ign_ap/cover/a/avatar-gen/avatar-generations_hugw.jpg";
  const firstName = student.name.split(' ')[0] || student.name;
  const roleText = (typingWords && typingWords.length > 0)
    ? typingWords[0]
    : (profile?.major || 'software developer');

  // Helper to highlight static role text
  const renderStaticRole = (text: string) => {
    if (!text) return null;
    let cleaned = text.trim();
    if (cleaned.toLowerCase().startsWith('a ')) {
      cleaned = cleaned.substring(2);
    } else if (cleaned.toLowerCase().startsWith('an ')) {
      cleaned = cleaned.substring(3);
    }
    const words = cleaned.split(' ');
    if (words.length <= 1) {
      return <span className="role-accent">{cleaned}</span>;
    }
    const lastWord = words[words.length - 1];
    const mainPart = words.slice(0, -1).join(' ');
    return (
      <>
        {mainPart} <span className="role-accent">{lastWord}</span>
      </>
    );
  };

  const startsWithVowel = (text: string) => {
    if (!text) return false;
    const firstChar = text.trim().toLowerCase().charAt(0);
    return ['a', 'e', 'i', 'o', 'u'].includes(firstChar);
  };

  return (
    <div 
      className="portfolio-premium-root font-outfit w-full relative overflow-hidden flex flex-col min-h-screen"
      style={{ ...customThemeVars, fontFamily: fontStyleFamily }}
    >
      
      {/* Stylesheet injection */}
      {styleElement}

      {/* Cursor Glow */}
      <div ref={glowRef} className="cursor-glow-premium" id="cursorGlow"></div>

      {/* Mode / Status banner alerts */}
      {isLecturer && (
        <div className="relative z-20 bg-stone-900 text-white text-[10px] font-bold uppercase tracking-wider py-2.5 px-4 flex justify-between items-center shadow-md border-b border-stone-800 w-full">
          <span className="flex items-center gap-1.5">
            <Lock className="size-3 text-amber-500 inline" /> Lecturer Preview Mode {isPrivate && '• Private Content'}
          </span>
          <button
            onClick={() => router.push('/admin')}
            className="px-2.5 py-1 bg-stone-800 hover:bg-stone-900 rounded font-mono text-[9px] font-bold transition-all"
          >
            Admin Portal
          </button>
        </div>
      )}

      {isOwner && isPrivate && !isLecturer && (
        <div className="relative z-20 bg-stone-900 text-white text-[10px] font-bold uppercase tracking-wider py-2.5 px-4 flex justify-between items-center shadow-md border-b border-stone-800 w-full">
          <span className="flex items-center gap-1.5">
            <EyeOff className="size-3 text-amber-500 inline" /> Owner Preview Mode (Private Page Preview)
          </span>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-2.5 py-1 bg-stone-800 hover:bg-stone-900 rounded font-mono text-[9px] font-bold transition-all"
          >
            Dashboard
          </button>
        </div>
      )}

      {/* Toast Alert */}
      {toast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] px-4 py-2.5 bg-stone-900 text-white rounded-full shadow-lg text-xs font-semibold tracking-wide animate-bounce">
          {toast}
        </div>
      )}

      {/* Navigation Header */}
      <nav className="nav-premium">
        <div className="container-premium flex justify-between items-center w-full">
          <div className="logo-premium">
            <span>{firstName}</span>
            <span className="logo-dot-muted">·</span>
            <span className="logo-sub-muted">portfolio</span>
          </div>
          <div className="flex items-center gap-4">
            {profile?.cv_url && (
              <a
                href={formatExternalUrl(profile.cv_url, 'general')}
                target="_blank"
                rel="noreferrer"
                className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-color)] px-3 py-1.5 rounded transition-all flex items-center gap-1.5 hover:bg-[var(--accent-light)]"
              >
                <FileText className="size-3.5 inline" /> CV
              </a>
            )}
            {currentUser && (
              <button
                onClick={() => router.push('/dashboard')}
                className="settings-btn-premium"
                aria-label="Settings"
              >
                <Settings className="size-3.5" />
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Main Grid Content */}
      <main className="main-premium flex-grow">
        <div className="container-premium">
          <div className="main-grid-premium animate-fadeIn">

            {/* Left Column: Profile & Info */}
            <div className="left-col-premium">
              
              {/* Profile Header */}
              <div className="intro-premium">
                {profile?.show_avatar !== false && (
                  <div className="avatar-wrapper mb-6 relative group w-24 h-24 sm:w-28 sm:h-28 shrink-0">
                    <div className="absolute inset-0 bg-gradient-to-tr from-[var(--accent)] to-amber-500 rounded-[28%] rotate-6 opacity-25 group-hover:rotate-12 group-hover:scale-105 transition-all duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-bl from-[var(--accent)] to-indigo-500 rounded-[28%] -rotate-3 opacity-20 group-hover:-rotate-6 group-hover:scale-102 transition-all duration-500" />
                    
                    <div className="relative w-full h-full overflow-hidden rounded-[28%] border-2 border-[var(--border-color)] bg-[var(--bg-card)] group-hover:border-[var(--accent)] group-hover:scale-105 transition-all duration-500 shadow-sm flex items-center justify-center">
                      {profile?.avatar ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={profile.avatar}
                          alt={student.name}
                          className="w-full h-full object-cover scale-100 group-hover:scale-110 transition-transform duration-500"
                          loading="eager"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-tr from-[var(--accent)] to-emerald-600/30 flex items-center justify-center text-white text-3xl font-display font-bold">
                          {firstName.charAt(0)}
                        </div>
                      )}
                    </div>
                  </div>
                )}
                <h1 className="main-title">
                  Hi, I'm {firstName}
                  <span className="role-line">
                    {renderStaticRole(roleText)}
                  </span>
                </h1>
                

                
                <div className="intro-meta-premium">
                  <span className="flex items-center gap-1">
                    <MapPin className="size-3.5 text-[var(--accent)] inline" /> {profile?.location || 'Jakarta'}
                  </span>
                  <span className="flex items-center gap-1">
                    <GraduationCap className="size-3.5 text-[var(--accent)] inline" /> {profile?.university || 'Binus University'}
                  </span>
                  {profile?.hero_badge_text && (
                    <span className="status-meta flex items-center gap-1">
                      <Send className="size-3 text-[var(--accent)] inline" /> {profile.hero_badge_text}
                    </span>
                  )}
                </div>

                {/* Social Links */}
                <div className="intro-social-premium">
                  {profile?.github && (
                    <a href={formatExternalUrl(profile.github, 'github')} target="_blank" rel="noreferrer" aria-label="GitHub">
                      <GithubIcon className="size-4" />
                    </a>
                  )}
                  {profile?.linkedin && (
                    <a href={formatExternalUrl(profile.linkedin, 'linkedin')} target="_blank" rel="noreferrer" aria-label="LinkedIn">
                      <LinkedinIcon className="size-4" />
                    </a>
                  )}
                  {profile?.twitter && (
                    <a href={formatExternalUrl(profile.twitter, 'twitter')} target="_blank" rel="noreferrer" aria-label="X">
                      <TwitterIcon className="size-4" />
                    </a>
                  )}
                  {profile?.website && (
                    <a href={formatExternalUrl(profile.website, 'website')} target="_blank" rel="noreferrer" aria-label="Website">
                      <Globe className="size-4" />
                    </a>
                  )}
                  {profile?.contact_email && (
                    <a href={`mailto:${profile.contact_email}`} aria-label="Email">
                      <Mail className="size-4" />
                    </a>
                  )}
                </div>
              </div>

              {/* About Section */}
              <div className="about-section-premium">
                <p>
                  {profile?.bio || 'Binus University student passionate about building clean, reliable software. I write maintainable backend code and modern interfaces that scale.'}
                </p>
              </div>

              {/* Experience Timeline */}
              {sections.show_experience !== false && experiences.length > 0 && (
                <div className="section-block">
                  <div className="section-label-premium">✦ Experience</div>
                  <div className="timeline-premium">
                    {experiences.map(exp => (
                      <div key={exp.id} className="timeline-item-premium">
                        <div className="timeline-meta-premium">
                          <span className="font-bold text-[var(--text-primary)] text-sm">{exp.company}</span>
                          <span className="text-[var(--text-muted)] font-mono text-[10px]">
                            {new Date(exp.start_date).toLocaleDateString(undefined, { year: 'numeric', month: 'short' })} - {exp.current ? 'Present' : exp.end_date ? new Date(exp.end_date).toLocaleDateString(undefined, { year: 'numeric', month: 'short' }) : ''}
                          </span>
                        </div>
                        <div className="timeline-role-premium">{exp.position}</div>
                        {exp.description && <p className="timeline-desc-premium">{exp.description}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Education list */}
              {sections.show_education !== false && education.length > 0 && (
                <div className="section-block">
                  <div className="section-label-premium">✦ Education</div>
                  <div className="timeline-premium">
                    {education.map(edu => (
                      <div key={edu.id} className="timeline-item-premium">
                        <div className="timeline-meta-premium">
                          <span className="font-bold text-[var(--text-primary)] text-sm">{edu.institution}</span>
                          <span className="text-[var(--text-muted)] font-mono text-[10px]">
                            {new Date(edu.start_date).toLocaleDateString(undefined, { year: 'numeric', month: 'short' })} - {edu.current ? 'Present' : edu.end_date ? new Date(edu.end_date).toLocaleDateString(undefined, { year: 'numeric', month: 'short' }) : ''}
                          </span>
                        </div>
                        <div className="timeline-role-premium">{edu.degree} in {edu.field}</div>
                        {edu.description && <p className="timeline-desc-premium">{edu.description}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Skills Tags */}
              {sections.show_skills !== false && profile?.skills && profile.skills.length > 0 && (
                <div className="section-block">
                  <div className="section-label-premium">+ SKILLS</div>
                  <div className="skills-tags-premium">
                    {profile.skills.map((skill: string) => (
                      <span key={skill}>{skill}</span>
                    ))}
                  </div>
                </div>
              )}



            </div>

            {/* Right Column: Projects */}
            <div className="right-col-premium">
              <div className="projects-header-premium">
                <h2>+ Projects</h2>
                <p>Selected projects I've built and delivered</p>
              </div>



              {/* Projects Grid */}
              <div className="project-grid-premium mt-4">
                {sortedProjects.map((project, index) => {
                  const isFeatured = project.featured === 1;
                  const metrics = project.technologies.filter(tech => tech.includes('%') || (tech.startsWith('+') && !isNaN(parseInt(tech.charAt(1)))));
                  const ndaNotices = project.technologies.filter(tech => tech.toLowerCase().includes('nda'));
                  const regularTechs = project.technologies.filter(tech => !metrics.includes(tech) && !ndaNotices.includes(tech));

                  return (
                    <SpotlightCard
                      key={project.id}
                      isFeatured={isFeatured}
                      cardStyle={themeConfig?.card_style || 'spotlight'}
                      className={isFeatured ? 'sm:col-span-2' : ''}
                    >
                      {project.image && (
                        <div 
                          onClick={() => setSelectedProject(project)}
                          className={`overflow-hidden rounded-xl bg-[var(--bg-body)] border border-[var(--border-color)] shrink-0 cursor-pointer aspect-square ${
                            isFeatured ? 'w-full sm:w-44 md:w-52 h-auto' : 'w-full max-h-56'
                          }`}
                          title="Click to view project details"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img 
                            className="w-full h-full object-cover transition-transform duration-500 group-hover/card:scale-105" 
                            src={project.image} 
                            alt={project.title} 
                            loading="lazy" 
                          />
                        </div>
                      )}
                      <div className="flex-grow flex flex-col justify-between">
                        <div className="flex flex-col gap-2">
                          <div className="flex justify-between items-center">
                            <span className="tag-premium">{project.category || 'PROJECTS'}</span>
                            {isFeatured && (
                              <span className="text-[9px] font-mono font-bold tracking-wider text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full uppercase animate-pulse">
                                ★ Featured
                              </span>
                            )}
                          </div>
                          <h3 
                            onClick={() => setSelectedProject(project)}
                            className="cursor-pointer hover:text-[var(--accent)] transition-colors"
                            title="Click to view project details"
                          >
                            {project.title}
                          </h3>
                          <p className="sub-premium text-xs md:text-sm leading-relaxed">{project.description}</p>
                          
                          {/* Metric Badges */}
                          {metrics.map(metric => (
                            <div key={metric} className="metric-premium animate-fadeIn text-[11px] font-mono flex items-center gap-1.5 mt-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" /> {metric}
                            </div>
                          ))}

                          {/* NDA Notices */}
                          {ndaNotices.map(nda => (
                            <p key={nda} className="nda-premium animate-fadeIn text-[10px] font-mono flex items-center gap-1.5">
                              <Lock className="size-2.5 text-[var(--text-muted)] inline" /> {nda}
                            </p>
                          ))}

                          {/* Regular Technologies */}
                          {regularTechs.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {regularTechs.map(tech => (
                                <span key={tech} className="text-[9px] font-mono text-[var(--text-muted)] bg-[var(--accent-light)] px-1.5 py-0.5 rounded border border-[var(--border-color)]">
                                  {tech}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Project Actions & External Links */}
                        <div className="flex flex-wrap items-center justify-between gap-y-2 gap-x-4 mt-4 pt-2 border-t border-stone-200/30 dark:border-zinc-700/30">
                          {(() => {
                            const projectLinks = project.links && Array.isArray(project.links) && project.links.length > 0
                              ? (project.links as any[])
                              : [
                                  ...(project.github_url ? [{ type: 'github', url: project.github_url, label: '' }] : []),
                                  ...(project.live_url ? [{ type: 'live', url: project.live_url, label: '' }] : [])
                                ];
                            return (
                              <div className="flex flex-wrap gap-x-4 gap-y-2">
                                {projectLinks.map((link, idx) => {
                                  const labelText = link.label || (
                                    link.type === 'github' 
                                      ? 'View on GitHub' 
                                      : link.type === 'live' 
                                      ? 'View Live Demo' 
                                      : 'View Project'
                                  );

                                  return (
                                    <a 
                                      key={idx}
                                      href={formatExternalUrl(link.url, link.type === 'github' ? 'github' : 'general')} 
                                      target="_blank" 
                                      rel="noreferrer" 
                                      className="project-github-premium text-xs font-semibold text-[var(--accent)] hover:text-[var(--accent-hover)] transition-colors flex items-center gap-1.5 w-fit mt-0"
                                    >
                                      {link.type === 'github' ? <GithubIcon className="size-3.5" /> : link.type === 'live' ? <ExternalLink className="size-3.5" /> : <LinkIcon className="size-3.5" />} {labelText} <ArrowRight className="size-3 transition-transform group-hover/card:translate-x-0.5" />
                                    </a>
                                  );
                                })}
                              </div>
                            );
                          })()}

                          <button
                            onClick={() => setSelectedProject(project)}
                            className="text-xs font-semibold text-stone-600 hover:text-[var(--accent)] dark:text-zinc-400 dark:hover:text-[var(--accent)] transition-colors flex items-center gap-1 font-mono hover:underline cursor-pointer active:scale-95 py-1 px-2 rounded hover:bg-stone-100 dark:hover:bg-zinc-800/60"
                          >
                            View Details <Maximize2 className="size-3 inline" />
                          </button>
                        </div>
                      </div>
                    </SpotlightCard>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Recruiter Contact Form */}
          {sections.show_contact !== false && (
            <div className="section-block mt-16 pt-10 border-t border-[var(--border-color)] max-w-xl mx-auto w-full animate-fadeIn">
              <div className="section-label-premium text-center mb-6">+ Send Message</div>
              {contactSuccess ? (
                <div className="p-4 bg-[var(--accent-light)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-lg text-xs font-semibold text-center animate-fadeIn">
                  Message sent successfully! Thank you for getting in touch.
                </div>
              ) : (
                <form onSubmit={handleContactSubmit} className="contact-form-premium mx-auto">
                  {contactError && (
                    <div className="text-[10px] font-bold text-red-600 dark:text-red-400 text-center mb-2">
                      {contactError}
                    </div>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Your Name"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      className="input-field"
                      required
                    />
                    <input
                      type="email"
                      placeholder="Your Email"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      className="input-field"
                      required
                    />
                  </div>
                  <textarea
                    placeholder="Your Message..."
                    rows={4}
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                    className="input-field mt-3"
                    required
                  />
                  <div className="flex justify-center mt-4">
                    <button type="submit" className="btn-primary-premium px-8 py-2.5 flex items-center gap-1.5">
                      Send Message <Send className="size-3.5 inline ml-1" />
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

        </div>
      </main>

      {/* Project Detail Modal */}
      {selectedProject && (
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-black/75 backdrop-blur-md animate-fadeIn"
          onClick={() => setSelectedProject(null)}
        >
          <div 
            className="bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-8 relative flex flex-col gap-5 animate-scaleUp text-[var(--text-primary)] transition-all"
            style={{
              backgroundColor: 'var(--bg-surface)',
              color: 'var(--text-primary)',
              borderColor: 'var(--border-color)',
              fontFamily: fontStyleFamily,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setSelectedProject(null)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[var(--bg-body)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-color)] flex items-center justify-center transition-all hover:scale-105 active:scale-95 z-10 cursor-pointer"
              aria-label="Close Modal"
            >
              ✕
            </button>

            {/* Header Info */}
            <div className="flex flex-col gap-1.5 pr-8">
              <div className="flex items-center gap-2">
                <span className="tag-premium">{selectedProject.category || 'PROJECT'}</span>
                {selectedProject.featured === 1 && (
                  <span className="text-[9px] font-mono font-bold tracking-wider text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full uppercase border border-amber-500/20">
                    ★ Featured
                  </span>
                )}
              </div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight mt-1 text-[var(--text-primary)]">
                {selectedProject.title}
              </h2>
            </div>

            {/* Embedded Media Preview or Project Image Gallery */}
            {selectedProject.embed_url ? (
              <div className="w-full aspect-video rounded-xl overflow-hidden bg-black border border-[var(--border-color)] shadow-inner">
                <iframe
                  src={normalizeEmbedUrl(selectedProject.embed_url)}
                  title={selectedProject.title}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; modals"
                  allowFullScreen
                />
              </div>
            ) : (() => {
              const galleryImages = Array.from(new Set([selectedProject.image, ...(selectedProject.images || [])].filter(Boolean))) as string[];
              if (galleryImages.length === 0) return null;
              const displayImg = activeModalImage || galleryImages[0];

              return (
                <div className="flex flex-col gap-3">
                  <div className="w-full h-56 sm:h-80 rounded-xl overflow-hidden bg-[var(--bg-body)] border border-[var(--border-color)] relative group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src={displayImg} 
                      alt={selectedProject.title} 
                      className="w-full h-full object-cover transition-all duration-300" 
                    />
                  </div>

                  {galleryImages.length > 1 && (
                    <div className="flex flex-col gap-1.5">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--text-muted)]">
                        Visualization Gallery ({galleryImages.length} Pictures)
                      </span>
                      <div className="flex items-center gap-2 overflow-x-auto pb-1.5 pt-0.5">
                        {galleryImages.map((imgUrl, idx) => (
                          <button
                            key={idx}
                            onClick={() => setActiveModalImage(imgUrl)}
                            className={`w-14 h-14 sm:w-16 sm:h-16 rounded-lg overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                              displayImg === imgUrl 
                                ? 'border-[var(--accent)] scale-105 shadow-md' 
                                : 'border-[var(--border-color)] opacity-60 hover:opacity-100'
                            }`}
                            title={`View picture ${idx + 1}`}
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={imgUrl} alt={`Visualization ${idx + 1}`} className="w-full h-full object-cover" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Detailed Description */}
            <div className="flex flex-col gap-2 border-t border-[var(--border-color)] pt-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] font-mono">
                Project Overview & Detailed Explanation
              </h4>
              {selectedProject.detailed_description ? (
                <div className="flex flex-col gap-3">
                  {selectedProject.description && (
                    <div className="text-xs font-medium text-[var(--text-secondary)] italic bg-[var(--bg-body)] p-3 rounded-lg border border-[var(--border-color)]">
                      "{selectedProject.description}"
                    </div>
                  )}
                  <p className="text-xs sm:text-sm text-[var(--text-primary)] opacity-90 leading-relaxed whitespace-pre-line">
                    {selectedProject.detailed_description}
                  </p>
                </div>
              ) : (
                <p className="text-xs sm:text-sm text-[var(--text-primary)] opacity-90 leading-relaxed whitespace-pre-line">
                  {selectedProject.description}
                </p>
              )}
            </div>

            {/* Key Metrics / NDA */}
            {(() => {
              const metrics = (selectedProject.technologies || []).filter((t: string) => t.includes('%') || (t.startsWith('+') && !isNaN(parseInt(t.charAt(1)))));
              const ndaNotices = (selectedProject.technologies || []).filter((t: string) => t.toLowerCase().includes('nda'));
              return (metrics.length > 0 || ndaNotices.length > 0) && (
                <div className="flex flex-col gap-2 bg-[var(--bg-body)] p-3.5 rounded-xl border border-[var(--border-color)]">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] font-mono">
                    Key Impact & Requirements
                  </h4>
                  <div className="flex flex-wrap gap-3">
                    {metrics.map((metric: string) => (
                      <div key={metric} className="text-xs font-mono font-semibold text-[var(--accent)] flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[var(--accent)]" /> {metric}
                      </div>
                    ))}
                    {ndaNotices.map((nda: string) => (
                      <div key={nda} className="text-xs font-mono text-[var(--text-muted)] flex items-center gap-1.5 italic">
                        <Lock className="size-3 inline" /> {nda}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}

            {/* Tools, Skills & Technologies */}
            {selectedProject.technologies && selectedProject.technologies.length > 0 && (
              <div className="flex flex-col gap-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] font-mono">
                  Tools, Skills & Technologies
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {selectedProject.technologies.map((tech: string) => (
                    <span 
                      key={tech} 
                      className="text-xs font-mono text-[var(--accent)] bg-[var(--accent-light)] px-2.5 py-1 rounded-md border border-[var(--border-color)]"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Modal Actions Footer */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-[var(--border-color)] mt-2">
              <div className="flex flex-wrap gap-3">
                {(() => {
                  const projectLinks = selectedProject.links && Array.isArray(selectedProject.links) && selectedProject.links.length > 0
                    ? (selectedProject.links as any[])
                    : [
                        ...(selectedProject.github_url ? [{ type: 'github', url: selectedProject.github_url, label: '' }] : []),
                        ...(selectedProject.live_url ? [{ type: 'live', url: selectedProject.live_url, label: '' }] : [])
                      ];
                  return projectLinks.map((link, idx) => {
                    const labelText = link.label || (link.type === 'github' ? 'GitHub Repository' : link.type === 'live' ? 'Live Demo' : 'Visit Link');
                    return (
                      <a
                        key={idx}
                        href={formatExternalUrl(link.url, link.type === 'github' ? 'github' : 'general')}
                        target="_blank"
                        rel="noreferrer"
                        className="px-4 py-2 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-xs font-semibold rounded-xl transition-all shadow-sm flex items-center gap-2 active:scale-95"
                      >
                        {link.type === 'github' ? <GithubIcon className="size-3.5" /> : link.type === 'live' ? <ExternalLink className="size-3.5" /> : <LinkIcon className="size-3.5" />} {labelText}
                      </a>
                    );
                  });
                })()}
              </div>

              <button
                onClick={() => setSelectedProject(null)}
                className="px-4 py-2 bg-[var(--bg-body)] hover:opacity-80 text-[var(--text-primary)] border border-[var(--border-color)] text-xs font-semibold rounded-xl transition-all active:scale-95 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="footer-premium">
        <div className="container-premium flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-1.5 sm:gap-3">
            <span>© COPYRIGHT 2026 {student.name.toUpperCase()}</span>
            {profile?.contact_email && (
              <>
                <span className="dot-premium hidden sm:inline">·</span>
                <a href={`mailto:${profile.contact_email}`}>{profile.contact_email}</a>
              </>
            )}
          </div>
          <div className="flex items-center gap-4 text-xs">
            <a href="#privacy" className="hover:underline transition-all">Privacy Policy</a>
            <span className="text-[var(--border-color)]">·</span>
            <a href="#terms" className="hover:underline transition-all">Terms of Service</a>
            <span className="text-[var(--border-color)]">·</span>
            <a href="#recruiter-guidelines" className="hover:underline transition-all">Guidelines</a>
          </div>
        </div>
      </footer>

    </div>
  );
}
