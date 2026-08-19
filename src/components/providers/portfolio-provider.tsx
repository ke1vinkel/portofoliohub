'use client';

import React, { createContext, useContext } from 'react';
import { ThemeProvider, useTheme } from './theme-provider';
import { AuthProvider, useAuth, User } from './auth-provider';
import { DatabaseProvider, useDatabase, SimulatedDatabase, Profile, Portfolio, Project, ProjectLink, Education, Experience, RecruiterMessage, ThemeConfig } from './db-provider';

export type { User, Profile, Portfolio, Project, ProjectLink, Education, Experience, RecruiterMessage, SimulatedDatabase, ThemeConfig };

interface PortfolioContextType {
  db: SimulatedDatabase;
  dbLoaded: boolean;
  authLoading: boolean;
  isLoggedIn: boolean;
  currentUser: User | null;
  activePortfolioId: string | null;
  theme: 'light' | 'dark';
  login: (username: string, pass: string) => Promise<boolean>;
  logout: () => Promise<void>;
  toggleTheme: () => void;
  addPortfolio: (title: string, description: string, isPublic: boolean) => Promise<string>;
  updatePortfolio: (id: string, title: string, description: string, isPublic: boolean, themeConfig?: ThemeConfig | null) => Promise<void>;
  deletePortfolio: (id: string) => Promise<void>;
  setActivePortfolio: (id: string) => void;
  togglePortfolioPublicStatus: (id: string) => Promise<void>;
  addProject: (portfolioId: string, project: Omit<Project, 'id' | 'portfolio_id' | 'created_at'>) => Promise<boolean>;
  updateProject: (id: string, project: Partial<Project>) => Promise<boolean>;
  deleteProject: (id: string) => Promise<boolean>;
  addExperience: (portfolioId: string, exp: Omit<Experience, 'id' | 'portfolio_id'>) => Promise<void>;
  updateExperience: (id: string, exp: Partial<Experience>) => Promise<void>;
  deleteExperience: (id: string) => Promise<void>;
  addEducation: (portfolioId: string, edu: Omit<Education, 'id' | 'portfolio_id'>) => Promise<void>;
  updateEducation: (id: string, edu: Partial<Education>) => Promise<void>;
  deleteEducation: (id: string) => Promise<void>;
  updateProfile: (userId: string, profileData: Partial<Profile>) => Promise<void>;
  addRecruiterMessage: (studentId: string, name: string, email: string, message: string) => Promise<void>;
  deleteRecruiterMessage: (id: string) => Promise<void>;
  hasUnsavedChanges: boolean;
  setHasUnsavedChanges: (val: boolean) => void;
}

const PortfolioContext = createContext<PortfolioContextType | undefined>(undefined);

const PortfolioContextAggregator: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { resolvedTheme, setTheme } = useTheme();
  const theme = (resolvedTheme === 'dark' ? 'dark' : 'light') as 'light' | 'dark';
  const toggleTheme = () => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  const { currentUser, isLoggedIn, authLoading, login: authLogin, logout } = useAuth();
  const {
    db,
    dbLoaded,
    activePortfolioId,
    hasUnsavedChanges,
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
    addExperience,
    updateExperience,
    deleteExperience,
    addEducation,
    updateEducation,
    deleteEducation,
    updateProfile,
    addRecruiterMessage,
    deleteRecruiterMessage,
  } = useDatabase();

  const login = async (username: string, pass: string) => {
    return authLogin(username, pass, async (user) => {
      await refreshDb();
    });
  };

  return (
    <PortfolioContext.Provider
      value={{
        db,
        dbLoaded,
        authLoading,
        isLoggedIn,
        currentUser,
        activePortfolioId,
        theme,
        login,
        logout,
        toggleTheme,
        addPortfolio,
        updatePortfolio,
        deletePortfolio,
        setActivePortfolio,
        togglePortfolioPublicStatus,
        addProject,
        updateProject,
        deleteProject,
        addExperience,
        updateExperience,
        deleteExperience,
        addEducation,
        updateEducation,
        deleteEducation,
        updateProfile,
        addRecruiterMessage,
        deleteRecruiterMessage,
        hasUnsavedChanges,
        setHasUnsavedChanges,
      }}
    >
      {children}
    </PortfolioContext.Provider>
  );
};

export const PortfolioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <AuthProvider>
      <DatabaseProvider>
        <PortfolioContextAggregator>{children}</PortfolioContextAggregator>
      </DatabaseProvider>
    </AuthProvider>
  );
};

export const usePortfolio = () => {
  const context = useContext(PortfolioContext);
  if (context === undefined) {
    throw new Error('usePortfolio must be used within a PortfolioProvider');
  }
  return context;
};
