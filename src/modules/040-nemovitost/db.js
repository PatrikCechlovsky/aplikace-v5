// Database operations for properties (nemovitosti) module
import { supabase } from '/src/supabase.js';

/**
 * List property types with their colors
 * Robust: if the DB does not have sort_order column, fall back to selecting without it
 * and return sort_order = 0 for all entries. Always return data as an array to avoid
 * caller-side "is not iterable" errors.
 * @returns {Promise<{data: Array, error: Object}>}
 */
export async function listPropertyTypes() {
  try {
    // Try to include sort_order (preferred)
    let res = await supabase
      .from('property_types')
      .select('slug,label,color,icon,sort_order')
      .order('label', { ascending: true });

    if (res.error) {
      // If error indicates missing column sort_order, fallback to query without it
      const msg = String(res.error?.message || '').toLowerCase();
      if (msg.includes('property_types.sort_order') || msg.includes('sort_order')) {
        console.warn('property_types.sort_order not found, falling back to select without sort_order');
        const res2 = await supabase
          .from('property_types')
          .select('slug,label,color,icon')
          .order('label', { ascending: true });
        if (res2.error) {
          console.error('Error listing property types (fallback):', res2.error);
          return { data: [], error: res2.error };
        }
        const data = (res2.data || []).map(d => ({ ...d, sort_order: 0 }));
        return { data, error: null };
      }
      console.error('Error listing property types:', res.error);
      return { data: [], error: res.error };
    }

    const data = (res.data || []).map(d => ({ ...d, sort_order: Number.isFinite(d.sort_order) ? d.sort_order : 0 }));
    return { data, error: null };
  } catch (err) {
    console.error('Exception in listPropertyTypes:', err);
    return { data: [], error: err };
  }
}

/**
 * Create or update property type
 * @param {Object} typeData - Type data (slug, label, color, icon)
 * @returns {Promise<{data: Object, error: Object}>}
 */
