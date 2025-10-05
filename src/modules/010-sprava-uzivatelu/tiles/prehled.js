// src/app/modules/010-sprava-uzivatelu/tiles/prehled.js
// Přehled uživatelů – dynamická tlačítka podle role + dvojklik → formulář

import { renderTable } from '../../../ui/table.js';
import { renderCommonActions } from '../../../ui/commonActions.js';
import { listProfiles } from '../../../db.js';
import { setBreadcrumb } from '../../../ui/breadcrumb.js';
import { navigateTo, route } from '../../../app.js';

// Dlaždice umí tyto akce (z nich se následně vyfiltrují jen ty,
// na které má aktuální uživatel oprávnění).
const MODULE_ACTIONS = ['add', 'edit', 'archive', 'attach', 'refresh', 'search'];

let selectedRow = null;

export async function render(root) {
  // 1) Breadcrumbs
  setBreadcrumb(document.getElementById('crumb'), [
    { icon: 'home',  label: 'Domů',      href: '#/' },
    { icon: 'users', label: 'Uživatelé', href: '#/m/010-sprava-uzivatelu' },
    { icon: 'list',  label: 'Přehled' }
  ]);

  // 2) (Dočasně) role uživatele
  //   Až napojíme profily, nahradíme za např.:
  //   const { data: profile } = await getMyProfile();
  //   const userRole = profile?.role || 'najemnik';
  const userRole = 'admin';

  // 3) Data
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

  // 4) Akční tlačítka – dynamicky podle role
  renderCommonActions(document.getElementById('commonactions'), {
    moduleActions: MODULE_ACTIONS,
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

  // 5) Tabulka
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
        // toggle výběru řádku
        selectedRow = (selectedRow && selectedRow.id === row.id) ? null : row;
        render(root);
      },
      onRowDblClick: row => {
        navigateTo(`#/m/010-sprava-uzivatelu/f/form?id=${row.id}&mode=edit`);
      }
    }
  });
}

export default { render };
