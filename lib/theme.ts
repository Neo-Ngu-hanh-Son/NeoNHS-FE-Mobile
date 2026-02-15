import { DarkTheme, DefaultTheme, type Theme } from '@react-navigation/native';

export const THEME = {
  light: {
    // Backgrounds
    background: '#ffffff',
    card: '#ffffff',
    popover: '#ffffff',
    sidebar: '#fafafa',

    // Text colors
    foreground: '#171717',
    cardForeground: '#171717',
    popoverForeground: '#171717',
    sidebarForeground: '#171717',

    // Primary - Green theme
    primary: '#1a8f3e',
    primaryForeground: '#ffffff',
    sidebarPrimary: '#1a8f3e',
    sidebarPrimaryForeground: '#ffffff',

    // Secondary & Muted
    secondary: '#f5f5f5',
    secondaryForeground: '#171717',
    muted: '#f5f5f5',
    mutedForeground: '#737373',
    accent: '#f5f5f5',
    accentForeground: '#171717',
    sidebarAccent: '#f5f5f5',
    sidebarAccentForeground: '#171717',

    // Borders & Inputs
    border: '#d9d9d9',
    input: '#d9d9d9',
    sidebarBorder: '#d9d9d9',

    // Others
    destructive: '#f03d3d',
    ring: '#23c05a',
    sidebarRing: '#23c05a',
    radius: '0.65rem',

    // Charts
    chart1: '#16a34a',
    chart2: '#2eb58f',
    chart3: '#e88a2e',
    chart4: '#a855f7',
    chart5: '#e11d48',
  },

  dark: {
    // Backgrounds
    background: '#0a0a0a',
    card: '#171717',
    popover: '#171717',
    sidebar: '#121212',

    // Text colors
    foreground: '#fafafa',
    cardForeground: '#fafafa',
    popoverForeground: '#fafafa',
    sidebarForeground: '#fafafa',

    // Primary
    primary: '#23c05a',
    primaryForeground: '#ffffff',
    sidebarPrimary: '#2bd665',
    sidebarPrimaryForeground: '#ffffff',

    // Secondary & Muted
    secondary: '#262626',
    secondaryForeground: '#fafafa',
    muted: '#262626',
    mutedForeground: '#999999',
    accent: '#262626',
    accentForeground: '#fafafa',
    sidebarAccent: '#262626',
    sidebarAccentForeground: '#fafafa',

    // Borders & Inputs
    border: '#333333',
    input: '#333333',
    sidebarBorder: '#333333',

    // Others
    destructive: '#dc3d3d',
    ring: '#23c05a',
    sidebarRing: '#23c05a',
    radius: '0.65rem',

    // Charts
    chart1: '#26d665',
    chart2: '#33cc99',
    chart3: '#f0a33d',
    chart4: '#b266ff',
    chart5: '#f03d66',
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
