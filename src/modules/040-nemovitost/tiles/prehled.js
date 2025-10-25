import { renderTable } from '/src/ui/table.js';
import { renderCommonActions } from '/src/ui/commonActions.js';
import { listProperties, listPropertyTypes } from '/src/modules/040-nemovitost/db.js';
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

// Pomocná funkce pro získání parametrů z hash části URL
function getHashParams() {
  const q = (location.hash.split('?')[1] || '');
  return Object.fromEntries(new URLSearchParams(q));
}

export async function render(root, params = {}) {
  // Získej parametry z URL nebo z předaných params
  const urlParams = getHashParams();
  const typeFilter = params.type || urlParams.type || null;
  const archivedParam = params.archived || urlParams.archived;
  
  // Nastavení showArchived podle parametru
  if (archivedParam !== undefined) {
    showArchived = archivedParam === '1' || archivedParam === 'true' || archivedParam === true;
  }

  try {
    setBreadcrumb(document.getElementById('crumb'), [
      { icon: 'home', label: 'Domů', href: '#/' },
      { icon: 'building', label: 'Nemovitosti', href: '#/m/040-nemovitost' },
      { icon: 'list', label: 'Přehled' }
    ]);
  } catch (e) {}

  root.innerHTML = `<div id="commonactions" class="mb-4"></div><div id="property-table"></div>`;

  // Načti nemovitosti s filtrem podle typu (pokud je zadán)
  const { data, error } = await listProperties({ 
    type: typeFilter, 
    showArchived, 
    limit: 500 
  });
  if (error) {
    root.querySelector('#property-table').innerHTML = `<div class="p-4 text-red-600">Chyba při načítání: ${error.message || JSON.stringify(error)}</div>`;
    return;
  }
  const rows = data || [];

  // Načti typy nemovitostí (včetně barvy)
  const { data: types = [] } = await listPropertyTypes();
  const typeMap = Object.fromEntries(types.map(t => [t.slug, t]));



  // Task 02: Type badge in FIRST column for visual consistency
  const columns = [
    {
      key: 'typ_nemovitosti',
      label: 'Typ',
      width: '12%',
      sortable: true,
      render: (row) => {
        const type = typeMap[row.typ_nemovitosti];
        if (!type) return `<span>${row.typ_nemovitosti || '—'}</span>`;
        return `<span style="
          background:${type.color};
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
        ">${type.label}</span>`;
      }
    },
    {
      key: 'nazev',
      label: 'Název',
      width: '22%',
      render: (r) => {
        const name = escapeHtml(r.nazev || '—');
        return `<a href="#/m/040-nemovitost/f/detail?id=${encodeURIComponent(r.id)}">${name}</a>`;
      }
    },
    { key: 'ulice', label: 'Ulice', width: '15%' },
    { key: 'mesto', label: 'Město', width: '12%' },
    { key: 'pocet_podlazi', label: 'Podlaží', width: '8%' },
    { key: 'pocet_jednotek', label: 'Jednotky', width: '8%' },
    { key: 'archivedLabel', label: 'Archivován', width: '10%' }
  ];

  function drawActions() {
    const ca = document.getElementById('commonactions');
    if (!ca) return;
    const hasSel = !!selectedRow && !selectedRow.archived;
    const userRole = window.currentUserRole || 'admin';
    const perms = getUserPermissions(userRole);
    renderCommonActions(ca, {
      moduleActions: ['add', 'edit', 'units', 'archive', 'attach', 'refresh', 'history'],
      userRole,
      handlers: {
        onAdd: () => navigateTo('#/m/040-nemovitost/f/chooser'),
        onEdit: hasSel ? () => navigateTo(`#/m/040-nemovitost/f/edit?id=${selectedRow.id}`) : undefined,
        onUnits: hasSel ? () => navigateTo(`#/m/040-nemovitost/t/jednotky?propertyId=${selectedRow.id}`) : undefined,
        onArchive: (perms.includes('archive') && hasSel) ? async () => {
          const { archiveProperty } = await import('/src/modules/040-nemovitost/db.js');
          await archiveProperty(selectedRow.id);
          selectedRow = null;
          await render(root, params);
        } : undefined,
        onAttach: hasSel ? () => showAttachmentsModal({ entity: 'properties', entityId: selectedRow.id }) : undefined,
        onRefresh: () => render(root, params),
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
      render(root, params);
    }
  });
}















  });




}

export default { render };
