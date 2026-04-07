import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
} from "react-native";
import { useEffect, useState } from "react";
import { supabase } from "../../../../lib/supabase";
import { useRouter, useLocalSearchParams } from "expo-router";

export default function RecipeView() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecipe();
  }, [id]);

  async function loadRecipe() {
    const { data, error } = await supabase
      .from("recipes")
      .select("id, title, ingredients, steps")
      .eq("id", id)
      .single();

    if (error) {
      console.error(error);
      setLoading(false);
      return;
    }

    setRecipe(data);
    setLoading(false);
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading…</Text>
      </View>
    );
  }

  if (!recipe) {
    return (
      <View style={styles.container}>
        <Text>Recipe not found</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
    
      {/* TITLE */}
      <Text style={styles.title}>{recipe.title}</Text>

      {/* INGREDIENTS */}
      <Text style={styles.sectionTitle}>Ingredients</Text>
      {(recipe.ingredients ?? []).length === 0 ? (
        <Text style={styles.empty}>No ingredients</Text>
      ) : (
        recipe.ingredients.map((i, idx) => (
          <Text key={idx} style={styles.item}>
            • {i.quantity} {i.unit} {i.name}
          </Text>
        ))
      )}

      {/* STEPS */}
      <Text style={styles.sectionTitle}>Steps</Text>
      {(recipe.steps ?? []).length === 0 ? (
        <Text style={styles.empty}>No steps</Text>
      ) : (
        recipe.steps.map((step, idx) => (
          <Text key={idx} style={styles.item}>
            {idx + 1}. {step}
          </Text>
        ))
      )}

      {/* ACTIONS */}
      <Pressable
        style={styles.editButton}
        onPress={() => router.push(`/recipes/${id}`)}
      >
        <Text style={styles.editText}>Edit recipe</Text>
      </Pressable>
    </ScrollView>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  backLink: {
    color: "#007AFF",
    fontSize: 16,
    marginBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: "600",
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginTop: 24,
    marginBottom: 8,
  },
  item: {
    fontSize: 16,
    marginBottom: 6,
  },
  empty: {
    fontStyle: "italic",
    color: "#666",
  },
  editButton: {
    marginTop: 32,
    backgroundColor: "#007AFF",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  editText: {
    color: "white",
    fontWeight: "600",
  },
});
