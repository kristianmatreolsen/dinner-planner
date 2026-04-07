import { View, Text, Pressable, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "../../../lib/theme-context";
import { LightTheme, DarkTheme } from "../../../lib/theme";
import { Appearance } from "react-native";

export default function Settings() {
  const { theme, setTheme } = useTheme();

  async function select(value) {
    await AsyncStorage.setItem("color_scheme", value);

    if (value === "light") setTheme(LightTheme);
    if (value === "dark") setTheme(DarkTheme);
    if (value === "system") {
      const system = Appearance.getColorScheme();
      setTheme(system === "dark" ? DarkTheme : LightTheme);
    }
  }

  const s = styles(theme);

  return (
    <View style={s.container}>
      <Text style={s.title}>Appearance</Text>

      <Pressable style={s.option} onPress={() => select("light")}>
        <Text style={s.text}>Light</Text>
      </Pressable>

      <Pressable style={s.option} onPress={() => select("dark")}>
        <Text style={s.text}>Dark</Text>
      </Pressable>

      <Pressable style={s.option} onPress={() => select("system")}>
        <Text style={s.text}>System</Text>
      </Pressable>
    </View>
  );
}

const styles = (theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
      padding: 20
    },
    title: {
      fontSize: 22,
      fontWeight: "600",
      color: theme.colors.text,
      marginBottom: 20
    },
    option: {
      padding: 14,
      borderRadius: 8,
      marginBottom: 12,
      backgroundColor: theme.colors.surface
    },
    text: {
      color: theme.colors.text,
      fontSize: 16
    }
  });