// src/db/subjects.js
// DB helpery pro "subjects" / subjekty (pronajímatel, nájemník, zástupce, ...)
// Používá Supabase klienta exportovaného z /src/supabase.js

import { supabase } from '/src/supabase.js';

/** Helper: zjistí aktuální auth UID (supabase user id) nebo vrátí null */
async function getAuthUid() {
  try {
    if (typeof window !== 'undefined' && window.currentUser && window.currentUser.id) {
      return window.currentUser.id;
    }
    if (supabase && supabase.auth && typeof supabase.auth.getUser === 'function') {
      const res = await supabase.auth.getUser();
      return res?.data?.user?.id || res?.user?.id || null;
    }
    if (supabase && supabase.auth && typeof supabase.auth.user === 'function') {
      const u = supabase.auth.user();
      return u?.id || null;
    }
  } catch (e) {
    // ignore
  }
  return null;
}

function _toStringOrNull(v) {
  return v == null ? null : String(v);
}

/**
 * listSubjects(options)
 * options: { q, type, role, profileId, limit, offset, orderBy }
 * pokud profileId není zadáno, použije se aktuální auth.uid()
 */
export async function listSubjects(options = {}) {
  const { q, type, role, profileId: pProfileId, limit = 50, offset = 0, orderBy = 'display_name' } = options;

  try {
    let profileId = pProfileId;
    if (!profileId) profileId = await getAuthUid();

    // pokud chceme pouze subjekty spojené s profileId -> nejprve vyber subject_id
    if (profileId) {
      const { data: linkRows, error: linkErr } = await supabase
        .from('user_subjects')
        .select('subject_id')
        .eq('profile_id', profileId);

      if (linkErr) return { data: null, error: linkErr };

      const ids = (linkRows || []).map(r => r.subject_id).filter(Boolean);
      if (ids.length === 0) return { data: [], error: null };

      let query = supabase.from('subjects').select('*').in('id', ids).order(orderBy, { ascending: true }).range(offset, offset + limit - 1);

      if (type) query = query.eq('typ_subjektu', type);
      if (role) query = query.eq('role', role);
      if (q) {
        query = query.or(`ilike(display_name,%${q}%),ilike(primary_email,%${q}%)`);
      }

      const { data, error } = await query;
      return { data, error };
    }

    // bez profileId - obecný seznam
    let query = supabase.from('subjects').select('*').order(orderBy, { ascending: true }).range(offset, offset + limit - 1);

    if (type) query = query.eq('typ_subjektu', type);
    if (role) query = query.eq('role', role);
    if (q) {
      query = query.or(`ilike(display_name,%${q}%),ilike(primary_email,%${q}%)`);
    }

    const { data, error } = await query;
    return { data, error };
  } catch (e) {
    return { data: null, error: e };
  }
}

/**
 * getSubject(id)
 */
export async function getSubject(id) {
  if (!id) return { data: null, error: new Error('id required') };
  try {
    const { data, error } = await supabase.from('subjects').select('*').eq('id', id).single();
    return { data, error };
  } catch (e) {
    return { data: null, error: e };
  }
}

/**
 * getSubjectHistory(subjectId)
 */
export async function getSubjectHistory(subjectId) {
  if (!subjectId) return { data: null, error: new Error('subjectId required') };
  try {
    const { data, error } = await supabase
      .from('subjects_history')
      .select('*')
      .eq('subject_id', subjectId)
      .order('changed_at', { ascending: false });
    return { data, error };
  } catch (e) {
    return { data: null, error: e };
  }
}

/**
 * logSubjectHistory(subjectId, currentUser, oldData, newData)
 * - uloží rozdíly mezi oldData a newData do subjects_history
 * - currentUser může být objekt (s display_name/email) nebo null
 */
export async function logSubjectHistory(subjectId, currentUser = null, oldData = {}, newData = {}) {
  if (!subjectId) return { data: null, error: new Error('subjectId required') };
  try {
    let changed_by = null;
    if (currentUser) {
      changed_by = currentUser.display_name || currentUser.username || currentUser.email || String(currentUser);
    } else if (typeof window !== 'undefined' && window.currentUser) {
      const cu = window.currentUser;
      changed_by = cu.display_name || cu.username || cu.email || null;
    }

    const changed_at = new Date().toISOString();
    const inserts = [];

    const keys = Array.from(new Set([...Object.keys(oldData || {}), ...Object.keys(newData || {})]));
    for (const key of keys) {
      const oldv = _toStringOrNull(oldData ? oldData[key] : null);
      const newv = _toStringOrNull(newData ? newData[key] : null);
      if (oldv !== newv) {
        inserts.push({
          subject_id: subjectId,
          field: key,
          old_value: oldv,
          new_value: newv,
          changed_by,
          changed_at
        });
      }
    }

    if (!inserts.length) return { data: null, error: null };

    const { data, error } = await supabase.from('subjects_history').insert(inserts).select();
    return { data, error };
  } catch (e) {
    return { data: null, error: e };
  }
}

/**
 * upsertSubject(payload)
 * - payload may contain id to update, otherwise insert.
 * - maps main fields to top-level columns and stores rest in data JSONB
 * - logs history (app-level) by comparing old vs new values
 */
