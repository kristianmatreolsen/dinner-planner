import { Stack } from "expo-router";
import { useTheme } from "../../../lib/theme-context";

export default function RecipesLayout() {
  const { theme } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.surface,
          height: 56,                    // ✅ MATCH drawer
          borderBottomWidth: 1,          // ✅ MATCH drawer
          borderBottomColor: theme.colors.border,
        },
        headerTintColor: theme.colors.text,
        headerTitleAlign: "left",
      }}
    >
      {/* Recipes list */}
      <Stack.Screen
        name="index"
        options={{ title: "Recipes" }}
      />

      {/* View recipe */}
      <Stack.Screen
        name="view/[id]"
        options={{ title: "Recipe" }}
      />

      {/* Edit + Create recipe */}
      <Stack.Screen
        name="[id]"
        options={{ title: "Edit recipe" }}
      />
    </Stack>
  );
}
