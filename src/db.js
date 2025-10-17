// src/db.js — upravená verze s validation/sanitization strategií a podporou popisku a aktualizace metadat
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
        old_value: old_data_to_string(oldData[key]),
        new_value: new_data_to_string(newData[key]),
        changed_by,
        changed_at
      });
    }
  }
  if (inserts.length) {
    await supabase.from('profiles_history').insert(inserts);
  }
}

function old_data_to_string(v) {
  return v == null ? null : String(v);
}
function new_data_to_string(v) {
  return v == null ? null : String(v);
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

/**
 * validateFilename:
 * - kontroluje, zda název souboru obsahuje pouze povolené znaky (bez diakritiky)
 * - povolené znaky: A-Za-z0-9 . _ -
 */
export function validateFilename(name) {
  if (!name || typeof name !== 'string') return false;
  const n = name.trim();
  const ascii = n.normalize('NFKD').replace(/[\u0300-\u036f]/g, '');
  return /^[A-Za-z0-9.\-_]+$/.test(ascii);
}

/**
 * sanitizeFilename:
 * - odstraní diakritiku a nahradí nepovolené znaky podtržítkem
 */
export function sanitizeFilename(name) {
  if (!name || typeof name !== 'string') return 'file';
  const base = name.split(/[/\\]+/).pop();
  const ascii = base.normalize('NFKD').replace(/[\u0300-\u036f]/g, '');
  const safe = ascii.replace(/[^A-Za-z0-9.\-_]/g, '_').replace(/_+/g, '_');
  return safe.slice(0, 200) || 'file';
}

/**
 * uploadAttachmentToStorage(folder, file, options)
 * - options.autoSanitize: pokud true, upraví název souboru místo vrácení chyby
 * - pokud autoSanitize=false (výchozí) a název obsahuje nepovolené znaky, vrátí chybu (user musí přejmenovat)
 */
export async function uploadAttachmentToStorage(folder, file, { autoSanitize = false } = {}) {
  if (!file || !file.name) {
    return { data: null, error: new Error('No file provided') };
  }

  let filename = file.name.trim();

  if (!validateFilename(filename)) {
    if (autoSanitize) {
      filename = sanitizeFilename(filename);
    } else {
      return { data: null, error: new Error(`Invalid filename: "${file.name}". Zkuste přejmenovat soubor bez mezer, diakritiky nebo speciálních znaků (nebo povolit automatickou sanitizaci).`) };
    }
  }

  const path = `${folder}/${Date.now()}_${filename}`;
  try {
    const { data, error } = await supabase.storage.from(ATTACH_BUCKET).upload(path, file, {
      cacheControl: '3600',
      upsert: false
    });
    return { data, error, path };
  } catch (err) {
    return { data: null, error: err };
  }
}

export async function removeAttachmentFromStorage(path) {
  const { data, error } = await supabase.storage.from(ATTACH_BUCKET).remove([path]);
  return { data, error };
}

export async function listStorageAttachments(folder) {
  const { data, error } = await supabase.storage.from(ATTACH_BUCKET).list(folder, { limit: 100 });
  return { data: data || [], error };
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

/**
 * uploadAttachment({entity, entityId, file, description = '', autoSanitize = false})
 * - pokud filename není validní a autoSanitize=false vrátí error, aby uživatel přejmenoval soubor
 * - pokud autoSanitize=true, provede sanitizaci názvu automaticky
 */
export async function uploadAttachment({ entity, entityId, file, description = '', autoSanitize = false }) {
  const folder = `${entity}/${entityId}`;
  const { data: uploadData, error: uploadError, path } = await uploadAttachmentToStorage(folder, file, { autoSanitize });
  if (uploadError) return { data: null, error: uploadError };

  const filePath = (uploadData && uploadData.path) ? uploadData.path : path;
  if (!filePath) {
    return { data: null, error: new Error('Soubor nahrán do storage, ale nebyla získána cesta k souboru (path)') };
  }

  const { data: publicUrlData } = supabase.storage.from(ATTACH_BUCKET).getPublicUrl(filePath);
  const fileUrl = publicUrlData?.publicUrl || filePath;

  const fileData = {
    entity,
    entity_id: entityId,
    filename: file.name,
    path: filePath,
    url: fileUrl,
    archived: false,
    description,
    created_at: new Date().toISOString()
  };

  const { data, error } = await supabase.from('attachments').insert(fileData).select().single();
  return { data, error };
}

export async function archiveAttachment(id) {
  const { data, error } = await supabase
    .from('attachments')
    .update({ archived: true })
    .eq('id', id)
    .select()
    .single();
  return { data, error };
}

// Nová funkce: od-archivovat (vrátit do aktivních)
export async function unarchiveAttachment(id) {
  const { data, error } = await supabase
    .from('attachments')
    .update({ archived: false })
    .eq('id', id)
    .select()
    .single();
  return { data, error };
}

// Nová funkce: aktualizovat metadata (filename/display-name a description) v DB
// Poznámka: toto NEPŘEJMENOVÁVÁ objekt ve storage, pouze metadata v tabulce attachments
export async function updateAttachmentMetadata(id, { filename, description }) {
  const payload = {};
  if (typeof filename === 'string') payload.filename = filename;
  if (typeof description === 'string') payload.description = description;
  if (!Object.keys(payload).length) return { data: null, error: new Error('No metadata to update') };

  const { data, error } = await supabase
    .from('attachments')
    .update(payload)
    .eq('id', id)
    .select()
    .single();
  return { data, error };
}

// Pro zpětnou kompatibilitu — jednoduchá funkce na update pouze popisku
export async function updateAttachmentDescription(id, description) {
  return await updateAttachmentMetadata(id, { description });
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
