import { icon } from './icons.js';

export function renderSidebar(root, modules = [], opts = {}) {
  if (!root) return;

  root.innerHTML = `
    <div class="panel-box w-64 rounded-xl shadow-sm border bg-white">
      <nav>
        <ul id="sb-list" class="space-y-1 py-2">
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
              ${m.tiles?.length ? `
                <div class="ml-8 mt-1 mb-2">
                  ${m.tiles.map(t => `<a href="#/m/${m.id}/t/${t.id}" class="block text-sm text-slate-600 hover:underline">${icon(t.icon || 'list')} ${t.title}</a>`).join('')}
                </div>
              ` : ''}
              ${m.forms?.length ? `
                <div class="ml-8 mb-2">
                  ${m.forms.map(f => `<a href="#/m/${m.id}/f/${f.id}" class="block text-sm text-slate-600 hover:underline">${icon(f.icon || 'form')} ${f.title}</a>`).join('')}
                </div>
              ` : ''}
            </li>
          `).join('')}
        </ul>
      </nav>
    </div>
  `;

  // Zvýraznění aktivního modulu
  const ul = root.querySelector('#sb-list');
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
  window.addEventListener('hashchange', markActive);
  markActive();
}
