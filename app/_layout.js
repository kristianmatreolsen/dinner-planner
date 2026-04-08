// app/_layout.js

import { Slot } from "expo-router";
import { ThemeProvider } from "../lib/theme/theme-context";

export default function RootLayout() {
  return (
    <ThemeProvider>
      <Slot />
    </ThemeProvider>
  );
}