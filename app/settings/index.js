import { View, Text, Pressable, StyleSheet } from "react-native";
import { useTheme } from "../../lib/theme";

export default function Settings() {
  const { theme, setTheme } = useTheme();

  return (
    <View>
      <Text style={styles.title}>Appearance</Text>

      <Option label="System" active={theme === "system"} onPress={() => setTheme("system")} />
      <Option label="Light" active={theme === "light"} onPress={() => setTheme("light")} />
      <Option label="Dark" active={theme === "dark"} onPress={() => setTheme("dark")} />
    </View>
  );
}

function Option({ label, active, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.option, active && styles.active]}
    >
      <Text style={styles.optionText}>
        {label} {active ? "✅" : ""}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  option: {
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    backgroundColor: "#ddd",
  },
  active: {
    backgroundColor: "#a0a0a0",
  },
  optionText: {
    fontSize: 16,
  },
});