import { View, Text, StyleSheet } from "react-native";

export default function RecipeCard({ recipe }) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{recipe.title}</Text>
      <Text>{recipe.description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 20,
    backgroundColor: "#eee",
    borderRadius: 10,
    marginVertical: 10
  },
  title: { fontSize: 20, fontWeight: "600" }
});