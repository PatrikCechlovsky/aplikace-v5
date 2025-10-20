// src/modules/000-sablona/forms/edit.js
// Template/example form using the universal form wrapper
// This demonstrates the standardized module structure

import { toast } from '/src/ui/commonActions.js';
import { renderUniversalForm, navigateToModuleOverview } from '/src/ui/universal-form.js';

// Example schema for the template module
const EXAMPLE_SCHEMA = [
  { key: 'name', label: 'Název *', type: 'text', required: true },
  { key: 'description', label: 'Popis', type: 'textarea', fullWidth: true },
  { key: 'status', label: 'Stav', type: 'select', 
    options: [
      { value: 'active', label: 'Aktivní' },
      { value: 'inactive', label: 'Neaktivní' },
      { value: 'archived', label: 'Archivováno' }
    ]
  },
  { key: 'priority', label: 'Priorita', type: 'select',
    options: [
      { value: 'low', label: 'Nízká' },
      { value: 'medium', label: 'Střední' },
      { value: 'high', label: 'Vysoká' }
    ]
  },
  { key: 'is_public', label: 'Veřejné', type: 'checkbox' }
];

export default async function renderEdit(root, params = {}) {
  root.innerHTML = '';
  
  // Get entity ID if editing existing record
  const entityId = params?.id || null;
  
  // Load existing data if editing
  let initial = {};
  if (entityId) {
    // TODO: Load data from database
    // const { data, error } = await getRecord(entityId);
    // if (error) { ... }
    initial = { 
      name: 'Příklad záznamu',
      description: 'Toto je příklad editace existujícího záznamu.',
      status: 'active',
      priority: 'medium',
      is_public: true
    };
  } else {
    // Default values for new record
    initial = {
      status: 'active',
      priority: 'medium',
      is_public: false
    };
  }

  // Breadcrumbs
  const breadcrumbs = [
    { icon: 'home', label: 'Domů', href: '#/' },
    { icon: 'folder', label: 'Šablona', href: '#/m/000-sablona/t/prehled' },
    { label: entityId ? 'Úprava' : 'Nový záznam' }
  ];

  // Render using universal form wrapper
  await renderUniversalForm({
    root,
    schema: EXAMPLE_SCHEMA,
    initialData: initial,
    breadcrumbs,
    onSave: async (values) => {
      // TODO: Save to database
      // const { data, error } = await upsertRecord(values);
      // if (error) { toast('Chyba při ukládání: ' + error.message, 'error'); return { success: false, error }; }
      
      console.log('Saving example record:', values);
      toast('Záznam uložen (demo)', 'success');
      navigateToModuleOverview('000-sablona');
      return { success: true };
    },
    options: {
      entity: 'example',
      entityId: entityId,
      showAttachments: !!entityId, // Only for existing records
      showHistory: !!entityId,     // Only for existing records
      showArchive: false,
      onCancel: () => {
        navigateToModuleOverview('000-sablona');
      }
    }
  });
}

// Also export as named export for consistency
export async function render(root, params = {}) {
  return renderEdit(root, params);
}
