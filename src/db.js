// src/db.js – tenká vrstva nad Supabase (profiles + storage + invite)
import { supabase } from './supabase.js';

export async function getSessionUser() {
  const { data, error } = await supabase.auth.getUser();
  if (error) return { user: null, error };
  return { user: data.user, error: null };
}

export async function getMyProfile() {
  const { user, error: uerr } = await getSessionUser();
  if (uerr) return { data: null, error: uerr };
  if (!user) return { data: null, error: new Error('Nenalezen přihlášený uživatel') };
  const { data, error } = await supabase
    .from('profiles')
    .select('id, email, display_name, role, archived')
    .eq('id', user.id)
    .single();
  return { data, error };
}

export async function isAdmin() {
  const { data, error } = await getMyProfile();
  if (error) return false;
  return data?.role === 'admin';
}

export async function listProfiles({ q = '' } = {}) {
  let query = supabase
    .from('profiles')
    .select('id, email, display_name, role, archived')
    .order('display_name', { ascending: true });
  if (q) query = query.ilike('display_name', `%${q}%`);
  const { data, error } = await query;
  return { data: data || [], error };
}

export async function getProfile(id) {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, email, display_name, role, archived')
    .eq('id', id)
    .single();
  return { data, error };
}

export async function updateProfile(id, payload) {
  const { data, error } = await supabase
    .from('profiles')
    .update(payload)
    .eq('id', id)
    .select()
    .single();
  return { data, error };
}

export async function createProfile(payload) {
  const { data, error } = await supabase
    .from('profiles')
    .insert(payload)
    .select()
    .single();
  return { data, error };
}

export async function archiveProfile(id) {
  const { data, error } = await supabase
    .from('profiles')
    .update({ archived: true })
    .eq('id', id)
    .select()
    .single();
  return { data, error };
}

export async function inviteUserByEmail({ email, display_name = '', role = 'user' }) {
  try {
    const { data, error } = await supabase.functions.invoke('invite-user', {
      body: { email, display_name, role }
    });
    return { data, error };
  } catch (err) {
    return { data: null, error: err };
  }
}

const ATTACH_BUCKET = 'attachments';

export async function listAttachments(folder) {
  const { data, error } = await supabase.storage.from(ATTACH_BUCKET).list(folder, { limit: 100 });
  return { data: data || [], error };
}

export async function uploadAttachment(folder, file) {
  const path = `${folder}/${Date.now()}_${file.name}`;
  const { data, error } = await supabase.storage.from(ATTACH_BUCKET).upload(path, file, {
    cacheControl: '3600', upsert: false
  });
  return { data, error };
}

export async function removeAttachment(path) {
  const { data, error } = await supabase.storage.from(ATTACH_BUCKET).remove([path]);
  return { data, error };
}
// --- Roles API ---
export async function listRoles() {
  const { data, error } = await supabase
    .from('roles')
    .select('slug,label,color,is_system')
    .order('label', { ascending: true });
  return { data, error };
}

export async function upsertRole({ slug, label, color, is_system = false }) {
  const { data, error } = await supabase
    .from('roles')
    .upsert({ slug, label, color, is_system }, { onConflict: 'slug' })
    .select();
  return { data, error };
}

export async function deleteRole(slug) {
  const { error } = await supabase.from('roles').delete().eq('slug', slug);
  return { error };
}
// ... ostatní importy a funkce

export async function listAttachments({ entity, entityId, showArchived = false }) {
  // TODO: dotaz na tabulku attachments podle entity, entity_id a showArchived
  // Vrátí pole objektů: { id, filename, url, archived }
  // Ukázkový skeleton:
  return { data: [] };
}

export async function uploadAttachment({ entity, entityId, file }) {
  // TODO: upload file do Supabase Storage + záznam do tabulky attachments
  // Můžeš použít supabase.storage a .from('attachments')
}

export async function archiveAttachment(id) {
  // TODO: nastav archived=true v tabulce attachments podle id
}
