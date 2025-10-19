import { renderTable } from '/src/ui/table.js';
import { renderCommonActions } from '/src/ui/commonActions.js';
import { listSubjects } from '/src/db/subjects.js';
import { setBreadcrumb } from '/src/ui/breadcrumb.js';
import { navigateTo } from '/src/app.js';
import { getUserPermissions } from '/src/security/permissions.js';
import { showAttachmentsModal } from '/src/ui/attachments.js';

let selectedRow = null;
let filterValue = '';

export async function render(root) {
  try {
    setBreadcrumb(document.getElementById('crumb'), [
      { icon:'home', label:'Domů', href:'#/' },
      { icon:'users', label:'Pronajímatel', href:'#/m/030-pronajimatel' },
      { icon:'list', label:'Přehled', href:'#/m/030-pronajimatel/t/prehled' },
      { icon:'people', label:'Spolek / Skupina' }
    ]);
  } catch (e) {}

  root.innerHTML = `<div id="commonactions" class="mb-4"></div><div id="subject-table"></div>`;

  const { data, error } = await listSubjects({ type: 'spolek', limit: 500 });
  if (error) { root.querySelector('#subject-table').innerHTML = `<div class="p-4 text-red-600">Chyba: ${error.message}</div>`; return; }
  const rows = data || [];

  const columns = [
    { key:'display_name', label:'Název' },
    { key:'primary_email', label:'E-mail' },
    { key:'primary_phone', label:'Telefon' }
  ];

  function drawActions() {
    const ca = document.getElementById('commonactions'); if (!ca) return;
    const hasSel = !!selectedRow;
    const userRole = window.currentUserRole || 'admin';
    const perms = getUserPermissions(userRole);
    renderCommonActions(ca, {
      moduleActions: ['add','edit','archive','attach','refresh','history'],
      userRole,
      handlers: {
        onAdd: () => navigateTo('#/m/030-pronajimatel/f/chooser?type=spolek'),
        onEdit: hasSel ? () => navigateTo(`#/m/030-pronajimatel/f/form?id=${selectedRow.id}&type=${selectedRow.typ_subjektu}`) : undefined,
        onArchive: (perms.includes('archive') && hasSel) ? async () => alert('Archivace - implementovat') : undefined,
        onAttach: hasSel ? () => showAttachmentsModal({ entity:'subjects', entityId: selectedRow.id }) : undefined,
        onRefresh: () => render(root),
        onHistory: hasSel ? () => alert('Historie - implementovat') : undefined
      }
    });
  }

  drawActions();

  renderTable(root.querySelector('#subject-table'), {
    columns, rows,
    options: {
      moduleId: '030-pronajimatel',
      filterValue,
      showFilter: true,
      onRowSelect: row => { selectedRow = (selectedRow && selectedRow.id === row.id) ? null : row; drawActions(); },
      onRowDblClick: row => { selectedRow = row; navigateTo(`#/m/030-pronajimatel/f/form?id=${row.id}&type=${row.typ_subjektu}`); }
    }
  });
}

export default { render };
