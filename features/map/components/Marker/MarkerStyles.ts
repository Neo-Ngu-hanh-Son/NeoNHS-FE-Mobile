import type { POIType } from '@/features/map/types';
import { ComponentProps } from 'react';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';

type IconName = ComponentProps<typeof MaterialCommunityIcons>['name'];

export function getMarkerStyle(type: POIType): MarkerStyle {
  return markerStyles[type];
}

export type MarkerStyle = {
  bg: string;
  border: string;
  icon: IconName;
};

export const markerStyles: Record<POIType, MarkerStyle> = {
  DEFAULT: {
    bg: '#1a8f3e',
    border: '#1a8f3e',
    icon: 'help-circle-outline',
  },
  PAGODA: {
    bg: '#7c3aed',
    border: '#ede9fe',
    icon: 'temple-buddhist',
  },
  CAVE: {
    bg: '#374151',
    border: '#e5e7eb',
    icon: 'image-filter-hdr',
  },
  VIEWPOINT: {
    bg: '#0284c7',
    border: '#e0f2fe',
    icon: 'eye-outline',
  },
  GENERAL: {
    bg: '#4b5563',
    border: '#f3f4f6',
    icon: 'map-marker',
  },
  CHECKIN: {
    bg: '#dc2626',
    border: '#fee2e2',
    icon: 'flag-variant',
  },
  STATUE: {
    bg: '#d97706',
    border: '#fef3c7',
    icon: 'human-handsup', // Good for statues/monuments
  },
  GATE: {
    bg: '#16a34a',
    border: '#dcfce7',
    icon: 'gate',
  },
  SHOP: {
    bg: '#ea580c',
    border: '#ffedd5',
    icon: 'store',
  },
  ELEVATOR: {
    bg: '#2563eb',
    border: '#dbeafe',
    icon: 'elevator-passenger',
  },
  EVENT: {
    bg: '#db2777',
    border: '#fce7f3',
    icon: 'calendar-star', // Distinctive for events
  },
  WORKSHOP: {
    bg: '#059669',
    border: '#d1fae5',
    icon: 'tools', // "Tools" is the classic workshop vibe in Community
  },
  ATTRACTION: {
    bg: '#8b5cf6',
    border: '#ede9fe',
    icon: 'ferris-wheel', // Perfect for attractions
  },
};
