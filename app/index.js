import { Link } from "expo-router";
import { View, Text, StyleSheet } from "react-native";

export default function Home() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Dinner Planner</Text>

      <Link href="/planner">
        <Text style={styles.link}>Go to Planner</Text>
      </Link>

      <Link href="/recipes">
        <Text style={styles.link}>View Recipes</Text>
      </Link>

      <Link href="/shopping">
        <Text style={styles.link}>Shopping List</Text>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 32, fontWeight: "bold", marginBottom: 30 },
  link: { fontSize: 20, marginTop: 10, color: "blue" }
});
``