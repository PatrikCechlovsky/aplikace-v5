import { renderTable } from '../../../ui/table.js';
import { icon } from '../../../ui/icons.js';
import { renderCommonActions } from '../../../ui/commonActions.js';
import { setBreadcrumb } from '../../../ui/breadcrumb.js';
import { listProfiles } from '../../../db.js';
import { ROLE_CONFIG, getRoleConfig } from '../../../ui/roles.js';

// Funkce pro barevný badge podle role
function roleBadge(role) {
  const cfg = getRoleConfig(role);
  return `<span class="inline-block text-xs px-2 py-0.5 rounded border font-semibold"
    style="background:${cfg.bg};color:${cfg.fg};border-color:${cfg.border}">
    ${cfg.label}
  </span>`;
}

export async function render(root) {
  setBreadcrumb(document.getElementById('crumb'), [
    { icon: 'home', label: 'Domů', href: '#/' },
    { icon: 'users', label: 'Uživatelé', href: '#/m/010-sprava-uzivatelu' },
    { icon: 'list', label: 'Přehled' },
  ]);
  renderCommonActions(document.getElementById('crumb-actions'), {
    onAdd: () => navigateTo('#/m/010-uzivatele/f/create'),
    onRefresh: () => route(),
  });

  const { data, error } = await listProfiles();
  if (error) {
    root.innerHTML = `<div class="p-4 text-red-600">Chyba: ${error.message}</div>`;
    return;
  }
  const rows = data || [];

  renderTable(root, {
    columns: [
      { key: 'display_name', label: 'Jméno', sortable: true, width: '20%' },
      { key: 'email', label: 'E‑mail', sortable: true, width: '25%' },
      { key: 'role', label: 'Role', sortable: true, width: '15%', render: row => roleBadge(row.role) },
      { key: 'archived', label: 'Archivován', sortable: true, width: '10%', render: row => row.archived ? 'Ano' : '' },
    ],
    rows,
    rowActions: [
      { label: 'Detail', icon: icon('detail'), onClick: row => navigateTo(`#/m/010-uzivatele/f/read?id=${row.id}`) },
      { label: 'Editace', icon: icon('edit'), onClick: row => navigateTo(`#/m/010-uzivatele/f/edit?id=${row.id}`) },
      { label: 'Archivace', icon: icon('archive'), onClick: row => navigateTo(`#/m/010-uzivatele/f/read?id=${row.id}`) },
      { label: 'Příloha', icon: icon('paperclip'), onClick: row => navigateTo(`#/m/010-uzivatele/f/read?id=${row.id}`) },
    ],
    options: {
      filterPlaceholder: 'Hledat uživatele…',
      onRowDblClick: row => navigateTo(`#/m/010-uzivatele/f/read?id=${row.id}`),
    },
  });
}

export default { render };
