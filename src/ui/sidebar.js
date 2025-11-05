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

  // Uchovávej otevřený modul v paměti a otevřené kolapsibilní tiles
  let openModId = null;
  let openTileIds = {}; // { 'module-id': { 'tile-id': true } }

  function render() {
    // Získat aktivní tile/form z hash
    const hash = location.hash || '';
    const match = hash.match(/^#\/m\/([^/]+)\/([tf])\/([^/?]+)/);
    const activeMod = match ? match[1] : null;
    const activeKind = match ? match[2] : null; // 't' nebo 'f'
    const activeSection = match ? match[3] : null; // id sekce

    // Helper to render tiles recursively (supports nested/collapsible tiles)
    function renderTile(t, modId, depth = 0) {
      const isActive = modId === activeMod && activeKind === 't' && t.id === activeSection;
      const hasChildren = t.children && t.children.length > 0;
      const tileOpenKey = `${modId}-${t.id}`;
      const isTileOpen = openTileIds[tileOpenKey] || false;
      const indentClass = depth > 0 ? `ml-${depth * 2}` : '';
      
      if (hasChildren && t.collapsible) {
        // Collapsible tile with children
        const childrenHtml = t.children.map(child => renderTile(child, modId, depth + 1)).join('');
        return `
          <div class="${indentClass}">
            <button
              class="flex items-center gap-1 w-full text-sm rounded px-2 py-1 transition font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-900"
              data-mod="${modId}"
              data-tile="${t.id}"
              data-toggle-tile="true"
            >
              <span class="transition-transform duration-200 ${isTileOpen ? 'rotate-90' : ''}">${icon('chevron-right', '▶️')}</span>
              ${icon(t.icon || 'list')} ${t.title}
            </button>
            <div class="${isTileOpen ? '' : 'hidden'} ml-4">
              ${childrenHtml}
            </div>
          </div>
        `;
      } else {
        // Regular tile (leaf or non-collapsible)
        return `
          <a href="#/m/${modId}/t/${t.id}"
            class="block text-sm rounded px-2 py-1 transition font-medium ${indentClass}
              ${isActive ? 'bg-blue-100 text-blue-900 font-semibold border border-blue-200' : 'text-slate-600 hover:bg-blue-50 hover:text-blue-900'}"
          >
            ${icon(t.icon || 'list')} ${t.title}
          </a>
        `;
      }
    }

    root.innerHTML = `
      <div class="${panelClass} transition-colors duration-300">
        <nav>
          <ul id="sb-list" class="space-y-1 py-2">
            ${modules.map(m => {
              const isOpen = openModId === m.id;
              const activeModuleClass = isOpen
                ? 'bg-blue-50 border border-blue-300 text-blue-900 shadow-sm'
                : 'hover:bg-blue-100';

              // Render tiles (supporting nested structure)
              const tileLinks = (m.tiles || []).map(t => renderTile(t, m.id)).join('');

              const formLinks = (m.forms || [])
                .filter(f => f.showInSidebar !== false) // Only show forms with showInSidebar !== false
                .map(f => {
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
    root.querySelectorAll('button[data-mod]:not([data-toggle-tile])').forEach(btn => {
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

    // Handle collapsible tile toggles
    root.querySelectorAll('button[data-toggle-tile]').forEach(btn => {
      btn.onclick = (e) => {
        e.preventDefault();
        const modId = btn.dataset.mod;
        const tileId = btn.dataset.tile;
        const tileOpenKey = `${modId}-${tileId}`;
        openTileIds[tileOpenKey] = !openTileIds[tileOpenKey];
        render();
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
    const match = hash.match(/^#\/m\/([^/]+)\/([tf])\/([^/?]+)/);
    const activeSection = match ? match[3] : null;
    
    if (m && openModId !== m) {
      openModId = m;
      
      // Auto-open parent collapsible tiles if activeSection is a child
      if (activeSection) {
        const mod = modules.find(mod => mod.id === m);
        if (mod && mod.tiles) {
          // Check if activeSection is a child of any collapsible tile
          for (const tile of mod.tiles) {
            if (tile.children && tile.children.some(child => child.id === activeSection)) {
              const tileOpenKey = `${m}-${tile.id}`;
              openTileIds[tileOpenKey] = true;
            }
          }
        }
      }
      
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
