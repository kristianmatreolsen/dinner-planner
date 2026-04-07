import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Modal,
  TextInput,
  Platform,
} from "react-native";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { getMonday, addDays, formatISO } from "../lib/dates";
import { useTheme } from "../lib/theme/theme-context";

/* ================== CONSTANTS ================== */

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

/* ================== HELPERS ================== */

function formatDateRange(start, end) {
  const opts = { month: "short", day: "numeric" };
  return `${start.toLocaleDateString(undefined, opts)} – ${end.toLocaleDateString(undefined, opts)}`;
}

function getISOWeekNumber(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
}

function getISOWeekYear(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  return d.getUTCFullYear();
}

/* ================== MAIN COMPONENT ================== */

export default function WeekPlanner() {
  const { theme } = useTheme();
  const styles = stylesFactory(theme);

  const [weekOffset, setWeekOffset] = useState(0);
  const [planner, setPlanner] = useState({});
  const [recipes, setRecipes] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [customRecipe, setCustomRecipe] = useState("");
  const [suggestions, setSuggestions] = useState([]);

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
      .select(`date, recipe:recipes(title)`)
      .gte("date", formatISO(monday))
      .lte("date", formatISO(addDays(monday, 6)));

    const mapped = {};
    data?.forEach((row) => {
      mapped[row.date] = row.recipe?.title ?? null;
    });

    setPlanner(mapped);
  }

  function openForDate(date) {
    setSelectedDate(date);
    setCustomRecipe("");
    setSuggestions([]);
    setShowModal(true);
  }

  async function clearDay(date) {
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

  /* ================== DATE LOGIC ================== */

  const monday = getMonday(new Date());
  monday.setDate(monday.getDate() + weekOffset * 7);
  const weekEnd = addDays(monday, 6);

  const todayISO = formatISO(new Date());
  const isCurrentWeek =
    formatISO(monday) === formatISO(getMonday(new Date()));

  const weekNumber = getISOWeekNumber(monday);
  const weekYear = getISOWeekYear(monday);
  const dateRangeLabel = formatDateRange(monday, weekEnd);

  /* ================== UI ================== */

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Weekly planned dinners</Text>

      <View
        style={[
          styles.weekNav,
          isCurrentWeek && styles.currentWeekNav,
        ]}
      >
        <Pressable
          style={styles.navButton}
          onPress={() => setWeekOffset((w) => w - 1)}
        >
          <Text style={styles.navArrow}>← Previous</Text>
        </Pressable>

        <View style={styles.navCenter}>
          <Text style={styles.weekLabel}>
            {isCurrentWeek
              ? `Current · Week ${weekNumber} (${weekYear})`
              : `Week ${weekNumber} (${weekYear})`}
          </Text>
          <Text style={styles.weekRange}>{dateRangeLabel}</Text>
        </View>

        <Pressable
          style={styles.navButton}
          onPress={() => setWeekOffset((w) => w + 1)}
        >
          <Text style={styles.navArrow}>Next →</Text>
        </Pressable>
      </View>

      <View style={styles.table}>
        {DAYS.map((day, index) => {
          const date = formatISO(addDays(monday, index));
          const dinner = planner[date];
          const isToday = isCurrentWeek && date === todayISO;

          return (
            <View
              key={date}
              style={[
                styles.row,
                index % 2 === 1 && styles.altRow,
                isToday && styles.todayRow,
              ]}
            >
              <Text
                style={[
                  styles.day,
                  isToday && styles.todayDay,
                ]}
              >
                {day}
              </Text>

              <Pressable
                style={styles.cell}
                onPress={() => openForDate(date)}
              >
                <Text style={styles.cellText}>
                  {dinner || "Insert dinner"}
                </Text>
              </Pressable>

              {dinner && (
                <Pressable onPress={() => clearDay(date)}>
                  <Text style={styles.remove}>✖</Text>
                </Pressable>
              )}
            </View>
          );
        })}
      </View>

      {showModal && (
        Platform.OS === "web" ? (
          <View style={styles.overlay}>
            <ModalContent
              styles={styles}
              recipes={recipes}
              customRecipe={customRecipe}
              setCustomRecipe={setCustomRecipe}
              suggestions={suggestions}
              setSuggestions={setSuggestions}
              saveRecipe={saveRecipe}
              close={() => setShowModal(false)}
            />
          </View>
        ) : (
          <Modal visible animationType="slide">
            <ModalContent
              styles={styles}
              recipes={recipes}
              customRecipe={customRecipe}
              setCustomRecipe={setCustomRecipe}
              suggestions={suggestions}
              setSuggestions={setSuggestions}
              saveRecipe={saveRecipe}
              close={() => setShowModal(false)}
            />
          </Modal>
        )
      )}
    </View>
  );
}

/* ================== MODAL ================== */

function ModalContent({
  styles,
  recipes,
  customRecipe,
  setCustomRecipe,
  suggestions,
  setSuggestions,
  saveRecipe,
  close,
}) {
  return (
    <View style={styles.modal}>
      <Text style={styles.modalTitle}>Select Dinner</Text>

      <TextInput
        style={styles.input}
        placeholder="Type a dinner…"
        placeholderTextColor={styles.muted.color}
        value={customRecipe}
        onChangeText={(text) => {
          setCustomRecipe(text);
          setSuggestions(
            recipes.filter((r) =>
              r.title.toLowerCase().includes(text.toLowerCase())
            )
          );
        }}
      />

      {suggestions.map((r) => (
        <Pressable key={r.id} onPress={() => saveRecipe(r.id)}>
          <Text style={styles.suggestion}>{r.title}</Text>
        </Pressable>
      ))}

      <Pressable
        style={styles.saveButton}
        onPress={() => saveRecipe(null, customRecipe)}
      >
        <Text style={styles.saveText}>Save custom dinner</Text>
      </Pressable>

      <Pressable onPress={close} style={styles.cancel}>
        <Text style={styles.cancelText}>Cancel</Text>
      </Pressable>
    </View>
  );
}

/* ================== STYLES ================== */

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
    },
    navButton: { paddingHorizontal: 16, paddingVertical: 8 },
    navArrow: { fontSize: 16, fontWeight: "600", color: theme.colors.text },
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
      padding: 12,
      backgroundColor: theme.colors.row,
    },
    altRow: {
      backgroundColor: theme.colors.rowAlt,
    },
    todayRow: {
      backgroundColor: theme.colors.rowHover,
      borderLeftWidth: 4,
      borderLeftColor: theme.colors.primary,
    },
    day: {
      width: 120,
      fontWeight: "600",
      color: theme.colors.text,
    },
    todayDay: {
      color: theme.colors.primary,
    },
    cell: { flex: 1 },
    cellText: {
      color: theme.colors.text,
    },
    remove: { color: theme.colors.danger, marginLeft: 10 },

    overlay: {
      position: "fixed",
      inset: 0,
      backgroundColor: "rgba(0,0,0,0.5)",
      justifyContent: "center",
      alignItems: "center",
    },
    modal: {
      backgroundColor: theme.colors.surface,
      padding: 20,
      width: 300,
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
    muted: { color: theme.colors.mutedText },
  });