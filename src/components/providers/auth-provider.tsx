'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { signIn, signOut } from 'next-auth/react';

export interface User {
  id: string;
  name: string;
  role: 'student' | 'lecturer';
  username: string;
  email: string;
}

interface AuthContextType {
  currentUser: User | null;
  isLoggedIn: boolean;
  authLoading: boolean;
  login: (username: string, pass: string, onLoginSuccess: (user: User) => Promise<void>) => Promise<boolean>;
  logout: () => Promise<void>;
  setCurrentUser: React.Dispatch<React.SetStateAction<User | null>>;
  setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [authLoading, setAuthLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const sessionRes = await fetch('/api/auth/session');
        if (sessionRes.ok) {
          const session = await sessionRes.json();
          if (session?.user) {
            setIsLoggedIn(true);
            setCurrentUser(session.user);
            localStorage.setItem('portfolio_hub_auth', 'true');
            localStorage.setItem('portfolio_hub_user', JSON.stringify(session.user));
          }
        }
      } catch (e) {
        console.error('Session loading failed', e);
      } finally {
        setAuthLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (username: string, pass: string, onLoginSuccess: (user: User) => Promise<void>): Promise<boolean> => {
    try {
      const res = await signIn('credentials', {
        redirect: false,
        username,
        password: pass,
      });

      if (res?.error) {
        return false;
      }

      const sessionRes = await fetch('/api/auth/session');
      if (sessionRes.ok) {
        const session = await sessionRes.json();
        if (session?.user) {
          setIsLoggedIn(true);
          setCurrentUser(session.user);
          localStorage.setItem('portfolio_hub_auth', 'true');
          localStorage.setItem('portfolio_hub_user', JSON.stringify(session.user));
          await onLoginSuccess(session.user);
          return true;
        }
      }
      return false;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  const logout = async () => {
    await signOut({ redirect: false });
    setIsLoggedIn(false);
    setCurrentUser(null);
    localStorage.removeItem('portfolio_hub_auth');
    localStorage.removeItem('portfolio_hub_user');
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isLoggedIn,
        authLoading,
        login,
        logout,
        setCurrentUser,
        setIsLoggedIn,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
