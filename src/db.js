// src/db.js — upravená verze: upload -> temp upload -> finalize metadata,
// možnost cancel (smazat temp soubor), update metadata, unarchive
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

// (ostatní profile funkce beze změn - zkráceno pro přehlednost; ponechte své existující implementace)

// --- Přílohy (attachments) ---
const ATTACH_BUCKET = 'attachments';

/**
 * validateFilename: kontrola povolených znaků (bez diakritiky)
 * povolené znaky: A-Za-z0-9 . _ -
 */
export function validateFilename(name) {
  if (!name || typeof name !== 'string') return false;
  const n = name.trim();
  const ascii = n.normalize('NFKD').replace(/[\u0300-\u036f]/g, '');
  return /^[A-Za-z0-9.\-_]+$/.test(ascii);
}

/**
 * sanitizeFilename: odstraní diakritiku a nahradí nepovolené znaky podtržítkem
 */
export function sanitizeFilename(name) {
  if (!name || typeof name !== 'string') return 'file';
  const base = name.split(/[/\\]+/).pop();
  const ascii = base.normalize('NFKD').replace(/[\u0300-\u036f]/g, '');
  const safe = ascii.replace(/[^A-Za-z0-9.\-_]/g, '_').replace(/_+/g, '_');
  return safe.slice(0, 200) || 'file';
}

/**
 * uploadAttachmentToStorage(folder, file, { autoSanitize })
 * - nahraje soubor do storage a vrátí path (klíč) i případné data z API
 */
export async function uploadAttachmentToStorage(folder, file, { autoSanitize = true } = {}) {
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

/**
 * createTempUpload(folder, file, options)
 * - nahraje soubor do storage (sanitized key) a vrátí path + public url + originalName
 * - tato funkce se používá pro "upload první, pak metadata"
 */
export async function createTempUpload(folder, file, { autoSanitize = true } = {}) {
  const { data, error, path } = await uploadAttachmentToStorage(folder, file, { autoSanitize });
  if (error || !path) return { data: null, error: error || new Error('Upload failed') };

  const { data: publicUrlData } = supabase.storage.from(ATTACH_BUCKET).getPublicUrl(path);
  const publicUrl = publicUrlData?.publicUrl || path;

  return {
    data: { path, publicUrl, originalName: file.name },
    error: null
  };
}

/**
 * cancelTemporaryUpload(path) - pokud uživatel zruší vkládání, smaže se temp soubor ze storage
 */
export async function cancelTemporaryUpload(path) {
  if (!path) return { data: null, error: new Error('No path provided') };
  const { data, error } = await supabase.storage.from(ATTACH_BUCKET).remove([path]);
  return { data, error };
}

/**
 * createAttachmentFromUpload({ entity, entityId, path, filename, description })
 * - uloží do tabulky attachments metadata a odkaz na již nahraný soubor (path)
 * - filename = display name (může obsahovat diakritiku); path zůstává sanitizovaný storage key
 */
export async function createAttachmentFromUpload({ entity, entityId, path, filename, description = '' }) {
  if (!path) return { data: null, error: new Error('No path provided') };
  if (!filename || !filename.trim()) return { data: null, error: new Error('Filename (display name) is required') };
  if (description == null) description = '';

  const { data: publicUrlData } = supabase.storage.from(ATTACH_BUCKET).getPublicUrl(path);
  const url = publicUrlData?.publicUrl || path;

  const fileData = {
    entity,
    entity_id: entityId,
    filename: filename.trim(),
    path,
    url,
    archived: false,
    description,
    created_at: new Date().toISOString()
  };

  const { data, error } = await supabase.from('attachments').insert(fileData).select().single();
  return { data, error };
}

/**
 * listAttachments - vrátí záznamy z tabulky attachments (metadata)
 */
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
 * archiveAttachment / unarchiveAttachment
 */
export async function archiveAttachment(id) {
  const { data, error } = await supabase
    .from('attachments')
    .update({ archived: true })
    .eq('id', id)
    .select()
    .single();
  return { data, error };
}
export async function unarchiveAttachment(id) {
  const { data, error } = await supabase
    .from('attachments')
    .update({ archived: false })
    .eq('id', id)
    .select()
    .single();
  return { data, error };
}

/**
 * updateAttachmentMetadata(id, { filename, description })
 * - aktualizuje pouze metadata v DB (ne storage path)
 */
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

// pro zpětnou kompatibilitu
export async function updateAttachmentDescription(id, description) {
  return await updateAttachmentMetadata(id, { description });
}

// removeAttachmentFromStorage (pokud potřebuješ manuálně mazat)
export async function removeAttachmentFromStorage(path) {
  const { data, error } = await supabase.storage.from(ATTACH_BUCKET).remove([path]);
  return { data, error };
}

// --- Roles API (ponechám beze změny) ---
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
