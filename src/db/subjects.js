// src/db/subjects.js
// DB helpery pro "subjects" / subjekty (pronajímatel, nájemník, zástupce, ...)
// Závisí na existenci /src/supabase.js exportujícího klienta `supabase`.

import { supabase } from '/src/supabase.js';

/**
 * listSubjects(options)
 * options: { q, type, role, profileId, limit, offset, orderBy }
 * - pokud profileId je zadáno, vrací pouze subjekty spojené přes user_subjects
 */
export async function listSubjects(options = {}) {
  const { q, type, role, profileId, limit = 50, offset = 0, orderBy = 'display_name' } = options;

  try {
    // pokud chceme pouze subjekty spojené s profileId -> nejprve vyber subject_id
    if (profileId) {
      const { data: linkRows, error: linkErr } = await supabase
        .from('user_subjects')
        .select('subject_id')
        .eq('profile_id', profileId);

      if (linkErr) return { data: null, error: linkErr };

      const ids = (linkRows || []).map(r => r.subject_id).filter(Boolean);
      if (ids.length === 0) return { data: [], error: null };

      let query = supabase.from('subjects').select('*').in('id', ids).order(orderBy, { ascending: true }).limit(limit).range(offset, offset + limit - 1);

      if (type) query = query.eq('typ_subjektu', type);
      if (role) query = query.eq('role', role);
      if (q) {
        // jednoduché filtrování: hledáme v display_name nebo v emailu
        query = query.or(`ilike(display_name,%${q}%),ilike(primary_email,%${q}%)`);
      }

      const { data, error } = await query;
      return { data, error };
    }

    // bez profileId - obecný seznam (můžeš ho omezit role/type nebo q)
    let query = supabase.from('subjects').select('*').order(orderBy, { ascending: true }).limit(limit).range(offset, offset + limit - 1);

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
 * upsertSubject(payload)
 * - payload may contain id to update, otherwise insert.
 * - maps main fields to top-level columns and stores rest in data JSONB
 * - returns inserted/updated row
 */
export async function upsertSubject(payload = {}) {
  try {
    const p = { ...payload };

    // map hlavních polí (uprav podle potřeby)
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
      owner_id: p.owner_id || null
    };

    // vytvoříme "data" – zkopírujeme payload a odstraníme hlavní klíče
    const data = { ...(p.data || {}) };
    // odstraň klíče obsažené v main z data
    const mainKeys = ['id','typ_subjektu','type','role','display_name','primary_email','email','primary_phone','telefon','country','stat','city','mesto','zip','psc','street','ulice','cislo_popisne','house_number','ico','dic','zastupce_id','zastupuje_id','owner_id'];
    mainKeys.forEach(k => { if (k in data) delete data[k]; if (k in p) delete p[k]; });

    // sloučit zbytek payloadu do data (není to destruktivní)
    Object.assign(data, p);

    const row = { ...main, data };

    // Supabase upsert: pokud je id povoleno změnit, upsert provede update/insert podle PK
    const { data: result, error } = await supabase
      .from('subjects')
      .upsert(row, { returning: 'representation' });

    return { data: Array.isArray(result) ? result[0] : result, error };
  } catch (e) {
    return { data: null, error: e };
  }
}

/**
 * assignSubjectToProfile(profileId, subjectId, roleInSubject)
 */
export async function assignSubjectToProfile(profileId, subjectId, roleInSubject = 'owner') {
  if (!profileId || !subjectId) return { data: null, error: new Error('profileId and subjectId required') };
  try {
    const payload = { profile_id: profileId, subject_id: subjectId, role_in_subject: roleInSubject };
    const { data, error } = await supabase.from('user_subjects').insert(payload).select().single();
    return { data, error };
  } catch (e) {
    return { data: null, error: e };
  }
}

/**
 * unassignSubjectFromProfile(profileId, subjectId)
 */
export async function unassignSubjectFromProfile(profileId, subjectId) {
  if (!profileId || !subjectId) return { data: null, error: new Error('profileId and subjectId required') };
  try {
    const { data, error } = await supabase.from('user_subjects').delete().match({ profile_id: profileId, subject_id: subjectId });
    return { data, error };
  } catch (e) {
    return { data: null, error: e };
  }
}
