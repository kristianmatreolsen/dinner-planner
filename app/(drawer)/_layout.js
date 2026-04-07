import { Drawer } from "expo-router/drawer";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Platform,
  Animated,
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter, usePathname } from "expo-router";
import { useTheme } from "../../lib/theme/theme-context";

const PIN_STORAGE_KEY = "drawer_pinned";
const isWeb = Platform.OS === "web";

const COLLAPSED_WIDTH = 56;
const EXPANDED_WIDTH = 240;

export default function DrawerLayout() {
  const { theme } = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const styles = stylesFactory(theme);

  const [pinned, setPinned] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const pinRotation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    AsyncStorage.getItem(PIN_STORAGE_KEY).then((v) => {
      const value = v === "true";
      setPinned(value);
      setExpanded(value);
      pinRotation.setValue(value ? 1 : 0);
    });
  }, []);

  async function togglePinned() {
    const next = !pinned;
    setPinned(next);
    setExpanded(next);
    await AsyncStorage.setItem(PIN_STORAGE_KEY, String(next));

    Animated.spring(pinRotation, {
      toValue: next ? 1 : 0,
      useNativeDriver: true,
    }).start();
  }

  async function closeDrawerAndUnpin() {
    setPinned(false);
    setExpanded(false);
    pinRotation.setValue(0);
    await AsyncStorage.setItem(PIN_STORAGE_KEY, "false");
  }

  const drawerWidth =
    pinned || expanded ? EXPANDED_WIDTH : COLLAPSED_WIDTH;

  const showLabels = pinned || expanded;

  function isActive(basePath) {
    if (basePath === "/") return pathname === "/";
    return pathname.startsWith(basePath);
  }

  function navItem(label, icon, path) {
    const active = isActive(path);

    return (
      <Pressable
        key={path}
        style={[
          styles.navItem,
          active && styles.navItemActive,
        ]}
        onPress={() => {
          router.push(path);
          if (!pinned) setExpanded(false);
        }}
      >
        <Ionicons
          name={icon}
          size={22}
          color={
            active ? theme.colors.primary : theme.colors.text
          }
        />
        {showLabels && (
          <Text
            style={[
              styles.navText,
              active && styles.navTextActive,
            ]}
          >
            {label}
          </Text>
        )}
      </Pressable>
    );
  }

  return (
    <Drawer
      screenListeners={{
        drawerClose: () => {
          if (!pinned) {
            setExpanded(false);
            pinRotation.setValue(0);
          }
        },
      }}
      screenOptions={{
        headerTitle: "",
        headerStyle: {
          height: 56,
          backgroundColor: theme.colors.surface,
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.border,
        },

        // ✅ NO BURGER IN HEADER ANYMORE
        headerLeft: () => null,

        drawerType: "permanent",
        drawerStyle: {
          width: drawerWidth,
          backgroundColor: theme.colors.background,
        },
      }}
      drawerContent={() => (
        <View style={{ flex: 1 }}>
          {/* Sidebar header */}
          <View style={styles.drawerHeader}>
            {!expanded && !pinned ? (
              /* ☰ when collapsed */
              <Pressable
                onPress={() => setExpanded(true)}
                accessibilityLabel="Open menu"
              >
                <Ionicons
                  name="menu"
                  size={22}
                  color={theme.colors.text}
                />
              </Pressable>
            ) : (
              /* ✕ when expanded */
              <Pressable
                onPress={closeDrawerAndUnpin}
                accessibilityLabel="Close menu"
              >
                <Ionicons
                  name="close"
                  size={22}
                  color={theme.colors.text}
                />
              </Pressable>
            )}

            {showLabels && (
              <Text style={styles.drawerTitle}>Menu</Text>
            )}

            {showLabels ? (
              <Pressable
                onPress={togglePinned}
                accessibilityLabel="Pin menu"
              >
                <Animated.View
                  style={{
                    transform: [
                      {
                        rotate: pinRotation.interpolate({
                          inputRange: [0, 1],
                          outputRange: ["45deg", "0deg"],
                        }),
                      },
                    ],
                  }}
                >
                  <MaterialIcons
                    name="push-pin"
                    size={20}
                    color={theme.colors.text}
                  />
                </Animated.View>
              </Pressable>
            ) : (
              <View style={{ width: 20 }} />
            )}
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
    drawerHeader: {
      height: 56,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },

    drawerTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: theme.colors.text,
    },

    navItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      paddingHorizontal: 16,
      paddingVertical: 14,
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
  });