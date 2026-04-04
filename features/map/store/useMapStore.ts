import { create } from 'zustand';

// Define the modes as a union type for type safety
export type MapViewMode = 'EXPLORING' | 'PREVIEWING_NAVIGATION' | 'NAVIGATING';

interface MapState {
  // State
  viewMode: MapViewMode;

  // Actions
  setViewMode: (mode: MapViewMode) => void;
  resetToExploration: () => void;
}

export const useMapStore = create<MapState>((set) => ({
  viewMode: 'EXPLORING',

  setViewMode: (mode) => set({ viewMode: mode }),

  resetToExploration: () => set({ viewMode: 'EXPLORING' }),
}));
