import { useState } from "react";
import { View, TextInput, Button } from "react-native";
import { supabase } from "../../lib/supabase";

export default function CreateRecipe() {
  const [title, setTitle] = useState("");
  const [ingredients, setIngredients] = useState("");
  const [steps, setSteps] = useState("");

  const save = async () => {
    await supabase.from("recipes").insert({
      title,
      ingredients: ingredients.split("\n"),
      steps: steps.split("\n")
    });
  };

  return (
    <View style={{ padding: 20 }}>
      <TextInput placeholder="Title" onChangeText={setTitle} />
      <TextInput placeholder="Ingredients (one per line)" multiline onChangeText={setIngredients} />
      <TextInput placeholder="Steps (one per line)" multiline onChangeText={setSteps} />
      <Button title="Save Recipe" onPress={save} />
    </View>
  );
}