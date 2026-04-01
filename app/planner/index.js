import { View, Text, StyleSheet } from "react-native";

export default function Planner() {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Weekly Planner</Text>
      <Text>✨ Calendar UI Coming Soon ✨</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  header: { fontSize: 28, fontWeight: "600", marginBottom: 20 }
});