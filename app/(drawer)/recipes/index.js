import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  TextInput,
} from "react-native";
import { useState, useCallback } from "react";
import { useRouter, useFocusEffect } from "expo-router";
import { supabase } from "../../../lib/supabase";

export default function RecipeList() {
  const router = useRouter();

  const [recipes, setRecipes] = useState([]);
  const [search, setSearch] = useState("");

  const [sortBy, setSortBy] = useState("title"); // title | updated_at | view_count
  const [sortDirection, setSortDirection] = useState("asc");

  /* ✅ Reload whenever screen becomes active */
  useFocusEffect(
    useCallback(() => {
      loadRecipes();
    }, [])
  );

  async function loadRecipes() {
    const { data } = await supabase
      .from("recipes")
      .select("id, title, updated_at, is_favorite, view_count");

    setRecipes(data ?? []);
  }

  /* ✅ Favourite toggle */
  async function toggleFavorite(recipe) {
    const next = !recipe.is_favorite;

    // optimistic UI update
    setRecipes((prev) =>
      prev.map((r) =>
        r.id === recipe.id ? { ...r, is_favorite: next } : r
      )
    );

    await supabase
      .from("recipes")
      .update({ is_favorite: next })
      .eq("id", recipe.id);
  }

  function toggleSort(column) {
    if (sortBy === column) {
      setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(column);
      setSortDirection(column === "title" ? "asc" : "desc");
    }
  }

  function renderSortArrow(column) {
    if (sortBy !== column) return "";
    return sortDirection === "asc" ? " ▲" : " ▼";
  }

  function formatDate(dateString) {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleString();
  }

  /* ✅ Filter + sort */
  const visibleRecipes = [...recipes]
    .filter((r) =>
      r.title.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      // ⭐ favourites first
      if (a.is_favorite && !b.is_favorite) return -1;
      if (!a.is_favorite && b.is_favorite) return 1;

      let result = 0;
      if (sortBy === "title") {
        result = a.title.localeCompare(b.title);
      } else if (sortBy === "updated_at") {
        result =
          new Date(a.updated_at) - new Date(b.updated_at);
      } else if (sortBy === "view_count") {
        result =
          (a.view_count ?? 0) - (b.view_count ?? 0);
      }

      return sortDirection === "asc" ? result : -result;
    });

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Top row */}
      <View style={styles.topRow}>
        <TextInput
          placeholder="🔍︎ Search recipes"
          value={search}
          onChangeText={setSearch}
          style={styles.searchInput}
        />

        <Pressable
          style={styles.addButton}
          onPress={() => router.push("/recipes/create")}
        >
          <Text style={styles.addText}>+ Add recipe</Text>
        </Pressable>
      </View>

      {/* Header */}
      <View style={styles.headerRow}>
        
<View style={styles.starCol}>
  <Text style={styles.sortIndicator}>↑↓</Text>
</View>


        <Pressable
          style={[styles.headerCell, styles.titleCol]}
          onPress={() => toggleSort("title")}
        >
          <Text style={styles.headerText}>
            Recipe{renderSortArrow("title")}
          </Text>
        </Pressable>

        <Pressable
          style={[styles.headerCell, styles.viewCol]}
          onPress={() => toggleSort("view_count")}
        >
          <Text style={[styles.headerText, styles.center]}>
            Viewed{renderSortArrow("view_count")}
          </Text>
        </Pressable>

        <Pressable
          style={[styles.headerCell, styles.dateCol]}
          onPress={() => toggleSort("updated_at")}
        >
          <Text style={styles.headerText}>
            Last edited{renderSortArrow("updated_at")}
          </Text>
        </Pressable>
      </View>

      {/* Rows */}
      {visibleRecipes.map((recipe) => (
        <Pressable
          key={recipe.id}
          style={({ hovered }) => [
            styles.row,
            hovered && styles.rowHover,
          ]}
          onPress={() =>
            router.push(`/recipes/view/${recipe.id}`)
          }
        >
          {/* ✅ Favourite star */}
          <Pressable
            style={styles.starCol}
            onPress={(e) => {
              e.stopPropagation();
              toggleFavorite(recipe);
            }}
          >
            <Text
              style={[
                styles.star,
                recipe.is_favorite && styles.starActive,
              ]}
            >
              ★
            </Text>
          </Pressable>

          <Text style={[styles.cell, styles.titleCol]}>
            {recipe.title}
          </Text>

          <Text
            style={[
              styles.cell,
              styles.viewCol,
              styles.center,
            ]}
          >
            {recipe.view_count ?? 0}
          </Text>

          <Text style={[styles.cell, styles.dateCol]}>
            {formatDate(recipe.updated_at)}
          </Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 40,
  },

  topRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },

  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 8,
  },

  addButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 6,
  },

  addText: {
    color: "white",
    fontWeight: "600",
  },

  headerRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: "#ccc",
    paddingBottom: 8,
    marginBottom: 8,
    alignItems: "center",
  },

  headerCell: {
    justifyContent: "center",
  },

  headerText: {
    fontWeight: "600",
    fontSize: 14,
    color: "#555",
  },

  row: {
    flexDirection: "row",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: "#eee",
    alignItems: "center",
  },

  rowHover: {
    backgroundColor: "#f5f7fa",
  },

  cell: {
    fontSize: 15,
  },

  starCol: {
    width: 30,
    alignItems: "center",
  },

sortIndicator: {
  fontSize: 14,
  color: "#555",
  lineHeight: 12,
},

  star: {
    fontSize: 18,
    color: "#ccc", // ✅ gray when not favourite
  },

  starActive: {
    color: "#FFD700", // ✅ gold when favourite
  },

  titleCol: {
    flex: 3,
  },

  viewCol: {
    flex: 1,
  },

  dateCol: {
    flex: 2,
    textAlign: "left",
  },

  center: {
    textAlign: "center",
  },
});
