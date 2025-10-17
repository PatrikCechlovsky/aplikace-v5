// src/services/accountMemberships.js
// Service wrapper pro account_memberships (přiřazování rolí k účtům).
// - listAccountMembers(accountId)
// - assignRoleToAccount(accountId, profileId, roleSlug, assignedBy)
// - removeMembership(id) (soft deactivate)
// - getMembership(id), getRoleForProfileOnAccount(accountId,profileId)
// - listMembershipsByProfile(profileId)
// Loguje změny do entity_history (pokud tabulka existuje).

import { supabase } from '../supabase.js';

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

/** listAccountMembers(accountId) -> { data: [members], error } */
export async function listAccountMembers(accountId) {
  if (!accountId) return { data: [], error: new Error('Missing accountId') };
  try {
    const { data, error } = await supabase
      .from('account_memberships')
      .select('id, account_id, profile_id, role_slug, assigned_by, assigned_at, is_active')
      .eq('account_id', accountId)
      .order('assigned_at', { ascending: true });
    return { data: data || [], error };
  } catch (err) {
    return { data: [], error: err };
  }
}

/** getMembership(id) */
export async function getMembership(id) {
  if (!id) return { data: null, error: new Error('Missing id') };
  try {
    const { data, error } = await supabase.from('account_memberships').select('*').eq('id', id).single();
    return { data, error };
  } catch (err) {
    return { data: null, error: err };
  }
}

/** getRoleForProfileOnAccount(accountId, profileId) -> { role: string|null, error } */
export async function getRoleForProfileOnAccount(accountId, profileId) {
  if (!accountId || !profileId) return { role: null, error: new Error('Missing params') };
  try {
    const { data, error } = await supabase
      .from('account_memberships')
      .select('role_slug')
      .eq('account_id', accountId)
      .eq('profile_id', profileId)
      .eq('is_active', true)
      .limit(1)
      .single();
    if (error) return { role: null, error };
    return { role: data?.role_slug ?? null, error: null };
  } catch (err) {
    return { role: null, error: err };
  }
}

/**
 * assignRoleToAccount(accountId, profileId, roleSlug, assignedBy)
 * - pokud existuje aktivní membership => aktualizuje role_slug (a is_active true)
 * - jinak vloží nový řádek
 */
export async function assignRoleToAccount(accountId, profileId, roleSlug, assignedBy = null) {
  if (!accountId || !profileId || !roleSlug) return { data: null, error: new Error('Missing params') };
  try {
    // check existing
    const { data: existing, error: e1 } = await supabase
      .from('account_memberships')
      .select('*')
      .eq('account_id', accountId)
      .eq('profile_id', profileId)
      .limit(1)
      .maybeSingle();
    if (e1) return { data: null, error: e1 };

    if (existing && existing.id) {
      // update if changed
      if (existing.role_slug !== roleSlug || !existing.is_active) {
        const { data, error } = await supabase
          .from('account_memberships')
          .update({ role_slug: roleSlug, is_active: true, assigned_by: assignedBy, assigned_at: new Date().toISOString() })
          .eq('id', existing.id)
          .select()
          .single();
        // log change
        try {
          await writeEntityHistory('account_memberships', data.id, [
            { field: 'role_slug', old_value: existing.role_slug, new_value: roleSlug },
            { field: 'is_active', old_value: existing.is_active, new_value: true }
          ], assignedBy);
        } catch (e) {}
        return { data, error };
      }
      return { data: existing, error: null };
    }

    // insert new
    const payload = {
      account_id: accountId,
      profile_id: profileId,
      role_slug: roleSlug,
      assigned_by: assignedBy,
      assigned_at: new Date().toISOString(),
      is_active: true
    };
    const { data, error } = await supabase.from('account_memberships').insert(payload).select().single();
    if (!error && data && data.id) {
      try {
        await writeEntityHistory('account_memberships', data.id, [
          { field: 'role_slug', old_value: null, new_value: roleSlug },
          { field: 'is_active', old_value: null, new_value: true }
        ], assignedBy);
      } catch (e) {}
    }
    return { data, error };
  } catch (err) {
    return { data: null, error: err };
  }
}

/** removeMembership(id) - soft deactivate (is_active = false) */
export async function removeMembership(id, changedBy = null) {
  if (!id) return { data: null, error: new Error('Missing id') };
  try {
    const { data: old, error: e1 } = await getMembership(id);
    if (e1) return { data: null, error: e1 };
    if (!old) return { data: null, error: new Error('Membership not found') };

    const { data, error } = await supabase
      .from('account_memberships')
      .update({ is_active: false, assigned_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (!error) {
      try {
        await writeEntityHistory('account_memberships', id, [
          { field: 'is_active', old_value: old.is_active, new_value: false }
        ], changedBy);
      } catch (e) {}
    }
    return { data, error };
  } catch (err) {
    return { data: null, error: err };
  }
}

/** listMembershipsByProfile(profileId) */
export async function listMembershipsByProfile(profileId) {
  if (!profileId) return { data: [], error: new Error('Missing profileId') };
  try {
    const { data, error } = await supabase
      .from('account_memberships')
      .select('id, account_id, role_slug, assigned_by, assigned_at, is_active')
      .eq('profile_id', profileId)
      .order('assigned_at', { ascending: false });
    return { data: data || [], error };
  } catch (err) {
    return { data: [], error: err };
  }
}

export default {
  listAccountMembers,
  getMembership,
  getRoleForProfileOnAccount,
  assignRoleToAccount,
  removeMembership,
  listMembershipsByProfile
};
