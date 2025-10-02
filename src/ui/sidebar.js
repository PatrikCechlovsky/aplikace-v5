// Jednoduchý a odolný renderer sidebaru
import { icon } from './icons.js';

export function renderSidebar(root, modules = [], opts = {}) {
  if (!root) return;

  root.innerHTML = `
    <nav class="pt-2 pl-2">
      <ul id="sb-list" class="space-y-1">
        ${modules.map(m => `
          <li>
            <a
              class="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-slate-100 transition font-medium text-base sidebar-link"
              data-mod="${m.id}"
              href="#/m/${m.id}/t/${m.defaultTile || m.tiles?.[0]?.id || ''}"
            >
              <span class="text-xl">${icon(m.icon || 'folder')}</span>
              <span>${m.title}</span>
            </a>
          </li>
        `).join('')}
      </ul>
    </nav>
  `;
  // zbytek beze změny
}

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
