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
  // breadcrumb (shodně s 030 / 010)
  try {
    setBreadcrumb(document.getElementById('crumb'), [
      { icon: 'home',  label: 'Domů',      href: '#/' },
      { icon: 'users', label: 'Nájemník', href: '#/m/050-najemnik' },
      { icon: 'list',  label: 'Přehled' }
    ]);
  } catch (e) {}

  root.innerHTML = `<div id="commonactions" class="mb-4"></div><div id="subject-table"></div>`;

  // načíst subjekty (listSubjects vrátí [] i když user nemá žádné přiřazení)
  const { data, error } = await listSubjects({ limit: 500 });
  if (error) {
    root.querySelector('#subject-table').innerHTML = `<div class="p-4 text-red-600">Chyba při načítání: ${error.message || JSON.stringify(error)}</div>`;
    return;
  }
  const rows = data || [];

  const columns = [
    { key: 'id', label: 'ID' },
    {
      key: 'display_name',
      label: 'Název / Jméno',
      render: (r) => {
        const name = escapeHtml(r.display_name || '—');
        return `<a href="#/m/050-najemnik/f/form?type=${encodeURIComponent(r.typ_subjektu||'osoba')}&id=${encodeURIComponent(r.id)}">${name}</a>`;
      }
    },
    { key: 'typ_subjektu', label: 'Typ' },
    { key: 'primary_email', label: 'Email' },
    { key: 'primary_phone', label: 'Telefon' },
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
        // pro nájemníka otevíráme chooser, aby uživatel zvolil typ
        onAdd: () => navigateTo('#/m/050-najemnik/f/chooser'),
        onEdit: hasSel ? () => navigateTo(`#/m/050-najemnik/f/form?id=${selectedRow.id}&type=${selectedRow.typ_subjektu}`) : undefined,
        onArchive: (perms.includes('archive') && hasSel) ? async () => {
          alert('Archivace (implementovat server-side)');
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
      moduleId: '050-najemnik',
      filterValue,
      showFilter: true,
      onRowSelect: row => {
        selectedRow = (selectedRow && selectedRow.id === row.id) ? null : row;
        drawActions();
      },
      onRowDblClick: row => {
        selectedRow = row;
        navigateTo(`#/m/050-najemnik/f/form?id=${row.id}&type=${row.typ_subjektu}`);
      }
    }
  });
}

export default { render };
