'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './auth-provider';
import { getRawGitHubUrl, normalizeEmbedUrl } from '@/lib/utils';

export interface Profile {
  user_id: string;
  bio: string;
  avatar: string;
  show_avatar: boolean;
  major: string;
  university: string;
  location: string;
  skills: string[];
  skill_descriptions: Record<string, string>;
  github: string;
  linkedin: string;
  twitter: string;
  website: string;
  github_type: string;
  linkedin_type: string;
  twitter_type: string;
  website_type: string;
  typing_words: string[];
  typing_speed: number;
  typing_delete_speed: number;
  typing_pause_duration: number;
  hero_badge_text: string;
  custom_domain: string;
  sections: {
    show_skills: boolean;
    show_projects: boolean;
    show_experience: boolean;
    show_education: boolean;
    show_contact: boolean;
  };
  [key: string]: any;
}

export interface ThemeConfig {
  preset?: string;
  bg_color?: string;
  surface_color?: string;
  text_color?: string;
  accent_color?: string;
  font_style?: 'sans' | 'serif' | 'mono' | 'display';
  card_style?: 'spotlight' | 'minimal' | 'glass' | 'bento';
}

export interface Portfolio {
  id: string;
  user_id: string;
  title: string;
  slug: string;
  description: string;
  is_public: number;
  theme_config?: ThemeConfig | null;
  created_at: string;
  updated_at: string;
}

export interface ProjectLink {
  type: 'github' | 'live' | 'custom';
  url: string;
  label?: string;
}

export interface Project {
  id: string;
  portfolio_id: string;
  title: string;
  description: string;
  detailed_description?: string | null;
  image: string | null;
  images?: string[];
  github_url: string | null;
  live_url: string | null;
  technologies: string[];
  featured: number;
  created_at: string;
  link_type: 'github' | 'live' | 'custom' | 'none';
  category: string;
  embed_url: string;
  links?: ProjectLink[];
}

export interface Education {
  id: string;
  portfolio_id: string;
  institution: string;
  degree: string;
  field: string;
  start_date: string;
  end_date: string | null;
  current: number;
  description: string;
}

export interface Experience {
  id: string;
  portfolio_id: string;
  company: string;
  position: string;
  location: string;
  start_date: string;
  end_date: string | null;
  current: number;
  description: string;
}

export interface RecruiterMessage {
  id: string;
  student_id: string;
  name: string;
  email: string;
  message: string;
  created_at: string;
}

export interface SimulatedDatabase {
  users: any[];
  profiles: Record<string, Profile>;
  portfolios: Portfolio[];
  projects: Project[];
  education: Education[];
  experiences: Experience[];
  messages: RecruiterMessage[];
}

interface DatabaseContextType {
  db: SimulatedDatabase;
  dbLoaded: boolean;
  activePortfolioId: string | null;
  hasUnsavedChanges: boolean;
  setActivePortfolioId: React.Dispatch<React.SetStateAction<string | null>>;
  setHasUnsavedChanges: (val: boolean) => void;
  refreshDb: () => Promise<void>;
  setActivePortfolio: (id: string) => void;
  addPortfolio: (title: string, description: string, isPublic: boolean) => Promise<string>;
  updatePortfolio: (id: string, title: string, description: string, isPublic: boolean, themeConfig?: ThemeConfig | null) => Promise<void>;
  deletePortfolio: (id: string) => Promise<void>;
  togglePortfolioPublicStatus: (id: string) => Promise<void>;
  addProject: (portfolioId: string, project: Omit<Project, 'id' | 'portfolio_id' | 'created_at'>) => Promise<boolean>;
  updateProject: (id: string, project: Partial<Project>) => Promise<boolean>;
  deleteProject: (id: string) => Promise<boolean>;
  toggleProjectInPortfolio: (project: Project, targetPortfolioId: string, shouldShow: boolean) => Promise<boolean>;
  syncProjectPortfolios: (projectData: any, selectedPortfolioIds: string[], originalProject?: Project | null) => Promise<boolean>;
  addExperience: (portfolioId: string, exp: Omit<Experience, 'id' | 'portfolio_id'>) => Promise<void>;
  updateExperience: (id: string, exp: Partial<Experience>) => Promise<void>;
  deleteExperience: (id: string) => Promise<void>;
  addEducation: (portfolioId: string, edu: Omit<Education, 'id' | 'portfolio_id'>) => Promise<void>;
  updateEducation: (id: string, edu: Partial<Education>) => Promise<void>;
  deleteEducation: (id: string) => Promise<void>;
  updateProfile: (userId: string, profileData: Partial<Profile>) => Promise<void>;
  addRecruiterMessage: (studentId: string, name: string, email: string, message: string) => Promise<void>;
  deleteRecruiterMessage: (id: string) => Promise<void>;
}

