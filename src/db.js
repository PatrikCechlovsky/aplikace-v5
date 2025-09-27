// src/db.js – tenká vrstva nad Supabase
import { supabase } from './supabase.js';

// Aktuální přihlášený uživatel (auth.users)
export async function getSessionUser() {
  const { data, error } = await supabase.auth.getUser();
  if (error) return { user: null, error };
  return { user: data.user, error: null };
}

// Získání mého profilu (1 řádek)
export async function getMyProfile() {
  const { user, error: uerr } = await getSessionUser();
  if (uerr) return { data: null, error: uerr };
  if (!user) return { data: null, error: new Error('Nenalezen přihlášený uživatel') };

  const { data, error } = await supabase
    .from('profiles')
    .select('id, email, display_name, role')
    .eq('id', user.id)
    .single();

  return { data, error };
}

// Jsem admin?
export async function isAdmin() {
  const { data, error } = await getMyProfile();
  if (error) return false;
  return data?.role === 'admin';
}

// Seznam profilů (RLS rozhodne, co uvidíš)
// - admin: všechny řádky
// - user: jen vlastní
export async function listProfiles() {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, email, display_name, role')
    .order('display_name', { ascending: true });

  return { data: data || [], error };
}
