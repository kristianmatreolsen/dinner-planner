import { Drawer } from "expo-router/drawer";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "../../lib/theme-context";
import { useRouter } from "expo-router";

const PIN_STORAGE_KEY = "drawer_pinned";
const isWeb = Platform.OS === "web";

export default function DrawerLayout() {
  const { theme } = useTheme();
  const router = useRouter();
  const styles = stylesFactory(theme);
  const [pinned, setPinned] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(PIN_STORAGE_KEY).then((v) =>
      setPinned(v === "true")
    );
  }, []);

  async function togglePinned() {
    const next = !pinned;
    setPinned(next);
    await AsyncStorage.setItem(PIN_STORAGE_KEY, String(next));
  }

  const navItem = (label, icon, path) => (
    <Pressable
      key={path}
      style={({ hovered }) => [
        styles.item,
        hovered && styles.hover,
      ]}
      onPress={() => router.push(path)}
    >
      <Ionicons
        name={icon}
        size={20}
        color={theme.colors.text}
      />
      <Text style={styles.itemText}>{label}</Text>
    </Pressable>
  );

  return (
    <Drawer
      screenOptions={{
        /** ✅ REMOVE ROUTE NAMES (planner/index etc.) */
        headerTitle: "",

        /** ✅ REMOVE DEFAULT HAMBURGER */
        headerLeft: () => null,

        headerStyle: {
          backgroundColor: theme.colors.surface,
        },
        headerTintColor: theme.colors.text,

        drawerStyle: {
          backgroundColor: theme.colors.background,
          width: pinned && isWeb ? 260 : 240,
        },
        drawerType: isWeb && pinned ? "permanent" : "front",
      }}
      drawerContent={(props) => (
        <View style={{ flex: 1 }}>
          {/* Drawer header */}
          <View style={styles.header}>
            <View style={styles.headerRow}>
              {/* ✅ Drawer toggle button (burger inside drawer) */}
              {!pinned && (
                <Pressable
                  onPress={() => props.navigation.toggleDrawer()}
                  style={({ hovered }) => [
                    styles.menuButton,
                    hovered && styles.hover,
                  ]}
                >
                  <Ionicons
                    name="menu"
                    size={22}
                    color={theme.colors.text}
                  />
                </Pressable>
              )}

              <Text style={styles.headerTitle}>Menu</Text>

              <Pressable onPress={togglePinned}>
                <Ionicons
                  name="pin"
                  size={18}
                  color={
                    pinned
                      ? theme.colors.primary
                      : theme.colors.mutedText
                  }
                />
              </Pressable>
            </View>
          </View>

          {/* Drawer items */}
          {navItem("Home", "home-outline", "/")}
          {navItem("Planner", "calendar-outline", "/planner")}
          {navItem("Recipes", "restaurant-outline", "/recipes")}
          {navItem("Shopping list", "cart-outline", "/shopping")}
          {navItem("Settings", "settings-outline", "/settings")}
        </View>
      )}
    >
      <Drawer.Screen name="index" />
      <Drawer.Screen name="planner" />
      <Drawer.Screen name="recipes" />
      <Drawer.Screen name="shopping" />
      <Drawer.Screen name="settings" />
    </Drawer>
  );
}

const stylesFactory = (theme) =>
  StyleSheet.create({
    header: {
      padding: 12,
      borderBottomWidth: 1,
      borderColor: theme.colors.border,
    },
    headerRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    headerTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: theme.colors.text,
    },
    menuButton: {
      padding: 6,
      borderRadius: 6,
    },
    item: {
      flexDirection: "row",
      alignItems: "center",
      padding: 16,
      gap: 12,
    },
    itemText: {
      color: theme.colors.text,
      fontSize: 15,
    },
    hover: {
      backgroundColor: "#00000010",
    },
  });
