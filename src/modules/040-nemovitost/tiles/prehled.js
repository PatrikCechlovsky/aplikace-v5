import { renderTable } from '/src/ui/table.js';
import { renderCommonActions } from '/src/ui/commonActions.js';
import { setBreadcrumb } from '/src/ui/breadcrumb.js';
import { navigateTo } from '/src/app.js';
import { getUserPermissions } from '/src/security/permissions.js';

let selectedRow = null;
let filterValue = '';

export async function render(root) {
  try {
    setBreadcrumb(document.getElementById('crumb'), [
      { icon: 'home', label: 'Domů', href: '#/' },
      { icon: 'building', label: 'Nemovitosti', href: '#/m/040-nemovitost' },
      { icon: 'list', label: 'Přehled' }
    ]);
  } catch (e) {}

  root.innerHTML = `
    <div id="commonactions" class="mb-4"></div>
    <div class="p-4 bg-white rounded-2xl shadow">
      <h2 class="text-xl font-semibold mb-4">Přehled nemovitostí</h2>
      <p class="text-slate-600 mb-4">Zde budou zobrazeny všechny nemovitosti.</p>
      <p class="text-sm text-slate-500">Modul nemovitostí je připraven k implementaci. Prozatím nejsou dostupné žádné data.</p>
    </div>
  `;

  // Common actions
  const ca = document.getElementById('commonactions');
  if (ca) {
    const userRole = window.currentUserRole || 'admin';
    renderCommonActions(ca, {
      moduleActions: ['add', 'refresh'],
      userRole,
      handlers: {
        onAdd: () => navigateTo('#/m/040-nemovitost/f/edit'),
        onRefresh: () => render(root)
      }
    });
  }
}

export default { render };
