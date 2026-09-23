// Типы для данных резюме и игрового мира
export interface ResumeData {
  basics: Basics;
  work: WorkExperience[];
  skills: Skill[];
  abilities: Ability[];
  worldConfig: WorldConfig;
}

export interface Basics {
  name: string;
  label: string;
  image?: string;
  email?: string;
  phone?: string;
  url?: string;
  summary: string;
  location?: {
    city?: string;
    region?: string;
    country?: string;
  };
}

export interface WorkExperience {
  id: string;
  name: string;
  position: string;
  url?: string;
  startDate?: string;
  endDate?: string;
  summary: string;
  highlights?: string[];
  metrics?: Record<string, string | number>;
  worldPosition: Vector3;
  buildingTheme: string;
  buildingScale?: Vector3;
  scenario?: Scenario;
}

export interface Scenario {
  title: string;
  description: string;
  abilities: string[];
  steps: ScenarioStep[];
}

export interface ScenarioStep {
  id: string;
  text: string;
  type: 'collect' | 'connect' | 'analyze' | 'launch';
}

export interface Skill {
  id: string;
  name: string;
  level: number;
  category: string;
  abilityMapping?: string;
}

export interface Ability {
  id: string;
  name: string;
  description: string;
  icon: string;
  hotkey: string;
  cooldown: number;
  duration: number;
  color: string;
}

export interface WorldConfig {
  hubPosition: Vector3;
  groundSize: number;
  skyColor?: string;
  ambientLight?: number;
  directionalLight?: number;
  districts: District[];
}

export interface District {
  id: string;
  name: string;
  description?: string;
  center: Vector3;
  color?: string;
}

export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

// Диалоги
export interface DialogueData {
  npcs: NPC[];
}

export interface NPC {
  id: string;
  name: string;
  avatar: string;
  location: string;
  dialogueTree: Record<string, DialogueNode>;
}

export interface DialogueNode {
  text: string;
  choices: DialogueChoice[];
}

export interface DialogueChoice {
  text: string;
  next: string;
}

// Игровое состояние
export interface GameState {
  currentDistrict: string | null;
  currentBuilding: string | null;
  activeAbility: string | null;
  completedScenarios: string[];
  unlockedAbilities: string[];
  metrics: Record<string, number>;
}
