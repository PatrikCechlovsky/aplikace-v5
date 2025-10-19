// src/db/subjects.js
// DB helpery pro "subjects" / subjekty (pronajímatel, nájemník, zástupce, ...)
import { supabase } from '/src/supabase.js';

/** Helper: zjistí aktuální auth UID (supabase user id) nebo vrátí null */
async function getAuthUid() {
  try {
    if (typeof window !== 'undefined' && window.currentUser && window.currentUser.id) {
      return window.currentUser.id;
    }
    if (supabase && supabase.auth && typeof supabase.auth.getUser === 'function') {
      const res = await supabase.auth.getUser();
      if (res && res.data && res.data.user && res.data.user.id) return res.data.user.id;
    }
    if (supabase && supabase.auth && typeof supabase.auth.user === 'function') {
      const u = supabase.auth.user();
      if (u && u.id) return u.id;
    }
  } catch (e) {
    // ignore
  }
  return null;
}

/**
 * listSubjects(options)
 * options: { q, type, role, profileId, limit, offset, orderBy }
 * - pokud profileId není zadáno, použije se aktuální auth.uid()
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
 * upsertSubject(payload)
 * - payload may contain id to update, otherwise insert.
 * - maps main fields to top-level columns and stores rest in data JSONB
 * - returns inserted/updated row
 *
 * Nově: pokud dojde k insertu (nebo update a nechceme skipAssign),
 *       funkce automaticky přiřadí subjekt k aktuálnímu uživateli pomocí assignSubjectToProfile.
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
    const mainKeys = ['id','typ_subjektu','type','role','display_name','primary_email','email','primary_phone','telefon','country','stat','city','mesto','zip','psc','street','ulice','cislo_popisne','house_number','ico','dic','zastupce_id','zastupuje_id','owner_id'];
    mainKeys.forEach(k => { if (k in data) delete data[k]; if (k in p) delete p[k]; });

    // sloučit zbytek payloadu do data
    Object.assign(data, p);

    const row = { ...main, data };

    // upsert (vrací representation)
    const { data: result, error } = await supabase
      .from('subjects')
      .upsert(row, { returning: 'representation' });

    if (error) return { data: null, error };

    const returned = Array.isArray(result) ? result[0] : result;
    const insertedId = returned && returned.id ? returned.id : null;

    // pokud chceme, automaticky přiřadit nový/aktualizovaný subjekt k aktuálnímu profilu
    // použití: payload.skipAssign = true zabrání tomu
    if (insertedId && !payload.skipAssign) {
      try {
        // přiřadit k auth uid (pokud existuje)
        const assignRes = await assignSubjectToProfile(insertedId, null, 'owner');
        // ignore assign error here (vrátíme původní výsledky)
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
 * assignSubjectToProfile(subjectId, profileId?, roleInSubject)
 * - pokud profileId není poskytnut, použije aktuální auth.uid()
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
    return { data: null, error: e };
  }
}

/**
 * unassignSubjectFromProfile(subjectId, profileId?)
 */
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
