// src/db.js
import { supabase } from './supabase.js';

// Vrátí aktivní session + user id
export async function getSessionSafe() {
  const { data: { session } } = await supabase.auth.getSession();
  return session || null;
}

export async function getMyProfile() {
  const session = await getSessionSafe();
  if (!session) throw new Error('No session');
  const { data, error } = await supabase
    .from('profiles')
    .select('id,email,display_name,role,theme,updated_at')
    .eq('id', session.user.id)
    .single();
  if (error && error.code !== 'PGRST116') throw error; // not found
  return data || null;
}

// Upsert jen povolených polí (RLS ochrání id)
export async function upsertMyProfile(patch) {
  const session = await getSessionSafe();
  if (!session) throw new Error('No session');
  const row = { id: session.user.id, ...patch };
  const { data, error } = await supabase
    .from('profiles')
    .upsert(row, { onConflict: 'id' })
    .select()
    .single();
  if (error) throw error;
  return data;
}
