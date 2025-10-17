// src/db.js — kompletní, kompatibilní verze s attachments (temp upload + finalize),
// sanitizací názvů, update metadat, archive/unarchive, profiles + history a role helpers.
import { supabase } from './supabase.js';
export { supabase };

// ----------------------
// --- Users / Profiles
// ----------------------
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

// ----------------------
// --- Profile history (profiles_history)
// ----------------------
export async function getProfileHistory(profileId) {
  const { data, error } = await supabase
    .from('profiles_history')
    .select('*')
    .eq('profile_id', profileId)
    .order('changed_at', { ascending: false });
  return { data, error };
}

function _toStringOrNull(v) {
  return v == null ? null : String(v);
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
        old_value: _toStringOrNull(oldData[key]),
        new_value: _toStringOrNull(newData[key]),
        changed_by,
        changed_at
      });
    }
  }
  if (inserts.length) {
    const { data, error } = await supabase.from('profiles_history').insert(inserts);
    return { data, error };
  }
  return { data: null, error: null };
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

// ----------------------
// --- Attachments (storage + metadata)
// ----------------------
const ATTACH_BUCKET = 'attachments';

/**
 * validateFilename: povolené znaky pro storage key test (ASCII, bez mezer)
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
 * uploadAttachmentToStorage(folder, file, options)
 * - autoSanitize (true by default) will sanitize filename if invalid
 * - returns { data, error, path }
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
 * createTempUpload(folder, file, { autoSanitize = true })
 * - uploads file (sanitized path) and returns path + publicUrl (or signedUrl fallback) + originalName
 */
export async function createTempUpload(folder, file, { autoSanitize = true } = {}) {
  const { data, error, path } = await uploadAttachmentToStorage(folder, file, { autoSanitize });
  // debug log helpful for troubleshooting
  // console.log('createTempUpload -> upload result', { data, error, path });

  if (error || !path) return { data: null, error: error || new Error('Upload failed') };

  // try public url first
  try {
    const { data: publicUrlData } = supabase.storage.from(ATTACH_BUCKET).getPublicUrl(path);
    const publicUrl = publicUrlData?.publicUrl || null;
    if (publicUrl) {
      return { data: { path, publicUrl, originalName: file.name }, error: null };
    }
  } catch (err) {
    // ignore and try signed url
  }

  // fallback: create signed url (short-lived)
  try {
    const { data: signedData, error: signedErr } = await supabase.storage.from(ATTACH_BUCKET).createSignedUrl(path, 60);
    if (signedErr) {
      return { data: { path, publicUrl: null, originalName: file.name }, error: null };
    }
    return { data: { path, publicUrl: signedData?.signedUrl || null, originalName: file.name }, error: null };
  } catch (err) {
    return { data: { path, publicUrl: null, originalName: file.name }, error: null };
  }
}

/**
 * cancelTemporaryUpload(path) - delete a file from storage (used when user cancels finalize)
 */
export async function cancelTemporaryUpload(path) {
  if (!path) return { data: null, error: new Error('No path provided') };
  const { data, error } = await supabase.from(ATTACH_BUCKET).remove([path]);
  return { data, error };
}

/**
 * createAttachmentFromUpload({ entity, entityId, path, filename, description })
 * - create metadata record in attachments table referencing already uploaded storage path
 * - filename is display name (can contain diacritics)
 */
export async function createAttachmentFromUpload({ entity, entityId, path, filename, description = '' }) {
  if (!path) return { data: null, error: new Error('No path provided') };
  if (!filename || !filename.trim()) return { data: null, error: new Error('Filename (display name) is required') };
  if (description == null) description = '';

  // build a public/signed url for metadata display
  let url = path;
  try {
    const { data: publicUrlData } = supabase.storage.from(ATTACH_BUCKET).getPublicUrl(path);
    url = publicUrlData?.publicUrl || path;
    // if publicUrl not available, create signed url as preview maybe
    if (!url) {
      const { data: signedData } = await supabase.storage.from(ATTACH_BUCKET).createSignedUrl(path, 60);
      url = signedData?.signedUrl || path;
    }
  } catch (err) {
    // fallback to path
    url = path;
  }

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
 * Legacy helper: uploadAttachment(...) - upload and immediately create metadata
 * Kept for backward compatibility with older UI callers.
 */
export async function uploadAttachment({ entity, entityId, file, description = '', autoSanitize = true }) {
  const folder = `${entity}/${entityId}`;
  const { data: uploadData, error: uploadError, path } = await uploadAttachmentToStorage(folder, file, { autoSanitize });
  if (uploadError) return { data: null, error: uploadError };

  const filePath = (uploadData && uploadData.path) ? uploadData.path : path;
  if (!filePath) {
    return { data: null, error: new Error('Soubor nahrán do storage, ale nebyla získána cesta k souboru (path)') };
  }

  // get url (public or signed)
  let fileUrl = filePath;
  try {
    const { data: publicUrlData } = await supabase.storage.from(ATTACH_BUCKET).getPublicUrl(filePath);
    fileUrl = publicUrlData?.publicUrl || filePath;
    if (!publicUrlData?.publicUrl) {
      const { data: signedData } = await supabase.storage.from(ATTACH_BUCKET).createSignedUrl(filePath, 60);
      fileUrl = signedData?.signedUrl || filePath;
    }
  } catch (err) {
    fileUrl = filePath;
  }

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

/**
 * listStorageAttachments(folder) - list objects from storage bucket (not DB)
 */
export async function listStorageAttachments(folder) {
  const { data, error } = await supabase.storage.from(ATTACH_BUCKET).list(folder, { limit: 100 });
  return { data: data || [], error };
}

/**
 * removeAttachmentFromStorage(path) - delete given path from storage
 */
export async function removeAttachmentFromStorage(path) {
  const { data, error } = await supabase.storage.from(ATTACH_BUCKET).remove([path]);
  return { data, error };
}

/**
 * listAttachments({entity, entityId, showArchived})
 * - read metadata records from attachments table
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
 * archive / unarchive
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
 * - updates only DB metadata (display filename and description), does NOT rename storage object
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

export async function updateAttachmentDescription(id, description) {
  return await updateAttachmentMetadata(id, { description });
}

// ----------------------
// --- Roles API
// ----------------------
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

/**
 * getRolePermissions(role)
 * - Attempt to read role permissions from DB table "role_permissions"
 * - Expected row shape: { role, permission_key } (one row per permission) or similar.
 * - Returns: { data: Array<string> | null, error: null | Error }
 */
export async function getRolePermissions(role) {
  if (!role) return { data: null, error: new Error('Role required') };
  try {
    // Try reading simple permission_key column from role_permissions table
    const { data, error } = await supabase
      .from('role_permissions')
      .select('permission_key')
      .eq('role', role);
    if (error) return { data: null, error };
    const keys = (data || []).map(r => r.permission_key || r.key || r.permission).filter(Boolean);
    return { data: keys, error: null };
  } catch (err) {
    return { data: null, error: err };
  }
}
