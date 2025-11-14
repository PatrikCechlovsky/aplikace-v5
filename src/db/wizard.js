// src/db/wizard.js
// Database operations for wizard system

import { supabase } from '/src/supabase.js';

/**
 * Create a new wizard draft
 * @param {Object} params - Draft parameters
 * @param {string} params.wizardKey - Type of wizard
 * @param {string} params.entityCode - Entity code (LORD, PROP, UNIT, etc.)
 * @param {string} params.mode - create or update
 * @param {string} params.targetId - Existing entity ID if updating
 * @param {number} params.totalSteps - Total number of steps
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export async function createWizardDraft(params) {
  const { wizardKey, entityCode, mode = 'create', targetId = null, totalSteps = 1 } = params;
  
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { data: null, error: new Error('User not authenticated') };
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // Expire after 7 days

    const { data, error } = await supabase
      .from('wizard_drafts')
      .insert({
        user_id: user.id,
        wizard_key: wizardKey,
        entity_code: entityCode,
        mode,
        target_id: targetId,
        total_steps: totalSteps,
        current_step_order: 1,
        status: 'draft',
        expires_at: expiresAt.toISOString()
      })
      .select()
      .single();

    return { data, error };
  } catch (error) {
    console.error('Error creating wizard draft:', error);
    return { data: null, error };
  }
}

/**
 * Get wizard draft by ID
 * @param {string} draftId - Draft ID
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export async function getWizardDraft(draftId) {
  try {
    const { data, error } = await supabase
      .from('wizard_drafts')
      .select('*')
      .eq('id', draftId)
      .single();

    return { data, error };
  } catch (error) {
    console.error('Error getting wizard draft:', error);
    return { data: null, error };
  }
}

/**
 * Update wizard draft
 * @param {string} draftId - Draft ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export async function updateWizardDraft(draftId, updates) {
  try {
    const { data, error } = await supabase
      .from('wizard_drafts')
      .update(updates)
      .eq('id', draftId)
      .select()
      .single();

    return { data, error };
  } catch (error) {
    console.error('Error updating wizard draft:', error);
    return { data: null, error };
  }
}

/**
 * Delete wizard draft
 * @param {string} draftId - Draft ID
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export async function deleteWizardDraft(draftId) {
  try {
    const { data, error } = await supabase
      .from('wizard_drafts')
      .delete()
      .eq('id', draftId)
      .select()
      .single();

    return { data, error };
  } catch (error) {
    console.error('Error deleting wizard draft:', error);
    return { data: null, error };
  }
}

/**
 * List wizard drafts for current user
 * @param {Object} params - Query parameters
 * @param {string} params.status - Filter by status
 * @param {string} params.wizardKey - Filter by wizard type
 * @returns {Promise<{data: Array|null, error: Error|null}>}
 */
export async function listWizardDrafts(params = {}) {
  const { status, wizardKey } = params;
  
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { data: null, error: new Error('User not authenticated') };
    }

    let query = supabase
      .from('wizard_drafts')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }
    if (wizardKey) {
      query = query.eq('wizard_key', wizardKey);
    }

    const { data, error } = await query;
    return { data, error };
  } catch (error) {
    console.error('Error listing wizard drafts:', error);
    return { data: null, error };
  }
}

/**
 * Create wizard step
 * @param {Object} params - Step parameters
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export async function createWizardStep(params) {
  const { draftId, stepOrder, stepCode, entityCode, formCode, listCode, tabCode } = params;
  
  try {
    const { data, error } = await supabase
      .from('wizard_steps')
      .insert({
        draft_id: draftId,
        step_order: stepOrder,
        step_code: stepCode,
        entity_code: entityCode,
        form_code: formCode,
        list_code: listCode,
        tab_code: tabCode,
        status: 'pending'
      })
      .select()
      .single();

    return { data, error };
  } catch (error) {
    console.error('Error creating wizard step:', error);
    return { data: null, error };
  }
}

/**
 * Get wizard steps for a draft
 * @param {string} draftId - Draft ID
 * @returns {Promise<{data: Array|null, error: Error|null}>}
 */
export async function getWizardSteps(draftId) {
  try {
    const { data, error } = await supabase
      .from('wizard_steps')
      .select('*')
      .eq('draft_id', draftId)
      .order('step_order', { ascending: true });

    return { data, error };
  } catch (error) {
    console.error('Error getting wizard steps:', error);
    return { data: null, error };
  }
}

/**
 * Update wizard step
 * @param {string} stepId - Step ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export async function updateWizardStep(stepId, updates) {
  try {
    const { data, error } = await supabase
      .from('wizard_steps')
      .update(updates)
      .eq('id', stepId)
      .select()
      .single();

    return { data, error };
  } catch (error) {
    console.error('Error updating wizard step:', error);
    return { data: null, error };
  }
}

/**
 * Complete wizard - validates all steps and creates entities
 * @param {string} draftId - Draft ID
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export async function completeWizard(draftId) {
  try {
    // Get draft and steps
    const { data: draft, error: draftError } = await getWizardDraft(draftId);
    if (draftError) return { data: null, error: draftError };

    const { data: steps, error: stepsError } = await getWizardSteps(draftId);
    if (stepsError) return { data: null, error: stepsError };

    // Validate all steps are valid
    const invalidSteps = steps.filter(s => s.status !== 'valid' && s.status !== 'done' && s.status !== 'skipped');
    if (invalidSteps.length > 0) {
      return {
        data: null,
        error: new Error(`Cannot complete wizard: ${invalidSteps.length} step(s) are not valid`)
      };
    }

    // Aggregate data from all steps
    const aggregatedData = {};
    steps.forEach(step => {
      Object.assign(aggregatedData, step.data || {});
    });

    // Update draft status
    const { data: completedDraft, error: updateError } = await updateWizardDraft(draftId, {
      status: 'completed',
      payload: aggregatedData,
      meta: {
        completed_at: new Date().toISOString(),
        steps_count: steps.length
      }
    });

    if (updateError) return { data: null, error: updateError };

    return { data: completedDraft, error: null };
  } catch (error) {
    console.error('Error completing wizard:', error);
    return { data: null, error };
  }
}

export default {
  createWizardDraft,
  getWizardDraft,
  updateWizardDraft,
  deleteWizardDraft,
  listWizardDrafts,
  createWizardStep,
  getWizardSteps,
  updateWizardStep,
  completeWizard
};
