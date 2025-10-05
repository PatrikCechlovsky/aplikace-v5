// src/app/modules/010-sprava-uzivatelu/tiles/prehled.js
// Přehled uživatelů – verze s dynamickými tlačítky a oprávněními

import { renderTable } from '../../../ui/table.js';
import { renderCommonActions } from '../../../ui/commonActions.js';
import { getSessionUser, listProfiles } from '../../../db.js';
import { setBreadcrumb } from '../../../ui/breadcrumb.js';
import { navigateTo, route } from '../../../app.js';

/**
 * Modulový seznam dostupných akcí
 * Tyto akce modul umí, ale zobrazí se jen ty,
 * které uživatel má ve svých oprávněních.
 */
const MODULE_ACTIONS = ['add', 'edit', 'archive', 'attach', 'refresh', 'search'];

let selectedRow = null;

export async function render(root) {
  // Nastavení breadcrumb
  setBreadcrumb(document.getElementById('crumb'), [
    { icon: 'home',  label: 'Domů',      href: '#/' },
    { icon: 'users', label: 'Uživatelé', href: '#/m/010-sprava-uzivatelu' },
    { icon: 'list',  label: 'Přehled' }
  ]);

  // Načtení uživatele (kvůli roli)
  const { user } = await getSessionUser();
  const userRole = user?.role || 'najemnik'; // fallback na nájemníka

  // Načtení dat
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

  // Vykreslení akčních tlačítek (dle role)
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
        alert(`Archivace uživatele ${selectedRow.display_name}`);
      },
      onAttach: () => {
        if (!selectedRow) return alert('Vyberte řádek.');
        alert(`Přílohy k uživateli ${selectedRow.display_name}`);
      },
      onRefresh: () => route(),
      onSearch: () => alert('Zatím demo – vyhledávání')
    }
  });

  // Sloupce tabulky
  const columns = [
    { key: 'display_name', label: 'Jméno', sortable: true, width: '25%' },
    { key: 'email',        label: 'E-mail', sortable: true, width: '25%' },
    { key: 'role',         label: 'Role', sortable: true, width: '15%' },
    { key: 'archived',     label: 'Archivován', sortable: true, width: '10%' }
  ];

  // Tabulka
  root.innerHTML = `<div id="user-table"></div>`;
  renderTable(root.querySelector('#user-table'), {
    columns,
    rows,
    options: {
      moduleId: '010-sprava-uzivatelu',
      onRowSelect: row => {
        selectedRow = (selectedRow && selectedRow.id === row.id) ? null : row;
        render(root);
      },
      onRowDblClick: row => {
        navigateTo(`#/m/010-sprava-uzivatelu/f/form?id=${row.id}&mode=edit`);
      }
    }
  });
}
