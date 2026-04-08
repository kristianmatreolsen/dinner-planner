import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
} from "react-native";
import { useState, useCallback } from "react";
import {
  useLocalSearchParams,
  useFocusEffect,
  useRouter,
} from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../../../../lib/supabase";
import { useTheme } from "../../../../lib/theme/theme-context";

export default function RecipeView() {
  const { theme } = useTheme();
  const styles = stylesFactory(theme);

  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);

  async function loadRecipe() {
    setLoading(true);

    const { data: current } = await supabase
      .from("recipes")
      .select("view_count, title, ingredients, steps")
      .eq("id", id)
      .single();

    if (!current) {
      setLoading(false);
      return;
    }

    await supabase
      .from("recipes")
      .update({
        view_count: (current.view_count ?? 0) + 1,
      })
      .eq("id", id);

    setRecipe(current);
    setLoading(false);
  }

  useFocusEffect(
    useCallback(() => {
      loadRecipe();
    }, [id])
  );

  if (loading || !recipe) {
    return (
      <View style={styles.container}>
        <Text style={styles.muted}>Loading…</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>{recipe.title}</Text>

          <Pressable
            style={({ hovered }) => [
              styles.editButton,
              hovered && styles.editHover,
            ]}
            onPress={() => router.push(`/recipes/${id}`)}
          >
            <Ionicons
              name="create-outline"
              size={18}
              color={theme.colors.primary}
            />
            <Text style={styles.editText}>Edit recipe</Text>
          </Pressable>
        </View>

        <Text style={styles.sectionTitle}>Ingredients</Text>
        {(recipe.ingredients || []).map((i, idx) => (
          <Text key={idx} style={styles.item}>
            • {i.quantity} {i.unit} {i.name}
          </Text>
        ))}

        <Text style={styles.sectionTitle}>Steps</Text>
        {(recipe.steps || []).map((s, idx) => (
          <Text key={idx} style={styles.item}>
            {idx + 1}. {s}
          </Text>
        ))}
      </View>
    </ScrollView>
  );
}

const stylesFactory = (theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    content: {
      alignSelf: "center",
      width: "100%",
      maxWidth: 680,
      padding: 16,
    },
    titleRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 16,
    },
    title: {
      fontSize: 28,
      fontWeight: "600",
      color: theme.colors.text,
    },
    editButton: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      padding: 6,
      borderRadius: 6,
    },
    editHover: {
      backgroundColor: theme.colors.rowHover,
    },
    editText: {
      color: theme.colors.primary,
      fontWeight: "500",
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: "600",
      color: theme.colors.text,
      marginTop: 24,
      marginBottom: 8,
    },
    item: {
      fontSize: 15,
      color: theme.colors.text,
      marginBottom: 6,
    },
    muted: {
      color: theme.colors.mutedText,
    },
  });