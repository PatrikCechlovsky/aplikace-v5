import { supabase } from './supabase.js';
export { supabase };

// --- Uživatelé (profiles) ---
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
    .select('id, email, display_name, username, first_name, last_name, phone, role, note, archived, last_login, updated_at, updated_by, created_at, active, street, house_number, city, zip, birth_number')
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
    .select('id, email, display_name, username, first_name, last_name, phone, role, note, archived, last_login, updated_at, updated_by, created_at, active, street, house_number, city, zip, birth_number')
    .order('display_name', { ascending: true });
  if (q) query = query.ilike('display_name', `%${q}%`);
  const { data, error } = await query;
  return { data: data || [], error };
}

export async function getProfile(id) {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, email, display_name, username, first_name, last_name, phone, role, note, archived, last_login, updated_at, updated_by, created_at, active, street, house_number, city, zip, birth_number')
    .eq('id', id)
    .single();
  return { data, error };
}

// --- Historie změn (profiles_history) ---
export async function getProfileHistory(profileId) {
  const { data, error } = await supabase
    .from('profiles_history')
    .select('*')
    .eq('profile_id', profileId)
    .order('changed_at', { ascending: false });
  return { data, error };
}

// Zápis změn do profiles_history - pro každou změněnou položku zvlášť
export async function logProfileHistory(profileId, currentUser, oldData, newData) {
  let changed_by = null;
  if (currentUser) {
    changed_by = currentUser.display_name || currentUser.username || currentUser.email;
  }
  const changed_at = new Date().toISOString();

  const inserts = [];
  for (const key of Object.keys(newData)) {
    if (!Object.prototype.hasOwnProperty.call(oldData, key) || oldData[key] !== newData[key]) {
      inserts.push({
        profile_id: profileId,
        field: key,
        old_value: oldData[key] == null ? null : String(oldData[key]),
        new_value: newData[key] == null ? null : String(newData[key]),
        changed_by,
        changed_at
      });
    }
  }
  if (inserts.length) {
    await supabase.from('profiles_history').insert(inserts);
  }
}

export async function updateProfile(id, payload, currentUser = null) {
  if (currentUser) {
    payload.updated_by = currentUser.display_name || currentUser.username || currentUser.email;
  }
  const { data: oldProfile } = await getProfile(id);
  const { data, error } = await supabase
    .from('profiles')
    .update(payload)
    .eq('id', id)
    .select()
    .single();
  if (oldProfile && data) {
    await logProfileHistory(id, currentUser, oldProfile, payload);
  }
  return { data, error };
}

export async function createProfile(payload, currentUser = null) {
  const { data, error } = await supabase
    .from('profiles')
    .insert(payload)
    .select()
    .single();
  if (data) {
    await logProfileHistory(data.id, currentUser, {}, payload);
  }
  return { data, error };
}

export async function archiveProfile(id, currentUser = null) {
  const { data: oldProfile } = await getProfile(id);
  const { data, error } = await supabase
    .from('profiles')
    .update({ archived: true })
    .eq('id', id)
    .select()
    .single();
  if (oldProfile && data) {
    await logProfileHistory(id, currentUser, oldProfile, { archived: true });
  }
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

// --- Přílohy (univerzální tabulka attachments) ---
const ATTACH_BUCKET = 'attachments';

export async function listStorageAttachments(folder) {
  const { data, error } = await supabase.storage.from(ATTACH_BUCKET).list(folder, { limit: 100 });
  return { data: data || [], error };
}

export async function uploadAttachmentToStorage(folder, file) {
  const path = `${folder}/${Date.now()}_${file.name}`;
  const { data, error } = await supabase.storage.from(ATTACH_BUCKET).upload(path, file, {
    cacheControl: '3600', upsert: false
  });
  // Vždy vracej i path, nezáleží na tom, jestli storage API ji vrátí
  return { data, error, path };
}

export async function removeAttachmentFromStorage(path) {
  const { data, error } = await supabase.storage.from(ATTACH_BUCKET).remove([path]);
  return { data, error };
}

export async function listAttachments({ entity, entityId, showArchived = false }) {
  let query = supabase
    .from('attachments')
    .select('*')
    .eq('entity', entity)
    .eq('entity_id', entityId);
  if (!showArchived) query = query.eq('archived', false);
  const { data, error } = await query;
  return { data: data || [], error };
}

// --- OPRAVENO: Funkce nyní podporuje description/popisek ---
export async function uploadAttachment({ entity, entityId, file, description = '' }) {
  const folder = `${entity}/${entityId}`;
  // Nahraj soubor do storage
  const { data: uploadData, error: uploadError, path } = await uploadAttachmentToStorage(folder, file);
  if (uploadError) return { data: null, error: uploadError };

  // Zjisti cestu k souboru: Storage API někdy vrací path v data, někdy ne
  const filePath = (uploadData && uploadData.path) ? uploadData.path : path;
  if (!filePath) {
    return { data: null, error: new Error('Soubor nahrán do storage, ale nebyla získána cesta k souboru (path)') };
  }
  // Pro url můžeš použít publicUrl, pokud je bucket public
  const { data: publicUrlData } = supabase.storage.from(ATTACH_BUCKET).getPublicUrl(filePath);
  const fileUrl = publicUrlData?.publicUrl || filePath;

  const fileData = {
    entity,
    entity_id: entityId,
    filename: file.name,
    path: filePath,
    url: fileUrl,
    archived: false,
    description, // <-- nový sloupec popis!
    created_at: new Date().toISOString()
  };
  const { data, error } = await supabase.from('attachments').insert(fileData).select().single();
  return { data, error };

export async function archiveAttachment(id) {
  const { data, error } = await supabase
    .from('attachments')
    .update({ archived: true })
    .eq('id', id)
    .select()
    .single();
  return { data, error };
}
}
export async function updateAttachmentDescription(id, description) {
  const { data, error } = await supabase
    .from('attachments')
    .update({ description })
    .eq('id', id)
    .select()
    .single();
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
