import { setBreadcrumb } from '/src/ui/breadcrumb.js';
import { renderTable } from '/src/ui/table.js';
import { renderCommonActions } from '/src/ui/commonActions.js';
import { navigateTo } from '/src/app.js';
import { listProperties, listPropertyTypes } from '/src/modules/040-nemovitost/db.js';

// jednoduchá escape utilka
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

  try {
    setBreadcrumb(document.getElementById('crumb'), [
      { icon: 'home', label: 'Domů', href: '#/' },
      { icon: 'building', label: 'Nemovitosti', href: '#/m/040-nemovitost' },
      { icon: 'list', label: 'Přehled' }
    ]);
  } catch (e) { /* ignore */ }

  root.innerHTML = `
    <div id="commonactions" class="mb-4"></div>
    <div id="properties-table"></div>
  `;

  // načti typy (pro barvy/labely)
  let types = [];
  try {
    const { data: tdata = [] } = await listPropertyTypes();
    types = tdata || [];
  } catch (e) {
    types = [];
  }
  const typeMap = Object.fromEntries((types || []).map(t => [t.slug, t]));

  // načti properties
  const { data: properties = [], error } = await listProperties({ type: filterType, showArchived: includeArchived, limit: 1000 });
  if (error) {
    root.querySelector('#properties-table').innerHTML = `<div class="p-4 text-red-600">Chyba při načítání nemovitostí: ${error.message || JSON.stringify(error)}</div>`;
    return;
  }

  const rows = properties || [];

  const columns = [
    {
      key: 'typ_nemovitosti',
      label: 'Typ',
      width: '12%',
      render: r => {
        const t = typeMap[r.typ_nemovitosti] || { label: (r.typ_nemovitosti || '—'), color: '#ddd' };
        const color = t.color || '#ddd';
        const label = t.label || (r.typ_nemovitosti || '—');
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
      key: 'nazev',
      label: 'Název',
      width: '34%',
      render: r => `<a href="#/m/040-nemovitost/f/detail?id=${encodeURIComponent(r.id)}" class="text-blue-600 hover:underline">${_escapeHtml(r.nazev || '—')}</a>`
    },
    {
      key: 'ulice',
      label: 'Ulice',
      width: '18%',
      render: r => `${_escapeHtml(r.ulice || '')} ${_escapeHtml(r.cislo_popisne || '')}`
    },
    { key: 'mesto', label: 'Město', width: '10%' },
    { key: 'pocet_podlazi', label: 'Podlaží', width: '6%' },
    { key: 'pocet_jednotek', label: 'Jednotky', width: '6%' },
    { key: 'archived', label: 'Archivován', width: '6%', render: r => r.archived ? 'Ano' : '' }
  ];

  renderTable(root.querySelector('#properties-table'), {
    columns,
    rows,
    options: {
      moduleId: '040-nemovitost-prehled',
      filterValue: '',
      customHeader: ({ filterInputHtml }) => `
        <div class="flex items-center gap-4">
          ${filterInputHtml}
          <label class="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" id="filter-show-archived" ${includeArchived ? 'checked' : ''}/>
            Zobrazit archivované
          </label>
          <button id="btn-new-property" title="Nová nemovitost" class="px-3 py-1 bg-blue-600 text-white rounded">Nová nemovitost</button>
          <button id="btn-new-unit" title="Nová jednotka" class="px-3 py-1 bg-green-600 text-white rounded">Nová jednotka</button>
        </div>
      `,
      onRowDblClick: row => navigateTo(`#/m/040-nemovitost/f/detail?id=${row.id}`)
    }
  });

  // Common actions (Add / Refresh)
  renderCommonActions(document.getElementById('commonactions'), {
    moduleActions: ['add', 'refresh'],
    userRole: window.currentUserRole || 'admin',
    handlers: {
      onAdd: () => navigateTo('#/m/040-nemovitost/f/chooser'),
      onRefresh: () => render(root, params)
    }
  });

  // Delegace kliků z custom header / table area
  const tableRoot = root.querySelector('#properties-table');
  if (tableRoot) {
    tableRoot.addEventListener('click', (e) => {
      const btn = e.target.closest && e.target.closest('button');
      if (btn) {
        if (btn.id === 'btn-new-property') {
          navigateTo('#/m/040-nemovitost/f/chooser');
        } else if (btn.id === 'btn-new-unit') {
          // otevře chooser pro vytvoření jednotky (umožní vybrat nemovitost)
          navigateTo('#/m/040-nemovitost/f/unit-chooser');
        }
        return;
      }

      const chk = e.target.closest && e.target.closest('#filter-show-archived');
      if (chk) {
        // přepínání archivovaných: přenačteme stránku s parametrem
        const newParams = new URLSearchParams(location.hash.split('?')[1] || '');
        newParams.set('showArchived', chk.checked ? 'true' : 'false');
        if (filterType) newParams.set('type', filterType);
        location.hash = `#/m/040-nemovitost/t/prehled?${newParams.toString()}`;
      }
    });

    // Also wire filter input's Enter to re-render (some table implementations already handle it)
    const filterInput = tableRoot.querySelector('input[type="search"], input[type="text"]');
    if (filterInput) {
      filterInput.addEventListener('keydown', (ev) => {
        if (ev.key === 'Enter') {
          // some renderTable implementations accept options.filterValue; reload with query param 'q'
          const q = filterInput.value || '';
          const newParams = new URLSearchParams(location.hash.split('?')[1] || '');
          if (q) newParams.set('q', q); else newParams.delete('q');
          if (filterType) newParams.set('type', filterType);
          location.hash = `#/m/040-nemovitost/t/prehled?${newParams.toString()}`;
        }
      });
    }
  }
}

export default { render };
