import { View, StyleSheet } from "react-native";
import { Slot } from "expo-router";
import Sidebar from "../components/Sidebar";
import { ThemeProvider, useTheme } from "../lib/theme";

function LayoutContent() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <View style={[styles.container, isDark && styles.dark]}>
      <Sidebar />
      <View style={[styles.content, isDark && styles.dark]}>
        <Slot />
      </View>
    </View>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <LayoutContent />
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#ffffff",
  },
  content: {
    flex: 1,
    padding: 20,
    backgroundColor: "#ffffff",
  },
  dark: {
    backgroundColor: "#121212", // dark grey
  },
});