// Seznam jednotek pro konkrétní nemovitost
import { renderTable } from '/src/ui/table.js';
import { renderCommonActions } from '/src/ui/commonActions.js';
import { listUnits, listUnitTypes, getProperty } from '/src/modules/040-nemovitost/db.js';
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
  const { propertyId } = params || getHashParams();
  
  if (!propertyId) {
    root.innerHTML = `<div class="p-4 text-red-600">Chybí ID nemovitosti. Jednotky musí být zobrazeny v kontextu nemovitosti.</div>`;
    return;
  }

  // Načti data nemovitosti pro breadcrumb
  const { data: property, error: propError } = await getProperty(propertyId);
  if (propError || !property) {
    root.innerHTML = `<div class="p-4 text-red-600">Chyba při načítání nemovitosti: ${propError?.message || 'Nemovitost nenalezena'}</div>`;
    return;
  }

  try {
    setBreadcrumb(document.getElementById('crumb'), [
      { icon: 'home', label: 'Domů', href: '#/' },
      { icon: 'building', label: 'Nemovitosti', href: '#/m/040-nemovitost' },
      { icon: 'building', label: property.nazev, href: `#/m/040-nemovitost/f/detail?id=${propertyId}` },
      { icon: 'grid', label: 'Jednotky' }
    ]);
  } catch (e) {}

  root.innerHTML = `<div id="commonactions" class="mb-4"></div><div id="units-table"></div>`;

  // Načti všechny jednotky pro tuto nemovitost
  const { data, error } = await listUnits(propertyId, showArchived);
  if (error) {
    root.querySelector('#units-table').innerHTML = `<div class="p-4 text-red-600">Chyba při načítání jednotek: ${error.message || JSON.stringify(error)}</div>`;
    return;
  }
  const rows = data || [];

  // Načti typy jednotek (včetně barvy)
  const { data: types = [] } = await listUnitTypes();
  const typeMap = Object.fromEntries(types.map(t => [t.slug, t]));

  // Mapování stavů na barvy
  const stavMap = {
    'volna': { label: 'Volná', color: '#10b981' },
    'obsazena': { label: 'Obsazená', color: '#ef4444' },
    'rezervovana': { label: 'Rezervovaná', color: '#f59e0b' },
    'rekonstrukce': { label: 'Rekonstrukce', color: '#6b7280' }
  };

  const columns = [
    {
      key: 'oznaceni',
      label: 'Označení',
      width: '15%',
      sortable: true,
      render: (r) => {
        const oznaceni = escapeHtml(r.oznaceni || r.cislo_jednotky || '—');
        return `<a href="#/m/040-nemovitost/f/unit-edit?id=${encodeURIComponent(r.id)}">${oznaceni}</a>`;
      }
    },
    {
      key: 'typ_jednotky',
      label: 'Typ',
      width: '12%',
      sortable: true,
      render: (row) => {
        const type = typeMap[row.typ_jednotky || row.typ];
        if (!type) return `<span>${row.typ_jednotky || row.typ || '—'}</span>`;
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
    { key: 'podlazi', label: 'Podlaží', width: '8%', sortable: true },
    { key: 'plocha', label: 'Plocha (m²)', width: '10%', sortable: true, render: (r) => r.plocha ? `${r.plocha} m²` : '—' },
    { key: 'dispozice', label: 'Dispozice', width: '10%' },
    {
      key: 'stav',
      label: 'Stav',
      width: '12%',
      sortable: true,
      render: (row) => {
        const stav = stavMap[row.stav] || { label: row.stav || '—', color: '#6b7280' };
        return `<span style="
          background:${stav.color};
          color:#fff;
          padding:2px 12px;
          border-radius:14px;
          font-size:0.97em;
          font-weight:600;
          display:inline-block;
          min-width:60px;
          text-align:center;
          box-shadow:0 1px 3px 0 #0001;
        ">${stav.label}</span>`;
      }
    },
    { key: 'mesicni_najem', label: 'Nájem (Kč)', width: '10%', render: (r) => r.mesicni_najem ? `${r.mesicni_najem} Kč` : '—' },
    { key: 'archivedLabel', label: 'Archivován', width: '10%' }
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
        onAdd: () => navigateTo(`#/m/040-nemovitost/f/unit-edit?propertyId=${propertyId}`),
        onEdit: hasSel ? () => navigateTo(`#/m/040-nemovitost/f/unit-edit?id=${selectedRow.id}`) : undefined,
        onArchive: (perms.includes('archive') && hasSel) ? async () => {
          const { archiveUnit } = await import('/src/modules/040-nemovitost/db.js');
          await archiveUnit(selectedRow.id);
          selectedRow = null;
          await render(root, { propertyId });
        } : undefined,
        onAttach: hasSel ? () => showAttachmentsModal({ entity: 'units', entityId: selectedRow.id }) : undefined,
        onRefresh: () => render(root, { propertyId }),
        onHistory: hasSel ? () => alert('Historie - implementovat') : undefined
      }
    });
  }

  drawActions();

  renderTable(root.querySelector('#units-table'), {
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
        navigateTo(`#/m/040-nemovitost/f/unit-edit?id=${row.id}`);
      }
    }
  });

  root.querySelector('#units-table').addEventListener('change', (e) => {
    if (e.target && e.target.id === 'toggle-archived') {
      showArchived = e.target.checked;
      render(root, { propertyId });
    }
  });
}

export default { render };
