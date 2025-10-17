import { icon } from './icons.js';

/**
 * Renderuje sidebar, kde jsou moduly ve sbaleném stavu. Kliknutím na modul se rozbalí a otevře se jeho výchozí sekce.
 * @param {HTMLElement} root
 * @param {Array} modules - pole modulů (z registry)
 * @param {Object} opts - { theme }
 */
export function renderSidebar(root, modules = [], opts = {}) {
  if (!root) return;

  const panelClass = opts.theme === 'dark'
    ? 'rounded-xl bg-slate-900 border border-slate-700 shadow w-full text-white'
    : 'rounded-xl bg-white border border-slate-200 shadow w-full';

  // Uchovávej otevřený modul v paměti
  let openModId = null;

  function render() {
    // Získat aktivní tile/form z hash
    const hash = location.hash || '';
    const match = hash.match(/^#\/m\/([^/]+)\/([tf])\/([^/?]+)/);
    const activeMod = match ? match[1] : null;
    const activeKind = match ? match[2] : null; // 't' nebo 'f'
    const activeSection = match ? match[3] : null; // id sekce

    root.innerHTML = `
      <div class="${panelClass} transition-colors duration-300">
        <nav>
          <ul id="sb-list" class="space-y-1 py-2">
            ${modules.map(m => {
              const isOpen = openModId === m.id;
              const activeModuleClass = isOpen
                ? 'bg-blue-50 border border-blue-300 text-blue-900 shadow-sm'
                : 'hover:bg-blue-100';

              // Tiles & forms s aktivní třídou
              const tileLinks = (m.tiles || []).map(t => {
                const isActive = m.id === activeMod && activeKind === 't' && t.id === activeSection;
                return `
                  <a href="#/m/${m.id}/t/${t.id}"
                    class="block text-sm rounded px-2 py-1 transition font-medium
                      ${isActive ? 'bg-blue-100 text-blue-900 font-semibold border border-blue-200' : 'text-slate-600 hover:bg-blue-50 hover:text-blue-900'}"
                  >
                    ${icon(t.icon || 'list')} ${t.title}
                  </a>
                `;
              }).join('');

              const formLinks = (m.forms || []).map(f => {
                const isActive = m.id === activeMod && activeKind === 'f' && f.id === activeSection;
                return `
                  <a href="#/m/${m.id}/f/${f.id}"
                    class="block text-sm rounded px-2 py-1 transition font-medium
                      ${isActive ? 'bg-blue-100 text-blue-900 font-semibold border border-blue-200' : 'text-slate-600 hover:bg-blue-50 hover:text-blue-900'}"
                  >
                    ${icon(f.icon || 'form')} ${f.title}
                  </a>
                `;
              }).join('');

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
                    ${tileLinks}
                    ${formLinks}
                  </div>
                </li>
              `;
            }).join('')}
          </ul>
        </nav>
      </div>
    `;

    // Klik na modul (přesměruje na defaultTile/form)
    root.querySelectorAll('button[data-mod]').forEach(btn => {
      btn.onclick = (e) => {
        const modId = btn.dataset.mod;
        if (openModId !== modId) {
          // najdi defaultTile/form
          const mod = modules.find(m => m.id === modId);
          const defaultId =
            mod?.defaultTile ||
            (mod?.tiles?.[0]?.id || mod?.forms?.[0]?.id);
          if (defaultId) {
            // Upřednostni tile, pokud je k dispozici, jinak form
            if (mod?.tiles?.some(t => t.id === defaultId)) {
              location.hash = `#/m/${modId}/t/${defaultId}`;
            } else {
              location.hash = `#/m/${modId}/f/${defaultId}`;
            }
            // otevře se sekce a sidebar bude znovu vykreslen podle hashchange
          } else {
            // Pokud není sekce, pouze rozbal
            openModId = modId;
            render();
          }
        } else {
          openModId = null;
          render();
        }
      };
    });

    // Zvýraznění aktivního modulu (jen pokud je rozbalený)
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
    } else {
      render(); // vždy renderuj, protože může změnit i aktivní sekci
    }
  }

  // Home button volá tuto funkci pro zavření všeho:
  renderSidebar.closeAll = function() {
    openModId = null;
    render();
  };

  // První render (vše zavřené)
  render();

  // Poslouchej změnu url pro otevření správného modulu nebo sekce
  window.addEventListener('hashchange', openFromHash);
}
