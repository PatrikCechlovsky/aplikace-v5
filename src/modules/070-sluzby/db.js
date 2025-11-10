// src/modules/070-sluzby/db.js
// Database operations for services module

import { supabase } from '/src/supabase.js';

/**
 * List service definitions
 * @param {Object} options - Filter options
 * @returns {Promise<{data: Array|null, error: Object|null}>}
 */
export async function listServiceDefinitions(options = {}) {
  const { kategorie, aktivni = true, limit = 500 } = options;
  
  try {
    let query = supabase
      .from('service_definitions')
      .select('*')
      .order('nazev', { ascending: true })
      .limit(limit);
    
    if (kategorie) {
      query = query.eq('kategorie', kategorie);
    }
    
    if (aktivni !== null) {
      query = query.eq('aktivni', aktivni);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error listing service definitions:', error);
      return { data: null, error };
    }
    
    return { data: data || [], error: null };
  } catch (err) {
    console.error('Exception in listServiceDefinitions:', err);
    return { data: null, error: err };
  }
}

/**
 * Get service definition by ID
 * @param {string} id - Service definition ID
 * @returns {Promise<{data: Object|null, error: Object|null}>}
 */
export async function getServiceDefinition(id) {
  try {
    const { data, error } = await supabase
      .from('service_definitions')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error getting service definition:', error);
      return { data: null, error };
    }
    
    return { data, error: null };
  } catch (err) {
    console.error('Exception in getServiceDefinition:', err);
    return { data: null, error: err };
  }
}

/**
 * Create or update service definition
 * @param {Object} service - Service data
 * @returns {Promise<{data: Object|null, error: Object|null}>}
 */
export async function upsertServiceDefinition(service) {
  try {
    const now = new Date().toISOString();
    const userId = (await supabase.auth.getUser()).data?.user?.id;
    
    const serviceData = {
      ...service,
      updated_at: now,
      updated_by: userId
    };
    
    if (!service.id) {
      serviceData.created_at = now;
      serviceData.created_by = userId;
    }
    
    const { data, error } = await supabase
      .from('service_definitions')
      .upsert(serviceData)
      .select()
      .single();
    
    if (error) {
      console.error('Error upserting service definition:', error);
      return { data: null, error };
    }
    
    return { data, error: null };
  } catch (err) {
    console.error('Exception in upsertServiceDefinition:', err);
    return { data: null, error: err };
  }
}

/**
 * List contract service lines for a contract
 * @param {string} contractId - Contract ID
 * @returns {Promise<{data: Array|null, error: Object|null}>}
 */
export async function listContractServiceLines(contractId) {
  try {
    const { data, error } = await supabase
      .from('contract_service_lines')
      .select(`
        *,
        service_definition:service_definitions(kod, nazev, kategorie, jednotka, zakladni_cena)
      `)
      .eq('contract_id', contractId)
      .order('created_at', { ascending: true });
    
    if (error) {
      console.error('Error listing contract service lines:', error);
      return { data: null, error };
    }
    
    return { data: data || [], error: null };
  } catch (err) {
    console.error('Exception in listContractServiceLines:', err);
    return { data: null, error: err };
  }
}

/**
 * Alias kept for compatibility (existing callers)
 */
export async function listContractServices(contractId) {
  return listContractServiceLines(contractId);
}

/**
 * Upsert (insert or update) contract service line
 * @param {Object} line - Service line to save
 * @returns {Promise<{data: Object|null, error: Object|null}>}
 */
export async function upsertContractServiceLine(line) {
  try {
    const now = new Date().toISOString();
    const userId = (await supabase.auth.getUser()).data?.user?.id;
    const payload = {
      ...line,
      updated_at: now,
      updated_by: userId
    };
    if (!line.id) {
      payload.created_at = now;
      payload.created_by = userId;
    }

    // use upsert to handle both insert/update if your DB is configured for upsert by primary key
    // For Postgres with UUID PK, using insert or update explicitly is clearer:
    if (line.id) {
      const { data, error } = await supabase
        .from('contract_service_lines')
        .update(payload)
        .eq('id', line.id)
        .select()
        .single();
      if (error) {
        console.error('Error updating contract service line:', error);
        return { data: null, error };
      }
      return { data, error: null };
    } else {
      const { data, error } = await supabase
        .from('contract_service_lines')
        .insert(payload)
        .select()
        .single();
      if (error) {
        console.error('Error inserting contract service line:', error);
        return { data: null, error };
      }
      return { data, error: null };
    }
  } catch (err) {
    console.error('Exception in upsertContractServiceLine:', err);
    return { data: null, error: err };
  }
}

/**
 * Delete contract service line by id
 * @param {string} id
 * @returns {Promise<{data: Object|null, error: Object|null}>}
 */
export async function deleteContractServiceLine(id) {
  try {
    const { data, error } = await supabase
      .from('contract_service_lines')
      .delete()
      .eq('id', id);
    if (error) {
      console.error('Error deleting contract service line:', error);
      return { data: null, error };
    }
    return { data, error: null };
  } catch (err) {
    console.error('Exception in deleteContractServiceLine:', err);
    return { data: null, error: err };
  }
}

/**
 * Add service to contract (compatibility helper)
 * @param {Object} serviceLine - Service line data
 * @returns {Promise<{data: Object|null, error: Object|null}>}
 */
export async function addServiceToContract(serviceLine) {
  // simple wrapper to insert
  return upsertContractServiceLine(serviceLine);
}

export default {
  listServiceDefinitions,
  getServiceDefinition,
  upsertServiceDefinition,
  listContractServices,
  listContractServiceLines,
  upsertContractServiceLine,
  deleteContractServiceLine,
  addServiceToContract
};
