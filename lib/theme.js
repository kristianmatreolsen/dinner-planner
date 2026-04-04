import { createContext, useContext, useEffect, useState } from "react";
import { useColorScheme } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const systemTheme = useColorScheme();
  const [theme, setTheme] = useState("system"); // light | dark | system
  const [resolvedTheme, setResolvedTheme] = useState(systemTheme);

  useEffect(() => {
    AsyncStorage.getItem("theme").then((saved) => {
      if (saved) setTheme(saved);
    });
  }, []);

  useEffect(() => {
    AsyncStorage.setItem("theme", theme);

    if (theme === "system") {
      setResolvedTheme(systemTheme);
    } else {
      setResolvedTheme(theme);
    }
  }, [theme, systemTheme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}