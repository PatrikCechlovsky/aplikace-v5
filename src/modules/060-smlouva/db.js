// src/modules/060-smlouva/db.js
// Database operations for contracts module

import { supabase } from '/src/supabase.js';

/**
 * List contracts with optional filters
 * @param {Object} options - Filter options
 * @returns {Promise<{data: Array|null, error: Object|null}>}
 */
export async function listContracts(options = {}) {
  const { unitId, tenantId, landlordId, status, showArchived = false, limit = 500 } = options;
  
  try {
    let query = supabase
      .from('contracts')
      .select(`
        *,
        landlord:subjects!landlord_id(id, display_name, primary_email, primary_phone),
        tenant:subjects!tenant_id(id, display_name, primary_email, primary_phone),
        unit:units!unit_id(id, oznaceni, typ_jednotky, stav),
        property:properties!property_id(id, nazev, ulice, mesto)
      `)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    // Filter by unit
    if (unitId) {
      query = query.eq('unit_id', unitId);
    }
    
    // Filter by tenant
    if (tenantId) {
      query = query.eq('tenant_id', tenantId);
    }
    
    // Filter by landlord
    if (landlordId) {
      query = query.eq('landlord_id', landlordId);
    }
    
    // Filter by status
    if (status) {
      query = query.eq('stav', status);
    }
    
    // Filter archived
    if (!showArchived) {
      query = query.or('archived.is.null,archived.eq.false');
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error listing contracts:', error);
      return { data: null, error };
    }
    
    return { data: data || [], error: null };
  } catch (err) {
    console.error('Exception in listContracts:', err);
    return { data: null, error: err };
  }
}

/**
 * Get contract by ID
 * @param {string} id - Contract ID
 * @returns {Promise<{data: Object|null, error: Object|null}>}
 */
export async function getContract(id) {
  try {
    const { data, error } = await supabase
      .from('contracts')
      .select(`
        *,
        landlord:subjects!landlord_id(id, display_name, primary_email, primary_phone, role),
        tenant:subjects!tenant_id(id, display_name, primary_email, primary_phone, role),
        unit:units!unit_id(id, oznaceni, typ_jednotky, stav, plocha, podlazi),
        property:properties!property_id(id, nazev, ulice, mesto, psc)
      `)
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error getting contract:', error);
      return { data: null, error };
    }
    
    return { data, error: null };
  } catch (err) {
    console.error('Exception in getContract:', err);
    return { data: null, error: err };
  }
}

/**
 * Get contract with services and payments
 * @param {string} id - Contract ID
 * @returns {Promise<{data: Object|null, error: Object|null}>}
 */
export async function getContractWithDetails(id) {
  try {
    // Get contract
    const { data: contract, error: contractError } = await getContract(id);
    
    if (contractError) {
      return { data: null, error: contractError };
    }
    
    // Get services
    const { data: services, error: servicesError } = await supabase
      .from('contract_service_lines')
      .select(`
        *,
        service_definition:service_definitions(kod, nazev, kategorie)
      `)
      .eq('contract_id', id)
      .order('created_at', { ascending: true });
    
    if (!servicesError) {
      contract.services = services || [];
    }
    
    // Get payments summary
    const { data: payments, error: paymentsError } = await supabase
      .from('payments')
      .select('id, amount, payment_date, status, payment_type')
      .eq('contract_id', id)
      .order('payment_date', { ascending: false })
      .limit(10);
    
    if (!paymentsError) {
      contract.recent_payments = payments || [];
    }
    
    return { data: contract, error: null };
  } catch (err) {
    console.error('Exception in getContractWithDetails:', err);
    return { data: null, error: err };
  }
}

/**
 * Create or update contract
 * @param {Object} contract - Contract data
 * @returns {Promise<{data: Object|null, error: Object|null}>}
 */
export async function upsertContract(contract) {
  try {
    const now = new Date().toISOString();
    const userId = (await supabase.auth.getUser()).data?.user?.id;
    
    const contractData = {
      ...contract,
      updated_at: now,
      updated_by: userId
    };
    
    // If creating new, add created_at
    if (!contract.id) {
      contractData.created_at = now;
      contractData.created_by = userId;
    }
    
    const { data, error } = await supabase
      .from('contracts')
      .upsert(contractData)
      .select()
      .single();
    
    if (error) {
      console.error('Error upserting contract:', error);
      return { data: null, error };
    }
    
    return { data, error: null };
  } catch (err) {
    console.error('Exception in upsertContract:', err);
    return { data: null, error: err };
  }
}

/**
 * Archive contract
 * @param {string} id - Contract ID
 * @returns {Promise<{data: Object|null, error: Object|null}>}
 */
export async function archiveContract(id) {
  try {
    const now = new Date().toISOString();
    const userId = (await supabase.auth.getUser()).data?.user?.id;
    
    const { data, error } = await supabase
      .from('contracts')
      .update({
        archived: true,
        archived_at: now,
        archived_by: userId
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error archiving contract:', error);
      return { data: null, error };
    }
    
    return { data, error: null };
  } catch (err) {
    console.error('Exception in archiveContract:', err);
    return { data: null, error: err };
  }
}

export default {
  listContracts,
  getContract,
  getContractWithDetails,
  upsertContract,
  archiveContract
};
