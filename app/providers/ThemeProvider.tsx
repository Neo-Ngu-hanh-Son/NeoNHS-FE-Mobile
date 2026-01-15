import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import { useColorScheme as useNativeColorScheme } from "react-native";
import { storage } from "@/utils/storage";

type ColorScheme = "light" | "dark";

interface ThemeContextValue {
  colorScheme: ColorScheme;
  isDarkColorScheme: boolean;
  toggleColorScheme: () => void;
  setColorScheme: (scheme: ColorScheme) => void;
  isLoading: boolean;
}

const THEME_STORAGE_KEY = "@NeoNHS/color_scheme";

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const systemColorScheme = useNativeColorScheme();
  const [colorScheme, setColorSchemeState] = useState<ColorScheme>("light");
  const [isLoading, setIsLoading] = useState(true);

  // Load saved theme preference on mount
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedScheme = await storage.getItem<ColorScheme>(THEME_STORAGE_KEY);
        if (savedScheme && (savedScheme === "light" || savedScheme === "dark")) {
          setColorSchemeState(savedScheme);
        } else if (systemColorScheme) {
          // Use system preference if no saved preference
          setColorSchemeState(systemColorScheme);
        }
      } catch (error) {
        console.error("Failed to load theme preference:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadTheme();
  }, [systemColorScheme]);

  const setColorScheme = useCallback(async (scheme: ColorScheme) => {
    setColorSchemeState(scheme);
    await storage.setItem(THEME_STORAGE_KEY, scheme);
  }, []);

  const toggleColorScheme = useCallback(() => {
    const newScheme = colorScheme === "light" ? "dark" : "light";
    setColorScheme(newScheme);
  }, [colorScheme, setColorScheme]);

  const value: ThemeContextValue = {
    colorScheme,
    isDarkColorScheme: colorScheme === "dark",
    toggleColorScheme,
    setColorScheme,
    isLoading,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

export { ThemeContext };
