import { renderTable } from '/src/ui/table.js';
import { renderCommonActions } from '/src/ui/commonActions.js';
import { listSubjects } from '/src/db/subjects.js';
import { setBreadcrumb } from '/src/ui/breadcrumb.js';
import { navigateTo } from '/src/app.js';
import { getUserPermissions } from '/src/security/permissions.js';
import { showAttachmentsModal } from '/src/ui/attachments.js';

let selectedRow = null;
let filterValue = '';
let showArchived = false; // Task 04: Add archived filter

// Task 02: Type badge configuration
const typeBadges = {
  'osoba': { color: '#3B82F6', label: 'FO', title: 'Fyzická osoba' },
  'osvc': { color: '#8B5CF6', label: 'OSVČ', title: 'OSVČ' },
  'firma': { color: '#10B981', label: 'PO', title: 'Právnická osoba' },
  'spolek': { color: '#F59E0B', label: 'Spolek', title: 'Spolek / Skupina' },
  'stat': { color: '#EF4444', label: 'Stát', title: 'Státní instituce' },
  'zastupce': { color: '#6B7280', label: 'Zástupce', title: 'Zástupce' }
};

function escapeHtml(s='') {
  return (''+s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

export async function render(root) {
  try {
    setBreadcrumb(document.getElementById('crumb'), [
      { icon: 'home', label: 'Domů', href: '#/' },
      { icon: 'users', label: 'Pronajímatel', href: '#/m/030-pronajimatel' },
      { icon: 'list',  label: 'Přehled' }
    ]);
  } catch (e) {}

  root.innerHTML = `<div id="commonactions" class="mb-4"></div><div id="subject-table"></div>`;

  // Task 04: Include archived filter
  const { data, error } = await listSubjects({ 
    role: 'pronajimatel', 
    showArchived,
    limit: 500 
  });
  if (error) {
    root.querySelector('#subject-table').innerHTML = `<div class="p-4 text-red-600">Chyba: ${error.message || JSON.stringify(error)}</div>`;
    return;
  }
  const rows = data || [];

  // Task 02: Type badge as FIRST column
  const columns = [
    {
      key: 'typ_subjektu',
      label: 'Typ',
      width: '10%',
      sortable: true,
      render: (row) => {
        const badge = typeBadges[row.typ_subjektu] || { color: '#6B7280', label: row.typ_subjektu, title: row.typ_subjektu };
        return `<span style="
          background:${badge.color};
          color:#fff;
          padding:2px 12px;
          border-radius:14px;
          font-size:0.97em;
          font-weight:600;
          display:inline-block;
          min-width:60px;
          text-align:center;
          box-shadow:0 1px 3px 0 #0001;
          letter-spacing:0.01em;
        " title="${badge.title}">${badge.label}</span>`;
      }
    },
    { key: 'display_name', label: 'Název / Jméno', width: '20%' },
    { key: 'ico', label: 'IČO', width: '10%' },
    { key: 'primary_phone', label: 'Telefon', width: '15%' },
    { key: 'primary_email', label: 'Email', width: '18%' },
    { key: 'city', label: 'Město', width: '15%' },
    { key: 'archivedLabel', label: 'Archivován', width: '10%' }
  ];

  function drawActions() {
    const ca = document.getElementById('commonactions');
    if (!ca) return;
    const hasSel = !!selectedRow;
    const userRole = window.currentUserRole || 'admin';
    const perms = getUserPermissions(userRole);
    renderCommonActions(ca, {
      moduleActions: ['add','edit','archive','attach','refresh','history'],
      userRole,
      handlers: {
        onAdd: () => navigateTo('#/m/030-pronajimatel/f/chooser'),
        onEdit: hasSel ? () => navigateTo(`#/m/030-pronajimatel/f/form?id=${selectedRow.id}&type=${selectedRow.typ_subjektu}`) : undefined,
        onArchive: (perms.includes('archive') && hasSel) ? async () => alert('Archivace - implementovat server-side') : undefined,
        onAttach: hasSel ? () => showAttachmentsModal({ entity:'subjects', entityId: selectedRow.id }) : undefined,
        onRefresh: () => render(root),
        onHistory: hasSel ? () => alert('Historie - implementovat') : undefined
      }
    });
  }

  drawActions();

  renderTable(root.querySelector('#subject-table'), {
    columns,
    rows: rows.map(r => ({
      ...r,
      archivedLabel: r.archived ? 'Ano' : '' // Task 04: Show archived status
    })),
    options: {
      moduleId: '030-pronajimatel',
      filterValue,
      showFilter: true,
      // Task 04: Custom header with archived checkbox
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
        navigateTo(`#/m/030-pronajimatel/f/form?id=${row.id}&type=${row.typ_subjektu}`);
      }
    }
  });

  // Task 04: Handle archived checkbox toggle
  root.querySelector('#subject-table').addEventListener('change', (e) => {
    if (e.target && e.target.id === 'toggle-archived') {
      showArchived = e.target.checked;
      render(root);
    }
  });
}

export default { render };
