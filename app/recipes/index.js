import { View, Text, Pressable, FlatList } from "react-native";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useRouter } from "expo-router";

export default function RecipeList() {
  const [recipes, setRecipes] = useState([]);
  const router = useRouter();

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const { data } = await supabase
      .from("recipes")
      .select("id, title")
      .order("title");

    setRecipes(data ?? []);
  }

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 24, marginBottom: 10 }}>Recipes</Text>

      <Pressable
        onPress={() => router.push("/recipes/new")}
        style={{ marginBottom: 10 }}
      >
        <Text style={{ color: "#007AFF" }}>+ Add new recipe</Text>
      </Pressable>

      <FlatList
        data={recipes}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => router.push(`/recipes/${item.id}`)}
            style={{ padding: 10 }}
          >
            <Text>{item.title}</Text>
          </Pressable>
        )}
      />
    </View>
  );
}
