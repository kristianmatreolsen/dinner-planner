import { useEffect, useState } from "react";
import { View, Text, FlatList } from "react-native";
import { supabase } from "../../lib/supabase";
import RecipeCard from "../../components/RecipeCard";

export default function Recipes() {
  const [recipes, setRecipes] = useState([]);

  useEffect(() => {
    fetchRecipes();
  }, []);

  const fetchRecipes = async () => {
    const { data, error } = await supabase.from("recipes").select("*");
    if (!error) setRecipes(data);
  };

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 28, fontWeight: "600" }}>Recipes</Text>

      <FlatList
        data={recipes}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <RecipeCard recipe={item} />}
      />
    </View>
  );
}