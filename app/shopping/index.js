import { useEffect, useState } from "react";
import { View, Text, FlatList } from "react-native";
import { supabase } from "../../lib/supabase";

export default function Shopping() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    const { data, error } = await supabase.from("shopping_items").select("*");
    if (!error) setItems(data);
  };

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 28, fontWeight: "600" }}>Shopping List</Text>

      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Text style={{ padding: 10, fontSize: 18 }}>• {item.name}</Text>
        )}
      />
    </View>
  );
}