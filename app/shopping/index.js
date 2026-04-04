import { useEffect, useState } from "react";
import { View, Text, FlatList, Pressable } from "react-native";
import { supabase } from "../../lib/supabase";

export default function Shopping() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    fetchItems();

    const channel = supabase
      .channel("shopping")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "shopping_items" },
        fetchItems
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  const fetchItems = async () => {
    const { data } = await supabase.from("shopping_items").select("*");
    setItems(data || []);
  };

  const toggle = async (item) => {
    await supabase
      .from("shopping_items")
      .update({ checked: !item.checked })
      .eq("id", item.id);
  };

  return (
    <FlatList
      data={items}
      keyExtractor={i => i.id}
      renderItem={({ item }) => (
        <Pressable onPress={() => toggle(item)}>
          <Text style={{ fontSize: 18 }}>
            {item.checked ? "✅" : "⬜"} {item.name}
          </Text>
        </Pressable>
      )}
    />
  );
}
