import { View, StyleSheet } from "react-native";
import WeekPlanner from "../../../components/WeekPlanner";

export default function Planner() {
  return (
    <View style={styles.container}>
      <WeekPlanner />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: 32, // ✅ gives space below planner
  },
});
``