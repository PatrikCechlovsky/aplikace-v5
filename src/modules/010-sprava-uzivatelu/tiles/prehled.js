// Přehled uživatelů — univerzální tabulka + dynamické CommonActions podle výběru řádku
import { renderTable } from '../../../ui/table.js';
import { renderCommonActions } from '../../../ui/commonActions.js';
import { listProfiles, listRoles, archiveProfile } from '../../../db.js';
import { setBreadcrumb } from '../../../ui/breadcrumb.js';
import { navigateTo, route } from '../../../app.js';
import { getUserPermissions } from '../../../security/permissions.js';

let selectedRow = null;
let showArchived = false;
let filterValue = '';

export async function render(root) {
  setBreadcrumb(document.getElementById('crumb'), [
    { icon: 'home',  label: 'Domů',      href: '#/' },
    { icon: 'users', label: 'Uživatelé', href: '#/m/010-sprava-uzivatelu' },
    { icon: 'list',  label: 'Přehled' }
  ]);

  root.innerHTML = `<div id="user-table"></div>`;

  // Načtení uživatelů podle filtru
  const { data: users, error } = await listProfiles();
  if (error) {
    root.querySelector('#user-table').innerHTML = `<div class="p-4 text-red-600">Chyba při načítání: ${error.message}</div>`;
    return;
  }

  // Načti role z DB (včetně barvy)
  const { data: roles = [] } = await listRoles();
  const roleMap = Object.fromEntries(roles.map(r => [r.slug, r]));

  // Filtrovaná data podle archivace
  const rows = (users || [])
    .filter(r => showArchived ? true : !r.archived)
    .map(r => ({
      id: r.id,
      display_name: r.display_name,
      email: r.email,
      role: r.role,
      archived: r.archived ? 'Ano' : ''
    }));

  // Sloupce tabulky včetně barevné role
  const columns = [
    {
      key: 'role',
      label: 'Role',
      width: '15%',
      sortable: true,
      render: (row) => {
        const role = roleMap[row.role];
        if (!role) return `<span>${row.role}</span>`;
        return `<span style="
          background:${role.color};
          color:#222;
          padding:2px 12px;
          border-radius:14px;
          font-size:0.97em;
          font-weight:600;
          display:inline-block;
          min-width:60px;
          text-align:center;
          box-shadow:0 1px 3px 0 #0001;
          letter-spacing:0.01em;
        ">${role.label}</span>`;
      }
    },
    { key: 'display_name', label: 'Jméno', sortable: true, width: '25%' },
    { key: 'email',        label: 'E-mail', sortable: true, width: '25%' },
    { key: 'archived',     label: 'Archivován', sortable: true, width: '10%' }
  ];

  // Helper pro akční tlačítka – Archivovat je VŽDY vidět, ale disabled pokud není vybráno nebo chybí právo
  function drawActions() {
    const ca = document.getElementById('commonactions');
    if (!ca) return;
    const hasSel = !!selectedRow;
    // ZDE ZÍSKEJ AKTUÁLNÍ ROLI UŽIVATELE (dle tvého session řešení)
    const userRole = window.currentUserRole || 'user'; // nebo jinak z session/auth
    const canArchive = getUserPermissions(userRole).includes('archive');

    // Handler je funkce jen pokud je vybráno a má oprávnění, jinak undefined → tlačítko bude disabled
    renderCommonActions(ca, {
      moduleActions: ['add', 'edit', 'archive', 'refresh'],
      handlers: {
        onAdd:    () => navigateTo('#/m/010-sprava-uzivatelu/f/create'),
        onEdit:   hasSel ? () => navigateTo(`#/m/010-sprava-uzivatelu/f/form?id=${selectedRow.id}&mode=edit`) : undefined,
        onArchive: canArchive && hasSel ? () => handleArchive(selectedRow) : undefined,
        onRefresh: () => route()
      }
    });
  }

  // Archivace s kontrolou vazeb (doplníš podle své business logiky)
  async function handleArchive(row) {
    if (!row) return;
    const hasVazby = await hasActiveVazby(row.id);
    if (hasVazby) {
      alert('Nelze archivovat, existují aktivní vazby!');
      return;
    }
    await archiveProfile(row.id);
    selectedRow = null;
    await render(root);
  }

  // Stub na kontrolu vazeb - nahradíš dle potřeby
  async function hasActiveVazby(userId) {
    // TODO: dotaz na DB nebo API
    return false;
  }

  // Inicializuj lištu akcí při každém vykreslení stránky:
  drawActions();

  // --- Vlastní renderTable s custom headerem ---
  renderTable(root.querySelector('#user-table'), {
    columns,
    rows,
    options: {
      moduleId: '010-sprava-uzivatelu',
      filterValue: filterValue,
      customHeader: ({ filterInputHtml }) => `
        <div class="flex items-center gap-4">
          ${filterInputHtml}
          <label class="flex items-center gap-1 text-sm cursor-pointer ml-2">
            <input type="checkbox" id="toggle-archived" ${showArchived ? 'checked' : ''}/>
            Zobrazit archivované
          </label>
        </div>
      `,
      onRowSelect: row => {
        selectedRow = (selectedRow && selectedRow.id === row.id) ? null : row;
        drawActions(); // překresli lištu akcí po výběru řádku!
      },
      onRowDblClick: row => {
        selectedRow = row;
        navigateTo(`#/m/010-sprava-uzivatelu/f/form?id=${row.id}&mode=edit`);
      }
    }
  });

  // Přepínač zobrazit archivované
  root.querySelector('#user-table').addEventListener('change', (e) => {
    if (e.target && e.target.id === 'toggle-archived') {
      showArchived = e.target.checked;
      render(root);
    }
  });
}

export default { render };
