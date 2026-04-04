import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  StyleSheet,
} from "react-native";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useLocalSearchParams, useRouter } from "expo-router";

export default function RecipeEditor() {
  const { id } = useLocalSearchParams(); // "new" or recipe id
  const router = useRouter();

  const isNew = id === "new";

  const [title, setTitle] = useState("");
  const [ingredients, setIngredients] = useState([]);
  const [steps, setSteps] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isNew) loadRecipe();
  }, []);

  /* ================= LOAD ================= */

  async function loadRecipe() {
    const { data, error } = await supabase
      .from("recipes")
      .select("title, ingredients, steps")
      .eq("id", id)
      .single();

    if (error) {
      console.error(error);
      return;
    }

    setTitle(data.title ?? "");
    setIngredients(data.ingredients ?? []);
    setSteps(data.steps ?? []);
  }

  /* ================= INGREDIENTS ================= */

  function updateIngredient(index, field, value) {
    const copy = [...ingredients];
    copy[index] = { ...copy[index], [field]: value };
    setIngredients(copy);
  }

  function addIngredient() {
    setIngredients([
      ...ingredients,
      { name: "", quantity: "", unit: "" },
    ]);
  }

  function removeIngredient(index) {
    const copy = [...ingredients];
    copy.splice(index, 1);
    setIngredients(copy);
  }

  /* ================= STEPS ================= */

  function updateStep(index, value) {
    const copy = [...steps];
    copy[index] = value;
    setSteps(copy);
  }

  function addStep() {
    setSteps([...steps, ""]);
  }

  function removeStep(index) {
    const copy = [...steps];
    copy.splice(index, 1);
    setSteps(copy);
  }

  /* ================= SAVE ================= */

  async function saveRecipe() {
    if (!title.trim()) return;

    setSaving(true);

    const payload = {
      title: title.trim(),
      ingredients,
      steps,
    };

    let error;

    if (isNew) {
      ({ error } = await supabase.from("recipes").insert(payload));
    } else {
      ({ error } = await supabase
        .from("recipes")
        .update(payload)
        .eq("id", id));
    }

    setSaving(false);

    if (error) {
      console.error(error);
      return;
    }

    router.back();
  }

  /* ================= UI ================= */

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.title}>
        {isNew ? "New Recipe" : "Edit Recipe"}
      </Text>

      {/* TITLE */}
      <TextInput
        placeholder="Recipe title"
        value={title}
        onChangeText={setTitle}
        style={styles.input}
      />

      {/* INGREDIENTS */}
      <Text style={styles.sectionTitle}>Ingredients</Text>

      {ingredients.map((ing, index) => (
        <View key={index} style={styles.row}>
          <TextInput
            placeholder="Name"
            value={ing.name}
            onChangeText={(v) => updateIngredient(index, "name", v)}
            style={[styles.input, styles.flex2]}
          />
          <TextInput
            placeholder="Qty"
            value={String(ing.quantity)}
            keyboardType="numeric"
            onChangeText={(v) => updateIngredient(index, "quantity", v)}
            style={[styles.input, styles.flex1]}
          />
          <TextInput
            placeholder="Unit"
            value={ing.unit}
            onChangeText={(v) => updateIngredient(index, "unit", v)}
            style={[styles.input, styles.flex1]}
          />
          <Pressable onPress={() => removeIngredient(index)}>
            <Text style={styles.remove}>✖</Text>
          </Pressable>
        </View>
      ))}

      <Pressable onPress={addIngredient}>
        <Text style={styles.link}>+ Add ingredient</Text>
      </Pressable>

      {/* STEPS */}
      <Text style={styles.sectionTitle}>Steps</Text>

      {steps.map((step, index) => (
        <View key={index} style={styles.stepRow}>
          <TextInput
            placeholder={`Step ${index + 1}`}
            value={step}
            multiline
            onChangeText={(v) => updateStep(index, v)}
            style={styles.stepInput}
          />
          <Pressable onPress={() => removeStep(index)}>
            <Text style={styles.remove}>✖</Text>
          </Pressable>
        </View>
      ))}

      <Pressable onPress={addStep}>
        <Text style={styles.link}>+ Add step</Text>
      </Pressable>

      {/* SAVE */}
      <Pressable
        onPress={saveRecipe}
        style={[styles.saveButton, saving && styles.disabled]}
        disabled={saving}
      >
        <Text style={styles.saveText}>
          {saving ? "Saving…" : "Save Recipe"}
        </Text>
      </Pressable>
    </ScrollView>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    marginBottom: 20,
    textAlign: "center",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 20,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 8,
    borderRadius: 5,
    marginBottom: 10,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  flex1: { flex: 1 },
  flex2: { flex: 2 },
  stepRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 6,
  },
  stepInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 8,
    borderRadius: 5,
    marginBottom: 10,
    minHeight: 60,
  },
  link: {
    color: "#007AFF",
    marginVertical: 8,
  },
  remove: {
    color: "red",
    padding: 4,
  },
  saveButton: {
    backgroundColor: "#007AFF",
    padding: 14,
    borderRadius: 6,
    marginTop: 30,
  },
  disabled: {
    opacity: 0.6,
  },
  saveText: {
    color: "white",
    textAlign: "center",
    fontWeight: "600",
  },
});