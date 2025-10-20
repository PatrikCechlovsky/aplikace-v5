// src/modules/040-nemovitost/forms/detail.js
// Detail view for property - read-only mode
// TODO: Implement properties table in database and update this form accordingly

import { getPropertySchema } from '/src/db/type-schemas.js';
import { renderUniversalForm, navigateToModuleOverview } from '/src/ui/universal-form.js';

export async function render(root, params = {}) {
  root.innerHTML = '';
  const schema = getPropertySchema();
  const entityId = params?.id;
  
  if (!entityId) {
    root.innerHTML = '<div class="error">ID nemovitosti není zadáno</div>';
    return;
  }

  // TODO: Load property data from database when properties table exists
  // const { data, error } = await getProperty(entityId);
  // if (error) { ... }
  const initial = { title: 'Placeholder Property Detail' };

  // Breadcrumbs
  const breadcrumbs = [
    { icon: 'home', label: 'Domů', href: '#/' },
    { icon: 'building', label: 'Nemovitosti', href: '#/m/040-nemovitost/t/prehled' },
    { label: 'Detail' }
  ];

  // Render using universal form wrapper in read-only mode
  await renderUniversalForm({
    root,
    schema,
    initialData: initial,
    breadcrumbs,
    onSave: null, // Read-only mode, no save
    options: {
      entity: 'property',
      entityId: entityId,
      showAttachments: true,
      showHistory: true,
      showArchive: false,
      readOnly: true,
      onCancel: () => {
        navigateToModuleOverview('040-nemovitost');
      }
    }
  });
}
