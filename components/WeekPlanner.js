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

// Date range (e.g. Apr 1 – Apr 7)
function formatDateRange(start, end) {
  const opts = { month: "short", day: "numeric" };
  return `${start.toLocaleDateString(undefined, opts)} – ${end.toLocaleDateString(undefined, opts)}`;
}

// ISO week number
function getISOWeekNumber(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
}

// ISO week-year (important around New Year)
function getISOWeekYear(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  return d.getUTCFullYear();
}

/* ================== MAIN COMPONENT ================== */

export default function WeekPlanner() {
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
    data?.forEach(row => {
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

      {/* ================== WEEK NAV ================== */}
      <View
        style={[
          styles.weekNav,
          isCurrentWeek && styles.currentWeekNav,
        ]}
      >
        <Pressable
          style={styles.navButton}
          onPress={() => setWeekOffset(w => w - 1)}
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
          onPress={() => setWeekOffset(w => w + 1)}
        >
          <Text style={styles.navArrow}>Upcoming →</Text>
        </Pressable>
      </View>

      {/* ================== PLANNER TABLE ================== */}
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
              <Text style={[styles.day, isToday && styles.todayDay]}>
                {day}
              </Text>

              <Pressable
                style={styles.cell}
                onPress={() => openForDate(date)}
              >
                <Text style={isToday && styles.todayText}>
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

      {/* ================== MODAL ================== */}
      {showModal && (
        Platform.OS === "web" ? (
          <View style={styles.overlay}>
            <ModalContent
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

/* ================== MODAL CONTENT ================== */

function ModalContent({
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
        value={customRecipe}
        onChangeText={(text) => {
          setCustomRecipe(text);
          setSuggestions(
            recipes.filter(r =>
              r.title.toLowerCase().includes(text.toLowerCase())
            )
          );
        }}
      />

      {suggestions.map(r => (
        <Pressable key={r.id} onPress={() => saveRecipe(r.id)}>
          <Text style={styles.suggestion}>{r.title}</Text>
        </Pressable>
      ))}

      <Pressable
        style={styles.saveButton}
        onPress={() => saveRecipe(null, customRecipe)}
      >
        <Text style={{ color: "white" }}>Save Custom Dinner</Text>
      </Pressable>

      <Pressable onPress={close} style={styles.cancel}>
        <Text>Cancel</Text>
      </Pressable>
    </View>
  );
}

/* ================== STYLES ================== */

const styles = StyleSheet.create({
  container: { padding: 20 },
  title: { fontSize: 24, fontWeight: "600", textAlign: "center" },

  /* Week navigation */
  weekNav: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 15,
    padding: 10,
    borderRadius: 8,
  },
  currentWeekNav: { backgroundColor: "#e6f0ff" },
  navButton: { paddingHorizontal: 16, paddingVertical: 8 },
  navArrow: { fontSize: 20, fontWeight: "600" },
  navCenter: { alignItems: "center" },
  weekLabel: { fontWeight: "600" },
  weekRange: { fontSize: 12, color: "#555" },

  /* Table */
  table: { borderWidth: 1, borderColor: "#ccc", borderRadius: 8 },
  row: { flexDirection: "row", alignItems: "center", padding: 12 },
  altRow: { backgroundColor: "#f5f5f5" },
  todayRow: {
    backgroundColor: "#dbeeff",
    borderLeftWidth: 4,
    borderLeftColor: "#007AFF",
  },
  day: { width: 120, fontWeight: "600" },
  todayDay: { color: "#007AFF" },
  cell: { flex: 1 },
  todayText: { fontWeight: "700" },
  remove: { color: "red", marginLeft: 10 },

  /* Modal */
  overlay: {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modal: { backgroundColor: "white", padding: 20, width: 300, borderRadius: 8 },
  modalTitle: { fontSize: 18, marginBottom: 10 },
  input: { borderWidth: 1, padding: 8, marginBottom: 10 },
  suggestion: { padding: 6, borderBottomWidth: 1 },
  saveButton: { backgroundColor: "#007AFF", padding: 10, marginTop: 10 },
  cancel: { marginTop: 10, alignItems: "center" },
});