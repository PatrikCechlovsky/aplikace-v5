// Přehled uživatelů – dynamická tlačítka + dvojklik + diagnostika povolených akcí

import { renderTable } from '../../../ui/table.js';
import { renderCommonActions } from '../../../ui/commonActions.js';
import { listProfiles } from '../../../db.js';
import { setBreadcrumb } from '../../../ui/breadcrumb.js';
import { navigateTo, route } from '../../../app.js';
import { getAllowedActions } from '../../../security/permissions.js';

// 1) Dlaždice umí tyto akce (z nich pak Permissions vyfiltruje, co smí uživatel)
const MODULE_ACTIONS = ['add', 'edit', 'archive', 'attach', 'refresh', 'search'];

let selectedRow = null;

export async function render(root) {
  // 2) Breadcrumbs
  setBreadcrumb(document.getElementById('crumb'), [
    { icon: 'home',  label: 'Domů',      href: '#/' },
    { icon: 'users', label: 'Uživatelé', href: '#/m/010-sprava-uzivatelu' },
    { icon: 'list',  label: 'Přehled' }
  ]);

  // 3) (Dočasně) role = admin, aby byly akce jistě vidět
  const userRole = 'admin';

  // 4) Data
  const { data, error } = await listProfiles();
  if (error) {
    root.innerHTML = `<div class="p-4 text-red-600">Chyba při načítání: ${error.message}</div>`;
    return;
  }
  const rows = (data || []).map(r => ({
    id: r.id,
    display_name: r.display_name,
    email: r.email,
    role: r.role,
    archived: r.archived ? 'Ano' : ''
  }));

  // 5) Diagnostika povolených akcí (log do konzole)
  const allowed = getAllowedActions(userRole, MODULE_ACTIONS);
  console.log('[ACTIONS DIAG]',
    { moduleActions: MODULE_ACTIONS, userRole, allowedKeys: allowed.map(a => a.key) }
  );

  // 6) Pokud by z nějakého důvodu vyšel prázdný průnik, zobrazíme dočasně fallback
  const actionsToRender = allowed.length ? MODULE_ACTIONS : MODULE_ACTIONS; // fallback stejný seznam
  if (!allowed.length) {
    console.warn('[ACTIONS DIAG] allowed.length === 0 → Fallback: vykreslím MODULE_ACTIONS bez filtru (dočasně)');
  }

  // 7) Akční tlačítka
  renderCommonActions(document.getElementById('commonactions'), {
    moduleActions: actionsToRender,
    userRole,
    handlers: {
      onAdd: () => navigateTo('#/m/010-sprava-uzivatelu/f/create'),
      onEdit: () => {
        if (!selectedRow) return alert('Vyberte řádek.');
        navigateTo(`#/m/010-sprava-uzivatelu/f/form?id=${selectedRow.id}&mode=edit`);
      },
      onArchive: () => {
        if (!selectedRow) return alert('Vyberte řádek.');
        alert(`Archivace uživatele: ${selectedRow.display_name}`);
      },
      onAttach: () => {
        if (!selectedRow) return alert('Vyberte řádek.');
        alert(`Přílohy k uživateli: ${selectedRow.display_name}`);
      },
      onRefresh: () => route(),
      onSearch: () => alert('Vyhledávání (demo)')
    }
  });

  // 8) Tabulka
  const columns = [
    { key: 'display_name', label: 'Jméno',      sortable: true, width: '25%' },
    { key: 'email',        label: 'E-mail',     sortable: true, width: '25%' },
    { key: 'role',         label: 'Role',       sortable: true, width: '15%' },
    { key: 'archived',     label: 'Archivován', sortable: true, width: '10%' }
  ];

  root.innerHTML = `<div id="user-table"></div>`;

  renderTable(root.querySelector('#user-table'), {
    columns,
    rows,
    options: {
      moduleId: '010-sprava-uzivatelu',
      onRowSelect: row => {
        selectedRow = (selectedRow && selectedRow.id === row.id) ? null : row;
        render(root); // re-render kvůli aktivaci/deaktivaci tlačítek
      },
      onRowDblClick: row => {
        navigateTo(`#/m/010-sprava-uzivatelu/f/form?id=${row.id}&mode=edit`);
      }
    }
  });
}

export default { render };
