import { Slot } from "expo-router";
import { ThemeContext } from "../lib/theme-context";
import { LightTheme, DarkTheme } from "../lib/theme";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Appearance } from "react-native";

export default function RootLayout() {
  const [theme, setTheme] = useState(LightTheme);

  useEffect(() => {
    loadTheme();
  }, []);

  async function loadTheme() {
    const stored = await AsyncStorage.getItem("color_scheme");

    if (stored === "dark") setTheme(DarkTheme);
    else if (stored === "light") setTheme(LightTheme);
    else {
      const system = Appearance.getColorScheme();
      setTheme(system === "dark" ? DarkTheme : LightTheme);
    }
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <Slot />
    </ThemeContext.Provider>
  );
}