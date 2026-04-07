import { View, Text, Pressable, StyleSheet } from "react-native";
import { useTheme } from "../../../lib/theme/theme-context";

export default function Settings() {
  const { theme, mode, setLight, setDark, setSystem } = useTheme();
  const s = styles(theme);

  return (
    <View style={s.container}>
      <Text style={s.title}>Appearance</Text>

      <Pressable style={s.option} onPress={setLight}>
        <Text style={s.text}>
          Light {mode === "light" ? "✓" : ""}
        </Text>
      </Pressable>

      <Pressable style={s.option} onPress={setDark}>
        <Text style={s.text}>
          Dark {mode === "dark" ? "✓" : ""}
        </Text>
      </Pressable>

      <Pressable style={s.option} onPress={setSystem}>
        <Text style={s.text}>
          System {mode === "system" ? "✓" : ""}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = (theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
      padding: 20,
    },
    title: {
      fontSize: 22,
      fontWeight: "600",
      color: theme.colors.text,
      marginBottom: 20,
    },
    option: {
      padding: 14,
      borderRadius: 8,
      marginBottom: 12,
      backgroundColor: theme.colors.surface,
      borderColor: theme.colors.border,
      borderWidth: 1,
    },
    text: {
      color: theme.colors.text,
      fontSize: 16,
    },
  });