// Database operations for properties (nemovitosti) module
import { supabase } from '/src/supabase.js';

/**
 * List properties with optional filters
 * @param {Object} options - Filter options
 * @param {string} options.type - Filter by property type (bytovy_dum, rodinny_dum, etc.)
 * @param {boolean} options.showArchived - Include archived properties
 * @param {number} options.limit - Maximum number of results
 * @returns {Promise<{data: Array, error: Object}>}
 */
export async function listProperties(options = {}) {
  const { type, showArchived = false, limit = 500 } = options;
  
  try {
    let query = supabase
      .from('properties')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);
    
    // Filter by type if specified
    if (type) {
      query = query.eq('typ_nemovitosti', type);
    }
    
    // Filter archived
    if (!showArchived) {
      query = query.or('archived.is.null,archived.eq.false');
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error listing properties:', error);
      return { data: null, error };
    }
    
    return { data: data || [], error: null };
  } catch (err) {
    console.error('Exception in listProperties:', err);
    return { data: null, error: err };
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
 * @returns {Promise<{data: Object, error: Object}>}
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
    
    return { data, error: null };
  } catch (err) {
    console.error('Exception in restoreProperty:', err);
    return { data: null, error: err };
  }
}

/**
 * List units for a property
 * @param {string} propertyId - Property ID
 * @param {boolean} showArchived - Include archived units
 * @returns {Promise<{data: Array, error: Object}>}
 */
export async function listUnits(propertyId, showArchived = false) {
  try {
    let query = supabase
      .from('units')
      .select('*')
      .eq('nemovitost_id', propertyId)
      .order('oznaceni', { ascending: true });
    
    // Filter archived
    if (!showArchived) {
      query = query.or('archived.is.null,archived.eq.false');
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error listing units:', error);
      return { data: null, error };
    }
    
    return { data: data || [], error: null };
  } catch (err) {
    console.error('Exception in listUnits:', err);
    return { data: null, error: err };
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

export default {
  listProperties,
  getProperty,
  upsertProperty,
  archiveProperty,
  restoreProperty,
  listUnits,
  getUnit,
  upsertUnit,
  archiveUnit
};
