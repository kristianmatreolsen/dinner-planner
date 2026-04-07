import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView
} from "react-native";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useRouter } from "expo-router";
import { useTheme } from "../../lib/theme-context";

export default function Home() {
  const { theme } = useTheme();
  const styles = makeStyles(theme);
  const router = useRouter();

  const [topRecipes, setTopRecipes] = useState([]);
  const [trending, setTrending] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    // Top 10 most used recipes
    const { data: topData } = await supabase
      .from("planner")
      .select("recipe_id, recipe:recipes(title)")
      .not("recipe_id", "is", null);

    const counts = {};
    topData?.forEach(row => {
      const id = row.recipe_id;
      counts[id] = (counts[id] || 0) + 1;
    });

    const topIds = Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([id]) => id);

    if (topIds.length > 0) {
      const { data: recipes } = await supabase
        .from("recipes")
        .select("id, title")
        .in("id", topIds);

      setTopRecipes(recipes || []);
    }

    // Trending: most recent planned recipes
    const { data: recentData } = await supabase
      .from("planner")
      .select("recipe_id, recipe:recipes(title), date")
      .not("recipe_id", "is", null)
      .order("date", { ascending: false })
      .limit(20);

    const seen = new Set();
    const trendingList = [];
    recentData?.forEach(row => {
      if (!seen.has(row.recipe_id)) {
        seen.add(row.recipe_id);
        trendingList.push(row.recipe);
      }
      if (trendingList.length >= 10) return;
    });

    setTrending(trendingList);
  }

  const RecipeItem = ({ recipe }) => (
    <Pressable
      style={styles.recipeItem}
      onPress={() => router.push(`/recipes/view/${recipe.id}`)}
    >
      <Text style={styles.recipeTitle}>{recipe.title}</Text>
    </Pressable>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.welcome}>Welcome to Dinner Planner!</Text>

        <Text style={styles.sectionTitle}>Most Used Recipes</Text>
        {topRecipes.map(recipe => (
          <RecipeItem key={recipe.id} recipe={recipe} />
        ))}

        <Text style={styles.sectionTitle}>Trending Dinners</Text>
        {trending.map(recipe => (
          <RecipeItem key={recipe.id} recipe={recipe} />
        ))}
      </View>
    </ScrollView>
  );
}

const makeStyles = theme =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background
    },
    content: {
      padding: 16
    },
    welcome: {
      fontSize: 24,
      fontWeight: "bold",
      color: theme.colors.text,
      marginBottom: 20,
      textAlign: "center"
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: theme.colors.text,
      marginTop: 20,
      marginBottom: 10
    },
    recipeItem: {
      padding: 12,
      backgroundColor: theme.colors.surface,
      borderRadius: 8,
      marginBottom: 8
    },
    recipeTitle: {
      fontSize: 16,
      color: theme.colors.text
    }
  });