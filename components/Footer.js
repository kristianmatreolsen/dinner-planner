import { View, Text, StyleSheet, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../lib/theme/theme-context";

export default function Footer() {
  const { theme } = useTheme();
  const styles = makeStyles(theme);

  const isDark = theme.mode === "dark";

  const icons = {
    copilot: isDark
      ? require("../assets/icons/copilot-dark.png")
      : require("../assets/icons/copilot.png"),
    react: isDark
      ? require("../assets/icons/react-dark.png")
      : require("../assets/icons/react.png"),
    supabase: isDark
      ? require("../assets/icons/supabase-dark.png")
      : require("../assets/icons/supabase.png"),
  };

  return (
    <View style={styles.footer}>
      <View style={styles.row}>
        <Text style={styles.text}>Created with</Text>

        <Ionicons name="heart-outline" size={14} color={theme.colors.text} />
        <Text style={styles.text}>and</Text>
        <Ionicons name="cafe-outline" size={14} color={theme.colors.text} />

        <Text style={styles.text}>with a sprinkle of</Text>

        <Image source={icons.copilot} style={styles.icon} />

        <Text style={styles.text}>using</Text>

        <Image source={icons.react} style={styles.icon} />
        <Text style={styles.text}>and</Text>
        <Image source={icons.supabase} style={styles.icon} />

        
      </View>
      <view style={styles.row}>
        <Text style={styles.text}>© 2026</Text>
        </view>
    </View>
  );
}

const makeStyles = (theme) =>
  StyleSheet.create({
    footer: {
      marginTop: 56,
      paddingVertical: 24,
      alignItems: "center",
      opacity: 0.75,
    },

    row: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      flexWrap: "wrap", // allow wrapping on very small screens
      justifyContent: "center",
    },

    text: {
      fontSize: 13,
      color: theme.colors.text,
    },

    icon: {
      width: 14,
      height: 14,
      resizeMode: "contain",
    },
  });