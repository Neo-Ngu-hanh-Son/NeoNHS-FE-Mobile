import type { POIType } from '@/features/map/types';
import { ComponentProps } from 'react';
import { MaterialIcons } from '@expo/vector-icons';

type IconName = ComponentProps<typeof MaterialIcons>['name'];

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
    icon: 'not-listed-location',
  },
  PAGODA: {
    bg: '#7c3aed',
    border: '#ede9fe',
    icon: 'account-balance', // MaterialIcons
  },
  CAVE: {
    bg: '#374151',
    border: '#e5e7eb',
    icon: 'terrain',
  },
  VIEWPOINT: {
    bg: '#0284c7',
    border: '#e0f2fe',
    icon: 'visibility',
  },
  GENERAL: {
    bg: '#4b5563',
    border: '#f3f4f6',
    icon: 'place',
  },
  CHECKIN: {
    bg: '#dc2626',
    border: '#fee2e2',
    icon: 'flag',
  },
  STATUE: {
    bg: '#d97706',
    border: '#fef3c7',
    icon: 'emoji-people',
  },
  GATE: {
    bg: '#16a34a',
    border: '#dcfce7',
    icon: 'door-front',
  },
  SHOP: {
    bg: '#ea580c',
    border: '#ffedd5',
    icon: 'storefront',
  },
  ELEVATOR: {
    bg: '#2563eb',
    border: '#dbeafe',
    icon: 'elevator',
  },
  EVENT: {
    bg: '#db2777',
    border: '#fce7f3',
    icon: 'event',
  },
  WORKSHOP: {
    bg: '#059669',
    border: '#d1fae5',
    icon: 'build',
  },
  ATTRACTION: {
    bg: '#8b5cf6',
    border: '#ede9fe',
    icon: 'attractions',
  },
};
