import { DarkTheme, DefaultTheme, type Theme } from '@react-navigation/native';

export const THEME = {
  light: {
    // Background Layers
    background: '#f8faf9', // App background (soft off-white)
    card: '#ffffff', // Cards / containers
    popover: '#ffffff',
    sidebar: '#f1f5f4',

    // Text Colors
    foreground: '#0f172a', // Main text (strong contrast)
    cardForeground: '#0f172a',
    popoverForeground: '#0f172a',
    sidebarForeground: '#0f172a',

    // Primary (Deeper green for authority)
    primary: '#15803d',
    primaryForeground: '#ffffff',
    sidebarPrimary: '#166534',
    sidebarPrimaryForeground: '#ffffff',

    // Secondary & Muted Surfaces
    secondary: '#eef2ef',
    secondaryForeground: '#0f172a',
    muted: '#e5e7eb',
    mutedForeground: '#475569',
    accent: '#e2e8f0',
    accentForeground: '#0f172a',
    sidebarAccent: '#e2e8f0',
    sidebarAccentForeground: '#0f172a',

    // Borders & Inputs
    border: '#cbd5e1',
    input: '#cbd5e1',
    sidebarBorder: '#d1d5db',

    // Status / Utility
    destructive: '#dc2626',
    ring: '#16a34a',
    sidebarRing: '#16a34a',
    radius: '0.75rem',

    // Charts
    chart1: '#16a34a',
    chart2: '#0ea5e9',
    chart3: '#f59e0b',
    chart4: '#8b5cf6',
    chart5: '#ef4444',
  },

  dark: {
    // Background Layers
    background: '#0f1115', // Slightly lifted from pure black
    card: '#171923',
    popover: '#171923',
    sidebar: '#111827',

    // Text Colors
    foreground: '#f8fafc',
    cardForeground: '#f8fafc',
    popoverForeground: '#f8fafc',
    sidebarForeground: '#f8fafc',

    // Primary (Brighter for dark contrast)
    primary: '#15803d',
    primaryForeground: '#0b0f0c',
    sidebarPrimary: '#16a34a',
    sidebarPrimaryForeground: '#ffffff',

    // Secondary & Muted Surfaces
    secondary: '#1f2937',
    secondaryForeground: '#f8fafc',
    muted: '#1e293b',
    mutedForeground: '#94a3b8',
    accent: '#1e293b',
    accentForeground: '#f8fafc',
    sidebarAccent: '#1f2937',
    sidebarAccentForeground: '#f8fafc',

    // Borders & Inputs
    border: '#334155',
    input: '#334155',
    sidebarBorder: '#374151',

    // Status / Utility
    destructive: '#ef4444',
    ring: '#22c55e',
    sidebarRing: '#22c55e',
    radius: '0.75rem',

    // Charts
    chart1: '#22c55e',
    chart2: '#38bdf8',
    chart3: '#fbbf24',
    chart4: '#a78bfa',
    chart5: '#f87171',
  },
};

export const NAV_THEME: Record<'light' | 'dark', Theme> = {
  light: {
    ...DefaultTheme,
    colors: {
      background: THEME.light.background,
      border: THEME.light.border,
      card: THEME.light.card,
      notification: THEME.light.destructive,
      primary: THEME.light.primary,
      text: THEME.light.foreground,
    },
  },
  dark: {
    ...DarkTheme,
    colors: {
      background: THEME.dark.background,
      border: THEME.dark.border,
      card: THEME.dark.card,
      notification: THEME.dark.destructive,
      primary: THEME.dark.primary,
      text: THEME.dark.foreground,
    },
  },
};
