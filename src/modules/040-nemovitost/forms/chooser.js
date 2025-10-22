import { icon } from '/src/ui/icons.js';
import { setBreadcrumb } from '/src/ui/breadcrumb.js';

function safeNavigate(href) {
  if (typeof window.navigateTo === 'function') {
    try { window.navigateTo(href); return; } catch (e) { /* fallback below */ }
  }
  location.hash = href;
}

const PROPERTY_TYPES = [
  { id: 'bytovy_dum', label: 'Bytový dům', icon: 'building-2' },
  { id: 'rodinny_dum', label: 'Rodinný dům', icon: 'home' },
  { id: 'admin_budova', label: 'Administrativní budova', icon: 'office-building' },
  { id: 'prumyslovy_objekt', label: 'Průmyslový objekt', icon: 'warehouse' },
  { id: 'pozemek', label: 'Pozemek', icon: 'map' },
  { id: 'jiny_objekt', label: 'Jiný objekt', icon: 'apartment' }
];

export async function render(root, params) {
  const { returnType } = params || {};
  
  try {
    setBreadcrumb(document.getElementById('crumb'), [
      { icon: 'home', label: 'Domů', href: '#/' },
      { icon: 'building', label: 'Nemovitosti', href: '#/m/040-nemovitost' },
      { icon: 'form', label: 'Formulář' },
      { icon: 'pencil-alt', label: 'Nová nemovitost' }
    ]);
  } catch (e) {
    console.warn('[chooser] setBreadcrumb failed:', e);
  }

  root.innerHTML = '<h2>Nová nemovitost — vyber typ</h2><div class="tiles-row" style="display:flex;gap:12px;flex-wrap:wrap"></div>';
  const row = root.querySelector('.tiles-row');
  const moduleId = (location.hash || '').match(/#\/m\/([^\/]+)/)?.[1] || '040-nemovitost';

  PROPERTY_TYPES.forEach(t => {
    const el = document.createElement('button');
    el.className = 'tile small flex items-center gap-2 p-3 rounded-md border hover:shadow-sm';
    el.style.minWidth = '160px';
    el.innerHTML = `<span style="font-size:20px">${icon(t.icon)}</span><span style="font-weight:600">${t.label}</span>`;
    el.addEventListener('click', () => {
      // při kliknutí navigujeme na edit form s type
      safeNavigate(`#/m/${moduleId}/f/edit?type=${t.id}`);
    });
    row.appendChild(el);
  });
}

export default { render };
