// Sdílený univerzální formulář (pronajímatel). Použijeme ho i pro nájemník (proxy export)
import { getSubject, upsertSubject } from '/src/db/subjects.js';
import { getSubjectTypeSchema } from '/src/db/type-schemas.js';
import { toast } from '/src/ui/commonActions.js';
import { renderUniversalForm, navigateToModuleOverview, getModuleIdFromHash } from '/src/ui/universal-form.js';

export async function render(root, params = {}) {
  root.innerHTML = '';
  const type = params?.type || 'osoba';
  const schema = getSubjectTypeSchema(type);

  // načíst existující data pokud editujeme
  let initial = {};
  let entityId = null;
  
  if (params?.id) {
    const { data, error } = await getSubject(params.id);
    if (error) {
      root.innerHTML = `<div class="error">Chyba při načtení: ${error.message || error}</div>`;
      return;
    }
    initial = data || {};
    entityId = params.id;
  } else {
    // Auto-detect role based on module
    const inferredRole = params?.role || (getModuleIdFromHash()?.startsWith('050') ? 'najemnik' : 'pronajimatel');
    initial = { typ_subjektu: type, role: inferredRole };
  }

  // Breadcrumbs
  const breadcrumbs = [
    { icon: 'home', label: 'Domů', href: '#/' },
    { icon: 'users', label: 'Nájemník', href: '#/m/050-najemnik/t/prehled' },
    { label: entityId ? 'Úprava' : 'Nový záznam' }
  ];

  // Render using universal form wrapper
  await renderUniversalForm({
    root,
    schema,
    initialData: initial,
    breadcrumbs,
    onSave: async (values) => {
      const inferredRole = params?.role || (getModuleIdFromHash()?.startsWith('050') ? 'najemnik' : 'pronajimatel');
      const payload = {
        ...values,
        typ_subjektu: type,
        role: inferredRole,
        display_name: (values.display_name && values.display_name.trim()) ||
                      ((values.jmeno || values.prijmeni) ? `${values.jmeno || ''} ${values.prijmeni || ''}`.trim() : values.primary_email || '')
      };

      if (entityId) {
        payload.id = entityId;
      }

      const { data, error } = await upsertSubject(payload);
      if (error) {
        toast('Chyba při ukládání: ' + (error.message || JSON.stringify(error)), 'error');
        return { success: false, error };
      }
      
      toast('Uloženo', 'success');
      const moduleId = params?.module || getModuleIdFromHash();
      navigateToModuleOverview(moduleId);
      return { success: true, data };
    },
    options: {
      entity: 'subject',
      entityId: entityId,
      showAttachments: !!entityId, // Only show for existing records
      showHistory: !!entityId,     // Only show for existing records
      showArchive: false,          // Can enable if archive functionality is needed
      onCancel: () => {
        const moduleId = params?.module || getModuleIdFromHash();
        navigateToModuleOverview(moduleId);
      }
    }
  });
}

