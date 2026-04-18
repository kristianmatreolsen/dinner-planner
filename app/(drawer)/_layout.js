import { Drawer } from "expo-router/drawer";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  useWindowDimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, usePathname } from "expo-router";
import { useTheme } from "../../lib/theme/theme-context";
import { DrawerToggleButton } from "@react-navigation/drawer";

export default function DrawerLayout() {
  const { theme } = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const styles = stylesFactory(theme);

  const { width } = useWindowDimensions();
  const isCompact = width < 900; // responsive breakpoint

  // choose icon variant based on theme mode
  const logoSource =
    theme.mode === "dark"
      ? require("../../assets/images/icon-dinner-planner-dark.png")
      : require("../../assets/images/icon-dinner-planner.png");

  function isActive(path) {
    if (path === "/") return pathname === "/";
    return pathname.startsWith(path);
  }

  function NavButton({ label, icon, path }) {
    const active = isActive(path);

    return (
      <Pressable
        onPress={() => router.push(path)}
        style={({ hovered }) => [
          styles.navItem,
          hovered && styles.navItemHover,
        ]}
      >
        <Ionicons
          name={icon}
          size={18}
          color={active ? theme.colors.primary : theme.colors.text}
        />

        <Text
          style={[
            styles.navText,
            active && styles.navTextActive,
          ]}
        >
          {label}
        </Text>

        {active && <View style={styles.activeUnderline} />}
      </Pressable>
    );
  }

  return (
    <Drawer
      screenOptions={{
        headerShown: true,
        drawerType: "front",

        // keep header styling consistent with the selected theme
        headerStyle: {
          backgroundColor: theme.colors.surface,
        },
        headerTintColor: theme.colors.text,
        headerShadowVisible: true,

        headerLeft: () =>
          isCompact ? (
            <DrawerToggleButton tintColor={theme.colors.text} />
          ) : null,

        headerTitle: () => (
          <View style={styles.headerContent}>
            {/* Logo button */}
            <Pressable
              onPress={() => router.push("/")}
              style={styles.logoWrapper}
            >
              <Image
                source={logoSource}
                style={styles.logo}
                resizeMode="contain"
              />
            </Pressable>

            {!isCompact && (
              <View style={styles.navContainer}>
                <NavButton label="Home" icon="home-outline" path="/" />
                <NavButton
                  label="Planner"
                  icon="calendar-outline"
                  path="/planner"
                />
                <NavButton
                  label="Recipes"
                  icon="restaurant-outline"
                  path="/recipes"
                />
                <NavButton
                  label="Shopping"
                  icon="cart-outline"
                  path="/shopping"
                />
                <NavButton
                  label="Settings"
                  icon="settings-outline"
                  path="/settings"
                />
              </View>
            )}
          </View>
        ),
      }}
      drawerContent={() =>
        isCompact ? (
          <View style={styles.drawer}>
            <Pressable
              style={styles.drawerItem}
              onPress={() => router.push("/")}
            >
              <Text>Home</Text>
            </Pressable>
            <Pressable
              style={styles.drawerItem}
              onPress={() => router.push("/planner")}
            >
              <Text>Planner</Text>
            </Pressable>
            <Pressable
              style={styles.drawerItem}
              onPress={() => router.push("/recipes")}
            >
              <Text>Recipes</Text>
            </Pressable>
            <Pressable
              style={styles.drawerItem}
              onPress={() => router.push("/shopping")}
            >
              <Text>Shopping List</Text>
            </Pressable>
            <Pressable
              style={styles.drawerItem}
              onPress={() => router.push("/settings")}
            >
              <Text>Settings</Text>
            </Pressable>
          </View>
        ) : null
      }
    >
      <Drawer.Screen name="index" />
      <Drawer.Screen name="planner" />
      <Drawer.Screen name="recipes" />
      <Drawer.Screen name="shopping" />
      <Drawer.Screen name="settings" />
    </Drawer>
  );
}

/* Styles */

const stylesFactory = (theme) =>
  StyleSheet.create({
    headerContent: {
      flexDirection: "row",
      alignItems: "center",
      gap: 24,
    },

    /* Logo */
    logoWrapper: {
      height: 45,
      aspectRatio: 1,
      alignItems: "center",
      justifyContent: "center",
    },

    logo: {
      width: "100%",
      height: "100%",
    },

    /* Nav */
    navContainer: {
      flexDirection: "row",
      gap: 16,
    },

    navItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingVertical: 6,
      paddingHorizontal: 10,
      borderRadius: 6,
      position: "relative",
    },

    navItemHover: {
      backgroundColor: theme.colors.rowHover,
    },

    navText: {
      fontSize: 14,
      color: theme.colors.text,
    },

    navTextActive: {
      color: theme.colors.primary,
      fontWeight: "600",
    },

    activeUnderline: {
      position: "absolute",
      bottom: 0,
      left: 8,
      right: 8,
      height: 2,
      borderRadius: 2,
      backgroundColor: theme.colors.primary,
    },

    /* Drawer */
    drawer: {
      paddingTop: 16,
    },

    drawerItem: {
      paddingVertical: 14,
      paddingHorizontal: 16,
    },
  });