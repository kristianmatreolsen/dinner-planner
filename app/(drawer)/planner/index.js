import { View, StyleSheet } from "react-native";
import { useTheme } from "../../../lib/theme/theme-context";
import WeekPlanner from "../../../components/WeekPlanner";
import Footer from "../../../components/Footer";

export default function Planner() {
  const { theme } = useTheme();
  const styles = stylesFactory(theme);

  return (
    <scrollView style={styles.container}>
    <View style={styles.content}>
      <WeekPlanner />
      <Footer />
    </View>
    </scrollView>
  );
}

const stylesFactory = (theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    content: {
      padding: 24,
    },
  });