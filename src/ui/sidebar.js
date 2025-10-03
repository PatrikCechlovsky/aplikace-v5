import { icon } from './icons.js';

/**
 * Renderuje sidebar, kde jsou moduly ve sbaleném stavu, a rozbalí se kliknutím na modul.
 * @param {HTMLElement} root
 * @param {Array} modules - pole modulů (z registry)
 * @param {Object} opts - { theme }
 */
export function renderSidebar(root, modules = [], opts = {}) {
  if (!root) return;

  // Theme podpora
  const panelClass = opts.theme === 'dark'
    ? 'rounded-xl bg-slate-900 border border-slate-700 shadow w-full text-white'
    : 'rounded-xl bg-white border shadow w-full';

  // Uchovávej otevřený modul v paměti (pro rerender)
  let openModId = null;

  // Funkce na vykreslení sidebaru podle otevřeného modulu
  function render() {
    root.innerHTML = `
      <div class="${panelClass} transition-colors duration-300">
        <nav>
          <ul id="sb-list" class="space-y-1 py-2">
            ${modules.map(m => {
              const isOpen = openModId === m.id;
              return `
                <li>
                  <button
                    class="flex items-center gap-2 w-full px-4 py-2 rounded-lg hover:bg-slate-800 transition font-medium text-base sidebar-link ${isOpen ? 'bg-slate-800 text-white' : ''}"
                    data-mod="${m.id}"
                    aria-expanded="${isOpen}"
                    tabindex="0"
                  >
                    <span class="transition-transform ${isOpen ? 'rotate-90' : ''}">${icon('chevron-right', '▶️')}</span>
                    <span class="text-xl">${icon(m.icon || 'folder')}</span>
                    <span>${m.title}</span>
                  </button>
                  <div class="${isOpen ? '' : 'hidden'} ml-8 mt-1 mb-2">
                    ${(m.tiles || []).map(t => `
                      <a href="#/m/${m.id}/t/${t.id}" class="block text-sm text-slate-300 hover:underline">
                        ${icon(t.icon || 'list')} ${t.title}
                      </a>
                    `).join('')}
                    ${(m.forms || []).map(f => `
                      <a href="#/m/${m.id}/f/${f.id}" class="block text-sm text-slate-300 hover:underline">
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

    // Eventy: klik na modul (rozbalí/sbalí)
    root.querySelectorAll('button[data-mod]').forEach(btn => {
      btn.onclick = (e) => {
        const modId = btn.dataset.mod;
        openModId = openModId === modId ? null : modId;
        render();
      };
    });

    // Zvýraznění aktivního modulu (jen pokud je rozbalený)
    const hash = location.hash || '';
    const activeMod = (/#\/m\/([^\/]+)/.exec(hash) || [])[1];
    root.querySelectorAll('button[data-mod]').forEach(btn => {
      btn.classList.toggle('ring-2', btn.dataset.mod === activeMod);
    });
  }

  // Otevřít modul podle hash (při načtení, nebo změně url)
  function openFromHash() {
    const hash = location.hash || '';
    const m = (/#\/m\/([^\/]+)/.exec(hash) || [])[1];
    if (m && openModId !== m) {
      openModId = m;
      render();
    }
  }

  // První render (vše zavřené)
  render();

  // Poslouchej změnu url pro otevření správného modulu
  window.addEventListener('hashchange', openFromHash);
}
