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
export async function listContractServices(contractId) {
  try {
    const { data, error } = await supabase
      .from('contract_service_lines')
      .select(`
        *,
        service_definition:service_definitions(kod, nazev, kategorie, jednotka)
      `)
      .eq('contract_id', contractId)
      .order('created_at', { ascending: true });
    
    if (error) {
      console.error('Error listing contract services:', error);
      return { data: null, error };
    }
    
    return { data: data || [], error: null };
  } catch (err) {
    console.error('Exception in listContractServices:', err);
    return { data: null, error: err };
  }
}

/**
 * Add service to contract
 * @param {Object} serviceLine - Service line data
 * @returns {Promise<{data: Object|null, error: Object|null}>}
 */
export async function addServiceToContract(serviceLine) {
  try {
    const now = new Date().toISOString();
    const userId = (await supabase.auth.getUser()).data?.user?.id;
    
    const serviceData = {
      ...serviceLine,
      created_at: now,
      created_by: userId,
      updated_at: now,
      updated_by: userId
    };
    
    const { data, error } = await supabase
      .from('contract_service_lines')
      .insert(serviceData)
      .select()
      .single();
    
    if (error) {
      console.error('Error adding service to contract:', error);
      return { data: null, error };
    }
    
    return { data, error: null };
  } catch (err) {
    console.error('Exception in addServiceToContract:', err);
    return { data: null, error: err };
  }
}

export default {
  listServiceDefinitions,
  getServiceDefinition,
  upsertServiceDefinition,
  listContractServices,
  addServiceToContract
};
