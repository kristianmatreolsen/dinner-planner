// lib/theme/theme-context.js

import { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Appearance } from "react-native";
import { LightTheme, DarkTheme } from "./themes";

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [mode, setMode] = useState("light"); // ✅ default

  useEffect(() => {
    AsyncStorage.getItem("color_scheme").then((stored) => {
      if (stored) setMode(stored);
    });
  }, []);

  function resolveTheme(currentMode) {
    if (currentMode === "system") {
      const system = Appearance.getColorScheme();
      return system === "dark" ? DarkTheme : LightTheme;
    }
    return currentMode === "dark" ? DarkTheme : LightTheme;
  }

  const theme = resolveTheme(mode);

  async function setLight() {
    setMode("light");
    await AsyncStorage.setItem("color_scheme", "light");
  }

  async function setDark() {
    setMode("dark");
    await AsyncStorage.setItem("color_scheme", "dark");
  }

  async function setSystem() {
    setMode("system");
    await AsyncStorage.setItem("color_scheme", "system");
  }

  return (
    <ThemeContext.Provider
      value={{
        theme,
        mode,
        setLight,
        setDark,
        setSystem,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used inside ThemeProvider");
  }
  return ctx;
}