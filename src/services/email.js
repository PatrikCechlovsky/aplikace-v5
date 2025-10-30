/**
 * ============================================================================
 * Email Service
 * ============================================================================
 * Service for sending emails including payment confirmations
 * Integrates with BankID for document signing
 * ============================================================================
 */

import { supabase } from '/src/supabase.js';

/**
 * Generate payment confirmation document
 * @param {Object} payment - Payment data
 * @param {Object} contract - Contract data
 * @returns {Object} Document data
 */
export function generatePaymentConfirmationDocument(payment, contract) {
  const paymentDate = new Date(payment.payment_date).toLocaleDateString('cs-CZ');
  const amount = new Intl.NumberFormat('cs-CZ', { style: 'currency', currency: 'CZK' }).format(payment.amount);
  
  const html = `
    <!DOCTYPE html>
    <html lang="cs">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Potvrzení o přijetí platby</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px; }
        .header { background: #0066cc; color: white; padding: 20px; text-align: center; margin-bottom: 30px; }
        .content { background: #f9f9f9; padding: 20px; border: 1px solid #ddd; }
        .field { margin: 15px 0; }
        .field-label { font-weight: bold; color: #666; }
        .field-value { margin-left: 10px; }
        .footer { margin-top: 30px; padding-top: 20px; border-top: 2px solid #0066cc; text-align: center; color: #666; font-size: 12px; }
        .amount { font-size: 24px; color: #0066cc; font-weight: bold; }
        .signature-section { margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Potvrzení o přijetí platby</h1>
      </div>
      
      <div class="content">
        <div class="field">
          <span class="field-label">Datum platby:</span>
          <span class="field-value">${paymentDate}</span>
        </div>
        
        <div class="field">
          <span class="field-label">Částka:</span>
          <span class="field-value amount">${amount}</span>
        </div>
        
        <div class="field">
          <span class="field-label">Číslo smlouvy:</span>
          <span class="field-value">${contract?.cislo_smlouvy || '-'}</span>
        </div>
        
        <div class="field">
          <span class="field-label">Nájemník:</span>
          <span class="field-value">${contract?.tenant?.display_name || '-'}</span>
        </div>
        
        <div class="field">
          <span class="field-label">Jednotka:</span>
          <span class="field-value">${contract?.unit?.oznaceni || '-'}</span>
        </div>
        
        <div class="field">
          <span class="field-label">Typ platby:</span>
          <span class="field-value">${payment.payment_type || '-'}</span>
        </div>
        
        ${payment.payment_reference ? `
        <div class="field">
          <span class="field-label">Variabilní symbol:</span>
          <span class="field-value">${payment.payment_reference}</span>
        </div>
        ` : ''}
        
        <div class="signature-section">
          <p><strong>Pronajímatel potvrzuje přijetí výše uvedené platby.</strong></p>
          <p>Tento dokument byl vygenerován automaticky a je platný bez podpisu. Pro elektronický podpis použijte BankID.</p>
        </div>
      </div>
      
      <div class="footer">
        <p>Tento dokument byl vygenerován ${new Date().toLocaleString('cs-CZ')}</p>
        <p>ID platby: ${payment.id}</p>
      </div>
    </body>
    </html>
  `;
  
  return {
    html,
    subject: `Potvrzení o přijetí platby - ${amount}`,
    filename: `potvrzeni_platby_${payment.id.substring(0, 8)}_${paymentDate.replace(/\./g, '-')}.pdf`
  };
}

/**
 * Send payment confirmation email
 * @param {string} paymentId - Payment ID
 * @param {Object} options - Email options
 * @returns {Promise<{data: Object|null, error: Object|null}>}
 */
