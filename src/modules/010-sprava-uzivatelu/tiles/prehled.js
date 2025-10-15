import { renderTable } from '../../../ui/table.js';
import { renderCommonActions } from '../../../ui/commonActions.js';
import { listProfiles, listRoles, archiveProfile } from '../../../db.js';
import { setBreadcrumb } from '../../../ui/breadcrumb.js';
import { navigateTo, route } from '../../../app.js';
import { getUserPermissions } from '../../../security/permissions.js';
import { showAttachmentsModal } from '../../../ui/attachments.js';

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

  // Připrav data pro tabulku (předávej bool archived i string zobrazení)
  const rows = (users || [])
    .filter(r => showArchived ? true : !r.archived)
    .map(r => ({
      id: r.id,
      display_name: r.display_name,
      email: r.email,
      role: r.role,
      archived: r.archived,
      archivedLabel: r.archived ? 'Ano' : ''
    }));

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
    { key: 'archivedLabel', label: 'Archivován', sortable: true, width: '10%' }
  ];

  function drawActions() {
    const ca = document.getElementById('commonactions');
    if (!ca) return;
    const hasSel = !!selectedRow && !selectedRow.archived;
    const userRole = window.currentUserRole || 'admin';
    const canArchive = getUserPermissions(userRole).includes('archive');
    renderCommonActions(ca, {
      moduleActions: ['add', 'edit', 'archive', 'attach', 'refresh'],
      handlers: {
        onAdd:    () => navigateTo('#/m/010-sprava-uzivatelu/f/create'),
        onEdit:   !!selectedRow ? () => navigateTo(`#/m/010-sprava-uzivatelu/f/form?id=${selectedRow.id}&mode=edit`) : undefined,
        onArchive: canArchive && hasSel ? () => handleArchive(selectedRow) : undefined,
        onAttach: !!selectedRow ? () => showAttachmentsModal({ entity: 'users', entityId: selectedRow.id }) : undefined,
        onRefresh: () => route()
      }
    });
  }

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

  async function hasActiveVazby(userId) {
    // TODO: dotaz na DB nebo API
    return false;
  }

  drawActions();

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
        drawActions();
      },
      onRowDblClick: row => {
        selectedRow = row;
        navigateTo(`#/m/010-sprava-uzivatelu/f/form?id=${row.id}&mode=edit`);
      }
    }
  });

  root.querySelector('#user-table').addEventListener('change', (e) => {
    if (e.target && e.target.id === 'toggle-archived') {
      showArchived = e.target.checked;
      render(root);
    }
  });
}

export default { render };
