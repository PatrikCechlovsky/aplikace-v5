import { icon } from '/src/ui/icons.js';
import { setBreadcrumb } from '/src/ui/breadcrumb.js';

function safeNavigate(href) {
  if (typeof window.navigateTo === 'function') {
    try { window.navigateTo(href); return; } catch (e) { /* fallback below */ }
  }
  location.hash = href;
}

const TILES = [
  { id: 'osoba', label: 'Osoba', icon: 'person' },
  { id: 'osvc', label: 'OSVČ', icon: 'briefcase' },
  { id: 'firma', label: 'Firma', icon: 'building' },
  { id: 'spolek', label: 'Spolek', icon: 'people' },
  { id: 'stat', label: 'Státní instituce', icon: 'bank' },
  { id: 'zastupce', label: 'Zástupce', icon: 'handshake' }
];

export async function render(root) {
  // nastav breadcrumb explicitně (tím přepíšeme "Přehled", pokud tam zůstal)
  try {
    setBreadcrumb(document.getElementById('crumb'), [
      { icon: 'home', label: 'Domů', href: '#/' },
      { icon: 'users', label: 'Pronajímatel', href: '#/m/030-pronajimatel' },
      { icon: 'form', label: 'Formulář' },
      { icon: 'pencil-alt', label: 'Nový subjekt' }
    ]);
  } catch (e) {
    // pokud crumb chybí, vypíšeme varování — pomůže to při debugování
    console.warn('[chooser] setBreadcrumb failed:', e);
  }

  root.innerHTML = '<h2>Nový subjekt — vyber typ</h2><div class="tiles-row" style="display:flex;gap:12px;flex-wrap:wrap"></div>';
  const row = root.querySelector('.tiles-row');
  const moduleId = (location.hash || '').match(/#\/m\/([^\/]+)/)?.[1] || '030-pronajimatel';

  TILES.forEach(t => {
    const el = document.createElement('button');
    el.className = 'tile small flex items-center gap-2 p-3 rounded-md border hover:shadow-sm';
    el.style.minWidth = '140px';
    el.innerHTML = `<span style="font-size:20px">${icon(t.icon)}</span><span style="font-weight:600">${t.label}</span>`;
    el.addEventListener('click', () => {
      // při kliknutí navigujeme na form s type — form render bude také nastavit breadcrumb na konkrétní typ
      safeNavigate(`#/m/${moduleId}/f/form?type=${t.id}`);
    });
    row.appendChild(el);
  });
}

export default { render };
