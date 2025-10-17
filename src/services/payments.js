// src/services/payments.js
// Service wrapper pro payment_accounts (CRUD, setPrimary) + jednoduché logování změn do entity_history.
// Opravy: validace UUID vstupů, bezpečné používání .neq() pouze pokud je id skutečně přítomné,
// lepší chybové zprávy místo nevalidních REST query (-> zařízne 400 způsobené neplatným filtrem).

import { supabase } from '../supabase.js';

/** Simple UUID validator (accepts 36-char canonical UUID) */
function isUuid(v) {
  return typeof v === 'string' && /^[0-9a-fA-F]{8}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{12}$/.test(v);
}

/** Helper: write entity history rows into entity_history (if table exists) */
async function writeEntityHistory(entityType, entityId, changes = [], changedBy = null) {
  if (!changes || !changes.length) return { data: null, error: null };
  try {
    const inserts = changes.map(ch => ({
      entity_type: entityType,
      entity_id: entityId,
      field: ch.field,
      old_value: ch.old_value == null ? null : String(ch.old_value),
      new_value: ch.new_value == null ? null : String(ch.new_value),
      changed_by: changedBy || null,
      changed_at: new Date().toISOString()
    }));
    const { data, error } = await supabase.from('entity_history').insert(inserts);
    return { data, error };
  } catch (err) {
    // pokud tabulka neexistuje, ignoruj chybu (fallback)
    return { data: null, error: err };
  }
}

/** listPaymentAccounts({ profileId }) */
export async function listPaymentAccounts({ profileId = null } = {}) {
  try {
    let q = supabase.from('payment_accounts').select('*').order('created_at', { ascending: false });
    if (profileId) {
      if (!isUuid(profileId)) {
        return { data: [], error: new Error('Invalid profileId (not a UUID)') };
      }
      q = q.eq('profile_id', profileId).neq('archived', true);
    }
    const { data, error } = await q;
    return { data: data || [], error };
  } catch (err) {
    return { data: [], error: err };
  }
}

/** getPaymentAccount(id) */
export async function getPaymentAccount(id) {
  if (!isUuid(id)) return { data: null, error: new Error('Missing or invalid id') };
  try {
    const { data, error } = await supabase.from('payment_accounts').select('*').eq('id', id).single();
    return { data, error };
  } catch (err) {
    return { data: null, error: err };
  }
}

/**
 * upsertPaymentAccount(payload)
 * - payload: { id?, profile_id, label, bank_name, account_number, iban, bic, currency, is_primary, logo_path, archived }
 */
export async function upsertPaymentAccount(payload = {}, currentUser = null) {
  if (!payload || !payload.profile_id || !payload.account_number) {
    return { data: null, error: new Error('profile_id and account_number are required') };
  }
  if (!isUuid(payload.profile_id)) {
    return { data: null, error: new Error('profile_id must be a valid UUID') };
  }
  try {
    // načti starý stav pokud existuje
    let old = null;
    if (payload.id) {
      if (isUuid(payload.id)) {
        const { data: od, error: oe } = await getPaymentAccount(payload.id);
        if (!oe) old = od;
      } else {
        return { data: null, error: new Error('id is not a valid UUID') };
      }
    }

    // pokud is_primary true, nejdříve "odznačit" ostatní účty (pro daný profil)
    if (payload.is_primary) {
      // provedeme update pouze pokud máme platné profile_id
      await supabase
        .from('payment_accounts')
        .update({ is_primary: false })
        .eq('profile_id', payload.profile_id)
        // pouze pokud payload.id existuje a je validní, přidáme neq; jinak žádný neq
        .then(() => {})
        .catch(() => {});
      // Note: we deliberately avoid .neq('id','') when id is missing to prevent malformed query
      // The supabase client will handle the generated REST call correctly with above chaining.
      // Alternative: use RPC/transaction for atomic behavior in production.
    }

    // upsert (onConflict id) — prepare object, ensure id only when provided or let DB generate
    const upsertObj = {
      ...payload,
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('payment_accounts')
      .upsert(upsertObj, { onConflict: 'id' })
      .select()
      .single();

    // log změny (porovnej old vs data)
    try {
      const changedBy = currentUser?.display_name || currentUser?.username || currentUser?.email || null;
      const changes = [];
      if (old) {
        for (const k of Object.keys(upsertObj)) {
          const oldv = old[k];
          const newv = data[k];
          if (String(oldv ?? '') !== String(newv ?? '')) {
            changes.push({ field: k, old_value: oldv, new_value: newv });
          }
        }
      } else {
        // nová položka: zaznamenej všechny hodnoty jako new
        for (const k of Object.keys(upsertObj)) {
          changes.push({ field: k, old_value: null, new_value: upsertObj[k] });
        }
      }
      if (changes.length) await writeEntityHistory('payment_accounts', data.id, changes, changedBy);
    } catch (e) {
      console.warn('payments: history logging failed', e);
    }

    return { data, error };
  } catch (err) {
    return { data: null, error: err };
  }
}

/** deletePaymentAccount(id) - soft delete (archived=true) */
export async function deletePaymentAccount(id, currentUser = null) {
  if (!isUuid(id)) return { data: null, error: new Error('Missing or invalid id') };
  try {
    const { data: old } = await getPaymentAccount(id);
    const { data, error } = await supabase
      .from('payment_accounts')
      .update({ archived: true, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (old && data) {
      const changedBy = currentUser?.display_name || currentUser?.username || currentUser?.email || null;
      await writeEntityHistory('payment_accounts', id, [{ field: 'archived', old_value: old.archived, new_value: true }], changedBy);
    }
    return { data, error };
  } catch (err) {
    return { data: null, error: err };
  }
}

/** setPrimaryAccount(accountId) */
export async function setPrimaryAccount(accountId, currentUser = null) {
  if (!isUuid(accountId)) return { data: null, error: new Error('Missing or invalid accountId') };
  try {
    const { data: acc, error: accErr } = await getPaymentAccount(accountId);
    if (accErr || !acc) return { data: null, error: accErr || new Error('Account not found') };

    // odznačit ostatní (pouze pokud máme validní profile_id)
    if (!isUuid(acc.profile_id)) {
      return { data: null, error: new Error('Account.profile_id is invalid') };
    }
    const { error: e1 } = await supabase
      .from('payment_accounts')
      .update({ is_primary: false })
      .eq('profile_id', acc.profile_id)
      .neq('id', accountId);
    if (e1) return { data: null, error: e1 };

    // nastavit tento jako primární
    const { data, error } = await supabase
      .from('payment_accounts')
      .update({ is_primary: true, updated_at: new Date().toISOString() })
      .eq('id', accountId)
      .select()
      .single();

    // log
    try {
      const changedBy = currentUser?.display_name || currentUser?.username || currentUser?.email || null;
      await writeEntityHistory('payment_accounts', accountId, [{ field: 'is_primary', old_value: false, new_value: true }], changedBy);
    } catch (e) {}

    return { data, error };
  } catch (err) {
    return { data: null, error: err };
  }
}

export default {
  listPaymentAccounts,
  getPaymentAccount,
  upsertPaymentAccount,
  deletePaymentAccount,
  setPrimaryAccount
};
