import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Modal,
  TextInput,
} from "react-native";
import { useEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../lib/supabase";
import { getMonday, addDays, formatISO } from "../lib/dates";
import { useTheme } from "../lib/theme/theme-context";
import { useRouter } from "expo-router";

/* Constants */

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

// prevent navigating more than 4 weeks into the past
const MIN_WEEK_OFFSET = -4;

/* Helpers */

function formatDateRange(start, end) {
  const opts = { month: "short", day: "numeric" };
  return `${start.toLocaleDateString(undefined, opts)} – ${end.toLocaleDateString(undefined, opts)}`;
}

function formatDayDate(date) {
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

function getISOWeekNumber(date) {
  const d = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
  );
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
}

function getISOWeekYear(date) {
  const d = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
  );
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  return d.getUTCFullYear();
}

/* Main component */

export default function WeekPlanner() {
  const { theme } = useTheme();
  const styles = stylesFactory(theme);
  const router = useRouter();

  const [weekOffset, setWeekOffset] = useState(0);
  const [planner, setPlanner] = useState({});
  const [plannerIds, setPlannerIds] = useState({});
  const [recipes, setRecipes] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [customRecipe, setCustomRecipe] = useState("");
  const [suggestions, setSuggestions] = useState([]);

  const isCurrentWeek = weekOffset === 0;
  const isPastWeek = weekOffset < 0;
  const atMinWeek = weekOffset <= MIN_WEEK_OFFSET;

  useEffect(() => {
    loadWeek();
    loadRecipes();
  }, [weekOffset]);

  async function loadRecipes() {
    const { data } = await supabase
      .from("recipes")
      .select("id, title")
      .order("title");
    setRecipes(data ?? []);
  }

  async function loadWeek() {
    const monday = getMonday(new Date());
    monday.setDate(monday.getDate() + weekOffset * 7);

    const { data } = await supabase
      .from("planner")
      .select("date, recipe_id, recipe:recipes(title)")
      .gte("date", formatISO(monday))
      .lte("date", formatISO(addDays(monday, 6)));

    const titles = {};
    const ids = {};

    data?.forEach((row) => {
      titles[row.date] = row.recipe?.title ?? null;
      ids[row.date] = row.recipe_id ?? null;
    });

    setPlanner(titles);
    setPlannerIds(ids);
  }

  function openForDate(date) {
    if (isPastWeek) return;
    setSelectedDate(date);
    setCustomRecipe("");
    setSuggestions([]);
    setShowModal(true);
  }

  async function clearDay(date) {
    if (isPastWeek) return;
    await supabase.from("planner").delete().eq("date", date);
    loadWeek();
  }

  async function saveRecipe(recipeId, typedTitle = null) {
    let finalRecipeId = recipeId;

    if (typedTitle !== null) {
      const cleaned = typedTitle.trim();
      if (!cleaned) return;

      const { data: existing } = await supabase
        .from("recipes")
        .select("id")
        .ilike("title", cleaned)
        .maybeSingle();

      if (existing) {
        finalRecipeId = existing.id;
      } else {
        const { data } = await supabase
          .from("recipes")
          .insert({ title: cleaned })
          .select("id")
          .single();
        finalRecipeId = data.id;
      }
    }

    await supabase.from("planner").upsert({
      date: selectedDate,
      recipe_id: finalRecipeId,
    });

    setShowModal(false);
    loadWeek();
  }

  /* Date logic */

  const monday = getMonday(new Date());
  monday.setDate(monday.getDate() + weekOffset * 7);
  const todayISO = formatISO(new Date());

  const weekNumber = getISOWeekNumber(monday);
  const weekYear = getISOWeekYear(monday);
  const dateRangeLabel = formatDateRange(monday, addDays(monday, 6));

  const weekStatus =
    weekOffset === 0 ? "Current" : weekOffset < 0 ? "Past" : "Future";

  /* UI */

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Weekly planned dinners</Text>

      <View style={[styles.weekNav, isCurrentWeek && styles.currentWeekNav]}>
        <Pressable
          disabled={atMinWeek}
          onPress={() =>
            setWeekOffset((w) =>
              Math.max(MIN_WEEK_OFFSET, w - 1)
            )
          }
        >
          <Text
            style={[
              styles.navArrow,
              atMinWeek && { opacity: 0.4 },
            ]}
          >
            ← Previous
          </Text>
        </Pressable>

        <View style={styles.navCenter}>
          <Text style={styles.weekLabel}>
            {weekStatus} · Week {weekNumber} ({weekYear})
          </Text>
          <Text style={styles.weekRange}>{dateRangeLabel}</Text>
        </View>

        <Pressable onPress={() => setWeekOffset((w) => w + 1)}>
          <Text style={styles.navArrow}>Next →</Text>
        </Pressable>
      </View>

      <View style={styles.table}>
        <View style={[styles.row, styles.headerRow]}>
          <Text style={styles.colDay}>Day</Text>
          <Text style={styles.colDate}>Date</Text>
          <Text style={styles.colDinner}>Dinner</Text>
          <Text style={styles.colRecipe}/>
          <View style={styles.colRemove} />
        </View>

        {DAYS.map((day, index) => {
          const dateObj = addDays(monday, index);
          const dateISO = formatISO(dateObj);
          const dinner = planner[dateISO];
          const recipeId = plannerIds[dateISO];
          const isToday = isCurrentWeek && dateISO === todayISO;

          return (
            <View
              key={dateISO}
              style={[
                styles.row,
                index % 2 === 1 && styles.altRow,
                isPastWeek && styles.pastRow,
                isToday && styles.todayRowOutline,
              ]}
            >
              <Text style={styles.colDay}>{day}</Text>
              <Text style={styles.colDate}>
                {formatDayDate(dateObj)}
              </Text>

              <View style={styles.colDinner}>
                <View style={styles.dinnerRow}>
                  {!isPastWeek && (
                    <Pressable
                      style={({ hovered }) => [
                        styles.smallButton,
                        hovered && styles.buttonHover,
                      ]}
                      onPress={() => openForDate(dateISO)}
                    >
                      <Text style={styles.smallButtonText}>
                        {dinner ? "Edit" : "+ Add"}
                      </Text>
                    </Pressable>
                  )}
                  {dinner && (
                    <Text style={styles.dinnerText}>{dinner}</Text>
                  )}
                </View>
              </View>

              <View style={styles.colRecipe}>
                {recipeId && (
                  <Pressable
                    style={({ hovered }) => [
                      styles.recipeButton,
                      hovered && styles.buttonHover,
                    ]}
                    onPress={() =>
                      router.push(`/recipes/view/${recipeId}`)
                    }
                  >
                    <Text style={styles.recipeButtonText}>
                      View recipe
                    </Text>
                  </Pressable>
                )}
              </View>

              <View style={styles.colRemove}>
                {dinner && !isPastWeek && (
                  <Pressable
                    style={({ hovered }) => [
                      styles.removeButton,
                      hovered && styles.removeHover,
                    ]}
                    onPress={() => clearDay(dateISO)}
                  >
                    <Ionicons
                      name="trash-outline"
                      size={16}
                      color={theme.colors.danger}
                    />
                    <Text style={styles.removeText}>Remove</Text>
                  </Pressable>
                )}
              </View>
            </View>
          );
        })}
      </View>

      {showModal && (
        <Modal visible animationType="slide">
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>
              Select Dinner
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Type a dinner…"
              value={customRecipe}
              onChangeText={(text) => {
                setCustomRecipe(text);
                setSuggestions(
                  recipes.filter((r) =>
                    r.title
                      .toLowerCase()
                      .includes(text.toLowerCase())
                  )
                );
              }}
            />

            {suggestions.map((r) => (
              <Pressable
                key={r.id}
                onPress={() => saveRecipe(r.id)}
              >
                <Text style={styles.suggestion}>{r.title}</Text>
              </Pressable>
            ))}

            <Pressable
              style={styles.saveButton}
              onPress={() =>
                saveRecipe(null, customRecipe)
              }
            >
              <Text style={styles.saveText}>
                Save custom dinner
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setShowModal(false)}
              style={styles.cancel}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
          </View>
        </Modal>
      )}
    </View>
  );
}

