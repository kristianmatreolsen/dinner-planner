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
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../../../lib/supabase";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useTheme } from "../../../lib/theme/theme-context";
import { UNIT_SYSTEMS, toBase, fromBase } from "../../../lib/units";

/* Unit labels */
const UNIT_LABELS = {
  pcs: "pcs",
  pkg: "pkg",
  btl: "btl",
  ml: "ml",
  l: "l",
  g: "g",
  kg: "kg",
  tsp: "tsp",
  tbsp: "tbsp",
  cup: "cup",
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
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState("");
  const [ingredients, setIngredients] = useState([]);
  const [steps, setSteps] = useState([]);

  useEffect(() => {
    init();
  }, [id]);

  async function init() {
    const stored =
      (await AsyncStorage.getItem("measurement_system")) || "metric";
    setSystem(stored);

    if (isNew) {
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
        return { name: i.name, quantity: c.quantity, unit: c.unit };
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

  function removeStep(index) {
    setSteps(steps.filter((_, i) => i !== index));
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
        <Text style={styles.muted}>Loading…</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.title}>
        {isNew ? "New Recipe" : "Edit Recipe"}
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Recipe title"
        placeholderTextColor={theme.colors.mutedText}
        value={title}
        onChangeText={setTitle}
      />

      <Text style={styles.sectionTitle}>Ingredients</Text>

      {ingredients.map((ing, index) => (
        <View key={index} style={styles.row}>
          <TextInput
            style={[styles.input, styles.flex2]}
            placeholder="Name"
            placeholderTextColor={theme.colors.mutedText}
            value={ing.name}
            onChangeText={(v) =>
              updateIngredient(index, "name", v)
            }
          />

          <TextInput
            style={[styles.input, styles.quantityInput]}
            placeholder="Qty"
            placeholderTextColor={theme.colors.mutedText}
            keyboardType="numeric"
            value={String(ing.quantity)}
            onChangeText={(v) =>
              updateIngredient(index, "quantity", v)
            }
          />

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

          <Pressable
            style={({ hovered }) => [
              styles.trashButton,
              hovered && styles.trashHover,
            ]}
            onPress={() =>
              setIngredients(
                ingredients.filter((_, i) => i !== index)
              )
            }
          >
            <Ionicons
              name="trash-outline"
              size={18}
              color={theme.colors.danger}
            />
          </Pressable>
        </View>
      ))}

      <Pressable
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
        <View key={idx} style={styles.stepRow}>
          <TextInput
            style={[styles.input, styles.stepInput]}
            placeholder={`Step ${idx + 1}`}
            placeholderTextColor={theme.colors.mutedText}
            value={step}
            onChangeText={(v) => {
              const copy = [...steps];
              copy[idx] = v;
              setSteps(copy);
            }}
          />

          <Pressable
            style={({ hovered }) => [
              styles.trashButton,
              hovered && styles.trashHover,
            ]}
            onPress={() => removeStep(idx)}
          >
            <Ionicons
              name="trash-outline"
              size={18}
              color={theme.colors.danger}
            />
          </Pressable>
        </View>
      ))}

      <Pressable onPress={() => setSteps([...steps, ""])}>
        <Text style={styles.link}>+ Add step</Text>
      </Pressable>

      <View style={styles.actions}>
        <Pressable
          style={[styles.buttonBase, styles.secondaryButton]}
          onPress={() => router.back()}
        >
          <Text style={styles.secondaryText}>Cancel</Text>
        </Pressable>

        <Pressable
          style={[styles.buttonBase, styles.primaryButton]}
          onPress={saveRecipe}
        >
          <Text style={styles.primaryText}>
            {saving ? "Saving…" : "Save"}
          </Text>
        </Pressable>
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
      padding: 16,
    },
    title: {
      fontSize: 26,
      fontWeight: "600",
      color: theme.colors.text,
      marginBottom: 8,
    },
    sectionTitle: {
      fontSize: 18,
      color: theme.colors.text,
      marginTop: 24,
      marginBottom: 8,
    },
    input: {
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surfaceAlt,
      color: theme.colors.text,
      borderRadius: 6,
      padding: 8,
      marginBottom: 8,
    },
    row: {
      flexDirection: "row",
      gap: 8,
      alignItems: "center",
    },
    stepRow: {
      flexDirection: "row",
      gap: 8,
      alignItems: "center",
      marginBottom: 8,
    },
    stepInput: {
      flex: 1,
    },
    flex2: { flex: 2 },
    quantityInput: { width: 90, textAlign: "center" },
    pickerWrapper: {
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 6,
      overflow: "hidden",
      height: 42,
      justifyContent: "center",
    },
    picker: {
      height: 42,
      width: 120,
    },
    trashButton: {
      padding: 8,
      borderRadius: 6,
    },
    trashHover: {
      backgroundColor: theme.colors.rowHover,
    },
    actions: {
      flexDirection: "row",
      gap: 12,
      marginTop: 24,
    },
    buttonBase: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: 8,
      alignItems: "center",
    },
    primaryButton: {
      backgroundColor: theme.colors.buttonPrimary,
    },
    secondaryButton: {
      backgroundColor: theme.colors.buttonSecondary,
    },
    primaryText: {
      color: theme.colors.buttonPrimaryText,
      fontWeight: "600",
    },
    secondaryText: {
      color: theme.colors.text,
    },
    link: {
      color: theme.colors.primary,
      marginTop: 8,
    },
    muted: {
      color: theme.colors.mutedText,
    },
  });