// Small chooser screen with 6 tiles. When user clicks one tile, navigate to the form for that type.
function getModuleIdFromHash() {
  try {
    const m = (location.hash || '').match(/#\/m\/([^\/]+)/);
    return m ? m[1] : null;
  } catch (e) { return null; }
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
  root.innerHTML = '<h2>Nový subjekt — vyber typ</h2><div class="tiles-row" style="display:flex;gap:12px;flex-wrap:wrap"></div>';
  const row = root.querySelector('.tiles-row');
  const moduleId = getModuleIdFromHash() || '030-pronajimatel';

  TILES.forEach(t => {
    const el = document.createElement('button');
    el.className = 'tile small';
    el.style.padding = '18px';
    el.style.minWidth = '140px';
    el.innerHTML = `<div style="font-size:18px">${t.label}</div>`;
    el.addEventListener('click', () => {
      // navigate to module form with type param
      window.navigateTo(`#/m/${moduleId}/f/form?type=${t.id}`);
    });
    row.appendChild(el);
  });
}
