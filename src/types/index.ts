export interface User {
  id: string;
  email: string;
  name: string;
  password: string;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  user_id: string;
  bio: string | null;
  avatar: string | null;
  major: string | null;
  university: string | null;
  location: string | null;
  skills: string | null;
  github: string | null;
  linkedin: string | null;
  twitter: string | null;
  website: string | null;
  created_at: string;
  updated_at: string;
}

export interface Portfolio {
  id: string;
  user_id: string;
  title: string;
  slug: string;
  description: string | null;
  is_public: number;
  theme: string;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  portfolio_id: string;
  title: string;
  description: string | null;
  image: string | null;
  github_url: string | null;
  live_url: string | null;
  technologies: string | null;
  featured: number;
  created_at: string;
  updated_at: string;
  links?: { type: string; url: string; label?: string }[];
}

export interface Education {
  id: string;
  portfolio_id: string;
  institution: string;
  degree: string;
  field: string | null;
  start_date: string;
  end_date: string | null;
  current: number;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface Experience {
  id: string;
  portfolio_id: string;
  company: string;
  position: string;
  location: string | null;
  start_date: string;
  end_date: string | null;
  current: number;
  description: string | null;
  created_at: string;
  updated_at: string;
}

import type { DefaultSession, DefaultUser } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: DefaultSession['user'] & {
      id: string;
    };
  }

  interface User extends DefaultUser {
    id: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string;
  }
}