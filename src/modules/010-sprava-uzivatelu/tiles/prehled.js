// src/modules/010-sprava-uzivatelu/tiles/prehled.js
// Přehled uživatelů — univerzální tabulka + dynamické CommonActions podle výběru řádku

import { renderTable } from '../../../ui/table.js';
import { renderCommonActions } from '../../../ui/commonActions.js';
import { listProfiles } from '../../../db.js';
import { setBreadcrumb } from '../../../ui/breadcrumb.js';
import { navigateTo, route } from '../../../app.js';

// aktuálně vybraný řádek (kvůli Edit/Archiv/Přílohy)
let selectedRow = null;

export async function render(root) {
  // Breadcrumbs
  setBreadcrumb(document.getElementById('crumb'), [
    { icon: 'home',  label: 'Domů',      href: '#/' },
    { icon: 'users', label: 'Uživatelé', href: '#/m/010-sprava-uzivatelu' },
    { icon: 'list',  label: 'Přehled' }
  ]);

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

  // Sloupce tabulky
  const columns = [
    { key: 'display_name', label: 'Jméno',      sortable: true, width: '25%' },
    { key: 'email',        label: 'E-mail',     sortable: true, width: '25%' },
    { key: 'role',         label: 'Role',       sortable: true, width: '15%' },
    { key: 'archived',     label: 'Archivován', sortable: true, width: '10%' }
  ];

  // Helper pro akční tlačítka – dynamicky podle toho, zda je něco vybráno
  function drawActions() {
    const ca = document.getElementById('commonactions');
    if (!ca) return;

    const hasSel = !!selectedRow;
    renderCommonActions(ca, {
      onAdd:       () => navigateTo('#/m/010-sprava-uzivatelu/f/create'),
      ...(hasSel && {
        onEdit:    () => navigateTo(`#/m/010-sprava-uzivatelu/f/form?id=${selectedRow.id}&mode=edit`),
        onArchive: () => alert(`Archivace uživatele: ${selectedRow.display_name}`),
        onAttach:  () => alert(`Přílohy k uživateli: ${selectedRow.display_name}`),
      }),
      onRefresh:   () => route()
    });
  }

  // Init actions (bez výběru)
  drawActions();

  // Tabulka
  root.innerHTML = `<div id="user-table"></div>`;
  renderTable(root.querySelector('#user-table'), {
    columns,
    rows,
    options: {
      moduleId: '010-sprava-uzivatelu',
      // klik = vybere/odznačí a překreslí akce
      onRowSelect: row => {
        selectedRow = (selectedRow && selectedRow.id === row.id) ? null : row;
        drawActions();
      },
      // dvojklik = otevři edit formulář
      onRowDblClick: row => {
        selectedRow = row;
        navigateTo(`#/m/010-sprava-uzivatelu/f/form?id=${row.id}&mode=edit`);
      }
    }
  });
}

export default { render };
