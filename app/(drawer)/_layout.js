import { Drawer } from "expo-router/drawer";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Platform,
  Animated,
} from "react-native";
import {
  Ionicons,
  MaterialIcons,
} from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  useRouter,
  usePathname,
} from "expo-router";
import { useTheme } from "../../lib/theme-context";

const PIN_STORAGE_KEY = "drawer_pinned";
const isWeb = Platform.OS === "web";

export default function DrawerLayout() {
  const { theme } = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const styles = stylesFactory(theme);

  const [pinned, setPinned] = useState(false);

  /* ✅ animated rotation for pin */
  const pinRotation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    AsyncStorage.getItem(PIN_STORAGE_KEY).then((v) => {
      const isPinned = v === "true";
      setPinned(isPinned);
      pinRotation.setValue(isPinned ? 1 : 0);
    });
  }, []);

  async function togglePinned() {
    const next = !pinned;
    setPinned(next);
    await AsyncStorage.setItem(PIN_STORAGE_KEY, String(next));

    Animated.spring(pinRotation, {
      toValue: next ? 1 : 0,
      useNativeDriver: true,
      friction: 6,
      tension: 120,
    }).start();
  }

  const rotate = pinRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ["45deg", "0deg"],
  });

  /* ✅ determine active route */
  function isActive(basePath) {
    if (basePath === "/") return pathname === "/";
    return pathname.startsWith(basePath);
  }

  function navItem(label, icon, path) {
    const active = isActive(path);

    return (
      <Pressable
        key={path}
        style={({ hovered }) => [
          styles.navItem,
          active && styles.navItemActive,
          hovered && !active && styles.hover,
        ]}
        onPress={() => router.push(path)}
      >
        <Ionicons
          name={icon}
          size={20}
          color={
            active
              ? theme.colors.primary
              : theme.colors.text
          }
        />
        <Text
          style={[
            styles.navText,
            active && styles.navTextActive,
          ]}
        >
          {label}
        </Text>
      </Pressable>
    );
  }

  return (
    <Drawer
      screenOptions={({ navigation }) => ({
        headerTitle: "",
        headerStyle: {
          backgroundColor: theme.colors.surface,
        },
        headerTintColor: theme.colors.text,

        /* ✅ header burger when drawer is closed */
        headerLeft: () =>
          !pinned ? (
            <Pressable
              style={styles.headerBurger}
              onPress={() =>
                navigation.toggleDrawer()
              }
            >
              <Ionicons
                name="menu"
                size={22}
                color={theme.colors.text}
              />
            </Pressable>
          ) : null,

        drawerStyle: {
          backgroundColor: theme.colors.background,
          width: pinned && isWeb ? 260 : 240,
        },
        drawerType: isWeb && pinned
          ? "permanent"
          : "front",
      })}
      drawerContent={(props) => (
        <View style={{ flex: 1 }}>
          {/* ✅ drawer header */}
          <View style={styles.drawerHeader}>
            <Pressable
              style={({ hovered }) => [
                styles.iconButton,
                hovered && styles.hover,
              ]}
              onPress={() =>
                props.navigation.toggleDrawer()
              }
            >
              <Ionicons
                name="menu"
                size={22}
                color={theme.colors.text}
              />
            </Pressable>

            <Text style={styles.drawerTitle}>
              Menu
            </Text>

            {/* ✅ animated monochrome push‑pin */}
            <Pressable
              style={({ hovered }) => [
                styles.iconButton,
                hovered && styles.hover,
              ]}
              onPress={togglePinned}
            >
              <Animated.View
                style={{
                  transform: [{ rotate }],
                }}
              >
                <MaterialIcons
                  name="push-pin"
                  size={20}
                  color={theme.colors.text}
                />
              </Animated.View>
            </Pressable>
          </View>

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

/* ================= STYLES ================= */

const stylesFactory = (theme) =>
  StyleSheet.create({
    headerBurger: {
      marginLeft: 12,
      padding: 6,
      borderRadius: 6,
    },

    drawerHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      padding: 12,
      borderBottomWidth: 1,
      borderColor: theme.colors.border,
    },

    drawerTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: theme.colors.text,
    },

    iconButton: {
      padding: 6,
      borderRadius: 6,
    },

    navItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      paddingHorizontal: 16,
      paddingVertical: 14,
      marginHorizontal: 8,
      marginVertical: 4,
      borderRadius: 8,
    },

    navItemActive: {
      backgroundColor: "#007AFF22",
    },

    navText: {
      fontSize: 15,
      color: theme.colors.text,
    },

    navTextActive: {
      color: theme.colors.primary,
      fontWeight: "600",
    },

    hover: {
      backgroundColor: "#00000010",
    },
  });