import { renderTable } from '/src/ui/table.js';
import { renderCommonActions } from '/src/ui/commonActions.js';
import { listProperties } from '/src/modules/040-nemovitost/db.js';
import { setBreadcrumb } from '/src/ui/breadcrumb.js';
import { navigateTo } from '/src/app.js';
import { getUserPermissions } from '/src/security/permissions.js';
import { showAttachmentsModal } from '/src/ui/attachments.js';

let selectedRow = null;
let showArchived = false;
let filterValue = '';

function escapeHtml(s='') {
  return (''+s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

export async function render(root) {
  try {
    setBreadcrumb(document.getElementById('crumb'), [
      { icon: 'home', label: 'Domů', href: '#/' },
      { icon: 'building', label: 'Nemovitosti', href: '#/m/040-nemovitost' },
      { icon: 'list', label: 'Přehled', href: '#/m/040-nemovitost/t/prehled' },
      { icon: 'map', label: 'Pozemek' }
    ]);
  } catch (e) { /* ignore if crumb missing */ }

  root.innerHTML = `<div id="commonactions" class="mb-4"></div><div id="property-table"></div>`;

  const { data, error } = await listProperties({ type: 'pozemek', showArchived, limit: 500 });
  if (error) {
    root.querySelector('#property-table').innerHTML = `<div class="p-4 text-red-600">Chyba při načítání: ${error.message || JSON.stringify(error)}</div>`;
    return;
  }
  const rows = data || [];

  const columns = [
    { key: 'id', label: 'ID', width: '8%' },
    {
      key: 'nazev',
      label: 'Název',
      width: '25%',
      render: (r) => {
        const name = escapeHtml(r.nazev || '—');
        return `<a href="#/m/040-nemovitost/f/detail?id=${encodeURIComponent(r.id)}">${name}</a>`;
      }
    },
    { key: 'ulice', label: 'Ulice', width: '20%' },
    { key: 'mesto', label: 'Město', width: '15%' },
    { key: 'rozloha', label: 'Rozloha', width: '10%' },
    { key: 'archivedLabel', label: 'Archivován', width: '12%' }
  ];

  function drawActions() {
    const ca = document.getElementById('commonactions');
    if (!ca) return;
    const hasSel = !!selectedRow && !selectedRow.archived;
    const userRole = window.currentUserRole || 'admin';
    const perms = getUserPermissions(userRole);
    renderCommonActions(ca, {
      moduleActions: ['add', 'edit', 'archive', 'attach', 'refresh', 'history'],
      userRole,
      handlers: {
        onAdd: () => navigateTo('#/m/040-nemovitost/f/chooser?returnType=pozemek'),
        onEdit: hasSel ? () => navigateTo(`#/m/040-nemovitost/f/edit?id=${selectedRow.id}`) : undefined,
        onArchive: (perms.includes('archive') && hasSel) ? async () => {
          const { archiveProperty } = await import('/src/modules/040-nemovitost/db.js');
          await archiveProperty(selectedRow.id);
          selectedRow = null;
          await render(root);
        } : undefined,
        onAttach: hasSel ? () => showAttachmentsModal({ entity: 'properties', entityId: selectedRow.id }) : undefined,
        onRefresh: () => render(root),
        onHistory: hasSel ? () => alert('Historie - implementovat') : undefined
      }
    });
  }

  drawActions();

  renderTable(root.querySelector('#property-table'), {
    columns,
    rows: rows.map(r => ({
      ...r,
      archivedLabel: r.archived ? 'Ano' : ''
    })),
    options: {
      moduleId: '040-nemovitost',
      filterValue,
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
        navigateTo(`#/m/040-nemovitost/f/detail?id=${row.id}`);
      }
    }
  });

  root.querySelector('#property-table').addEventListener('change', (e) => {
    if (e.target && e.target.id === 'toggle-archived') {
      showArchived = e.target.checked;
      render(root);
    }
  });
}

export default { render };
