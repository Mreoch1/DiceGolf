// Golfer Card Types
export type StatModifier = -3 | -2 | -1 | 0 | 1 | 2 | 3;

export interface GolferStats {
  drive: StatModifier;
  accuracy: StatModifier;
  shortGame: StatModifier;
  putting: StatModifier;
}

export interface SpecialAbility {
  name: string;
  description: string;
  type: 'par3' | 'par4' | 'par5' | 'bunker' | 'water' | 'rough' | 'fairway' | 'green' | 'wind';
  effectValue: number; // Can be positive or negative
}

export interface GolferCard {
  id: string;
  name: string;
  stats: GolferStats;
  imageUrl?: string;
  isUsed: boolean;
  specialAbility?: SpecialAbility;
}

// Course and Hole Types
export type Par = 3 | 4 | 5;
export type TerrainType = 'tee' | 'fairway' | 'rough' | 'bunker' | 'green' | 'water';
export type GreenSpeed = 'slow' | 'normal' | 'fast';
export type GreenBreak = 'easy' | 'hard';

export interface Hole {
  id: string;
  number: number;
  par: Par;
  length: number; // in yards
  terrain: Record<TerrainType, number>; // Percentage of each terrain type
  green: {
    speed: GreenSpeed;
    break: GreenBreak;
  };
}

export interface Course {
  id: string;
  name: string;
  holes: Hole[];
}

// Wind System Types
export type WindDirection = 'tailwind' | 'headwind' | 'crosswind' | 'none';
export type WindStrength = 0 | 1 | 2;

export interface Wind {
  direction: WindDirection;
  strength: WindStrength;
}

// Shot Types
export type ShotType = 'drive' | 'approach' | 'chip' | 'putt';
export type ShotResult = 'excellent' | 'good' | 'average' | 'poor' | 'terrible';

export interface Shot {
  id: string;
  type: ShotType;
  diceRoll: number;
  statModifier: number;
  surfaceModifier: number;
  windModifier: number;
  totalScore: number;
  result: ShotResult;
  resultText: string;
  lie: TerrainType;
  distanceRemaining?: number;
  specialAbilityActivated?: string; // Name of the special ability that was activated for this shot
}

// Game State Types
export interface HoleState {
  hole: Hole;
  shots: Shot[];
  score: number;
  completed: boolean;
  selectedGolfer?: GolferCard;
}

export interface GameState {
  course: Course;
  golferCards: GolferCard[];
  currentHoleIndex: number;
  holes: HoleState[];
  currentWind: Wind;
  totalScore: number;
  gameCompleted: boolean;
}

// Action Types
export type GameAction =
  | { type: 'START_GAME'; payload: { course: Course; golferCards: GolferCard[] } }
  | { type: 'SELECT_GOLFER'; payload: { golferId: string } }
  | { type: 'TAKE_SHOT'; payload: { shotType: ShotType; diceRoll?: [number, number] } }
  | { type: 'UPDATE_WIND' }
  | { type: 'COMPLETE_HOLE' }
  | { type: 'NEXT_HOLE' }
  | { type: 'COMPLETE_GAME' };

// Leaderboard Types
export interface LeaderboardEntry {
  id: string;
  player_name: string;
  course_name: string;
  score: number;
  date: string;
  location?: {
    city?: string;
    state?: string;
    country?: string;
  };
  hole_count: number;
}

export interface LeaderboardState {
  entries: LeaderboardEntry[];
  isLoading: boolean;
  error: string | null;
} 