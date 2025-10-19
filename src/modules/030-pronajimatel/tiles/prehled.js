import { renderTable } from '/src/ui/table.js';
import { renderCommonActions } from '/src/ui/commonActions.js';
import { listSubjects } from '/src/db/subjects.js';
import { setBreadcrumb } from '/src/ui/breadcrumb.js';
import { navigateTo } from '/src/app.js';
import { getUserPermissions } from '/src/security/permissions.js';
import { showAttachmentsModal } from '/src/ui/attachments.js';

let selectedRow = null;
let filterValue = '';

function escapeHtml(s='') {
  return (''+s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

export async function render(root) {
  // breadcrumb
  try {
    setBreadcrumb(document.getElementById('crumb'), [
      { icon: 'home',  label: 'Domů', href: '#/' },
      { icon: 'users', label: 'Pronajímatel', href: '#/m/030-pronajimatel' },
      { icon: 'list',  label: 'Přehled' }
    ]);
  } catch (e) {}

  root.innerHTML = `<div id="commonactions" class="mb-4"></div><div id="subject-table"></div>`;

  const { data, error } = await listSubjects({ limit: 500 });
  if (error) {
    root.querySelector('#subject-table').innerHTML = `<div class="p-4 text-red-600">Chyba při načítání: ${error.message || JSON.stringify(error)}</div>`;
    return;
  }
  const rows = data || [];

  const columns = [
    { key: 'id', label: 'ID', sortable: true },
    {
      key: 'display_name',
      label: 'Název / Jméno',
      sortable: true,
      render: (r) => {
        const name = escapeHtml(r.display_name || '—');
        return `<a href="#/m/030-pronajimatel/f/form?type=${encodeURIComponent(r.typ_subjektu||'osoba')}&id=${encodeURIComponent(r.id)}">${name}</a>`;
      }
    },
    { key: 'typ_subjektu', label: 'Typ' },
    { key: 'ico', label: 'IČO' },
    { key: 'primary_phone', label: 'Telefon' },
    { key: 'primary_email', label: 'Email' },
    { key: 'city', label: 'Město' }
  ];

  function drawActions() {
    const ca = document.getElementById('commonactions');
    if (!ca) return;
    const hasSel = !!selectedRow;
    const userRole = window.currentUserRole || 'admin';
    const perms = getUserPermissions(userRole);
    renderCommonActions(ca, {
      moduleActions: ['add', 'edit', 'archive', 'attach', 'refresh', 'history'],
      userRole,
      handlers: {
        onAdd: () => navigateTo('#/m/030-pronajimatel/f/chooser?type=osoba'),
        onEdit: hasSel ? () => navigateTo(`#/m/030-pronajimatel/f/form?id=${selectedRow.id}&type=${selectedRow.typ_subjektu}`) : undefined,
        onArchive: (perms.includes('archive') && hasSel) ? async () => {
          alert('Archivace musí být implementována na serveru');
        } : undefined,
        onAttach: hasSel ? () => showAttachmentsModal({ entity: 'subjects', entityId: selectedRow.id }) : undefined,
        onRefresh: () => render(root),
        onHistory: hasSel ? () => alert('Historie subjektu - implementovat') : undefined
      }
    });
  }

  drawActions();

  renderTable(root.querySelector('#subject-table'), {
    columns,
    rows,
    options: {
      moduleId: '030-pronajimatel',
      filterValue,
      showFilter: true,
      customHeader: ({ filterInputHtml }) => `
        <div class="flex items-center gap-4">
          ${filterInputHtml}
          <label class="flex items-center gap-1 text-sm cursor-pointer ml-2">
            <input type="checkbox" id="toggle-archived" />
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
        navigateTo(`#/m/030-pronajimatel/f/form?id=${row.id}&type=${row.typ_subjektu}`);
      }
    }
  });

  const tableRoot = root.querySelector('#subject-table');
  tableRoot.addEventListener('change', (e) => {
    if (e.target && e.target.id === 'toggle-archived') {
      render(root);
    }
  });
}
export default { render };
