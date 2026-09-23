// Типы для данных резюме и игрового мира (v1.0 — рельсовая архитектура)
export interface ResumeData {
  basics: Basics;
  roles: Record<string, Role>;
  work: WorkExperience[];
  scenes: Record<string, SceneConfig>;
  achievements: Achievement[];
}

export interface Basics {
  name: string;
  label: string;
  summary: string;
  totals: {
    documents: number;
    projects: number;
    budget: number;
    users: number;
    regions: number;
    experience: string;
  };
  contacts: {
    phone?: string;
    telegram?: string;
    hh?: string;
    email?: string;
    pdf?: string;
  };
  location?: {
    city?: string;
    country?: string;
  };
}

export interface Role {
  id: string;
  label: string;
  description: string;
  sceneOrder: string[];
  focusMetrics: string[];
}

export interface WorkExperience {
  id: string;
  name: string;
  position: string;
  startDate?: string;
  endDate?: string;
  summary: string;
  metrics?: Record<string, number | string>;
  game: {
    position: [number, number, number];
    theme: string;
    size: number;
    model: string;
    scenes?: string[];
  };
}

export interface SceneConfig {
  id: string;
  title: string;
  building: string;
  duration: number;
  maxScore: number;
  description: string;
  metrics?: {
    label: string;
    value?: string;
    formula?: string;
    unit?: string;
  };
}

export interface Achievement {
  id: string;
  icon: string;
  name: string;
  condition: string;
}

export interface GameState {
  currentScene: string | null;
  sceneIndex: number;
  totalScenes: number;
  score: number;
  sceneScores: Record<string, number>;
  achievements: string[];
  startTime: number;
  endTime: number | null;
  role: string | null;
}
