import { icon } from './icons.js';

// Klíče do localStorage
const FAV_TILES_KEY = 'favoriteTiles';         // oblíbené ve tvaru ['modul1/tile1', ...]
const FAV_TILES_ORDER_KEY = 'favoriteTilesOrder'; // pořadí jako ['modul1/tile1', ...]

// Načtení oblíbených
export function loadFavorites() {
  try {
    return JSON.parse(localStorage.getItem(FAV_TILES_KEY) || '[]') || [];
  } catch {
    return [];
  }
}

// Nastavení oblíbenosti (používej v nastavení nebo commonActions)
export function setFavorite(tileId, value = true) {
  let favs = loadFavorites();
  if (value) {
    if (!favs.includes(tileId)) favs.push(tileId);
  } else {
    favs = favs.filter(id => id !== tileId);
  }
  localStorage.setItem(FAV_TILES_KEY, JSON.stringify(favs));
  // Pokud odebereme, musíme i z pořadí
  let order = loadFavoriteOrder();
  if (!value) {
    order = order.filter(id => id !== tileId);
    localStorage.setItem(FAV_TILES_ORDER_KEY, JSON.stringify(order));
  }
}

// Načtení pořadí
export function loadFavoriteOrder() {
  try {
    return JSON.parse(localStorage.getItem(FAV_TILES_ORDER_KEY) || '[]') || [];
  } catch {
    return [];
  }
}
// Nastavení pořadí
export function setFavoriteOrder(orderArr) {
  localStorage.setItem(FAV_TILES_ORDER_KEY, JSON.stringify(orderArr));
}

// Nově: očista oblíbených po změnách modulů
export function sanitizeFavorites(modules = []) {
  const favs = loadFavorites();
  if (!Array.isArray(favs) || !favs.length) return;

  const valid = new Set();
  modules.forEach(m => {
    (m.tiles||[]).forEach(t => valid.add(`${m.id}/${t.id}`));
    (m.forms||[]).forEach(f => valid.add(`${m.id}/${f.id}`));
  });

  const cleaned = favs.filter(id => valid.has(id));
  localStorage.setItem(FAV_TILES_KEY, JSON.stringify(cleaned));

  const order = loadFavoriteOrder().filter(id => valid.has(id));
  localStorage.setItem(FAV_TILES_ORDER_KEY, JSON.stringify(order));
}

// Pomocná funkce pro typ tile
function tileType(mod, tile) {
  if (mod.tiles?.some(t => t.id === tile.id)) return 'Seznam';
  if (mod.forms?.some(f => f.id === tile.id)) return 'Formulář';
  return '';
}

// Větší dlaždice s nadpisem modulu a typem
function renderTile(mod, tile) {
  const tileId = `${mod.id}/${tile.id}`;
  return `
    <div class="tile-draggable group relative bg-white rounded-2xl p-5 shadow-lg flex flex-col min-w-[200px] max-w-lg min-h-[150px] border border-slate-200 hover:ring-2 hover:ring-blue-400 transition cursor-move" data-id="${tileId}">
      <div class="mb-1 text-xs font-semibold text-blue-700 uppercase tracking-wider flex items-center gap-1">
        ${icon(mod.icon || 'folder')} <span>${mod.title}</span>
      </div>
      <div class="flex items-center gap-2 text-2xl font-bold text-slate-800 mb-1">
        ${icon(tile.icon || 'tile')}
        <span>${tile.title}</span>
      </div>
      <div class="text-sm text-slate-500 font-medium mb-2">${tileType(mod, tile)}</div>
      <div class="mt-auto text-slate-500 text-sm">${tile.desc || ''}</div>
      <div class="absolute inset-0" style="z-index:1;">
        <a href="#/m/${mod.id}/t/${tile.id}" class="w-full h-full block" title="Otevřít"></a>
      </div>
      <div class="absolute top-3 right-3 z-10 opacity-40 pointer-events-none group-hover:opacity-60 select-none">
        <svg width="18" height="18" fill="currentColor" class="inline text-blue-300" viewBox="0 0 20 20"><path d="M7 4a3 3 0 1 1 6 0v1h1a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 0-1-1h1V4zm2 0a1 1 0 1 1 2 0v1h-2V4zm-3 3v7a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V7a1 1 0 0 0-1-1H6a1 1 0 0 0-1 1z"/></svg>
      </div>
    </div>
  `;
}

/**
 * Renderuje dashboard s pouze oblíbenými dlaždicemi v pořadí (drag&drop).
 * @param {HTMLElement} root
 * @param {Array} modules - pole modulů (např. Array.from(registry.values()))
 */
export function renderDashboardTiles(root, modules = []) {
  if (!root) return;

  const favIds = loadFavorites();
  let favOrder = loadFavoriteOrder();
  // fallback: pokud nemám uložené pořadí, použij pořadí podle favIds
  if (!favOrder.length) favOrder = favIds.slice();

  // Map id -> {mod, tile}
  const tileMap = {};
  modules.forEach(mod => {
    if (Array.isArray(mod.tiles)) {
      mod.tiles.forEach(tile => tileMap[`${mod.id}/${tile.id}`] = { mod, tile });
    }
    if (Array.isArray(mod.forms)) {
      mod.forms.forEach(tile => tileMap[`${mod.id}/${tile.id}`] = { mod, tile });
    }
  });

  // Vyber jen existující a oblíbené
  const favTiles = favOrder
    .filter(id => favIds.includes(id))
    .map(id => tileMap[id])
    .filter(Boolean);

  root.innerHTML = `
    <div id="fav-tiles-list" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      ${favTiles.length
        ? favTiles.map(({ mod, tile }) => renderTile(mod, tile)).join('')
        : `<div class="text-slate-400 col-span-full p-6 text-center">
            Nemáte žádné oblíbené dlaždice.<br>
            <span class="text-xs">Nastavte si je v modulu <b>Nastavení</b> &mdash; Osobní osnova.</span>
          </div>`
      }
    </div>
    ${favTiles.length ? `<div class="mt-4 text-xs text-slate-400 text-center italic">Dlaždice lze řadit tažením myší.</div>` : ''}
  `;

  // Drag & drop pomocí SortableJS (musíš mít v projektu, jinak napiš a dám fallback)
  if (window.Sortable && favTiles.length) {
    const list = document.getElementById('fav-tiles-list');
    if (list && !list._sortableAttached) {
      window.Sortable.create(list, {
        animation: 180,
        ghostClass: 'bg-blue-50',
        handle: '.tile-draggable', // celá dlaždice je "handle"
        draggable: '.tile-draggable',
        onEnd: function () {
          // Zjisti nové pořadí a ulož do localStorage
          const newOrder = Array.from(list.children)
            .map(tile => tile.getAttribute('data-id'))
            .filter(Boolean);
          setFavoriteOrder(newOrder);
        }
      });
      list._sortableAttached = true;
    }
  }
}
