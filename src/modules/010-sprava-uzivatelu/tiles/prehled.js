// Přehled uživatelů – dynamická tlačítka + dvojklik s ohledem na oprávnění

import { renderTable } from '../../../ui/table.js';
import { renderCommonActions } from '../../../ui/commonActions.js';
import { listProfiles } from '../../../db.js';
import { setBreadcrumb } from '../../../ui/breadcrumb.js';
import { navigateTo, route } from '../../../app.js';
import { getAllowedActions, canPerform } from '../../../security/permissions.js';

// Dlaždice umí tyto akce (vyfiltrují se podle role uživatele)
const MODULE_ACTIONS = ['detail', 'add', 'edit', 'archive', 'attach', 'refresh', 'search'];

let selectedRow = null;

export async function render(root) {
  // Breadcrumbs
  setBreadcrumb(document.getElementById('crumb'), [
    { icon: 'home',  label: 'Domů',      href: '#/' },
    { icon: 'users', label: 'Uživatelé', href: '#/m/010-sprava-uzivatelu' },
    { icon: 'list',  label: 'Přehled' }
  ]);

  // Dočasně role = admin (později napojíme na profil v DB)
  const userRole = 'admin';

  // Data
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

  // Akční tlačítka
  renderCommonActions(document.getElementById('commonactions'), {
    moduleActions: MODULE_ACTIONS,
    userRole,
    handlers: {
      onDetail: () => {
        if (!selectedRow) return alert('Vyberte řádek.');
        navigateTo(`#/m/010-sprava-uzivatelu/f/form?id=${selectedRow.id}&mode=read`);
      },
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

  // Tabulka
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
        // Pokud ROLE smí editovat → otevřít edit; jinak jen detail (read-only)
        const canEdit = canPerform(userRole, 'edit');
        const mode = canEdit ? 'edit' : 'read';
        navigateTo(`#/m/010-sprava-uzivatelu/f/form?id=${row.id}&mode=${mode}`);
      }
    }
  });
}

export default { render };
