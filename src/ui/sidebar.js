// src/ui/sidebar.js
// Robustní render s logy + explicitní barvou textu (kdyby ji něco přepisovalo).

export function renderSidebar(root, modules = [], opts = {}) {
  if (!root) { console.warn('[SIDEBAR] root je null'); return; }

  root.innerHTML = `
    <nav class="space-y-1 text-slate-900">
      <ul id="sb-list" class="space-y-1"></ul>
    </nav>
  `;

  const ul = root.querySelector('#sb-list');
  if (!ul) { console.warn('[SIDEBAR] chybí #sb-list'); return; }

  if (!Array.isArray(modules) || modules.length === 0) {
    ul.innerHTML = `<li class="px-3 py-2 text-sm opacity-60">Žádné moduly</li>`;
    console.warn('[SIDEBAR] modules je prázdné');
    return;
  }

  modules.forEach(m => {
    const li = document.createElement('li');
    const a  = document.createElement('a');
    const firstTile = m.defaultTile || m.tiles?.[0]?.id;
    a.href = `#/m/${m.id}${firstTile ? `/t/${firstTile}` : ''}`;
    a.dataset.mod = m.id;
    a.className = 'block px-3 py-2 rounded hover:bg-slate-100';
    a.innerHTML = `<span class="mr-2">${m.icon || '📁'}</span><span>${m.title}</span>`;
    li.appendChild(a);
    ul.appendChild(li);
  });

  function markActive() {
    const hash = location.hash || '';
    const m = (/#\/m\/([^\/]+)/.exec(hash) || [])[1] || modules[0]?.id || '';
    ul.querySelectorAll('a[data-mod]').forEach(a => {
      const active = a.dataset.mod === m;
      a.classList.toggle('bg-slate-900', active);
      a.classList.toggle('text-white', active);
      a.classList.toggle('hover:bg-slate-100', !active);
    });
  }

  ul.addEventListener('click', ev => {
    const a = ev.target.closest('a[data-mod]');
    if (!a) return;
    const mod = modules.find(x => x.id === a.dataset.mod);
    if (opts.onSelect && mod) setTimeout(() => opts.onSelect(mod), 0);
  });

  window.addEventListener('hashchange', markActive);
  markActive();

  console.log('[SIDEBAR] rendered items:', ul.children.length);
}
