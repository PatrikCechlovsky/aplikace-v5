import { icon } from './icons.js';

// Pomocné funkce pro práci s oblíbenými (localStorage)
const FAV_KEY = 'favoriteTiles';

export function loadFavorites() {
  try {
    return JSON.parse(localStorage.getItem(FAV_KEY) || '[]') || [];
  } catch {
    return [];
  }
}

// Tento export použij pro přidávání/odebírání oblíbených z jiných částí (commonActions apod.)
export function setFavorite(tileId, value = true) {
  let favs = loadFavorites();
  if (value) {
    if (!favs.includes(tileId)) favs.push(tileId);
  } else {
    favs = favs.filter(id => id !== tileId);
  }
  localStorage.setItem(FAV_KEY, JSON.stringify(favs));
}

// Render jedné dlaždice (bez hvězdičky, protože na dashboardu už ji nenastavuješ)
function renderTile(mod, tile) {
  const tileId = `${mod.id}/${tile.id}`;
  return `
    <div class="relative bg-white rounded-xl p-4 shadow flex flex-col min-w-[220px] max-w-xs border border-slate-200 hover:ring-2 hover:ring-blue-400 transition">
      <div class="flex items-center gap-2 text-xl text-slate-800 font-bold">
        ${icon(tile.icon || mod.icon || 'tile')}
        <span>${tile.title}</span>
      </div>
      <div class="mt-2 text-slate-500 text-sm">${tile.desc || ''}</div>
      <div class="mt-2 flex flex-wrap gap-1">
        ${(tile.tags || []).map(tag => `<span class="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">${tag}</span>`).join('')}
      </div>
      <a href="#/m/${mod.id}/t/${tile.id}" class="absolute inset-0" title="Otevřít"></a>
    </div>
  `;
}

/**
 * Renderuje dashboard s pouze oblíbenými dlaždicemi.
 * @param {HTMLElement} root
 * @param {Array} modules - pole modulů (např. Array.from(registry.values()))
 */
export function renderDashboardTiles(root, modules = []) {
  if (!root) return;

  // Sestav pole všech tiles ze všech modulů
  const favIds = loadFavorites();
  let favTiles = [];
  modules.forEach(mod => {
    if (Array.isArray(mod.tiles)) {
      mod.tiles.forEach(tile => {
        if (favIds.includes(`${mod.id}/${tile.id}`)) {
          favTiles.push({ mod, tile });
        }
      });
    }
    // Pro rozšíření: můžeš přidat i forms/funkce apod.
  });

  root.innerHTML = `
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
      ${favTiles.length
        ? favTiles.map(({ mod, tile }) => renderTile(mod, tile)).join('')
        : '<div class="text-slate-400 col-span-full p-6 text-center">Nemáte žádné oblíbené dlaždice.<br><span class="text-xs">Nastavte si je v modulu <b>Nastavení</b> &mdash; Osobní osnova.</span></div>'
      }
    </div>
  `;
}
