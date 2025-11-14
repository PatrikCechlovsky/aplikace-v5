/**
 * ============================================================================
 * Wizard UI Component
 * ============================================================================
 * Multi-step form wizard for creating/editing entities
 * Based on docs/wizard-system.md
 * ============================================================================
 */

import { 
  createWizardDraft, 
  getWizardDraft, 
  updateWizardDraft,
  createWizardStep,
  getWizardSteps,
  updateWizardStep,
  completeWizard 
} from '/src/db/wizard.js';

/**
 * Render a wizard interface
 * @param {HTMLElement} container - Container element
 * @param {Object} config - Wizard configuration
 * @param {string} config.wizardKey - Wizard type identifier
 * @param {string} config.entityCode - Entity code (LORD, PROP, UNIT, etc.)
 * @param {string} config.title - Wizard title
 * @param {Array} config.steps - Array of step configurations
 * @param {Function} config.onComplete - Callback when wizard completes
 * @param {Function} config.onCancel - Callback when wizard is cancelled
 * @returns {Promise<Object>} Wizard API
 */
export async function renderWizard(container, config) {
  const {
    wizardKey,
    entityCode,
    title = 'Průvodce',
    steps = [],
    mode = 'create',
    targetId = null,
    onComplete = null,
    onCancel = null
  } = config;

  if (!wizardKey || !entityCode || steps.length === 0) {
    container.innerHTML = '<div class="p-4 text-red-600">Chybná konfigurace průvodce</div>';
    return null;
  }

  // Create wizard draft
  const { data: draft, error: draftError } = await createWizardDraft({
    wizardKey,
    entityCode,
    mode,
    targetId,
    totalSteps: steps.length
  });

  if (draftError || !draft) {
    container.innerHTML = `<div class="p-4 text-red-600">Chyba při vytváření průvodce: ${draftError?.message || 'Neznámá chyba'}</div>`;
    return null;
  }

  // Create steps in database
  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    await createWizardStep({
      draftId: draft.id,
      stepOrder: i + 1,
      stepCode: step.code,
      entityCode: step.entityCode || entityCode,
      formCode: step.formCode,
      listCode: step.listCode,
      tabCode: step.tabCode
    });
  }

  let currentStepIndex = 0;
  let stepsData = {};

  // Render wizard UI
  function renderWizardUI() {
    const step = steps[currentStepIndex];
    const isFirstStep = currentStepIndex === 0;
    const isLastStep = currentStepIndex === steps.length - 1;

    container.innerHTML = `
      <div class="wizard-container bg-white rounded-lg shadow-lg p-6">
        <!-- Header -->
        <div class="wizard-header mb-6">
          <h2 class="text-2xl font-bold text-gray-800">${escapeHtml(title)}</h2>
          <p class="text-sm text-gray-600 mt-1">Krok ${currentStepIndex + 1} z ${steps.length}</p>
        </div>

        <!-- Progress bar -->
        <div class="wizard-progress mb-6">
          <div class="flex justify-between mb-2">
            ${steps.map((s, i) => `
              <div class="flex-1 ${i > 0 ? 'ml-2' : ''}">
                <div class="h-2 rounded ${i <= currentStepIndex ? 'bg-blue-500' : 'bg-gray-200'}"></div>
                <div class="text-xs text-center mt-1 ${i === currentStepIndex ? 'font-semibold text-blue-600' : 'text-gray-500'}">
                  ${escapeHtml(s.label || s.code)}
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Step content -->
        <div class="wizard-step-content mb-6 min-h-[300px]">
          <h3 class="text-lg font-semibold mb-4">${escapeHtml(step.label || step.code)}</h3>
          ${step.description ? `<p class="text-sm text-gray-600 mb-4">${escapeHtml(step.description)}</p>` : ''}
          <div id="wizard-step-form"></div>
        </div>

        <!-- Navigation buttons -->
        <div class="wizard-navigation flex justify-between border-t pt-4">
          <div>
            ${!isFirstStep ? `
              <button id="wizard-prev" class="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded text-gray-700">
                ← Zpět
              </button>
            ` : `
              <button id="wizard-cancel" class="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded text-gray-700">
                Zrušit
              </button>
            `}
          </div>
          <div>
            ${!isLastStep ? `
              <button id="wizard-next" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded">
                Další →
              </button>
            ` : `
              <button id="wizard-finish" class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded">
                Dokončit
              </button>
            `}
          </div>
        </div>
      </div>
    `;

    // Render step form
    const formContainer = container.querySelector('#wizard-step-form');
    if (step.renderForm) {
      step.renderForm(formContainer, stepsData[step.code] || {});
    } else {
      formContainer.innerHTML = '<p class="text-gray-500">Formulář pro tento krok není definován.</p>';
    }

    // Add event listeners
    const prevBtn = container.querySelector('#wizard-prev');
    const nextBtn = container.querySelector('#wizard-next');
    const finishBtn = container.querySelector('#wizard-finish');
    const cancelBtn = container.querySelector('#wizard-cancel');

    if (prevBtn) {
      prevBtn.addEventListener('click', async () => {
        currentStepIndex--;
        renderWizardUI();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', async () => {
        // Collect form data
        const formData = step.collectData ? step.collectData(formContainer) : {};
        
        // Validate
        const validationErrors = step.validate ? step.validate(formData) : [];
        
        if (validationErrors.length > 0) {
          alert('Prosím opravte chyby:\n' + validationErrors.join('\n'));
          return;
        }

        // Save step data
        stepsData[step.code] = formData;
        
        // Update step in database
        const { data: dbSteps } = await getWizardSteps(draft.id);
        const dbStep = dbSteps?.find(s => s.step_code === step.code);
        if (dbStep) {
          await updateWizardStep(dbStep.id, {
            data: formData,
            status: 'valid',
            completed_at: new Date().toISOString()
          });
        }

        // Move to next step
        currentStepIndex++;
        renderWizardUI();
      });
    }

    if (finishBtn) {
      finishBtn.addEventListener('click', async () => {
        // Collect final step data
        const formData = step.collectData ? step.collectData(formContainer) : {};
        
        // Validate
        const validationErrors = step.validate ? step.validate(formData) : [];
        
        if (validationErrors.length > 0) {
          alert('Prosím opravte chyby:\n' + validationErrors.join('\n'));
          return;
        }

        // Save final step data
        stepsData[step.code] = formData;
        
        // Update final step in database
        const { data: dbSteps } = await getWizardSteps(draft.id);
        const dbStep = dbSteps?.find(s => s.step_code === step.code);
        if (dbStep) {
          await updateWizardStep(dbStep.id, {
            data: formData,
            status: 'valid',
            completed_at: new Date().toISOString()
          });
        }

        // Complete wizard
        const { data: completedDraft, error: completeError } = await completeWizard(draft.id);
        
        if (completeError) {
          alert('Chyba při dokončování průvodce: ' + completeError.message);
          return;
        }

        // Show success message
        container.innerHTML = `
          <div class="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
            <div class="text-green-600 text-4xl mb-4">✓</div>
            <h3 class="text-lg font-semibold text-green-800 mb-2">Průvodce dokončen!</h3>
            <p class="text-sm text-green-700">Data byla úspěšně uložena.</p>
          </div>
        `;

        // Call completion callback
        if (onComplete) {
          setTimeout(() => onComplete(completedDraft, stepsData), 1000);
        }
      });
    }

    if (cancelBtn) {
      cancelBtn.addEventListener('click', async () => {
        if (confirm('Opravdu chcete zrušit průvodce? Neuložená data budou ztracena.')) {
          await updateWizardDraft(draft.id, { status: 'canceled' });
          if (onCancel) {
            onCancel();
          }
        }
      });
    }
  }

  // Initial render
  renderWizardUI();

  // Return wizard API
  return {
    getDraft: () => draft,
    getCurrentStep: () => currentStepIndex,
    getStepsData: () => stepsData,
    goToStep: (index) => {
      if (index >= 0 && index < steps.length) {
        currentStepIndex = index;
        renderWizardUI();
      }
    },
    refresh: () => renderWizardUI()
  };
}

/**
 * Helper function to escape HTML
 */
function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str || '';
  return div.innerHTML;
}

export default {
  renderWizard
};
