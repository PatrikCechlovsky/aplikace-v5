import { renderTable } from '../../../ui/table.js';
import { icon } from '../../../ui/icons.js';
import { renderCommonActions } from '../../../ui/commonActions.js';
import { setBreadcrumb } from '../../../ui/breadcrumb.js';
import { listProfiles } from '../../../db.js';
import { ROLE_CONFIG, getRoleConfig } from '../../../ui/roles.js';
import { navigateTo, route } from '../../../app.js';

function roleBadge(role) {
  const cfg = getRoleConfig(role);
  return `<span class="inline-block text-xs px-2 py-0.5 rounded border font-semibold"
    style="background:${cfg.bg};color:${cfg.fg};border-color:${cfg.border}">
    ${cfg.label}
  </span>`;
}

let selectedRow = null;
let showFilter = false;
let filterValue = "";

function getCurrentUser() {
  return {
    role: "admin",
    permissions: ["can_edit_user", "can_archive_user"],
  };
}

export async function render(root) {
  setBreadcrumb(document.getElementById('crumb'), [
    { icon: 'home', label: 'Domů', href: '#/' },
    { icon: 'users', label: 'Uživatelé', href: '#/m/010-sprava-uzivatelu' },
    { icon: 'list', label: 'Přehled' },
  ]);

  const { data, error } = await listProfiles();
  if (error) {
    root.innerHTML = `<div class="p-4 text-red-600">Chyba: ${error.message}</div>`;
    return;
  }
  let rows = data || [];

  if (filterValue) {
    const f = filterValue.toLowerCase();
    rows = rows.filter(r =>
      ["display_name", "email", "phone", "mesto", "role"]
        .some(k => String(r[k] ?? "").toLowerCase().includes(f))
    );
  }

  // Zkontroluj, že každý řádek má id!
  rows = rows.map(r => ({ ...r, id: r.id ?? r.user_id ?? r.ID }));

  const user = getCurrentUser();
  const canAdd = user.role === 'admin' || user.permissions.includes("can_add_user");
  const canEdit = user.role === 'admin' || user.permissions.includes("can_edit_user");
  const canArchive = user.role === 'admin' || user.permissions.includes("can_archive_user");

  renderCommonActions(document.getElementById('crumb-actions'), {
    onAdd: canAdd
      ? () => navigateTo('#/m/010-sprava-uzivatelu/f/create')
      : () => alert("Nemáte oprávnění přidávat uživatele."),
    onEdit: () => {
      if (!selectedRow) return alert("Nejprve vyberte řádek.");
      if (!canEdit) return alert("Nemáte oprávnění upravovat.");
      navigateTo(`#/m/010-sprava-uzivatelu/f/form?id=${selectedRow.id}&mode=edit`);
    },
    onArchive: () => {
      if (!selectedRow) return alert("Nejprve vyberte řádek.");
      if (!canArchive) return alert("Nemáte oprávnění archivovat.");
      alert("Archivace uživatele není zatím implementována.");
    },
    onAttach: () => {
      if (!selectedRow) return alert("Nejprve vyberte řádek.");
      alert(`Přidat přílohu k uživateli: ${selectedRow.display_name}`);
    },
    onRefresh: () => route(),
    onSearch: () => { showFilter = !showFilter; render(root); }
  });

  const columns = [
    { key: 'display_name', label: 'Jméno', sortable: true, width: '18%' },
    { key: 'email', label: 'E‑mail', sortable: true, width: '20%' },
    { key: 'phone', label: 'Telefon', sortable: true, width: '15%' },
    { key: 'mesto', label: 'Město', sortable: true, width: '15%' },
    { key: 'role', label: 'Role', sortable: true, width: '15%', render: row => roleBadge(row.role) },
    { key: 'archived', label: 'Archivován', sortable: true, width: '10%', render: row => row.archived ? 'Ano' : '' },
  ];

  let filterHtml = "";
  if (showFilter) {
    filterHtml = `
      <div class="flex items-center gap-2 mb-2">
        <input
          class="border rounded px-2 py-1 text-sm w-full sm:w-80"
          placeholder="Hledat uživatele…"
          value="${filterValue}"
          id="user-filter-input"
        />
        <button class="border rounded px-2 py-1 bg-white" id="user-filter-close" title="Zavřít hledání">${icon('close')}</button>
      </div>
    `;
  }

  root.innerHTML = `
    ${filterHtml}
    <div id="user-table"></div>
  `;

  renderTable(root.querySelector('#user-table'), {
    columns,
    rows,
    options: {
      onRowDblClick: row => {
        console.log("DVOJKLIK", row);
        navigateTo(`#/m/010-sprava-uzivatelu/f/form?id=${row.id}&mode=edit`);
      },
      onRowSelect: row => {
        selectedRow = (selectedRow && selectedRow.id === row.id) ? null : row;
        render(root);
      },
      selectedRow,
    },
  });

  if (showFilter) {
    const inp = root.querySelector('#user-filter-input');
    const close = root.querySelector('#user-filter-close');
    if (inp) {
      inp.focus();
      inp.selectionStart = inp.value.length;
      inp.addEventListener('input', e => {
        filterValue = e.target.value;
        render(root);
      });
    }
    if (close) {
      close.addEventListener('click', () => {
        showFilter = false;
        filterValue = "";
        render(root);
      });
    }
  }
}

export default { render };
