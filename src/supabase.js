import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// DOPLŇ SVOJE KLÍČE:
export const SUPABASE_URL = "https://YOUR_PROJECT.supabase.co";
export const SUPABASE_ANON_KEY = "YOUR_ANON_KEY";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { autoRefreshToken: true, persistSession: true, detectSessionInUrl: true }
});

// pro konzoli/debug
window.supabase = supabase;
console.log("[SUPABASE INIT]", SUPABASE_URL);
