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
  description: string | null;
  is_public: number;
  theme: string;
  theme_config?: ThemeConfig | null;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  portfolio_id: string;
  title: string;
  description: string | null;
  detailed_description?: string | null;
  image: string | null;
  images?: string[];
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