const INITIAL_DB: SimulatedDatabase = {
  users: [],
  profiles: {},
  portfolios: [],
  projects: [],
  education: [],
  experiences: [],
  messages: [],
};

const DatabaseContext = createContext<DatabaseContextType | undefined>(undefined);

export const DatabaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const [db, setDb] = useState<SimulatedDatabase>(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem('portfolio_hub_db');
        if (cached) return JSON.parse(cached);
      } catch (e) {
        // Fallback to initial DB on error
      }
    }
    return INITIAL_DB;
  });
  const [dbLoaded, setDbLoaded] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      try {
        return !!localStorage.getItem('portfolio_hub_db');
      } catch (e) {
        return false;
      }
    }
    return false;
  });
  const [activePortfolioId, setActivePortfolioId] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);

  const apiFetch = async (path: string, options: RequestInit = {}) => {
    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    } as Record<string, string>;

    return fetch(path, {
      ...options,
      headers,
    });
  };

  const refreshDb = async () => {
    try {
      const res = await apiFetch('/api/db');
      if (res.ok) {
        const data = await res.json();
        setDb(data);
        if (typeof window !== 'undefined') {
          localStorage.setItem('portfolio_hub_db', JSON.stringify(data));
        }
      }
    } catch (e) {
      console.error('Failed to sync DB from PostgreSQL:', e);
    } finally {
      setDbLoaded(true);
    }
  };

  useEffect(() => {
    refreshDb();
  }, []);

  // Sync active portfolio based on currentUser
  useEffect(() => {
    if (currentUser) {
      const savedActive = localStorage.getItem(`active_portfolio_${currentUser.id}`);
      if (savedActive) {
        setActivePortfolioId(savedActive);
      } else if (db.portfolios.length > 0) {
        const userPortfolios = db.portfolios.filter(p => (p.user_id || (p as any).user) === currentUser.id);
        const publicPort = userPortfolios.find(p => p.is_public === 1) || userPortfolios[0];
        if (publicPort) {
          setActivePortfolioId(publicPort.id);
          localStorage.setItem(`active_portfolio_${currentUser.id}`, publicPort.id);
        }
      }
    } else {
      setActivePortfolioId(null);
    }
  }, [currentUser, db.portfolios]);

  const setActivePortfolio = (id: string) => {
    if (!currentUser) return;
    setActivePortfolioId(id);
    localStorage.setItem(`active_portfolio_${currentUser.id}`, id);
  };

  const addPortfolio = async (title: string, description: string, isPublic: boolean): Promise<string> => {
    if (!currentUser) return '';
    try {
      const res = await apiFetch('/api/portfolios', {
        method: 'POST',
        body: JSON.stringify({ title, description, is_public: isPublic ? 1 : 0 }),
      });
      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Failed to create portfolio: ${res.statusText || res.status} - ${errText}`);
      }
      const data = await res.json();
      await refreshDb();
      if (isPublic) {
        setActivePortfolioId(data.id);
        localStorage.setItem(`active_portfolio_${currentUser.id}`, data.id);
      }
      return data.id;
    } catch (e) {
      console.error('Error creating portfolio:', e);
      throw e;
    }
  };

  const updatePortfolio = async (id: string, title: string, description: string, isPublic: boolean, themeConfig?: ThemeConfig | null) => {
    if (!currentUser) return;
    try {
      const res = await apiFetch(`/api/portfolios/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ title, description, is_public: isPublic ? 1 : 0, theme_config: themeConfig }),
      });
      if (res.ok) {
        await refreshDb();
        if (isPublic) {
          setActivePortfolioId(id);
          localStorage.setItem(`active_portfolio_${currentUser.id}`, id);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const deletePortfolio = async (id: string) => {
    if (!currentUser) return;
    try {
      const res = await apiFetch(`/api/portfolios/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        if (activePortfolioId === id) {
          const remaining = db.portfolios.filter(p => p.id !== id && (p.user_id || (p as any).user) === currentUser.id);
          const nextActive = remaining.find(p => p.is_public === 1) || remaining[0] || null;
          const nextActiveId = nextActive ? nextActive.id : null;
          setActivePortfolioId(nextActiveId);
          if (nextActiveId) {
            localStorage.setItem(`active_portfolio_${currentUser.id}`, nextActiveId);
          } else {
            localStorage.removeItem(`active_portfolio_${currentUser.id}`);
          }
        }
        await refreshDb();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const togglePortfolioPublicStatus = async (id: string) => {
    if (!currentUser) return;
    const portfolio = db.portfolios.find(p => p.id === id);
    if (!portfolio) return;
    const newPublicStatus = portfolio.is_public === 1 ? 0 : 1;
    await updatePortfolio(id, portfolio.title, portfolio.description || '', newPublicStatus === 1);
  };

  const addProject = async (portfolioId: string, project: Omit<Project, 'id' | 'portfolio_id' | 'created_at'>): Promise<boolean> => {
    try {
      const res = await apiFetch('/api/projects', {
        method: 'POST',
        body: JSON.stringify({
          portfolio: portfolioId,
          portfolio_id: portfolioId,
          ...project,
          image: project.image ? getRawGitHubUrl(project.image) : null,
          images: Array.isArray(project.images) ? project.images.map(img => getRawGitHubUrl(img)) : [],
          embed_url: normalizeEmbedUrl(project.embed_url),
        }),
      });
      if (res.ok) {
        await refreshDb();
        return true;
      }
      const errText = await res.text();
      console.error('Failed to add project:', res.status, errText);
      return false;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  const updateProject = async (id: string, project: Partial<Project>): Promise<boolean> => {
    try {
      const res = await apiFetch('/api/projects', {
        method: 'PUT',
        body: JSON.stringify({
          id,
          ...project,
          image: project.image !== undefined ? (project.image ? getRawGitHubUrl(project.image) : null) : undefined,
          images: project.images !== undefined ? (Array.isArray(project.images) ? project.images.map(img => getRawGitHubUrl(img)) : []) : undefined,
          embed_url: project.embed_url !== undefined ? normalizeEmbedUrl(project.embed_url) : undefined,
        }),
      });
      if (res.ok) {
        await refreshDb();
        return true;
      }
      const errText = await res.text();
      console.error('Failed to update project:', res.status, errText);
      return false;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  const deleteProject = async (id: string): Promise<boolean> => {
    try {
      const res = await apiFetch(`/api/projects?id=${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        await refreshDb();
        return true;
      }
      return false;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  const toggleProjectInPortfolio = async (
    project: Project,
    targetPortfolioId: string,
    shouldShow: boolean
  ): Promise<boolean> => {
    try {
      if (shouldShow) {
        // Check if project already in target portfolio
        const existing = db.projects.find(
          (p) => p.portfolio_id === targetPortfolioId && (p.id === project.id || p.title.trim().toLowerCase() === project.title.trim().toLowerCase())
        );
        if (!existing) {
          return await addProject(targetPortfolioId, {
            title: project.title,
            description: project.description || '',
            detailed_description: project.detailed_description,
            image: project.image,
            images: project.images || [],
            github_url: project.github_url,
            live_url: project.live_url,
            technologies: project.technologies || [],
            featured: project.featured || 0,
            link_type: project.link_type || 'none',
            category: project.category || 'Other',
            embed_url: project.embed_url || '',
            links: project.links || [],
          });
        }
        return true;
      } else {
        // Remove from target portfolio
        const match = db.projects.find(
          (p) => p.portfolio_id === targetPortfolioId && (p.id === project.id || p.title.trim().toLowerCase() === project.title.trim().toLowerCase())
        );
        if (match) {
          return await deleteProject(match.id);
        }
        return true;
      }
    } catch (e) {
      console.error('Error toggling project in portfolio:', e);
      return false;
    }
  };

  const syncProjectPortfolios = async (
    projectData: any,
    selectedPortfolioIds: string[],
    originalProject?: Project | null
  ): Promise<boolean> => {
    if (!currentUser) return false;
    try {
      const userPortfolios = db.portfolios.filter(
        (p) => (p.user_id || (p as any).user) === currentUser.id
      );
      const userPortfolioIds = userPortfolios.map((p) => p.id);

      // 1. For every selected portfolio, add or update the project
      for (const portId of selectedPortfolioIds) {
        const existing = db.projects.find(
          (p) => p.portfolio_id === portId && (
            (originalProject && p.id === originalProject.id) ||
            (originalProject && p.title.trim().toLowerCase() === originalProject.title.trim().toLowerCase()) ||
            p.title.trim().toLowerCase() === projectData.title.trim().toLowerCase()
          )
        );

        if (existing) {
          await updateProject(existing.id, {
            ...projectData,
            portfolio_id: portId,
          });
        } else {
          await addProject(portId, projectData);
        }
      }

      // 2. For unselected user portfolios, if this project previously existed there, remove it
      if (originalProject) {
        const unselectedIds = userPortfolioIds.filter((id) => !selectedPortfolioIds.includes(id));
        for (const unselectedId of unselectedIds) {
          const toRemove = db.projects.find(
            (p) => p.portfolio_id === unselectedId && (
              p.id === originalProject.id ||
              p.title.trim().toLowerCase() === originalProject.title.trim().toLowerCase()
            )
          );
          if (toRemove) {
            await deleteProject(toRemove.id);
          }
        }
      }

      return true;
    } catch (err) {
      console.error('Error syncing project portfolios:', err);
      return false;
    }
  };

  const addExperience = async (portfolioId: string, exp: Omit<Experience, 'id' | 'portfolio_id'>) => {
    try {
      const res = await apiFetch('/api/experiences', {
        method: 'POST',
        body: JSON.stringify({
          portfolio_id: portfolioId,
          ...exp,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to add experience');
      }
      await refreshDb();
    } catch (e) {
      console.error(e);
      throw e;
    }
  };

  const updateExperience = async (id: string, exp: Partial<Experience>) => {
    try {
      const res = await apiFetch('/api/experiences', {
        method: 'PUT',
        body: JSON.stringify({
          id,
          ...exp,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to update experience');
      }
      await refreshDb();
    } catch (e) {
      console.error(e);
      throw e;
    }
  };

  const deleteExperience = async (id: string) => {
    try {
      const res = await apiFetch(`/api/experiences?id=${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to delete experience');
      }
      await refreshDb();
    } catch (e) {
      console.error(e);
      throw e;
    }
  };

  const addEducation = async (portfolioId: string, edu: Omit<Education, 'id' | 'portfolio_id'>) => {
    try {
      const res = await apiFetch('/api/education', {
        method: 'POST',
        body: JSON.stringify({
          portfolio_id: portfolioId,
          ...edu,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to add education');
      }
      await refreshDb();
    } catch (e) {
      console.error(e);
      throw e;
    }
  };

  const updateEducation = async (id: string, edu: Partial<Education>) => {
    try {
      const res = await apiFetch('/api/education', {
        method: 'PUT',
        body: JSON.stringify({
          id,
          ...edu,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to update education');
      }
      await refreshDb();
    } catch (e) {
      console.error(e);
      throw e;
    }
  };

  const deleteEducation = async (id: string) => {
    try {
      const res = await apiFetch(`/api/education?id=${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to delete education');
      }
      await refreshDb();
    } catch (e) {
      console.error(e);
      throw e;
    }
  };

  const updateProfile = async (userId: string, profileData: Partial<Profile>) => {
    try {
      const res = await apiFetch('/api/profile', {
        method: 'PUT',
        body: JSON.stringify({
          ...profileData,
          avatar: profileData.avatar !== undefined ? (profileData.avatar ? getRawGitHubUrl(profileData.avatar) : '') : undefined,
        }),
      });
      if (res.ok) {
        await refreshDb();
      } else {
        const errJson = await res.json().catch(() => ({}));
        console.error('Failed to update profile:', errJson.error || res.statusText);
      }
    } catch (e) {
      console.error('Network or server error updating profile:', e);
    }
  };

  const addRecruiterMessage = async (studentId: string, name: string, email: string, message: string) => {
    try {
      const res = await apiFetch('/api/messages', {
        method: 'POST',
        body: JSON.stringify({
          student_id: studentId,
          name,
          email,
          message,
        }),
      });
      if (res.ok) {
        await refreshDb();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const deleteRecruiterMessage = async (id: string) => {
    try {
      const res = await apiFetch(`/api/messages?id=${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        await refreshDb();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <DatabaseContext.Provider
      value={{
        db,
        dbLoaded,
        activePortfolioId,
        hasUnsavedChanges,
        setActivePortfolioId,
        setHasUnsavedChanges,
        refreshDb,
        setActivePortfolio,
        addPortfolio,
        updatePortfolio,
        deletePortfolio,
        togglePortfolioPublicStatus,
        addProject,
        updateProject,
        deleteProject,
        toggleProjectInPortfolio,
        syncProjectPortfolios,
        addExperience,
        updateExperience,
        deleteExperience,
        addEducation,
        updateEducation,
        deleteEducation,
        updateProfile,
        addRecruiterMessage,
        deleteRecruiterMessage,
      }}
    >
      {children}
    </DatabaseContext.Provider>
  );
};

export const useDatabase = () => {
  const context = useContext(DatabaseContext);
  if (!context) {
    throw new Error('useDatabase must be used within a DatabaseProvider');
  }
  return context;
};
