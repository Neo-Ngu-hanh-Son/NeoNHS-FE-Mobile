import { DarkTheme, DefaultTheme, type Theme } from '@react-navigation/native';
 
export const THEME = {
  light: {
    // Backgrounds
    background: 'hsl(0 0% 100%)',           // Pure white
    card: 'hsl(0 0% 100%)',                 // Pure white
    popover: 'hsl(0 0% 100%)',              // Pure white
    sidebar: 'hsl(0 0% 98%)',               // Slight off-white
    
    // Text colors
    foreground: 'hsl(0 0% 9%)',             // Near black for high contrast
    cardForeground: 'hsl(0 0% 9%)',
    popoverForeground: 'hsl(0 0% 9%)',
    sidebarForeground: 'hsl(0 0% 9%)',
    
    // Primary - Green theme
    primary: 'hsl(142 71% 35%)',            // Rich green
    primaryForeground: 'hsl(0 0% 100%)',    // White text on primary
    sidebarPrimary: 'hsl(142 71% 35%)',
    sidebarPrimaryForeground: 'hsl(0 0% 100%)',
    
    // Secondary & Muted
    secondary: 'hsl(0 0% 96%)',             // Light gray
    secondaryForeground: 'hsl(0 0% 9%)',
    muted: 'hsl(0 0% 96%)',
    mutedForeground: 'hsl(0 0% 45%)',       // Medium gray - visible
    accent: 'hsl(0 0% 96%)',
    accentForeground: 'hsl(0 0% 9%)',
    sidebarAccent: 'hsl(0 0% 96%)',
    sidebarAccentForeground: 'hsl(0 0% 9%)',
    
    // Borders & Inputs - More visible
    border: 'hsl(0 0% 85%)',                // Darker border - visible!
    input: 'hsl(0 0% 85%)',
    sidebarBorder: 'hsl(0 0% 85%)',
    
    // Others
    destructive: 'hsl(0 84% 60%)',          // Red for errors
    ring: 'hsl(142 71% 45%)',               // Focus ring - green
    sidebarRing: 'hsl(142 71% 45%)',
    radius: '0.65rem',
    
    // Charts
    chart1: 'hsl(142 76% 36%)',
    chart2: 'hsl(160 60% 45%)',
    chart3: 'hsl(30 80% 55%)',
    chart4: 'hsl(280 65% 60%)',
    chart5: 'hsl(340 75% 55%)',
  },
  dark: {
    // Backgrounds - PITCH DARK
    background: 'hsl(0 0% 4%)',             // Near black
    card: 'hsl(0 0% 9%)',                   // Slightly lighter for cards
    popover: 'hsl(0 0% 9%)',
    sidebar: 'hsl(0 0% 7%)',
    
    // Text colors - High contrast
    foreground: 'hsl(0 0% 98%)',            // Near white
    cardForeground: 'hsl(0 0% 98%)',
    popoverForeground: 'hsl(0 0% 98%)',
    sidebarForeground: 'hsl(0 0% 98%)',
    
    // Primary - Brighter green for dark mode
    primary: 'hsl(142 71% 45%)',            // Brighter green
    primaryForeground: 'hsl(0 0% 100%)',
    sidebarPrimary: 'hsl(142 71% 50%)',
    sidebarPrimaryForeground: 'hsl(0 0% 100%)',
    
    // Secondary & Muted
    secondary: 'hsl(0 0% 15%)',             // Dark gray
    secondaryForeground: 'hsl(0 0% 98%)',
    muted: 'hsl(0 0% 15%)',
    mutedForeground: 'hsl(0 0% 60%)',       // Visible muted text
    accent: 'hsl(0 0% 15%)',
    accentForeground: 'hsl(0 0% 98%)',
    sidebarAccent: 'hsl(0 0% 15%)',
    sidebarAccentForeground: 'hsl(0 0% 98%)',
    
    // Borders & Inputs - More visible
    border: 'hsl(0 0% 20%)',                // Visible border
    input: 'hsl(0 0% 20%)',
    sidebarBorder: 'hsl(0 0% 20%)',
    
    // Others
    destructive: 'hsl(0 62% 55%)',          // Red for errors
    ring: 'hsl(142 71% 45%)',
    sidebarRing: 'hsl(142 71% 45%)',
    radius: '0.65rem',
    
    // Charts
    chart1: 'hsl(142 70% 50%)',
    chart2: 'hsl(160 60% 50%)',
    chart3: 'hsl(30 80% 60%)',
    chart4: 'hsl(280 65% 65%)',
    chart5: 'hsl(340 75% 60%)',
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
