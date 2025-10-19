// safe chooser for 050: adds role=najemnik when navigating to form
function safeNavigate(href) {
  if (typeof window.navigateTo === 'function') {
    try { window.navigateTo(href); return; } catch (e) { /* fallback */ }
  }
  location.hash = href;
}

const TILES = [
  { id: 'osoba', label: 'Osoba' },
  { id: 'osvc', label: 'OSVČ' },
  { id: 'firma', label: 'Firma' },
  { id: 'spolek', label: 'Spolek' },
  { id: 'stat', label: 'Státní instituce' },
  { id: 'zastupce', label: 'Zástupce' }
];

export async function render(root) {
  root.innerHTML = '<h2>Nový nájemník — vyber typ</h2><div class="tiles-row" style="display:flex;gap:12px;flex-wrap:wrap"></div>';
  const row = root.querySelector('.tiles-row');
  const moduleId = '050-najemnik';

  TILES.forEach(t => {
    const el = document.createElement('button');
    el.className = 'tile small';
    el.style.padding = '18px';
    el.style.minWidth = '140px';
    el.textContent = t.label;
    el.addEventListener('click', () => {
      safeNavigate(`#/m/${moduleId}/f/form?type=${t.id}&role=najemnik`);
    });
    row.appendChild(el);
  });
}
