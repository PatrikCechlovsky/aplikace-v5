import { icon } from '/src/ui/icons.js';

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
  root.innerHTML = '<h2>Nový nájemník — vyber typ</h2><div class="tiles-row" style="display:flex;gap:12px;flex-wrap:wrap"></div>';
  const row = root.querySelector('.tiles-row');
  const moduleId = '050-najemnik';

  TILES.forEach(t => {
    const el = document.createElement('button');
    el.className = 'tile small flex items-center gap-2 p-3 rounded-md border hover:shadow-sm';
    el.style.minWidth = '140px';
    el.innerHTML = `<span style="font-size:20px">${icon(t.icon)}</span><span style="font-weight:600">${t.label}</span>`;
    el.addEventListener('click', () => {
      safeNavigate(`#/m/${moduleId}/f/form?type=${t.id}&role=najemnik`);
    });
    row.appendChild(el);
  });
}
