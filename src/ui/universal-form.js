// src/ui/universal-form.js
// Universal form wrapper with common actions, history, attachments, and archive
// Provides consistent structure across all modules

import { renderForm } from './form.js';
import { renderCommonActions } from './commonActions.js';
import { setBreadcrumb } from './breadcrumb.js';
import { useUnsavedHelper } from './unsaved-helper.js';
import { showAttachmentsModal } from './attachments.js';

/**
 * Render a universal form with consistent features
 * 
 * @param {Object} config - Configuration object
 * @param {HTMLElement} config.root - Root element to render into
 * @param {Array} config.schema - Form field schema
 * @param {Object} config.initialData - Initial form data
 * @param {Function} config.onSave - Save handler, returns Promise<{success: boolean, data?: any, error?: any}>
 * @param {Array} config.breadcrumbs - Breadcrumb items
 * @param {Object} config.options - Additional options
 * @param {string} config.options.entity - Entity type for attachments/history (e.g., 'profile', 'subject')
 * @param {string} config.options.entityId - Entity ID for attachments/history
 * @param {boolean} config.options.showAttachments - Show attachments button (default: true)
 * @param {boolean} config.options.showHistory - Show history button (default: true)
 * @param {boolean} config.options.showArchive - Show archive button (default: true)
 * @param {Function} config.options.onArchive - Archive handler
 * @param {Function} config.options.onHistory - Custom history handler
 * @param {Function} config.options.onCancel - Cancel handler (default: navigate back)
 * @param {Array} config.options.additionalActions - Additional custom actions
 */
export async function renderUniversalForm(config) {
  const {
    root,
    schema,
    initialData = {},
    onSave,
    breadcrumbs = [],
    options = {}
  } = config;

  if (!root) {
    console.error('renderUniversalForm: root element is required');
    return;
  }

  if (!schema || !Array.isArray(schema)) {
    console.error('renderUniversalForm: schema array is required');
    return;
  }

  // Options with defaults
  const {
    entity,
    entityId,
    showAttachments = true,
    showHistory = true,
    showArchive = false,
    onArchive,
    onHistory,
    onCancel,
    additionalActions = [],
    readOnly = false
  } = options;

  // Set breadcrumbs if provided
  if (breadcrumbs.length > 0) {
    const crumbEl = document.getElementById('crumb');
    if (crumbEl) {
      setBreadcrumb(crumbEl, breadcrumbs);
    }
  }

  // Determine which actions to show
  const moduleActions = ['approve', 'reject'];
  
  // Add attachments action if enabled and entity is provided
  if (showAttachments && entity && entityId) {
    moduleActions.push('attach');
  }

  // Add history action if enabled
  if (showHistory && entity && entityId) {
    moduleActions.push('history');
  }

  // Add archive action if enabled
  if (showArchive && onArchive) {
    moduleActions.push('archive');
  }

  // Add custom actions
  additionalActions.forEach(action => {
    if (action && action.key) {
      moduleActions.push(action.key);
    }
  });

  // Prepare handlers for common actions
  const handlers = {
    onApprove: async () => {
      if (!onSave) {
        console.warn('renderUniversalForm: No onSave handler provided');
        return;
      }

      // Collect form values
      const formEl = root.querySelector('form');
      if (!formEl) {
        console.error('renderUniversalForm: Form element not found');
        return;
      }

      const values = {};
      schema.forEach(field => {
        const input = formEl.querySelector(`[name="${field.key}"]`);
        if (input) {
          if (field.type === 'checkbox') {
            values[field.key] = input.checked;
          } else {
            values[field.key] = input.value;
          }
        }
      });

      try {
        const result = await onSave(values);
        if (result && result.success !== false) {
          // Success - the onSave handler should show toast
          return true;
        }
      } catch (error) {
        console.error('Save error:', error);
        return false;
      }
    },

    onReject: () => {
      if (onCancel) {
        onCancel();
      } else {
        // Default: go back
        if (window.history.length > 1) {
          window.history.back();
        } else {
          window.location.hash = '#/';
        }
      }
    }
  };

  // Add attachments handler
  if (showAttachments && entity && entityId) {
    handlers.onAttach = async () => {
      try {
        await showAttachmentsModal({ entity, entityId });
      } catch (error) {
        console.error('Error showing attachments:', error);
      }
    };
  }

  // Add history handler
  if (showHistory && entity && entityId) {
    handlers.onHistory = async () => {
      if (onHistory) {
        await onHistory(entity, entityId);
      } else {
        // Default history handler - could show a modal or navigate
        console.log('History for', entity, entityId);
        // TODO: Implement default history modal
      }
    };
  }

  // Add archive handler
  if (showArchive && onArchive) {
    handlers.onArchive = async () => {
      try {
        await onArchive(entityId);
      } catch (error) {
        console.error('Error archiving:', error);
      }
    };
  }

  // Add custom action handlers
  additionalActions.forEach(action => {
    if (action && action.key && action.handler) {
      const handlerKey = 'on' + action.key.charAt(0).toUpperCase() + action.key.slice(1);
      handlers[handlerKey] = action.handler;
    }
  });

  // Render the form
  renderForm(root, schema, initialData, async (values) => {
    if (!onSave) return false;
    
    try {
      const result = await onSave(values);
      return result && result.success !== false;
    } catch (error) {
      console.error('Save error:', error);
      return false;
    }
  }, {
    readOnly,
    showSubmit: false // We handle submit through common actions
  });

  // Render common actions
  const actionsEl = document.getElementById('commonactions');
  if (actionsEl) {
    renderCommonActions(actionsEl, {
      moduleActions,
      userRole: window.currentUserRole || 'user',
      handlers
    });
  }

  // Apply unsaved helper
  const formEl = root.querySelector('form');
  if (formEl && !readOnly) {
    try {
      useUnsavedHelper(formEl);
    } catch (error) {
      console.warn('useUnsavedHelper failed:', error);
    }
  }
}

/**
 * Helper to get module ID from hash for navigation
 */
export function getModuleIdFromHash() {
  try {
    const m = (location.hash || '').match(/#\/m\/([^\/]+)/);
    return m ? m[1] : null;
  } catch (e) {
    return null;
  }
}

/**
 * Helper to navigate back to module overview
 */
export function navigateToModuleOverview(moduleId = null) {
  const id = moduleId || getModuleIdFromHash();
  if (id) {
    window.navigateTo(`#/m/${id}/t/prehled`);
  } else {
    window.location.hash = '#/';
  }
}