export async function upsertPropertyType({ slug, label, color, icon }) {
  try {
    const { data, error } = await supabase
      .from('property_types')
      .upsert({ slug, label, color, icon }, { onConflict: 'slug' })
      .select();

    if (error) {
      console.error('Error upserting property type:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (err) {
    console.error('Exception in upsertPropertyType:', err);
    return { data: null, error: err };
  }
}

/**
 * List unit types with their colors
 * Robust fallback same as listPropertyTypes()
 * @returns {Promise<{data: Array, error: Object}>}
 */
export async function listUnitTypes() {
  try {
    // Try to include sort_order (preferred)
    let res = await supabase
      .from('unit_types')
      .select('slug,label,color,icon,sort_order')
      .order('label', { ascending: true });

    if (res.error) {
      const msg = String(res.error?.message || '').toLowerCase();
      if (msg.includes('unit_types.sort_order') || msg.includes('sort_order')) {
        console.warn('unit_types.sort_order not found, falling back to select without sort_order');
        const res2 = await supabase
          .from('unit_types')
          .select('slug,label,color,icon')
          .order('label', { ascending: true });
        if (res2.error) {
          console.error('Error listing unit types (fallback):', res2.error);
          return { data: [], error: res2.error };
        }
        const data = (res2.data || []).map(d => ({ ...d, sort_order: 0 }));
        return { data, error: null };
      }
      console.error('Error listing unit types:', res.error);
      return { data: [], error: res.error };
    }

    const data = (res.data || []).map(d => ({ ...d, sort_order: Number.isFinite(d.sort_order) ? d.sort_order : 0 }));
    return { data, error: null };
  } catch (err) {
    console.error('Exception in listUnitTypes:', err);
    return { data: [], error: err };
  }
}

/**
 * Create or update unit type
 * @param {Object} typeData - Type data (slug, label, color, icon)
 * @returns {Promise<{data: Object, error: Object}>}
 */
export async function upsertUnitType({ slug, label, color, icon }) {
  try {
    const { data, error } = await supabase
      .from('unit_types')
      .upsert({ slug, label, color, icon }, { onConflict: 'slug' })
      .select();

    if (error) {
      console.error('Error upserting unit type:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (err) {
    console.error('Exception in upsertUnitType:', err);
    return { data: null, error: err };
  }
}

/**
 * Helpers: load type ordering maps (robust to missing sort_order column)
 */
async function loadPropertyTypesMap() {
  try {
    const res = await listPropertyTypes();
    if (res.error) {
      // log but return empty map
      console.warn('loadPropertyTypesMap: listPropertyTypes returned error', res.error);
    }
    const types = res.data || [];
    const map = {};
    (types || []).forEach(t => {
      map[t.slug] = Number.isFinite(t.sort_order) ? t.sort_order : 0;
    });
    return { map, error: null };
  } catch (e) {
    return { map: {}, error: e };
  }
}

async function loadUnitTypesMap() {
  try {
    const res = await listUnitTypes();
    if (res.error) {
      console.warn('loadUnitTypesMap: listUnitTypes returned error', res.error);
    }
    const types = res.data || [];
    const map = {};
    (types || []).forEach(t => {
      map[t.slug] = Number.isFinite(t.sort_order) ? t.sort_order : 0;
    });
    return { map, error: null };
  } catch (e) {
    return { map: {}, error: e };
  }
}

/**
 * List properties with optional filters
 * @param {Object} options - Filter options
 * @param {string} options.type - Filter by property type (bytovy_dum, rodinny_dum, etc.)
 * @param {string} options.landlordId - Filter by landlord (owner) ID
 * @param {boolean} options.showArchived - Include archived properties
 * @param {number} options.limit - Maximum number of results
 * @returns {Promise<{data: Array, error: Object}>}
 */
export async function listProperties(options = {}) {
  const { type, landlordId, showArchived = false, limit = 500 } = options;
  
  try {
    // load property types ordering
    const { map: typeMap } = await loadPropertyTypesMap();

    let query = supabase
      .from('properties')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);
    
    // Filter by type if specified
    if (type) {
      query = query.eq('typ_nemovitosti', type);
    }
    
    // Filter by landlord if specified
    // NOTE: DB column is named pronajimatel_id (not vlastnik_id) — use correct column name.
    if (landlordId) {
      query = query.eq('pronajimatel_id', landlordId);
    }
    
    // Filter archived
    if (!showArchived) {
      query = query.or('archived.is.null,archived.eq.false');
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error listing properties:', error);
      return { data: [], error };
    }

    const arr = (data || []).map(p => ({ ...p }));

    // sort by property type's sort_order then by name
    arr.sort((a, b) => {
      const ta = (a.typ_nemovitosti && typeMap[a.typ_nemovitosti] !== undefined) ? typeMap[a.typ_nemovitosti] : Number.MAX_SAFE_INTEGER;
      const tb = (b.typ_nemovitosti && typeMap[b.typ_nemovitosti] !== undefined) ? typeMap[b.typ_nemovitosti] : Number.MAX_SAFE_INTEGER;
      if (ta !== tb) return ta - tb;
      const na = (a.nazev || '').toString().localeCompare(b.nazev || '');
      if (na !== 0) return na;
      return (a.id || '').toString().localeCompare(b.id || '');
    });
    
    return { data: arr, error: null };
  } catch (err) {
    console.error('Exception in listProperties:', err);
    return { data: [], error: err };
  }
}

/**
 * Get property by ID
 * @param {string} id - Property ID
 * @returns {Promise<{data: Object, error: Object}>}
 */
export async function getProperty(id) {
  try {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error getting property:', error);
      return { data: null, error };
    }
    
    return { data, error: null };
  } catch (err) {
    console.error('Exception in getProperty:', err);
    return { data: null, error: err };
  }
}

/**
 * Get property with owner (landlord) details
 * @param {string} id - Property ID
 * @returns {Promise<{data: Object, error: Object}>}
 */
export async function getPropertyWithOwner(id) {
  try {
    const { data, error } = await supabase
      .from('properties')
      .select(`
        *,
        owner:subjects!fk_properties_pronajimatel(id, display_name, primary_email, primary_phone, role)
      `)
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error getting property with owner:', error);
      return { data: null, error };
    }
    
    return { data, error: null };
  } catch (err) {
    console.error('Exception in getPropertyWithOwner:', err);
    return { data: null, error: err };
  }
}

/**
 * Create or update property
 * @param {Object} property - Property data
 * @returns {Promise<{data: Object, error: Object}>}
 */
export async function upsertProperty(property) {
  try {
    const now = new Date().toISOString();
    const userId = (await supabase.auth.getUser()).data?.user?.id;
    
    const propertyData = {
      ...property,
      updated_at: now,
      updated_by: userId
    };
    
    // If creating new, add created_at
    if (!property.id) {
      propertyData.created_at = now;
      propertyData.created_by = userId;
    }
    
    const { data, error } = await supabase
      .from('properties')
      .upsert(propertyData)
      .select()
      .single();
    
    if (error) {
      console.error('Error upserting property:', error);
      return { data: null, error };
    }
    
    return { data, error: null };
  } catch (err) {
    console.error('Exception in upsertProperty:', err);
    return { data: null, error: err };
  }
}

/**
 * Archive property (soft delete)
 * @param {string} id - Property ID
 * @returns {Promise<{data: Object, error: Object}>}
 */
export async function archiveProperty(id) {
  try {
    const now = new Date().toISOString();
    
    const { data, error } = await supabase
      .from('properties')
      .update({
        archived: true,
        archivedAt: now
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error archiving property:', error);
      return { data: null, error };
    }
    
    return { data, error: null };
  } catch (err) {
    console.error('Exception in archiveProperty:', err);
    return { data: null, error: err };
  }
}

/**
 * Restore archived property
 * @param {string} id - Property ID
 * @returns {Promise<{data: Array, error: Object}>}
 */
export async function restoreProperty(id) {
  try {
    const { data, error } = await supabase
      .from('properties')
      .update({
        archived: false,
        archivedAt: null
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error restoring property:', error);
      return { data: null, error };
    }
    
    return { data: null, error: null };
  } catch (err) {
    console.error('Exception in restoreProperty:', err);
    return { data: null, error: err };
  }
}

/**
 * List units for a property
 * @param {string} propertyId - Property ID
 * @param {Object} options - Filter options
 * @param {boolean} options.showArchived - Include archived units
 * @param {boolean} options.onlyUnoccupied - Show only unoccupied units
 * @returns {Promise<{data: Array, error: Object}>}
 */
export async function listUnits(propertyId, options = {}) {
  const { showArchived = false, onlyUnoccupied = false } = options;
  
  try {
    // load unit types ordering
    const { map: unitTypeMap } = await loadUnitTypesMap();

    let query = supabase
      .from('units')
      .select('*')
      .eq('nemovitost_id', propertyId)
      .order('oznaceni', { ascending: true });
    
    // Filter archived
    if (!showArchived) {
      query = query.or('archived.is.null,archived.eq.false');
    }
    
    // Filter by occupied status - units with stav='volna' are unoccupied
    if (onlyUnoccupied) {
      query = query.eq('stav', 'volna');
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error listing units:', error);
      return { data: [], error };
    }

    const arr = (data || []).map(u => ({ ...u }));

    // Sort by unit type sort_order, then by oznaceni
    arr.sort((a, b) => {
      const ta = (a.typ && unitTypeMap[a.typ] !== undefined) ? unitTypeMap[a.typ] : Number.MAX_SAFE_INTEGER;
      const tb = (b.typ && unitTypeMap[b.typ] !== undefined) ? unitTypeMap[b.typ] : Number.MAX_SAFE_INTEGER;
      if (ta !== tb) return ta - tb;
      const ca = (a.oznaceni || '').toString().localeCompare(b.oznaceni || '');
      if (ca !== 0) return ca;
      return (a.id || '').toString().localeCompare(b.id || '');
    });
    
    return { data: arr, error: null };
  } catch (err) {
    console.error('Exception in listUnits:', err);
    return { data: [], error: err };
  }
}

/**
 * Get unit by ID
 * @param {string} id - Unit ID
 * @returns {Promise<{data: Object, error: Object}>}
 */
export async function getUnit(id) {
  try {
    const { data, error } = await supabase
      .from('units')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error getting unit:', error);
      return { data: null, error };
    }
    
    return { data, error: null };
  } catch (err) {
    console.error('Exception in getUnit:', err);
    return { data: null, error: err };
  }
}

/**
 * Get unit with property and active contract details
 * @param {string} id - Unit ID
 * @returns {Promise<{data: Object, error: Object}>}
 */
export async function getUnitWithDetails(id) {
  try {
    // Get unit with property
    const { data: unit, error: unitError } = await supabase
      .from('units')
      .select(`
        *,
        property:properties!fk_units_nemovitost(
          id, 
          nazev, 
          ulice, 
          mesto, 
          psc,
          owner:subjects!fk_properties_pronajimatel(id, display_name, primary_email, primary_phone)
        )
      `)
      .eq('id', id)
      .single();
    
    if (unitError) {
      console.error('Error getting unit with details:', unitError);
      return { data: null, error: unitError };
    }
    
    // Get active contracts for this unit
    const { data: contracts, error: contractsError } = await supabase
      .from('contracts')
      .select(`
        id,
        cislo_smlouvy,
        stav,
        datum_zacatek,
        datum_konec,
        najem_vyse,
        tenant:subjects!tenant_id(id, display_name, primary_email, primary_phone)
      `)
      .eq('unit_id', id)
      .eq('stav', 'aktivni')
      .order('datum_zacatek', { ascending: false });
    
    if (!contractsError && contracts && contracts.length > 0) {
      unit.active_contract = contracts[0];
      unit.all_contracts = contracts;
    }
    
    return { data: unit, error: null };
  } catch (err) {
    console.error('Exception in getUnitWithDetails:', err);
    return { data: null, error: err };
  }
}

/**
 * Create or update unit
 * @param {Object} unit - Unit data
 * @returns {Promise<{data: Object, error: Object}>}
 */
export async function upsertUnit(unit) {
  try {
    const now = new Date().toISOString();
    const userId = (await supabase.auth.getUser()).data?.user?.id;
    
    const unitData = {
      ...unit,
      updated_at: now,
      updated_by: userId
    };
    
    // If creating new, add created_at
    if (!unit.id) {
      unitData.created_at = now;
      unitData.created_by = userId;
    }
    
    const { data, error } = await supabase
      .from('units')
      .upsert(unitData)
      .select()
      .single();
    
    if (error) {
      console.error('Error upserting unit:', error);
      return { data: null, error };
    }
    
    return { data, error: null };
  } catch (err) {
    console.error('Exception in upsertUnit:', err);
    return { data: null, error: err };
  }
}

/**
 * Archive unit (soft delete)
 * @param {string} id - Unit ID
 * @returns {Promise<{data: Object, error: Object}>}
 */
export async function archiveUnit(id) {
  try {
    const now = new Date().toISOString();
    
    const { data, error } = await supabase
      .from('units')
      .update({
        archived: true,
        archivedAt: now
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error archiving unit:', error);
      return { data: null, error };
    }
    
    return { data, error: null };
  } catch (err) {
    console.error('Exception in archiveUnit:', err);
    return { data: null, error: err };
  }
}

/**
 * Get counts of units by type
 * @param {Object} options - Options for filtering
 * @param {boolean} options.showArchived - Include archived units
 * @returns {Promise<{data: Array, error: Object}>} Array of {type, count}
 */
export async function getUnitsCountsByType(options = {}) {
  const { showArchived = false } = options;
  
  try {
    let query = supabase
      .from('units')
      .select('typ_jednotky');
    
    // Filter archived
    if (!showArchived) {
      query = query.or('archived.is.null,archived.eq.false');
    }
    
    const { data: units, error } = await query;
    
    if (error) {
      console.error('Error getting units counts:', error);
      return { data: null, error };
    }
    
    // Count by type
    const counts = {};
    (units || []).forEach(unit => {
      const type = unit.typ_jednotky || '_unclassified';
      counts[type] = (counts[type] || 0) + 1;
    });
    
    // Convert to array
    const result = Object.entries(counts).map(([type, count]) => ({
      type,
      count
    }));
    
    return { data: result, error: null };
  } catch (err) {
    console.error('Exception in getUnitsCountsByType:', err);
    return { data: null, error: err };
  }
}

/**
 * Get counts of properties by type
 * @param {Object} options - Options for filtering
 * @param {boolean} options.showArchived - Include archived properties
 * @returns {Promise<{data: Array, error: Object}>} Array of {type, count}
 */
export async function getPropertiesCountsByType(options = {}) {
  const { showArchived = false } = options;
  
  try {
    let query = supabase
      .from('properties')
      .select('typ_nemovitosti');
    
    // Filter archived
    if (!showArchived) {
      query = query.or('archived.is.null,archived.eq.false');
    }
    
    const { data: properties, error } = await query;
    
    if (error) {
      console.error('Error getting properties counts:', error);
      return { data: null, error };
    }
    
    // Count by type
    const counts = {};
    (properties || []).forEach(prop => {
      const type = prop.typ_nemovitosti || '_unclassified';
      counts[type] = (counts[type] || 0) + 1;
    });
    
    // Convert to array
    const result = Object.entries(counts).map(([type, count]) => ({
      type,
      count
    }));
    
    return { data: result, error: null };
  } catch (err) {
    console.error('Exception in getPropertiesCountsByType:', err);
    return { data: null, error: err };
  }
}

export default {
  listProperties,
  getProperty,
  getPropertyWithOwner,
  upsertProperty,
  archiveProperty,
  restoreProperty,
  listUnits,
  getUnit,
  getUnitWithDetails,
  upsertUnit,
  archiveUnit,
  listPropertyTypes,
  listUnitTypes,
  upsertPropertyType,
  upsertUnitType,
  getUnitsCountsByType,
  getPropertiesCountsByType
};
