// Jednoduchý a odolný renderer sidebaru
export function renderSidebar(root, modules = [], opts = {}) {
  if (!root) return;

  root.innerHTML = `
    <nav class="space-y-1 text-slate-900">
      <ul id="sb-list" class="space-y-1"></ul>
    </nav>
  `;
  const ul = root.querySelector('#sb-list');

  const list = (Array.isArray(modules) ? modules : []).map(m => {
    const first = m.defaultTile || m.tiles?.[0]?.id || '';
    const href  = `#/m/${m.id}${first ? `/t/${first}` : ''}`;
    return `<li>
      <a class="block px-3 py-2 rounded hover:bg-slate-100" data-mod="${m.id}" href="${href}">
        <span class="mr-2">${m.icon || '📁'}</span><span>${m.title}</span>
      </a>
    </li>`;
  }).join('');

  ul.innerHTML = list || `<li class="px-3 py-2 text-sm opacity-60">Žádné moduly</li>`;

  function markActive() {
    const hash = location.hash || '';
    const m = (/#\/m\/([^\/]+)/.exec(hash) || [])[1];
    ul.querySelectorAll('a[data-mod]').forEach(a => {
      const active = a.dataset.mod === m;
      a.classList.toggle('bg-slate-900', active);
      a.classList.toggle('text-white', active);
      a.classList.toggle('hover:bg-slate-100', !active);
    });
  }

  ul.addEventListener('click', (ev) => {
    const a = ev.target.closest('a[data-mod]');
    if (!a) return;
    const modId = a.dataset.mod;
    if (opts.onSelect) setTimeout(() => opts.onSelect(modId), 0);
  });

  window.addEventListener('hashchange', markActive);
  markActive();
}
