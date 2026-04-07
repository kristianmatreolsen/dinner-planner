import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  TextInput,
} from "react-native";
import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";
import { useRouter } from "expo-router";

export default function RecipeList() {
  const [recipes, setRecipes] = useState([]);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("title");
  const [sortDirection, setSortDirection] = useState("asc");

  const router = useRouter();

  useEffect(() => {
    loadRecipes();
  }, []);

  async function loadRecipes() {
    const { data, error } = await supabase
      .from("recipes")
      .select("id, title, updated_at, is_favorite, view_count");

    if (error) {
      console.error(error);
      return;
    }

    setRecipes(data ?? []);
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
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function getVisibleRecipes() {
    let list = recipes.filter((r) =>
      r.title.toLowerCase().includes(search.toLowerCase())
    );

    list.sort((a, b) => {
      if (a.is_favorite && !b.is_favorite) return -1;
      if (!a.is_favorite && b.is_favorite) return 1;

      let result = 0;

      if (sortBy === "title") {
        result = a.title.localeCompare(b.title);
      } else if (sortBy === "updated_at") {
        result = new Date(a.updated_at) - new Date(b.updated_at);
      } else if (sortBy === "view_count") {
        result = (a.view_count ?? 0) - (b.view_count ?? 0);
      }

      return sortDirection === "asc" ? result : -result;
    });

    return list;
  }

  const visibleRecipes = getVisibleRecipes();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* SEARCH + ADD */}
      <View style={styles.topRow}>
        <View style={styles.searchWrapper}>
          <TextInput
            placeholder="🔍︎ Search recipes"
            placeholderTextColor="#000"
            value={search}
            onChangeText={setSearch}
            style={styles.searchInput}
          />

          {search.length > 0 && (
            <Pressable
              onPress={() => setSearch("")}
              style={styles.clearButton}
              hitSlop={10}
            >
              <Text style={styles.clearText}>×</Text>
            </Pressable>
          )}
        </View>

        {/* ✅ UPDATED ROUTE */}
        <Pressable
          style={styles.addButton}
          onPress={() => router.push("/recipes/create")}
        >
          <Text style={styles.addText}>+ Add recipe</Text>
        </Pressable>
      </View>

      {/* TABLE HEADER */}
      <View style={styles.headerRow}>
        <View style={styles.starCol} />

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
          <Text style={[styles.headerText, styles.centerText]}>
            Viewed{renderSortArrow("view_count")}
          </Text>
        </Pressable>

        <Pressable
          style={[styles.headerCell, styles.dateCol]}
          onPress={() => toggleSort("updated_at")}
        >
          <Text style={[styles.headerText, styles.dateText]}>
            Last edited{renderSortArrow("updated_at")}
          </Text>
        </Pressable>
      </View>

      {/* TABLE ROWS */}
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
          <View style={styles.starCol}>
            <Text
              style={[
                styles.star,
                recipe.is_favorite && styles.starActive,
              ]}
            >
              ★
            </Text>
          </View>

          <Text style={[styles.cell, styles.titleCol]}>
            {recipe.title}
          </Text>

          <Text style={[styles.cell, styles.viewCol, styles.centerText]}>
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
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  searchWrapper: {
    flex: 1,
    position: "relative",
    justifyContent: "center",
  },
  searchInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    paddingVertical: 8,
    paddingLeft: 10,
    paddingRight: 34,
  },
  clearButton: {
    position: "absolute",
    right: 8,
    height: "100%",
    justifyContent: "center",
  },
  clearText: {
    fontSize: 18,
    color: "#666",
  },
  addButton: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    backgroundColor: "#007AFF",
    borderRadius: 6,
  },
  addText: {
    color: "white",
    fontWeight: "600",
  },
  headerRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
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
    borderBottomColor: "#eee",
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
  star: {
    fontSize: 18,
    color: "#ccc",
  },
  starActive: {
    color: "#FFD700",
  },
  titleCol: {
    flex: 3,
    paddingLeft: 4,
  },
  viewCol: {
    flex: 1,
  },
  centerText: {
    textAlign: "center",
  },
  dateCol: {
    flex: 2,
    textAlign: "right",
    paddingRight: 4,
    color: "#555",
  },
  dateText: {
    textAlign: "right",
  },
});