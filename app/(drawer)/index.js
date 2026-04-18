import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  Image,
  useWindowDimensions,
} from "react-native";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useRouter } from "expo-router";
import { useTheme } from "../../lib/theme/theme-context";
import Footer from "../../components/Footer";

export default function Home() {
  const { theme } = useTheme();
  const styles = makeStyles(theme);
  const router = useRouter();
  const { width } = useWindowDimensions();

  const isCompact = width < 900;

  const [topRecipes, setTopRecipes] = useState([]);
  const [trending, setTrending] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    // load the most frequently planned recipes
    const { data: topData } = await supabase
      .from("planner")
      .select("recipe_id")
      .not("recipe_id", "is", null);

    const counts = {};
    topData?.forEach((row) => {
      counts[row.recipe_id] = (counts[row.recipe_id] || 0) + 1;
    });

    const topIds = Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([id]) => id);

    if (topIds.length > 0) {
      const { data } = await supabase
        .from("recipes")
        .select("id, title")
        .in("id", topIds);

      setTopRecipes(data || []);
    }

    // load the most recently planned recipes
    const { data: recentData } = await supabase
      .from("planner")
      .select("recipe_id, recipe:recipes(id, title), date")
      .not("recipe_id", "is", null)
      .order("date", { ascending: false })
      .limit(20);

    const seen = new Set();
    const trendingList = [];

    recentData?.forEach((row) => {
      if (!seen.has(row.recipe_id)) {
        seen.add(row.recipe_id);
        trendingList.push(row.recipe);
      }
      if (trendingList.length >= 6) return;
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

  const logoSource =
    theme.mode === "dark"
      ? require("../../assets/images/dinner-planner-dark.png")
      : require("../../assets/images/dinner-planner.png");

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Hero row (two columns) */}
        <View
          style={[
            styles.heroRow,
            isCompact && styles.heroRowCompact,
          ]}
        >
          {/* Logo column */}
          <View style={styles.heroLogoColumn}>
            <Image
              source={logoSource}
              style={styles.heroLogo}
              resizeMode="contain"
            />
          </View>

          {/* Text column */}
          <View style={styles.heroTextColumn}>
            <Text style={styles.heroTitle}>
              The app that helps you plan your dinners and meals for the week.
              Browse or create your own recipes, add them to your planner, and generate shopping lists in seconds.
              Get started by exploring our collection of delicious recipes or jump
              straight into planning your week of delicious food!
            </Text>
            <Text style={styles.heroSubtitle}>
              
            </Text>
            
          </View>
        </View>

        {/* Grid row */}
        <View
          style={[
            styles.grid,
            isCompact && styles.gridCompact,
          ]}
        >
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Top Recipes
            </Text>
            <View style={styles.recipeGrid}>
              {topRecipes.map((recipe) => (
                <RecipeItem
                  key={recipe.id}
                  recipe={recipe}
                />
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Trending Dinners
            </Text>
            <View style={styles.recipeGrid}>
              {trending.map((recipe) => (
                <RecipeItem
                  key={recipe.id}
                  recipe={recipe}
                />
              ))}
            </View>
          </View>
        </View>
        <Footer />
      </View>
    </ScrollView>
  );
}

/* Styles */

const makeStyles = (theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },

    content: {
      padding: 24,
    },

    /* Hero row */
    heroRow: {
      flexDirection: "row",
      gap: 32,
      marginBottom: 48,
      alignItems: "center",
    },

    heroRowCompact: {
      flexDirection: "column",
      alignItems: "center",
    },

    heroLogoColumn: {
      flex: 1,               // take half width
      alignItems: "center",
      justifyContent: "center",
    },

    heroLogo: {
      width: "100%",
      aspectRatio: 1,    // maintain square image ratio
      maxHeight: 400,
    },

    heroTextColumn: {
      flex: 1,
    },

    heroTitle: {
      fontSize: 26,
      fontWeight: "700",
      color: theme.colors.text,
      textAlign: "center",
    },

    heroSubtitle: {
      fontSize: 16,
      marginTop: 10,
      color: theme.colors.mutedText,
      lineHeight: 22,
    },

    /* Grid */
    grid: {
      flexDirection: "row",
      gap: 32,
    },

    gridCompact: {
      flexDirection: "column",
    },

    section: {
      flex: 1,
    },

    sectionTitle: {
      fontSize: 26,
      fontWeight: "600",
      color: theme.colors.text,
      marginBottom: 12,
      textAlign: "center",
    },

    recipeGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 12,
    },

    recipeItem: {
      flexBasis: "48%",
      padding: 12,
      backgroundColor: theme.colors.surface,
      borderRadius: 10,
    },

    recipeTitle: {
      fontSize: 15,
      color: theme.colors.text,
    },
  });