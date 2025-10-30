/**
 * ============================================================================
 * Payment Actions Service
 * ============================================================================
 * UI actions for payment management including confirmation emails
 * ============================================================================
 */

import { sendPaymentConfirmationEmail, checkBankIDSigningStatus } from '/src/services/email.js';
import { supabase } from '/src/supabase.js';

/**
 * Show payment confirmation dialog
 * @param {string} paymentId - Payment ID
 * @param {Object} options - Dialog options
 */
export async function showPaymentConfirmationDialog(paymentId, options = {}) {
  const {
    onSuccess = null,
    onError = null
  } = options;

  // Create modal dialog
  const modal = document.createElement('div');
  modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
  modal.innerHTML = `
    <div class="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
      <h2 class="text-xl font-bold mb-4">Odeslat potvrzení o platbě</h2>
      <p class="text-gray-600 mb-4">
        Chcete odeslat emailové potvrzení o přijetí této platby?
      </p>
      
      <div class="mb-4">
        <label class="flex items-center">
          <input type="checkbox" id="requireSignature" class="mr-2">
          <span>Vyžadovat elektronický podpis (BankID)</span>
        </label>
        <p class="text-sm text-gray-500 ml-6">
          Pokud zaškrtnete, bude zahájen proces podpisu prostřednictvím BankID
        </p>
      </div>
      
      <div class="flex justify-end space-x-3">
        <button id="cancelBtn" class="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400">
          Zrušit
        </button>
        <button id="sendBtn" class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
          Odeslat
        </button>
      </div>
      
      <div id="statusMessage" class="mt-4 hidden">
        <div class="p-3 rounded bg-blue-50 text-blue-800"></div>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  const cancelBtn = modal.querySelector('#cancelBtn');
  const sendBtn = modal.querySelector('#sendBtn');
  const requireSignatureCheck = modal.querySelector('#requireSignature');
  const statusMessage = modal.querySelector('#statusMessage');

  const closeModal = () => {
    document.body.removeChild(modal);
  };

  cancelBtn.addEventListener('click', closeModal);

  sendBtn.addEventListener('click', async () => {
    try {
      sendBtn.disabled = true;
      sendBtn.setAttribute('aria-busy', 'true');
      sendBtn.textContent = 'Odesílání...';

      const requireSignature = requireSignatureCheck.checked;

      const { data, error } = await sendPaymentConfirmationEmail(paymentId, {
        requireSignature
      });

      if (error) {
        statusMessage.classList.remove('hidden');
        statusMessage.querySelector('div').className = 'p-3 rounded bg-red-50 text-red-800';
        statusMessage.querySelector('div').textContent = `Chyba: ${error.message || 'Nepodařilo se odeslat email'}`;
        sendBtn.disabled = false;
        sendBtn.removeAttribute('aria-busy');
        sendBtn.textContent = 'Odeslat';
        if (onError) onError(error);
        return;
      }

      statusMessage.classList.remove('hidden');
      statusMessage.querySelector('div').className = 'p-3 rounded bg-green-50 text-green-800';
      
      if (data.requiresUserAction) {
        statusMessage.querySelector('div').innerHTML = `
          <p><strong>BankID workflow zahájen</strong></p>
          <p class="text-sm mt-1">${data.message}</p>
          <p class="text-sm mt-2">Flow ID: ${data.flowId}</p>
        `;
      } else {
        statusMessage.querySelector('div').textContent = data.message || 'Email byl úspěšně odeslán';
      }

      if (onSuccess) onSuccess(data);

      // Auto-close after 2 seconds if successful and no signature required
      if (!data.requiresUserAction) {
        setTimeout(closeModal, 2000);
      }
    } catch (err) {
      console.error('Error sending payment confirmation:', err);
      statusMessage.classList.remove('hidden');
      statusMessage.querySelector('div').className = 'p-3 rounded bg-red-50 text-red-800';
      statusMessage.querySelector('div').textContent = `Neočekávaná chyba: ${err.message}`;
      sendBtn.disabled = false;
      sendBtn.removeAttribute('aria-busy');
      sendBtn.textContent = 'Odeslat';
      if (onError) onError(err);
    }
  });
}

/**
 * Add payment confirmation button to a container
 * @param {HTMLElement} container - Container element
 * @param {string} paymentId - Payment ID
 * @param {Object} options - Button options
 */
export function addPaymentConfirmationButton(container, paymentId, options = {}) {
  const {
    buttonText = 'Odeslat potvrzení',
    buttonClass = 'px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600'
  } = options;

  const button = document.createElement('button');
  button.className = buttonClass;
  button.textContent = buttonText;
  button.addEventListener('click', () => {
    showPaymentConfirmationDialog(paymentId, options);
  });

  container.appendChild(button);
  return button;
}

/**
 * Check and update BankID signing status
 * @param {string} paymentId - Payment ID
 * @returns {Promise<{data: Object|null, error: Object|null}>}
 */
export async function updateBankIDSigningStatus(paymentId) {
  try {
    // Get payment with signing info
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .select('id, podpis_info')
      .eq('id', paymentId)
      .single();

    if (paymentError) {
      return { data: null, error: paymentError };
    }

    if (!payment.podpis_info || !payment.podpis_info.flow_id) {
      return { 
        data: null, 
        error: { message: 'Žádný aktivní podpisový proces' } 
      };
    }

    // Check BankID status
    const { data: statusData, error: statusError } = await checkBankIDSigningStatus(
      payment.podpis_info.flow_id
    );

    if (statusError) {
      return { data: null, error: statusError };
    }

    // Update payment if status changed
    if (statusData.status === 'signed') {
      await supabase
        .from('payments')
        .update({
          podpis_info: {
            ...payment.podpis_info,
            status: 'signed',
            signed_at: new Date().toISOString()
          },
          auto_odeslano_potvrzeni: 'odeslano',
          potvrzeni_odeslano_v: new Date().toISOString()
        })
        .eq('id', paymentId);
    } else if (statusData.status === 'failed' || statusData.status === 'expired') {
      await supabase
        .from('payments')
        .update({
          podpis_info: {
            ...payment.podpis_info,
            status: statusData.status,
            failed_at: new Date().toISOString()
          },
          auto_odeslano_potvrzeni: 'selhalo'
        })
        .eq('id', paymentId);
    }

    return { data: statusData, error: null };
  } catch (err) {
    console.error('Exception in updateBankIDSigningStatus:', err);
    return { data: null, error: err };
  }
}

export default {
  showPaymentConfirmationDialog,
  addPaymentConfirmationButton,
  updateBankIDSigningStatus
};
