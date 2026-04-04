import { View, Text, FlatList } from "react-native";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { getMonday, addDays, formatISO } from "../../lib/dates";

export default function ShoppingList() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    generate();
  }, []);

  async function generate() {
    const monday = getMonday(new Date());

    const { data } = await supabase
      .from("planner")
      .select("recipe:recipes(ingredients)")
      .gte("date", formatISO(monday))
      .lte("date", formatISO(addDays(monday, 6)));

    const merged = {};

    data.forEach(r => {
      r.recipe?.ingredients?.forEach(i => {
        const key = `${i.name}|${i.unit}`;
        if (!merged[key]) merged[key] = { ...i };
        else merged[key].quantity += i.quantity;
      });
    });

    setItems(Object.values(merged));
  }

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 24, marginBottom: 10 }}>Shopping List</Text>
      <FlatList
        data={items}
        keyExtractor={(i, idx) => idx.toString()}
        renderItem={({ item }) => (
          <Text>
            {item.quantity} {item.unit} {item.name}
          </Text>
        )}
      />
    </View>
  );
}