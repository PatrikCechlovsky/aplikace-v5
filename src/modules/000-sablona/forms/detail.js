// src/modules/000-sablona/forms/detail.js
// Template/example detail view using the universal form wrapper in read-only mode
// This demonstrates the standardized module structure for read-only forms

import { renderUniversalForm, navigateToModuleOverview } from '/src/ui/universal-form.js';

// Example schema (same as edit, but will be rendered read-only)
const EXAMPLE_SCHEMA = [
  { key: 'name', label: 'Název', type: 'text' },
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

export default async function renderDetail(root, params = {}) {
  const qs = new URLSearchParams((location.hash.split('?')[1] || ''));
  const entityId = params?.id || qs.get('id');

  if (!entityId) {
    root.innerHTML = '<div class="error">ID záznamu není zadáno</div>';
    return;
  }

  // Load data for display
  // TODO: Load from database
  // const { data, error } = await getRecord(entityId);
  // if (error) { ... }
  const initial = {
    name: 'Příklad záznamu',
    description: 'Toto je detail záznamu v režimu jen pro čtení. Všechna pole jsou deaktivována.',
    status: 'active',
    priority: 'high',
    is_public: true
  };

  // Breadcrumbs
  const breadcrumbs = [
    { icon: 'home', label: 'Domů', href: '#/' },
    { icon: 'folder', label: 'Šablona', href: '#/m/000-sablona/t/prehled' },
    { label: 'Detail' }
  ];

  // Render using universal form wrapper in read-only mode
  await renderUniversalForm({
    root,
    schema: EXAMPLE_SCHEMA,
    initialData: initial,
    breadcrumbs,
    onSave: null, // No save in detail/read-only mode
    options: {
      entity: 'example',
      entityId: entityId,
      showAttachments: true,
      showHistory: true,
      showArchive: false,
      readOnly: true, // This makes all fields read-only
      onCancel: () => {
        navigateToModuleOverview('000-sablona');
      }
    }
  });
}

// Also export as named export for consistency
export async function render(root, params = {}) {
  return renderDetail(root, params);
}
