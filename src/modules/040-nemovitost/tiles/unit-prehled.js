// Přehled všech jednotek (volitelně filtrovaný podle typu)
import { setBreadcrumb } from '/src/ui/breadcrumb.js';
import { renderTable } from '/src/ui/table.js';
import { renderCommonActions } from '/src/ui/commonActions.js';
import { navigateTo } from '/src/app.js';
import { listUnitTypes } from '/src/modules/040-nemovitost/db.js';
import { supabase } from '/src/supabase.js';
import { showAttachmentsModal } from '/src/ui/attachments.js';
import { getUserPermissions } from '/src/security/permissions.js';

function _escapeHtml(s = '') {
  return ('' + s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

export async function render(root, params = {}) {
  const qs = params && Object.keys(params).length
    ? params
    : (location.hash.split('?')[1] ? Object.fromEntries(new URLSearchParams(location.hash.split('?')[1])) : {});
  const { type, showArchived } = qs;
  const filterType = type || null;
  const includeArchived = (showArchived === 'true' || showArchived === true) ? true : false;
  
  let selectedRow = null;

  try {
    setBreadcrumb(document.getElementById('crumb'), [
      { icon: 'home', label: 'Domů', href: '#/' },
      { icon: 'building', label: 'Nemovitosti', href: '#/m/040-nemovitost' },
      { icon: 'grid', label: 'Přehled jednotek' }
    ]);
  } catch (e) { /* ignore */ }

  root.innerHTML = `
    <div id="commonactions" class="mb-4"></div>
    <div id="units-table"></div>
  `;

  // Load unit types (for colors/labels)
  let types = [];
  try {
    const { data: tdata = [] } = await listUnitTypes();
    types = tdata || [];
  } catch (e) {
    types = [];
  }
  const typeMap = Object.fromEntries((types || []).map(t => [t.slug, t]));

  // Load units
  let query = supabase
    .from('units')
    .select(`
      id,
      typ_jednotky,
      oznaceni,
      stav,
      podlazi,
      plocha_celkem,
      archived,
      property:properties!fk_units_nemovitost(id, nazev, mesto)
    `)
    .order('created_at', { ascending: false })
    .limit(500);

  // Filter by type if specified
  if (filterType) {
    query = query.eq('typ_jednotky', filterType);
  }

  // Filter archived
  if (!includeArchived) {
    query = query.or('archived.is.null,archived.eq.false');
  }

  const { data: units = [], error } = await query;
  if (error) {
    root.querySelector('#units-table').innerHTML = `<div class="p-4 text-red-600">Chyba při načítání jednotek: ${error.message || JSON.stringify(error)}</div>`;
    return;
  }

  const rows = units || [];

  const columns = [
    {
      key: 'typ_jednotky',
      label: 'Typ',
      width: '12%',
      render: r => {
        const t = typeMap[r.typ_jednotky] || { label: (r.typ_jednotky || '—'), color: '#ddd' };
        const color = t.color || '#ddd';
        const label = t.label || (r.typ_jednotky || '—');
        return `<span style="
          display:inline-block;
          padding:6px 12px;
          border-radius:14px;
          background:${_escapeHtml(color)};
          color:${/#([0-9A-Fa-f]{6})/.test(color) ? '#fff' : '#222'};
          font-weight:600;
          font-size:0.95em;
          box-shadow:0 1px 3px 0 #0001;
        ">${_escapeHtml(label)}</span>`;
      }
    },
    {
      key: 'oznaceni',
      label: 'Označení',
      width: '15%',
      render: r => `<a href="#/m/040-nemovitost/f/unit-detail?id=${encodeURIComponent(r.id)}" class="text-blue-600 hover:underline">${_escapeHtml(r.oznaceni || '—')}</a>`
    },
    {
      key: 'property',
      label: 'Nemovitost',
      width: '25%',
      render: r => {
        const prop = r.property;
        return prop ? `<a href="#/m/040-nemovitost/f/detail?id=${encodeURIComponent(prop.id)}" class="text-blue-600 hover:underline">${_escapeHtml(prop.nazev || '—')}</a>` : '—';
      }
    },
    {
      key: 'stav',
      label: 'Stav',
      width: '12%',
      render: r => {
        const stavLabels = {
          'volna': 'Volná',
          'obsazena': 'Obsazena',
          'rezervovana': 'Rezervována',
          'rekonstrukce': 'Rekonstrukce'
        };
        return stavLabels[r.stav] || r.stav || '—';
      }
    },
    { key: 'podlazi', label: 'Podlaží', width: '10%' },
    { 
      key: 'plocha_celkem', 
      label: 'Plocha (m²)', 
      width: '12%',
      render: r => r.plocha_celkem ? `${r.plocha_celkem} m²` : '—'
    },
    { 
      key: 'archived', 
      label: 'Archivován', 
      width: '8%', 
      render: r => r.archived ? 'Ano' : '' 
    }
  ];

  renderTable(root.querySelector('#units-table'), {
    columns,
    rows,
    options: {
      moduleId: '040-nemovitost-jednotky-prehled',
      filterValue: '',
      customHeader: ({ filterInputHtml }) => `
        <div class="flex items-center gap-4">
          ${filterInputHtml}
          <label class="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" id="filter-show-archived" ${includeArchived ? 'checked' : ''}/>
            Zobrazit archivované
          </label>
        </div>
      `,
      onRowSelect: row => {
        selectedRow = (selectedRow && selectedRow.id === row.id) ? null : row;
        drawActions();
      },
      onRowDblClick: row => navigateTo(`#/m/040-nemovitost/f/unit-detail?id=${row.id}`)
    }
  });
    const ca = document.getElementById('commonactions');
    if (!ca) return;
    const hasSel = !!selectedRow;
    const userRole = window.currentUserRole || 'admin';
    renderCommonActions(ca, {
      moduleActions: ['add', 'edit', 'attach', 'refresh', 'history'],
      userRole,
      handlers: {
        onAdd: () => navigateTo('#/m/040-nemovitost/f/unit-chooser'),
        onEdit: hasSel ? () => navigateTo(`#/m/040-nemovitost/f/unit-edit?id=${selectedRow.id}`) : undefined,
        onAttach: hasSel ? () => showAttachmentsModal({ entity: 'units', entityId: selectedRow.id }) : undefined,
        onRefresh: () => render(root, params),
        onHistory: hasSel ? () => alert('Historie jednotky - implementovat') : undefined
      }
    });
  }

  drawActions();

  // Handle archived checkbox toggle
  const tableRoot = root.querySelector('#units-table');
  if (tableRoot) {
    tableRoot.addEventListener('change', (e) => {
      const chk = e.target.closest && e.target.closest('#filter-show-archived');
      if (chk) {
        const newParams = new URLSearchParams(location.hash.split('?')[1] || '');
        newParams.set('showArchived', chk.checked ? 'true' : 'false');
        if (filterType) newParams.set('type', filterType);
        location.hash = `#/m/040-nemovitost/t/unit-prehled?${newParams.toString()}`;
      }
    });
  }
}

export default { render };
