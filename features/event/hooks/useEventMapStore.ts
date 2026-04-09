import { create } from 'zustand';
import { Region } from 'react-native-maps';
import { MAP_CENTER } from '@/features/map/data/mapData';

// Define the modes as a union type for type safety
export type MapViewMode = 'EXPLORING' | 'PREVIEWING_NAVIGATION' | 'NAVIGATING';

interface MapState {
  // State
  viewMode: MapViewMode;
  mapZoom: { latitudeDelta: number; longitudeDelta: number };
  lastMapInteractionLocation?: Region;
  isMapReady: boolean;

  // Actions
  setViewMode: (mode: MapViewMode) => void;
  setIsMapReady: (ready: boolean) => void;
  setMapZoom: (zoom: { latitudeDelta: number; longitudeDelta: number }) => void;
  setLastMapInteractionLocation: (location: Region) => void;
  resetToExploration: () => void;
}

export const useEventMapStore = create<MapState>((set) => ({
  viewMode: 'EXPLORING',
  mapZoom: { latitudeDelta: MAP_CENTER.latitudeDelta, longitudeDelta: MAP_CENTER.longitudeDelta },
  isMapReady: false,

  setViewMode: (mode) => set({ viewMode: mode }),
  setIsMapReady(ready) {
    set({ isMapReady: ready });
  },
  setMapZoom(zoom) {
    set({ mapZoom: zoom });
  },
  setLastMapInteractionLocation(location) {
    set({ lastMapInteractionLocation: location });
  },
  resetToExploration: () => set({ viewMode: 'EXPLORING' }),
}));
