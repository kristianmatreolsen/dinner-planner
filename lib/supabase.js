import { createClient } from "@supabase/supabase-js";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

// IMPORTANT
// do not use AsyncStorage on web or Node environments
const storage =
  Platform.OS === "web"
    ? undefined // disable auth storage on web
    : AsyncStorage; // use AsyncStorage on native

const SUPABASE_URL = "https://yparzixzlngulxwecwsg.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlwYXJ6aXh6bG5ndWx4d2Vjd3NnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ5ODE3MDUsImV4cCI6MjA5MDU1NzcwNX0.pq67VrlLt4TaZFNRGsiopPJPOtiDfJWDAYVd4JF767s";

export const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  {
    auth: {
      storage,
      persistSession: Platform.OS !== "web",
      autoRefreshToken: Platform.OS !== "web",
      detectSessionInUrl: false,
    },
  }
);