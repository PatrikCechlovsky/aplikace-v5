// src/modules/080-platby/db.js
// Database operations for payments module

import { supabase } from '/src/supabase.js';

/**
 * List payments with optional filters
 * @param {Object} options - Filter options
 * @returns {Promise<{data: Array|null, error: Object|null}>}
 */
export async function listPayments(options = {}) {
  const { contractId, partyId, status, paymentType, limit = 500 } = options;
  
  try {
    let query = supabase
      .from('payments')
      .select(`
        *,
        contract:contracts(id, cislo_smlouvy),
        party:subjects!party_id(id, display_name, primary_email)
      `)
      .order('payment_date', { ascending: false })
      .limit(limit);
    
    if (contractId) {
      query = query.eq('contract_id', contractId);
    }
    
    if (partyId) {
      query = query.eq('party_id', partyId);
    }
    
    if (status) {
      query = query.eq('status', status);
    }
    
    if (paymentType) {
      query = query.eq('payment_type', paymentType);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error listing payments:', error);
      return { data: null, error };
    }
    
    return { data: data || [], error: null };
  } catch (err) {
    console.error('Exception in listPayments:', err);
    return { data: null, error: err };
  }
}

/**
 * Get payment by ID
 * @param {string} id - Payment ID
 * @returns {Promise<{data: Object|null, error: Object|null}>}
 */
export async function getPayment(id) {
  try {
    const { data, error } = await supabase
      .from('payments')
      .select(`
        *,
        contract:contracts(id, cislo_smlouvy, landlord_id, tenant_id),
        party:subjects!party_id(id, display_name, primary_email, primary_phone)
      `)
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error getting payment:', error);
      return { data: null, error };
    }
    
    return { data, error: null };
  } catch (err) {
    console.error('Exception in getPayment:', err);
    return { data: null, error: err };
  }
}

/**
 * Create or update payment
 * @param {Object} payment - Payment data
 * @returns {Promise<{data: Object|null, error: Object|null}>}
 */
export async function upsertPayment(payment) {
  try {
    const now = new Date().toISOString();
    const userId = (await supabase.auth.getUser()).data?.user?.id;
    
    const paymentData = {
      ...payment,
      updated_at: now,
      updated_by: userId
    };
    
    if (!payment.id) {
      paymentData.created_at = now;
      paymentData.created_by = userId;
    }
    
    const { data, error } = await supabase
      .from('payments')
      .upsert(paymentData)
      .select()
      .single();
    
    if (error) {
      console.error('Error upserting payment:', error);
      return { data: null, error };
    }
    
    return { data, error: null };
  } catch (err) {
    console.error('Exception in upsertPayment:', err);
    return { data: null, error: err };
  }
}

/**
 * Allocate payment to contract items
 * @param {string} paymentId - Payment ID
 * @param {Array} allocations - Allocation data
 * @returns {Promise<{data: Object|null, error: Object|null}>}
 */
export async function allocatePayment(paymentId, allocations) {
  try {
    const now = new Date().toISOString();
    const userId = (await supabase.auth.getUser()).data?.user?.id;
    
    // Prepare allocation records
    const allocationRecords = allocations.map(alloc => ({
      payment_id: paymentId,
      allocation_type: alloc.type,
      amount: alloc.amount,
      target_id: alloc.target_id || null,
      period_from: alloc.period_from || null,
      period_to: alloc.period_to || null,
      poznamky: alloc.poznamky || null,
      created_at: now,
      created_by: userId,
      updated_at: now,
      updated_by: userId
    }));
    
    const { data, error } = await supabase
      .from('payment_allocations')
      .insert(allocationRecords)
      .select();
    
    if (error) {
      console.error('Error allocating payment:', error);
      return { data: null, error };
    }
    
    return { data, error: null };
  } catch (err) {
    console.error('Exception in allocatePayment:', err);
    return { data: null, error: err };
  }
}

/**
 * Get payment schedule for contract
 * @param {string} contractId - Contract ID
 * @returns {Promise<{data: Array|null, error: Object|null}>}
 */
export async function getPaymentSchedule(contractId) {
  try {
    // Get contract details
    const { data: contract, error: contractError } = await supabase
      .from('contracts')
      .select('datum_zacatek, datum_konec, najem_vyse, periodicita_najmu')
      .eq('id', contractId)
      .single();
    
    if (contractError) {
      return { data: null, error: contractError };
    }
    
    // Generate schedule based on contract dates and periodicity
    const schedule = [];
    const startDate = new Date(contract.datum_zacatek);
    const endDate = contract.datum_konec ? new Date(contract.datum_konec) : new Date(startDate.getFullYear() + 1, startDate.getMonth(), startDate.getDate());
    
    let currentDate = new Date(startDate);
    let period = 1; // month increment
    
    // Adjust period based on periodicita_najmu
    if (contract.periodicita_najmu === 'tydenni') period = 7 / 30; // approximate
    if (contract.periodicita_najmu === 'rocni') period = 12;
    
    while (currentDate <= endDate) {
      schedule.push({
        due_date: new Date(currentDate),
        amount: contract.najem_vyse,
        period_start: new Date(currentDate),
        period_end: new Date(currentDate.getFullYear(), currentDate.getMonth() + period, currentDate.getDate())
      });
      
      // Move to next period
      currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + period, currentDate.getDate());
    }
    
    return { data: schedule, error: null };
  } catch (err) {
    console.error('Exception in getPaymentSchedule:', err);
    return { data: null, error: err };
  }
}

export default {
  listPayments,
  getPayment,
  upsertPayment,
  allocatePayment,
  getPaymentSchedule
};
