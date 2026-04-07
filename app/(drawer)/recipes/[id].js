import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  StyleSheet,
  Alert,
} from "react-native";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Picker } from "@react-native-picker/picker";
import { supabase } from "../../../lib/supabase";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useTheme } from "../../../lib/theme-context";
import { UNIT_SYSTEMS, toBase, fromBase } from "../../../lib/units";

/* Local labels to avoid Metro issues */
const UNIT_LABELS = {
  pcs: "pcs",
  pkg: "pkgs",
  btl: "bottles",
  ml: "ml",
  l: "l",
  g: "g",
  kg: "kg",
  tsp: "tsp",
  tbsp: "tbsp",
  cup: "cups",
  oz: "oz",
  lb: "lb",
};

export default function RecipeEditor() {
  const { theme } = useTheme();
  const styles = stylesFactory(theme);

  const { id } = useLocalSearchParams();
  const router = useRouter();
  const isNew = id === "create";

  const [system, setSystem] = useState(null);
  const [ready, setReady] = useState(false);

  const [title, setTitle] = useState("");
  const [ingredients, setIngredients] = useState([]);
  const [steps, setSteps] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    init();
  }, [id]);

  async function init() {
    const stored =
      (await AsyncStorage.getItem("measurement_system")) || "metric";
    setSystem(stored);

    if (isNew) {
      setTitle("");
      setIngredients([{ name: "", quantity: "", unit: "pcs" }]);
      setSteps([""]);
      setReady(true);
      return;
    }

    const { data, error } = await supabase
      .from("recipes")
      .select("title, ingredients, steps")
      .eq("id", id)
      .single();

    if (error) {
      Alert.alert("Error", "Failed to load recipe");
      return;
    }

    setTitle(data.title);
    setIngredients(
      (data.ingredients || []).map((i) => {
        const c = fromBase(i.quantity, i.unit, stored);
        return {
          name: i.name,
          quantity: c.quantity,
          unit: c.unit,
        };
      })
    );
    setSteps(data.steps || []);
    setReady(true);
  }

  function updateIngredient(index, field, value) {
    const copy = [...ingredients];
    copy[index] = { ...copy[index], [field]: value };
    setIngredients(copy);
  }

  async function saveRecipe() {
    if (!title.trim()) {
      Alert.alert("Title required");
      return;
    }

    setSaving(true);

    const payload = {
      title: title.trim(),
      ingredients: ingredients.map((i) => {
        const c = toBase(i.quantity, i.unit);
        return { name: i.name, quantity: c.quantity, unit: c.unit };
      }),
      steps,
    };

    if (isNew) {
      await supabase.from("recipes").insert(payload);
    } else {
      await supabase.from("recipes").update(payload).eq("id", id);
    }

    setSaving(false);
    router.back();
  }

  if (!ready) {
    return (
      <View style={styles.container}>
        <Text>Loading…</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ ...styles.content, flexGrow: 1 }}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.title}>
        {isNew ? "New Recipe" : "Edit Recipe"}
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Recipe title"
        value={title}
        onChangeText={setTitle}
      />

      <Text style={styles.sectionTitle}>Ingredients</Text>

      {ingredients.map((ing, index) => (
        <View key={index} style={styles.row}>
          <TextInput
            style={[styles.input, styles.flex2]}
            placeholder="Name"
            value={ing.name}
            onChangeText={(v) =>
              updateIngredient(index, "name", v)
            }
          />

          <TextInput
            style={[styles.input, styles.flex1]}
            placeholder="Qty"
            keyboardType="numeric"
            value={String(ing.quantity)}
            onChangeText={(v) =>
              updateIngredient(index, "quantity", v)
            }
          />

          {/* ✅ Styled Picker */}
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={ing.unit}
              onValueChange={(v) =>
                updateIngredient(index, "unit", v)
              }
              style={styles.picker}
            >
              {Object.values(UNIT_SYSTEMS[system])
                .flat()
                .map((u) => (
                  <Picker.Item
                    key={u}
                    label={UNIT_LABELS[u] ?? u}
                    value={u}
                  />
                ))}
            </Picker>
          </View>

          <Pressable onPress={() =>
            setIngredients(ingredients.filter((_, i) => i !== index))
          }>
            <Text style={styles.remove}>✕</Text>
          </Pressable>
        </View>
      ))}

      <Pressable
        style={({ hovered }) => [
          styles.linkButton,
          hovered && styles.hover,
        ]}
        onPress={() =>
          setIngredients([
            ...ingredients,
            { name: "", quantity: "", unit: "pcs" },
          ])
        }
      >
        <Text style={styles.link}>+ Add ingredient</Text>
      </Pressable>

      <Text style={styles.sectionTitle}>Steps</Text>

      {steps.map((step, idx) => (
        <TextInput
          key={idx}
          style={styles.input}
          placeholder={`Step ${idx + 1}`}
          value={step}
          onChangeText={(v) => {
            const s = [...steps];
            s[idx] = v;
            setSteps(s);
          }}
        />
      ))}

      <Pressable
        style={({ hovered }) => [
          styles.linkButton,
          hovered && styles.hover,
        ]}
        onPress={() => setSteps([...steps, ""])}
      >
        <Text style={styles.link}>+ Add step</Text>
      </Pressable>

      {/* ✅ Unified action buttons */}
      <View style={styles.actions}>
        <Pressable
          style={({ hovered }) => [
            styles.buttonBase,
            styles.secondaryButton,
            hovered && styles.hover,
          ]}
          onPress={() => router.back()}
        >
          <Text style={styles.buttonTextSecondary}>Cancel</Text>
        </Pressable>

        <Pressable
          style={({ hovered }) => [
            styles.buttonBase,
            styles.primaryButton,
            saving && { opacity: 0.6 },
            hovered && styles.hover,
          ]}
          disabled={saving}
          onPress={saveRecipe}
        >
          <Text style={styles.buttonTextPrimary}>
            {saving ? "Saving…" : "Save"}
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

