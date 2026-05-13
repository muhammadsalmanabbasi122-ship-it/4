import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

export type ThemeMode = "dark" | "light";

export interface ThemeColors {
  bg: string;
  surface: string;
  surface2: string;
  border: string;
  text: string;
  textSecondary: string;
  accent: string;
  accentText: string;
  danger: string;
  dangerBg: string;
  dangerBorder: string;
  card: string;
  inputBg: string;
  tabBg: string;
  placeholder: string;
  footer: string;
}

const DARK: ThemeColors = {
  bg: "#1a1a2e",
  surface: "#16213e",
  surface2: "#1a1a2e",
  border: "#0f3460",
  text: "#ffffff",
  textSecondary: "#8892b0",
  accent: "#FFD700",
  accentText: "#1a1a2e",
  danger: "#ef4444",
  dangerBg: "#1f0d0d",
  dangerBorder: "#3d1515",
  card: "#16213e",
  inputBg: "#1a1a2e",
  tabBg: "#1a1a2e",
  placeholder: "#8892b0",
  footer: "#0f3460",
};

const LIGHT: ThemeColors = {
  bg: "#f0f2f5",
  surface: "#ffffff",
  surface2: "#f8f9fa",
  border: "#e0e0e0",
  text: "#1a1a2e",
  textSecondary: "#6b7280",
  accent: "#FFD700",
  accentText: "#1a1a2e",
  danger: "#ef4444",
  dangerBg: "#fef2f2",
  dangerBorder: "#fecaca",
  card: "#ffffff",
  inputBg: "#f8f9fa",
  tabBg: "#ffffff",
  placeholder: "#9ca3af",
  footer: "#d1d5db",
};

interface ThemeContextType {
  mode: ThemeMode;
  colors: ThemeColors;
  toggleTheme: () => void;
  setTheme: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  mode: "dark",
  colors: DARK,
  toggleTheme: () => {},
  setTheme: () => {},
});

const THEME_KEY = "@chandmod_theme";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>("dark");

  useEffect(() => {
    AsyncStorage.getItem(THEME_KEY).then((stored) => {
      if (stored === "light" || stored === "dark") setMode(stored);
    });
  }, []);

  const setTheme = useCallback((m: ThemeMode) => {
    setMode(m);
    AsyncStorage.setItem(THEME_KEY, m);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(mode === "dark" ? "light" : "dark");
  }, [mode, setTheme]);

  const colors = mode === "dark" ? DARK : LIGHT;

  return (
    <ThemeContext.Provider value={{ mode, colors, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}

export function useThemeColors() {
  return useContext(ThemeContext).colors;
}
