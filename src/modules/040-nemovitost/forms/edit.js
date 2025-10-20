// src/modules/040-nemovitost/forms/edit.js
// Formulář pro úpravu nemovitosti - placeholder implementation
// TODO: Implement properties table in database and update this form accordingly

import { getPropertySchema } from '/src/db/type-schemas.js';
import { toast } from '/src/ui/commonActions.js';
import { renderUniversalForm, navigateToModuleOverview } from '/src/ui/universal-form.js';

export async function render(root, params = {}) {
  root.innerHTML = '';
  const schema = getPropertySchema();
  
  // TODO: Load property data from database when properties table exists
  // For now, use placeholder data
  let initial = {};
  let entityId = params?.id || null;
  
  if (entityId) {
    // TODO: Fetch property from database
    // const { data, error } = await getProperty(entityId);
    // if (error) { ... }
    // initial = data || {};
    initial = { title: 'Placeholder Property' };
  }

  // Breadcrumbs
  const breadcrumbs = [
    { icon: 'home', label: 'Domů', href: '#/' },
    { icon: 'building', label: 'Nemovitosti', href: '#/m/040-nemovitost/t/prehled' },
    { label: entityId ? 'Úprava' : 'Nová nemovitost' }
  ];

  // Render using universal form wrapper
  await renderUniversalForm({
    root,
    schema,
    initialData: initial,
    breadcrumbs,
    onSave: async (values) => {
      // TODO: Save property to database when properties table exists
      // const { data, error } = await upsertProperty(values);
      // if (error) { ... }
      
      console.log('Property save placeholder:', values);
      toast('Nemovitost uložena (placeholder)', 'success');
      navigateToModuleOverview('040-nemovitost');
      return { success: true };
    },
    options: {
      entity: 'property',
      entityId: entityId,
      showAttachments: !!entityId,
      showHistory: !!entityId,
      showArchive: false,
      onCancel: () => {
        navigateToModuleOverview('040-nemovitost');
      }
    }
  });
}
