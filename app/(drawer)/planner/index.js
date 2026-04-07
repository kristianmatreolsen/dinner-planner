import { View, StyleSheet } from "react-native";
import { useTheme } from "../../../lib/theme/theme-context";
import WeekPlanner from "../../../components/WeekPlanner";

export default function Planner() {
  const { theme } = useTheme();
  const styles = stylesFactory(theme);

  return (
    <View style={styles.container}>
      <WeekPlanner />
    </View>
  );
}

const stylesFactory = (theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
      paddingBottom: 32,
    },
  });