/* Styles */

const stylesFactory = (theme) =>
  StyleSheet.create({
    container: {
      padding: 20,
      backgroundColor: theme.colors.background,
    },
    title: {
      fontSize: 24,
      fontWeight: "600",
      textAlign: "center",
      color: theme.colors.text,
    },

    weekNav: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginVertical: 15,
      padding: 10,
      borderRadius: 8,
      backgroundColor: theme.colors.surface,
    },
    currentWeekNav: {
      backgroundColor: theme.colors.rowHover,
      borderWidth: 1,
      borderColor: theme.colors.primary,
    },
    navArrow: {
      fontSize: 16,
      fontWeight: "600",
      color: theme.colors.text,
    },
    navCenter: { alignItems: "center" },
    weekLabel: { fontWeight: "600", color: theme.colors.text },
    weekRange: { fontSize: 12, color: theme.colors.mutedText },

    table: {
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 8,
      overflow: "hidden",
    },

    row: {
      flexDirection: "row",
      alignItems: "center",
      padding: 10,
      backgroundColor: theme.colors.row,
    },
    altRow: { backgroundColor: theme.colors.rowAlt },
    pastRow: { opacity: 0.6 },

    todayRowOutline: {
      borderWidth: 1,
      borderColor: theme.colors.primary,
    },

    headerRow: {
      backgroundColor: theme.colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },

    colDay: { width: 120, color: theme.colors.text },
    colDate: { width: 80, color: theme.colors.mutedText },
    colDinner: { flex: 1, paddingRight: 12, color: theme.colors.text },
    colRecipe: { width: 140, paddingRight: 12 },
    colRemove: { width: 120 },

    dinnerRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    dinnerText: {
      color: theme.colors.text,
      fontWeight: "500",
    },

    smallButton: {
      minWidth: 64,
      paddingVertical: 4,
      paddingHorizontal: 12,
      borderRadius: 6,
      borderWidth: 1,
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.surfaceAlt,
      alignItems: "center",
    },
    smallButtonText: {
      color: theme.colors.primary,
      fontWeight: "500",
    },

    recipeButton: {
      paddingVertical: 6,
      paddingHorizontal: 12,
      borderRadius: 6,
      borderWidth: 1,
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.surfaceAlt,
      alignItems: "center",
    },
    recipeButtonText: {
      color: theme.colors.primary,
      fontWeight: "500",
    },

    removeButton: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingVertical: 6,
      paddingHorizontal: 12,
      borderRadius: 6,
      borderWidth: 1,
      borderColor: theme.colors.danger,
      backgroundColor: theme.colors.surfaceAlt,
    },
    removeText: {
      color: theme.colors.danger,
      fontWeight: "500",
    },

    buttonHover: { backgroundColor: theme.colors.rowHover },
    removeHover: { backgroundColor: "#ffdede" },

    modal: {
      backgroundColor: theme.colors.surface,
      padding: 20,
      borderRadius: 8,
    },
    modalTitle: {
      fontSize: 18,
      marginBottom: 10,
      color: theme.colors.text,
    },
    input: {
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surfaceAlt,
      color: theme.colors.text,
      padding: 8,
      marginBottom: 10,
    },
    suggestion: {
      padding: 6,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.divider,
      color: theme.colors.text,
    },
    saveButton: {
      backgroundColor: theme.colors.buttonPrimary,
      padding: 10,
      marginTop: 10,
      borderRadius: 6,
      alignItems: "center",
    },
    saveText: {
      color: theme.colors.buttonPrimaryText,
      fontWeight: "600",
    },
    cancel: { marginTop: 10, alignItems: "center" },
    cancelText: { color: theme.colors.text },
  });