/* ================= STYLES ================= */

const stylesFactory = (theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    content: {
      padding: 16,
    },
    title: {
      fontSize: 26,
      fontWeight: "600",
      marginBottom: 8,
    },
    sectionTitle: {
      fontSize: 18,
      marginTop: 24,
      marginBottom: 8,
    },
    input: {
      borderWidth: 1,
      borderColor: "#ccc",
      borderRadius: 6,
      padding: 8,
      marginBottom: 8,
    },
    row: {
      flexDirection: "row",
      gap: 8,
      alignItems: "center",
      marginBottom: 8,
    },
    flex1: { flex: 1 },
    flex2: { flex: 2 },

    /* Dropdown */
    pickerWrapper: {
      borderWidth: 1,
      borderColor: "#ccc",
      borderRadius: 6,
      overflow: "hidden",
      height: 42,
      justifyContent: "center",
    },
    picker: {
      height: 42,
      width: 120,
    },

    actions: {
      flexDirection: "row",
      gap: 12,
      marginTop: 32,
    },

    buttonBase: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: 8,
      alignItems: "center",
      justifyContent: "center",
    },
    primaryButton: {
      backgroundColor: "#007AFF",
    },
    secondaryButton: {
      backgroundColor: "#f2f2f7",
      borderWidth: 1,
      borderColor: "#ccc",
    },
    buttonTextPrimary: {
      color: "#fff",
      fontWeight: "600",
    },
    buttonTextSecondary: {
      fontWeight: "600",
    },

    linkButton: {
      alignSelf: "flex-start",
    },
    link: {
      color: "#007AFF",
      fontWeight: "500",
    },

    hover: {
      opacity: 0.85,
    },

    remove: {
      color: "#cc0000",
      fontSize: 16,
    },
  });