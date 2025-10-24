import { setBreadcrumb } from '/src/ui/breadcrumb.js';
import { renderForm } from '/src/ui/form.js';
import { renderCommonActions } from '/src/ui/commonActions.js';
import { navigateTo } from '/src/app.js';
import { getProperty, archiveProperty } from '/src/modules/040-nemovitost/db.js';
import { showAttachmentsModal } from '/src/ui/attachments.js';
import { FIELDS } from '/src/modules/040-nemovitost/forms/fields.js';

// ... (ostatní pomocné funkce)

export async function render(root, params) {
  const { id } = params || getHashParams();
  if (!id) { root.innerHTML = `<div class="p-4 text-red-600">Chybí ID nemovitosti.</div>`; return; }

  const { data, error } = await getProperty(id);
  if (error) { root.innerHTML = `<div class="p-4 text-red-600">Chyba: ${error.message}</div>`; return; }

  // (připravit data stejně jako dříve) ...

  const moduleActions = ['edit', 'units', 'attach', 'archive', 'refresh', 'history'];
  const handlers = {};
  handlers.onEdit = () => navigateTo(`#/m/040-nemovitost/f/edit?id=${id}`);
  handlers.onUnits = () => navigateTo(`#/m/040-nemovitost/t/jednotky?propertyId=${id}`);
  handlers.onAttach = () => showAttachmentsModal({ entity: 'properties', entityId: id });
  handlers.onRefresh = () => render(root, params);
  handlers.onHistory = () => alert('Historie - implementovat');
  if (!data.archived) {
    handlers.onArchive = async () => { await archiveProperty(id); alert('Archivováno'); navigateTo('#/m/040-nemovitost/t/prehled'); };
  }

  renderCommonActions(document.getElementById('commonactions'), {
    moduleActions,
    userRole: window.currentUserRole || 'admin',
    handlers
  });

  // renderForm(... readOnly true ...) zůstává stejné
}
export default { render };
