import { icon } from './icons.js';

// Pomocné funkce pro práci s oblíbenými (localStorage)
const FAV_KEY = 'favoriteTiles';

function loadFavorites() {
  try {
    return JSON.parse(localStorage.getItem(FAV_KEY) || '[]') || [];
  } catch {
    return [];
  }
}
function saveFavorites(arr) {
  localStorage.setItem(FAV_KEY, JSON.stringify(arr));
}
function isFavorite(tileId) {
  return loadFavorites().includes(tileId);
}
function toggleFavorite(tileId) {
  let favs = loadFavorites();
  if (favs.includes(tileId)) {
    favs = favs.filter(id => id !== tileId);
  } else {
    favs.push(tileId);
  }
  saveFavorites(favs);
}

// Render jedné dlaždice
function renderTile(mod, tile) {
  const tileId = `${mod.id}/${tile.id}`;
  const fav = isFavorite(tileId);
  return `
    <div class="relative bg-slate-800 rounded-xl p-4 shadow flex flex-col min-w-[220px] max-w-xs transition hover:ring-2 hover:ring-blue-500">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2 text-xl text-white">
          ${icon(tile.icon || mod.icon || 'tile')}
          <span class="font-bold">${tile.title}</span>
        </div>
        <button
          class="star-btn"
          data-tile="${tileId}"
          title="${fav ? 'Odebrat z oblíbených' : 'Přidat do oblíbených'}"
        >
          <span class="text-2xl select-none transition ${fav ? 'text-yellow-400' : 'text-slate-400'}">${fav ? '★' : '☆'}</span>
        </button>
      </div>
      <div class="mt-2 text-slate-300 text-sm">${tile.desc || ''}</div>
      <div class="mt-2 flex flex-wrap gap-1">
        <!-- Štítky -->
        ${(tile.tags || []).map(tag => `<span class="text-xs bg-blue-900 text-blue-200 px-2 py-0.5 rounded">${tag}</span>`).join('')}
      </div>
      <a href="#/m/${mod.id}/t/${tile.id}" class="absolute inset-0" title="Otevřít"></a>
    </div>
  `;
}

/**
 * Renderuje dashboard s dlaždicemi všech (nebo oblíbených) tiles všech modulů.
 * @param {HTMLElement} root
 * @param {Array} modules - pole modulů (např. Array.from(registry.values()))
 * @param {Object} opts - { onlyFavorites }
 */
export function renderDashboardTiles(root, modules = [], opts = {}) {
  if (!root) return;

  // Sestav pole všech tiles ze všech modulů
  let allTiles = [];
  modules.forEach(mod => {
    if (Array.isArray(mod.tiles)) {
      mod.tiles.forEach(tile => {
        allTiles.push({ mod, tile });
      });
    }
  });

  // Filtrovat jen oblíbené?
  if (opts.onlyFavorites) {
    const favIds = loadFavorites();
    allTiles = allTiles.filter(({ mod, tile }) => favIds.includes(`${mod.id}/${tile.id}`));
  }

  root.innerHTML = `
    <div class="mb-4 flex items-center gap-2">
      <span class="text-lg font-bold text-slate-700 dark:text-slate-200">Hlavní panel</span>
      <button id="showFavorites" class="ml-2 px-2 py-1 rounded border text-xs ${opts.onlyFavorites ? 'bg-yellow-300 text-yellow-900' : 'bg-white'}">Oblíbené</button>
      <button id="showAll" class="px-2 py-1 rounded border text-xs ${!opts.onlyFavorites ? 'bg-blue-100 text-blue-900' : 'bg-white'}">Vše</button>
    </div>
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
      ${allTiles.length
        ? allTiles.map(({ mod, tile }) => renderTile(mod, tile)).join('')
        : '<div class="text-slate-500 col-span-full p-6 text-center">Žádné dlaždice k zobrazení.</div>'
      }
    </div>
  `;

  // Akce pro hvězdičky
  root.querySelectorAll('.star-btn').forEach(btn => {
    btn.onclick = (e) => {
      e.preventDefault();
      const tileId = btn.getAttribute('data-tile');
      const fav = isFavorite(tileId);
      if (confirm(fav ? 'Chcete odebrat z oblíbených?' : 'Chcete přidat do oblíbených?')) {
        toggleFavorite(tileId);
        renderDashboardTiles(root, modules, opts); // rerender
      }
    };
  });

  // Přepínače (Oblíbené / Vše)
  root.querySelector('#showFavorites')?.addEventListener('click', () => {
    renderDashboardTiles(root, modules, { onlyFavorites: true });
  });
  root.querySelector('#showAll')?.addEventListener('click', () => {
    renderDashboardTiles(root, modules, { onlyFavorites: false });
  });
}
