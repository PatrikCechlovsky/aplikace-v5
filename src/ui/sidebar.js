import { icon } from './icons.js';

// Uložení otevřeného modulu globálně (kvůli homebutton)
let openModId = null;

export function renderSidebar(root, modules = [], opts = {}) {
  if (!root) return;

  // Theme a barvy
  const panelClass = opts.theme === 'dark'
    ? 'rounded-xl bg-slate-900 border border-slate-700 shadow w-full text-white'
    : 'rounded-xl bg-white border border-slate-200 shadow w-full';

  // Zjisti aktuální modul a sekci z hash
  function getCurrent() {
    const hash = location.hash || '';
    const m = (/#\/m\/([^\/]+)/.exec(hash) || [])[1];
    const t = (/#\/m\/([^\/]+)\/[tf]\/([^\/]+)/.exec(hash) || [])[2];
    return { mod: m, tile: t };
  }

  function render() {
    const { mod: activeMod, tile: activeTile } = getCurrent();

    root.innerHTML = `
      <div class="${panelClass} transition-colors duration-300">
        <nav>
          <ul id="sb-list" class="space-y-1 py-2">
            ${modules.map(m => {
              const isOpen = openModId === m.id;
              // Aktivní modul decentně zvýraznit
              const activeModuleClass = isOpen
                ? 'bg-blue-50 border border-blue-300 text-blue-900 shadow-sm'
                : 'hover:bg-blue-100';

              return `
                <li>
                  <button
                    class="flex items-center gap-2 w-full px-4 py-2 rounded-lg font-semibold transition sidebar-link ${activeModuleClass}"
                    data-mod="${m.id}"
                    aria-expanded="${isOpen}"
                    tabindex="0"
                    style="outline: none;"
                  >
                    <span class="transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}">${icon('chevron-right', '▶️')}</span>
                    <span class="text-xl">${icon(m.icon || 'folder')}</span>
                    <span>${m.title}</span>
                  </button>
                  <div class="${isOpen ? '' : 'hidden'} ml-8 mt-1 mb-2">
                    ${(m.tiles || []).map(t => `
                      <a href="#/m/${m.id}/t/${t.id}"
                        class="block text-sm rounded px-2 py-1 transition font-medium
                          ${activeMod === m.id && activeTile === t.id
                            ? 'bg-blue-100 text-blue-900'
                            : 'text-slate-600 hover:bg-blue-50 hover:text-blue-900'
                          }"
                      >
                        ${icon(t.icon || 'list')} ${t.title}
                      </a>
                    `).join('')}
                    ${(m.forms || []).map(f => `
                      <a href="#/m/${m.id}/f/${f.id}"
                        class="block text-sm rounded px-2 py-1 transition font-medium
                          ${activeMod === m.id && activeTile === f.id
                            ? 'bg-blue-100 text-blue-900'
                            : 'text-slate-600 hover:bg-blue-50 hover:text-blue-900'
                          }"
                      >
                        ${icon(f.icon || 'form')} ${f.title}
                      </a>
                    `).join('')}
                  </div>
                </li>
              `;
            }).join('')}
          </ul>
        </nav>
      </div>
    `;

    // Klik na modul (rozbalí/sbalí)
    root.querySelectorAll('button[data-mod]').forEach(btn => {
      btn.onclick = (e) => {
      const modId = btn.dataset.mod;
      if (openModId !== modId) {
        // najdi defaultTile
        const mod = modules.find(m => m.id === modId);
        const defaultId = mod?.defaultTile || (mod?.tiles?.[0]?.id || mod?.forms?.[0]?.id);
        if (defaultId) {
          location.hash = `#/m/${modId}/t/${defaultId}`;
        } else {
          location.hash = `#/m/${modId}`;
        }
      } else {
        openModId = null;
        render();
      }
    };
  }

  // Otevřít modul podle hash (např. kliknutí v contentu)
  function openFromHash() {
    const { mod } = getCurrent();
    if (mod && openModId !== mod) {
      openModId = mod;
      render();
    }
  }

  // Home button volá tuto funkci pro zavření všeho:
  renderSidebar.closeAll = function() {
    openModId = null;
    render();
  };

  // První render (vše zavřené)
  render();

  // Poslouchej změnu url pro otevření správného modulu
  window.addEventListener('hashchange', openFromHash);
}
