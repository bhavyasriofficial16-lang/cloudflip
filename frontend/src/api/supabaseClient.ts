import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL || "";
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

// When Supabase isn't configured yet, this client simply never
// authenticates anyone — the app stays usable in demo mode.
export const supabase = createClient(url || "https://placeholder.supabase.co", anonKey || "placeholder");
export const isSupabaseConfigured = Boolean(url && anonKey);
