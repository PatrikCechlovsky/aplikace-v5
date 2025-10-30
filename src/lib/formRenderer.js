// src/lib/formRenderer.js
// Generic form renderer that uses module metadata

import { renderForm } from '/src/ui/form.js';

/**
 * Render a form based on module metadata
 * @param {HTMLElement} root - Root element to render into
 * @param {Object} moduleMeta - Module metadata containing forms definition
 * @param {string} formId - Form ID to render
 * @param {Object} initialData - Initial form data
 * @param {Function} onSubmit - Submit callback
 * @param {Object} options - Additional options for renderForm
 * @returns {void}
 */
export function renderMetadataForm(
  root,
  moduleMeta,
  formId,
  initialData = {},
  onSubmit = async () => true,
  options = {}
) {
  if (!moduleMeta || !moduleMeta.forms) {
    root.innerHTML = `<div class="p-4 text-red-600">Module metadata not available</div>`;
    return;
  }

  // Find the form definition
  const formDef = moduleMeta.forms.find(f => f.id === formId);
  
  if (!formDef) {
    root.innerHTML = `<div class="p-4 text-red-600">Form '${formId}' not found in module metadata</div>`;
    return;
  }

  if (!formDef.fields || !Array.isArray(formDef.fields)) {
    root.innerHTML = `<div class="p-4 text-red-600">Form '${formId}' has no fields defined</div>`;
    return;
  }

  // Use the renderForm utility with fields from metadata
  renderForm(root, formDef.fields, initialData, onSubmit, options);
}

export default { renderMetadataForm };
