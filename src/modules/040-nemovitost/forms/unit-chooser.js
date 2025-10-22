import { icon } from '/src/ui/icons.js';
import { setBreadcrumb } from '/src/ui/breadcrumb.js';

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
  
  if (!propertyId) {
    root.innerHTML = `<div class="p-4 text-red-600">Chybí ID nemovitosti. Jednotka musí být přiřazena k nemovitosti.</div>`;
    return;
  }
  
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

  root.innerHTML = '<h2>Nová jednotka — vyber typ</h2><div class="tiles-row" style="display:flex;gap:12px;flex-wrap:wrap"></div>';
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
