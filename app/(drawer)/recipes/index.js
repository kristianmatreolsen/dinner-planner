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
import { useTheme } from "../../../lib/theme/theme-context";

export default function RecipeList() {
  const router = useRouter();
  const { theme } = useTheme();
  const s = styles(theme);

  const [recipes, setRecipes] = useState([]);
  const [search, setSearch] = useState("");

  const [sortBy, setSortBy] = useState("title");
  const [sortDirection, setSortDirection] = useState("asc");

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

  async function toggleFavorite(recipe) {
    const next = !recipe.is_favorite;

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

  const visibleRecipes = [...recipes]
    .filter((r) =>
      r.title.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
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
    <ScrollView
      contentContainerStyle={s.container}
    >
      {/* Top row */}
      <View style={s.topRow}>
        <TextInput
          placeholder="Search recipes"
          placeholderTextColor={theme.colors.mutedText}
          value={search}
          onChangeText={setSearch}
          style={s.searchInput}
        />

        <Pressable
          style={s.addButton}
          onPress={() => router.push("/recipes/create")}
        >
          <Text style={s.addText}>+ Add recipe</Text>
        </Pressable>
      </View>

      {/* Header */}
      <View style={s.headerRow}>
        <View style={s.starCol}>
          <Text style={s.sortIndicator}>↑↓</Text>
        </View>

        <Pressable
          style={[s.headerCell, s.titleCol]}
          onPress={() => toggleSort("title")}
        >
          <Text style={s.headerText}>
            Recipe{renderSortArrow("title")}
          </Text>
        </Pressable>

        <Pressable
          style={[s.headerCell, s.viewCol]}
          onPress={() => toggleSort("view_count")}
        >
          <Text style={[s.headerText, s.center]}>
            Viewed{renderSortArrow("view_count")}
          </Text>
        </Pressable>

        <Pressable
          style={[s.headerCell, s.dateCol]}
          onPress={() => toggleSort("updated_at")}
        >
          <Text style={s.headerText}>
            Last edited{renderSortArrow("updated_at")}
          </Text>
        </Pressable>
      </View>

      {/* Rows */}
      {visibleRecipes.map((recipe) => (
        <Pressable
          key={recipe.id}
          style={({ hovered }) => [
            s.row,
            hovered && s.rowHover,
          ]}
          onPress={() =>
            router.push(`/recipes/view/${recipe.id}`)
          }
        >
          <Pressable
            style={s.starCol}
            onPress={(e) => {
              e.stopPropagation();
              toggleFavorite(recipe);
            }}
          >
            <Text
              style={[
                s.star,
                recipe.is_favorite && s.starActive,
              ]}
            >
              ★
            </Text>
          </Pressable>

          <Text style={[s.cell, s.titleCol]}>
            {recipe.title}
          </Text>

          <Text style={[s.cell, s.viewCol, s.center]}>
            {recipe.view_count ?? 0}
          </Text>

          <Text style={[s.cell, s.dateCol]}>
            {formatDate(recipe.updated_at)}
          </Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

/* ================= STYLES ================= */

const styles = (theme) =>
  StyleSheet.create({
    container: {
      padding: 20,
      paddingBottom: 40,
      backgroundColor: theme.colors.background,
    },

    topRow: {
      flexDirection: "row",
      gap: 12,
      marginBottom: 16,
    },

    searchInput: {
      flex: 1,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 6,
      padding: 8,
      backgroundColor: theme.colors.surfaceAlt,
      color: theme.colors.text,
    },

    addButton: {
      backgroundColor: theme.colors.buttonPrimary,
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 6,
    },

    addText: {
      color: theme.colors.buttonPrimaryText,
      fontWeight: "600",
    },

    headerRow: {
      flexDirection: "row",
      borderBottomWidth: 1,
      borderColor: theme.colors.divider,
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
      color: theme.colors.mutedText,
    },

    row: {
      flexDirection: "row",
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderColor: theme.colors.divider,
      alignItems: "center",
      backgroundColor: theme.colors.row,
    },

    rowHover: {
      backgroundColor: theme.colors.rowHover,
    },

    cell: {
      fontSize: 15,
      color: theme.colors.text,
    },

    starCol: {
      width: 30,
      alignItems: "center",
    },

    sortIndicator: {
      fontSize: 14,
      color: theme.colors.mutedText,
      lineHeight: 12,
    },

    star: {
      fontSize: 18,
      color: theme.colors.mutedText,
    },

    starActive: {
      color: theme.colors.primary,
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