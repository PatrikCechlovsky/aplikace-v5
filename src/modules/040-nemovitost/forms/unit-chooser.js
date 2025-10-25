import { icon } from '/src/ui/icons.js';
import { setBreadcrumb } from '/src/ui/breadcrumb.js';
import { listProperties } from '/src/modules/040-nemovitost/db.js';

function safeNavigate(href) {
  if (typeof window.navigateTo === 'function') {
    try { window.navigateTo(href); return; } catch (e) { /* fallback below */ }
  }
  location.hash = href;
}

const UNIT_TYPES = [
  { id: 'byt', label: 'Byt', icon: 'apartment-unit' },
  { id: 'kancelar', label: 'Kancelář', icon: 'office' },
  { id: 'obchod', label: 'Obchodní prostor', icon: 'shopping-cart' },
  { id: 'sklad', label: 'Sklad', icon: 'storage' },
  { id: 'garaz', label: 'Garáž/Parking', icon: 'car' },
  { id: 'sklep', label: 'Sklep', icon: 'basement' },
  { id: 'puda', label: 'Půda', icon: 'attic' },
  { id: 'jina_jednotka', label: 'Jiná jednotka', icon: 'unit-key' }
];

export async function render(root, params) {
  const { propertyId, returnType } = params || {};
  
  try {
    setBreadcrumb(document.getElementById('crumb'), [
      { icon: 'home', label: 'Domů', href: '#/' },
      { icon: 'building', label: 'Nemovitosti', href: '#/m/040-nemovitost' },
      { icon: 'form', label: 'Formulář' },
      { icon: 'pencil-alt', label: 'Nová jednotka' }
    ]);
  } catch (e) {
    console.warn('[unit-chooser] setBreadcrumb failed:', e);
  }

  // If no propertyId, show property selector first
  if (!propertyId) {
    root.innerHTML = `
      <div class="space-y-4">
        <h2 class="text-xl font-semibold">Nová jednotka — krok 1: Vyberte nemovitost</h2>
        <p class="text-sm text-gray-600">Jednotka musí být přiřazena k nemovitosti. Nejprve vyberte nemovitost.</p>
        <div id="property-selector" class="space-y-2">
          <div class="text-center py-4">Načítání nemovitostí...</div>
        </div>
      </div>
    `;
    
    const { data: properties = [], error } = await listProperties({ showArchived: false, limit: 500 });
    const selector = root.querySelector('#property-selector');
    
    if (error || !properties.length) {
      selector.innerHTML = `
        <div class="p-4 bg-red-50 text-red-800 rounded">
          ${error ? `Chyba při načítání: ${error.message}` : 'Nebyly nalezeny žádné nemovitosti. Nejprve vytvořte nemovitost.'}
        </div>
        <a href="#/m/040-nemovitost/f/chooser" class="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          Vytvořit novou nemovitost
        </a>
      `;
      return;
    }
    
    // Show list of properties to select from
    selector.innerHTML = `
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        ${properties.map(p => `
          <button 
            onclick="location.hash='#/m/040-nemovitost/f/unit-chooser?propertyId=${encodeURIComponent(p.id)}'"
            class="p-4 text-left border rounded-lg hover:bg-blue-50 hover:border-blue-300 transition"
          >
            <div class="font-semibold">${p.nazev || '—'}</div>
            <div class="text-sm text-gray-600">${p.ulice || ''} ${p.mesto || ''}</div>
            <div class="text-xs text-gray-500 mt-1">${p.typ_nemovitosti || ''}</div>
          </button>
        `).join('')}
      </div>
    `;
    return;
  }
  
  // If propertyId exists, show unit type chooser
  root.innerHTML = '<h2>Nová jednotka — krok 2: Vyberte typ jednotky</h2><div class="tiles-row" style="display:flex;gap:12px;flex-wrap:wrap"></div>';
  const row = root.querySelector('.tiles-row');
  const moduleId = (location.hash || '').match(/#\/m\/([^\/]+)/)?.[1] || '040-nemovitost';

  UNIT_TYPES.forEach(t => {
    const el = document.createElement('button');
    el.className = 'tile small flex items-center gap-2 p-3 rounded-md border hover:shadow-sm';
    el.style.minWidth = '160px';
    el.innerHTML = `<span style="font-size:20px">${icon(t.icon)}</span><span style="font-weight:600">${t.label}</span>`;
    el.addEventListener('click', () => {
      // při kliknutí navigujeme na unit-edit form s type a propertyId
      safeNavigate(`#/m/${moduleId}/f/unit-edit?propertyId=${propertyId}&type=${t.id}`);
    });
    row.appendChild(el);
  });
}

export default { render };