export async function upsertSubject(payload = {}, currentUser = null) {
  try {
    const p = { ...payload };

    // map hlavních polí
    const main = {
      id: p.id || undefined,
      typ_subjektu: p.typ_subjektu || p.type || 'osoba',
      role: p.role || 'pronajimatel',
      display_name: p.display_name || null,
      primary_email: p.primary_email || p.email || null,
      primary_phone: p.primary_phone || p.telefon || p.phone || null,
      country: p.country || p.stat || null,
      city: p.city || p.mesto || null,
      zip: p.zip || p.psc || null,
      street: p.street || p.ulice || null,
      cislo_popisne: p.cislo_popisne || p.house_number || null,
      ico: p.ico || null,
      dic: p.dic || null,
      zastupce_id: p.zastupce_id || null,
      zastupuje_id: p.zastupuje_id || null,
      owner_id: p.owner_id || null,
      source_module: p.source_module || p.module || null,
      archived: typeof p.archived !== 'undefined' ? !!p.archived : undefined
    };

    // vytvoříme "data" – zkopírujeme payload a odstraníme hlavní klíče
    const data = { ...(p.data || {}) };
    const mainKeys = ['id','typ_subjektu','type','role','display_name','primary_email','email','primary_phone','telefon','country','stat','city','mesto','zip','psc','street','ulice','cislo_popisne','house_number','ico','dic','zastupce_id','zastupuje_id','owner_id','source_module','module','archived'];
    mainKeys.forEach(k => { if (k in data) delete data[k]; if (k in p) delete p[k]; });

    // sloučit zbytek payloadu do data
    Object.assign(data, p);

    const row = { ...main, data };

    // pokud update (id present) -> načíst starý záznam pro historií
    let oldRecord = null;
    if (row.id) {
      const oldRes = await getSubject(row.id);
      if (oldRes && !oldRes.error) oldRecord = oldRes.data || null;
    }

    // upsert
    const { data: result, error } = await supabase
      .from('subjects')
      .upsert(row, { returning: 'representation' });

    if (error) return { data: null, error };

    const returned = Array.isArray(result) ? result[0] : result;
    const insertedId = returned && returned.id ? returned.id : null;

    // log history (app-level) - porovnat relevantní pole a data.jsonb
    try {
      const newForLog = { ...returned, ...(returned.data || {}) };
      const oldForLog = oldRecord ? { ...oldRecord, ...(oldRecord.data || {}) } : {};
      await logSubjectHistory(insertedId, currentUser || null, oldForLog, newForLog);
    } catch (e) {
      // ignore logging errors
      console.warn('logSubjectHistory failed', e);
    }

    // přiřadit k current user pokud nově vloženo a skipAssign isn't true
    if (insertedId && !payload.skipAssign) {
      try {
        await assignSubjectToProfile(insertedId, null, 'owner');
      } catch (e) {
        // ignore
      }
    }

    return { data: returned, error: null };
  } catch (e) {
    return { data: null, error: e };
  }
}

/**
 * archiveSubject(id, currentUser)
 */
export async function archiveSubject(id, currentUser = null) {
  if (!id) return { data: null, error: new Error('id required') };
  try {
    const { data: oldRec } = await getSubject(id);
    const { data, error } = await supabase
      .from('subjects')
      .update({ archived: true })
      .eq('id', id)
      .select()
      .single();
    if (!error) {
      await logSubjectHistory(id, currentUser, oldRec || {}, { archived: true });
    }
    return { data, error };
  } catch (e) {
    return { data: null, error: e };
  }
}

export async function unarchiveSubject(id, currentUser = null) {
  if (!id) return { data: null, error: new Error('id required') };
  try {
    const { data: oldRec } = await getSubject(id);
    const { data, error } = await supabase
      .from('subjects')
      .update({ archived: false })
      .eq('id', id)
      .select()
      .single();
    if (!error) {
      await logSubjectHistory(id, currentUser, oldRec || {}, { archived: false });
    }
    return { data, error };
  } catch (e) {
    return { data: null, error: e };
  }
}

/**
 * assign / unassign
 */
export async function assignSubjectToProfile(subjectId, profileId = null, roleInSubject = 'owner') {
  if (!subjectId) return { data: null, error: new Error('subjectId required') };
  try {
    let pid = profileId;
    if (!pid) pid = await getAuthUid();
    if (!pid) return { data: null, error: new Error('profileId or auth uid required') };

    const payload = { profile_id: pid, subject_id: subjectId, role_in_subject: roleInSubject };
    const { data, error } = await supabase.from('user_subjects').insert(payload).select().single();
    return { data, error };
  } catch (e) {
    // ignore unique constraint errors (already assigned)
    return { data: null, error: e };
  }
}

export async function unassignSubjectFromProfile(subjectId, profileId = null) {
  if (!subjectId) return { data: null, error: new Error('subjectId required') };
  try {
    let pid = profileId;
    if (!pid) pid = await getAuthUid();
    if (!pid) return { data: null, error: new Error('profileId or auth uid required') };

    const { data, error } = await supabase.from('user_subjects').delete().match({ profile_id: pid, subject_id: subjectId });
    return { data, error };
  } catch (e) {
    return { data: null, error: e };
  }
}

export default {
  listSubjects,
  getSubject,
  getSubjectHistory,
  logSubjectHistory,
  upsertSubject,
  archiveSubject,
  unarchiveSubject,
  assignSubjectToProfile,
  unassignSubjectFromProfile
};
