import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// DOPLŇ své klíče z Supabase → Settings → API
export const SUPABASE_URL = "https://auvhxsbaklfeiwrmwlyl.supabase.co";
export const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF1dmh4c2Jha2xmZWl3cm13bHlsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg4MDEzNDksImV4cCI6MjA3NDM3NzM0OX0.S6-WwY_rwYe4Lq7p0HSLUCPfUpPXvHdUswBZ5s8qiIA";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { autoRefreshToken: true, persistSession: true, detectSessionInUrl: true }
});

window.supabase = supabase; // pro konzoli
console.log("[SUPABASE INIT]", SUPABASE_URL);
