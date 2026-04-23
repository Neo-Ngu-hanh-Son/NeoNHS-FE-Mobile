import { PointDifficulty, PointVibe } from '@/features/map/types';
import { Ionicons } from '@expo/vector-icons';

export type IconConfig = {
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  bgColor: string;
};

export const DIFFICULTY_CONFIG: Record<PointDifficulty, IconConfig> = {
  [PointDifficulty.EASY]: {
    icon: 'leaf-outline',
    color: '#22c55e', // Green-500
    bgColor: '#22c55e15',
  },
  [PointDifficulty.MEDIUM]: {
    icon: 'flash-outline',
    color: '#f97316', // Orange-500
    bgColor: '#f9731615',
  },
  [PointDifficulty.HARD]: {
    icon: 'flame-outline',
    color: '#ef4444', // Red-500
    bgColor: '#ef444415',
  },
};

export const VIBE_CONFIG: Record<PointVibe, IconConfig> = {
  [PointVibe.SPIRITUAL]: {
    icon: 'cloud-outline',
    color: '#8b5cf6', // Violet-500
    bgColor: '#8b5cf615',
  },
  [PointVibe.RELAXING]: {
    icon: 'sunny-outline',
    color: '#06b6d4', // Cyan-500
    bgColor: '#06b6d415',
  },
  [PointVibe.ENERGETIC]: {
    icon: 'fitness-outline',
    color: '#f43f5e', // Rose-500
    bgColor: '#f43f5e15',
  },
  [PointVibe.SCENIC]: {
    icon: 'camera-outline',
    color: '#14b8a6', // Teal-500
    bgColor: '#14b8a615',
  },
  [PointVibe.HISTORICAL]: {
    icon: 'library-outline',
    color: '#a8a29e', // Stone-400
    bgColor: '#a8a29e15',
  },
};

export const pointDetailUtils = {
  getDifficultyIconConfig: (difficulty: PointDifficulty) => {
    return DIFFICULTY_CONFIG[difficulty];
  },

  getVibeIconConfig: (vibe: PointVibe) => {
    return VIBE_CONFIG[vibe];
  },
}