export async function sendPaymentConfirmationEmail(paymentId, options = {}) {
  try {
    const {
      requireSignature = false,
      sendTo = null // Override recipient email
    } = options;
    
    // Get payment with related data
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .select(`
        *,
        contract:contracts(
          id,
          cislo_smlouvy,
          landlord:subjects!landlord_id(id, display_name, primary_email),
          tenant:subjects!tenant_id(id, display_name, primary_email),
          unit:units(id, oznaceni)
        )
      `)
      .eq('id', paymentId)
      .single();
    
    if (paymentError) {
      return { data: null, error: paymentError };
    }
    
    const contract = payment.contract;
    const recipientEmail = sendTo || contract?.tenant?.primary_email;
    
    if (!recipientEmail) {
      return { data: null, error: { message: 'Email příjemce nebyl nalezen' } };
    }
    
    // Generate confirmation document
    const document = generatePaymentConfirmationDocument(payment, contract);
    
    // If signature is required, initiate BankID signing workflow
    if (requireSignature) {
      const signingResult = await initiateBankIDSigning(payment, document);
      
      if (signingResult.error) {
        return { data: null, error: signingResult.error };
      }
      
      // Store signing info
      await supabase
        .from('payments')
        .update({
          podpis_info: {
            provider: 'BankID',
            initiated_at: new Date().toISOString(),
            flow_id: signingResult.data.flowId,
            status: 'pending'
          },
          auto_odeslano_potvrzeni: 'fronta'
        })
        .eq('id', paymentId);
      
      return {
        data: {
          message: 'Podpisový workflow BankID byl zahájen',
          flowId: signingResult.data.flowId,
          requiresUserAction: true
        },
        error: null
      };
    }
    
    // Send email without signature (mock for now - would use real email service)
    const emailResult = await sendEmail({
      to: recipientEmail,
      subject: document.subject,
      html: document.html,
      attachments: []
    });
    
    if (emailResult.error) {
      // Update payment status to failed
      await supabase
        .from('payments')
        .update({
          auto_odeslano_potvrzeni: 'selhalo'
        })
        .eq('id', paymentId);
      
      return { data: null, error: emailResult.error };
    }
    
    // Update payment status to sent
    await supabase
      .from('payments')
      .update({
        auto_odeslano_potvrzeni: 'odeslano',
        potvrzeni_odeslano_v: new Date().toISOString()
      })
      .eq('id', paymentId);
    
    return {
      data: {
        message: 'Email s potvrzením byl úspěšně odeslán',
        sentTo: recipientEmail
      },
      error: null
    };
  } catch (err) {
    console.error('Exception in sendPaymentConfirmationEmail:', err);
    return { data: null, error: err };
  }
}

/**
 * Initiate BankID signing workflow
 * @param {Object} payment - Payment data
 * @param {Object} document - Document to sign
 * @returns {Promise<{data: Object|null, error: Object|null}>}
 */
async function initiateBankIDSigning(payment, document) {
  try {
    // This is a mock implementation
    // In production, this would:
    // 1. Call BankID API to create a signing session
    // 2. Upload the document to be signed
    // 3. Return the flow ID and signing URL
    
    // For now, return a mock flow ID
    const mockFlowId = `bankid_${payment.id}_${Date.now()}`;
    
    // TODO: Implement actual BankID integration
    // const bankIdResponse = await fetch('https://api.bankid.cz/signing/initiate', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Authorization': `Bearer ${process.env.BANKID_API_KEY}`
    //   },
    //   body: JSON.stringify({
    //     document: document.html,
    //     signerEmail: payment.contract?.tenant?.primary_email,
    //     documentName: document.filename
    //   })
    // });
    
    return {
      data: {
        flowId: mockFlowId,
        signingUrl: `https://bankid.cz/sign/${mockFlowId}`, // Mock URL
        message: 'BankID signing workflow initiated (MOCK)'
      },
      error: null
    };
  } catch (err) {
    console.error('Exception in initiateBankIDSigning:', err);
    return { data: null, error: err };
  }
}

/**
 * Check BankID signing status
 * @param {string} flowId - BankID flow ID
 * @returns {Promise<{data: Object|null, error: Object|null}>}
 */
export async function checkBankIDSigningStatus(flowId) {
  try {
    // This is a mock implementation
    // In production, this would call BankID API to check status
    
    // TODO: Implement actual BankID status check
    // const response = await fetch(`https://api.bankid.cz/signing/${flowId}/status`, {
    //   headers: {
    //     'Authorization': `Bearer ${process.env.BANKID_API_KEY}`
    //   }
    // });
    
    return {
      data: {
        status: 'pending', // Mock status: pending, signed, failed, expired
        message: 'Čeká na podpis (MOCK)'
      },
      error: null
    };
  } catch (err) {
    console.error('Exception in checkBankIDSigningStatus:', err);
    return { data: null, error: err };
  }
}

/**
 * Send email (mock implementation)
 * @param {Object} emailData - Email data
 * @returns {Promise<{data: Object|null, error: Object|null}>}
 */
async function sendEmail(emailData) {
  try {
    // This is a mock implementation
    // In production, this would use a real email service like SendGrid, AWS SES, etc.
    
    console.log('Sending email (MOCK):', {
      to: emailData.to,
      subject: emailData.subject,
      hasHtml: !!emailData.html,
      attachmentCount: emailData.attachments?.length || 0
    });
    
    // TODO: Implement actual email sending
    // const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Authorization': `Bearer ${process.env.SENDGRID_API_KEY}`
    //   },
    //   body: JSON.stringify({
    //     personalizations: [{ to: [{ email: emailData.to }] }],
    //     from: { email: 'noreply@example.com', name: 'Rental Management System' },
    //     subject: emailData.subject,
    //     content: [{ type: 'text/html', value: emailData.html }]
    //   })
    // });
    
    return {
      data: {
        messageId: `mock_${Date.now()}`,
        message: 'Email sent (MOCK)'
      },
      error: null
    };
  } catch (err) {
    console.error('Exception in sendEmail:', err);
    return { data: null, error: err };
  }
}

export default {
  sendPaymentConfirmationEmail,
  checkBankIDSigningStatus,
  generatePaymentConfirmationDocument
};
