import { setBreadcrumb } from '/src/ui/breadcrumb.js';
import { renderTable } from '/src/ui/table.js';
import { renderCommonActions } from '/src/ui/commonActions.js';
import { navigateTo } from '/src/app.js';
import { listProperties } from '/src/modules/040-nemovitost/db.js';

// jednoduchá escape utilka (pokud máš vlastní, použij ji)
function _escapeHtml(s='') {
  return (''+s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

export async function render(root, params = {}) {
  const qs = params && Object.keys(params).length ? params : (location.hash.split('?')[1] ? Object.fromEntries(new URLSearchParams(location.hash.split('?')[1])) : {});
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

  root.innerHTML = `<div id="commonactions" class="mb-4"></div><div id="properties-table"></div>`;

  const { data: properties = [], error } = await listProperties({ type: filterType, showArchived: includeArchived, limit: 1000 });
  if (error) {
    root.querySelector('#properties-table').innerHTML = `<div class="p-4 text-red-600">Chyba při načítání nemovitostí: ${error.message || JSON.stringify(error)}</div>`;
    return;
  }

  const rows = properties || [];

  const columns = [
    {
      key: 'nazev',
      label: 'Název',
      width: '40%',
      render: r => `<a href="#/m/040-nemovitost/f/detail?id=${encodeURIComponent(r.id)}">${_escapeHtml(r.nazev || '—')}</a>`
    },
    {
      key: 'adresa',
      label: 'Adresa',
      width: '35%',
      render: r => `${_escapeHtml(r.ulice || '')} ${_escapeHtml(r.cislo_popisne || '')}, ${_escapeHtml(r.mesto || '')}`
    },
    { key: 'typ_nemovitosti', label: 'Typ', width: '10%' },
    { key: 'pocet_jednotek', label: 'Jednotek', width: '7%' },
    { key: 'archived', label: 'Archiv', width: '8%', render: r => r.archived ? 'Ano' : '' }
  ];

  renderTable(root.querySelector('#properties-table'), {
    columns,
    rows,
    options: {
      moduleId: '040-nemovitost-prehled',
      customHeader: ({ filterInputHtml }) => `
        <div class="flex items-center gap-4">
          ${filterInputHtml}
          <button id="btn-new-property" class="px-3 py-1 bg-blue-600 text-white rounded">Nová nemovitost</button>
          <button id="btn-new-unit" class="px-3 py-1 bg-green-600 text-white rounded">Nová jednotka</button>
        </div>
      `,
      onRowDblClick: row => navigateTo(`#/m/040-nemovitost/f/detail?id=${row.id}`)
    }
  });

  renderCommonActions(document.getElementById('commonactions'), {
    moduleActions: ['add', 'refresh'],
    userRole: window.currentUserRole || 'admin',
    handlers: {
      onAdd: () => navigateTo('#/m/040-nemovitost/f/chooser'),
      onRefresh: () => render(root, params)
    }
  });

  const tableRoot = root.querySelector('#properties-table');
  if (tableRoot) {
    tableRoot.addEventListener('click', (e) => {
      const btn = e.target.closest && e.target.closest('button');
      if (!btn) return;
      if (btn.id === 'btn-new-property') navigateTo('#/m/040-nemovitost/f/chooser');
      if (btn.id === 'btn-new-unit') navigateTo('#/m/040-nemovitost/f/unit-chooser');
    });
  }
}

export default { render };
