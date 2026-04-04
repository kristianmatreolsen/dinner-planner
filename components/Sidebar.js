import { View, Pressable, StyleSheet, Text } from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import { useColorScheme } from "react-native";
import { useTheme } from "../lib/theme";

const theme = useColorScheme();
const isDark = theme === "dark";

backgroundColor: isDark ? "#949494" : "#eee"

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const router = useRouter();
  
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  backgroundColor: isDark ? "#1c1c1e" : "#eee"


  return (
    <View style={[styles.sidebar, collapsed && styles.collapsed]}>
      <Pressable onPress={() => setCollapsed(!collapsed)} style={styles.toggle}>
        <Text>☰</Text>
      </Pressable>

      <NavItem label="📅" text="Planner" onPress={() => router.push("/")} collapsed={collapsed} />
      <NavItem label="📖" text="Recipes" onPress={() => router.push("/recipes")} collapsed={collapsed} />
      <NavItem label="🛒" text="Shopping" onPress={() => router.push("/shopping")} collapsed={collapsed} />
      <NavItem label="⚙️" text="Settings" onPress={() => router.push("/settings")} collapsed={collapsed} />
    </View>
  );
}

function NavItem({ label, text, onPress, collapsed }) {
  return (
    <Pressable onPress={onPress} style={styles.item}>
      <Text style={styles.icon}>{label}</Text>
      {!collapsed && <Text>{text}</Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  sidebar: {
    width: 200,
    backgroundColor: "#eee",
    paddingTop: 20,
  },
  collapsed: {
    width: 60,
  },
  toggle: {
    padding: 10,
    alignItems: "center",
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    gap: 10,
  },
  icon: {
    fontSize: 20,
  },
});
