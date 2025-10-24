import { setBreadcrumb } from '/src/ui/breadcrumb.js';
import { renderTable } from '/src/ui/table.js';
import { renderCommonActions } from '/src/ui/commonActions.js';
import { navigateTo } from '/src/app.js';
import { listProperties } from '/src/modules/040-nemovitost/db.js';

// Nastavení breadcrumbs a základního layoutu
export async function render(root) {
  try {
    setBreadcrumb(document.getElementById('crumb'), [
      { icon: 'home', label: 'Domů', href: '#/' },
      { icon: 'building', label: 'Nemovitosti', href: '#/m/040-nemovitost' },
      { icon: 'list', label: 'Přehled' }
    ]);
  } catch (e) {}

  root.innerHTML = `<div id="commonactions" class="mb-4"></div><div id="property-table"></div>`;

  // Načti data
  const { data, error } = await listProperties({ showArchived: false, limit: 500 });
  if (error) {
    root.querySelector('#property-table').innerHTML = `<div class="p-4 text-red-600">Chyba při načítání: ${error.message || JSON.stringify(error)}</div>`;
    return;
  }
  const rows = data || [];

  // state: vybraná nemovitost
  let selectedId = null;

  // helper: vykresli common actions pro aktuální selectedId
  function renderActionsFor(selected) {
    const actions = ['edit', 'units', 'attach', 'archive', 'refresh', 'history'];
    const handlers = {};

    if (selected) {
      handlers.onEdit = () => navigateTo(`#/m/040-nemovitost/f/edit?id=${selected}`);
      handlers.onAttach = () => showAttachmentsModal({ entity: 'properties', entityId: selected });
      handlers.onArchive = async () => {
        // fallback navigace po archivaci (detail/switch)
        // zde bych raději použil db.archiveProperty + refresh, ale minimal implementace:
        navigateTo('#/m/040-nemovitost/t/prehled');
      };
      handlers.onUnits = () => navigateTo(`#/m/040-nemovitost/t/jednotky?propertyId=${selected}`);
      handlers.onRefresh = () => render(root);
      handlers.onHistory = () => alert('Historie - implementovat');
    } else {
      // pro prázdný výběr - většina tlačítek disabled (renderCommonActions zajistí)
    }

    renderCommonActions(document.getElementById('commonactions'), {
      moduleActions: actions,
      userRole: window.currentUserRole || 'admin',
      handlers
    });
  }

  // inicialní vykreslení action lišty bez výběru
  renderActionsFor(null);

  // Vykreslení tabulky (jednoduché)
  const tableEl = document.createElement('div');
  tableEl.className = 'table-container';
  // jednoduchá tabulka - můžete nahradit existujícím renderTable voláním
  const tbl = document.createElement('table');
  tbl.className = 'w-full table-auto border-collapse';
  const thead = document.createElement('thead');
  thead.innerHTML = `<tr class="text-left bg-slate-50">
    <th class="p-3">Typ</th><th class="p-3">Název</th><th class="p-3">Ulice</th><th class="p-3">Město</th><th class="p-3">Podlaží</th><th class="p-3">Jednotky</th>
  </tr>`;
  tbl.appendChild(thead);
  const tbody = document.createElement('tbody');

  rows.forEach(r => {
    const tr = document.createElement('tr');
    tr.className = 'cursor-pointer hover:bg-yellow-50';
    tr.innerHTML = `
      <td class="p-3">${r.typ_nemovitosti || ''}</td>
      <td class="p-3">${r.nazev || ''}</td>
      <td class="p-3">${r.ulice || ''}</td>
      <td class="p-3">${r.mesto || ''}</td>
      <td class="p-3">${r.pocet_podlazi ?? ''}</td>
      <td class="p-3">${r.pocet_jednotek ?? 0}</td>
    `;
    tr.addEventListener('click', () => {
      // nastav selectedId, zvýrazni řádek a aktualizuj actions
      selectedId = r.id;
      // vizuálně zvýraznit: odstraníme class u ostatních a přidáme u aktuálního
      Array.from(tbody.querySelectorAll('tr')).forEach(row => row.classList.remove('bg-yellow-50'));
      tr.classList.add('bg-yellow-50');
      renderActionsFor(selectedId);
    });

    // double-click: otevře detail
    tr.addEventListener('dblclick', () => navigateTo(`#/m/040-nemovitost/f/detail?id=${r.id}`));

    tbody.appendChild(tr);
  });

  tbl.appendChild(tbody);
  tableEl.appendChild(tbl);
  root.querySelector('#property-table').appendChild(tableEl);
}

export default { render };
