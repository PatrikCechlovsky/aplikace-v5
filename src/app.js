// ========== Imports ==========
import { MODULE_SOURCES } from './app/modules.index.js';
import { icon } from './ui/icons.js';
import { renderHomeButton } from './ui/homebutton.js';
import { renderHeaderActions } from './ui/headerActions.js';
import { renderSidebar } from './ui/sidebar.js';
import { setBreadcrumb } from './ui/breadcrumb.js';
import { renderCommonActions } from './ui/commonActions.js';
import { renderDashboardTiles, loadFavorites, setFavorite } from './ui/content.js';
import './supabase.js';
import './auth.js'; // zajistí requireAuthOnApp() na app.html

// ========== Mini utils ==========
const $ = (sel) => document.querySelector(sel);
const $id = (id) => document.getElementById(id);

export function navigateTo(hash) {
  if (!hash.startsWith('#')) hash = '#' + hash;
  if (location.hash === hash) {
    route(); // vynutit rerender
  } else {
    location.hash = hash;
  }
}

// ===== Renderer shim ("airbag") =============================================
async function runRenderer(modPromise, root, params, debugTag) {
  try {
    const mod = await modPromise;

    const r =
      (mod && mod.render) ||
      (mod && mod.default && mod.default.render) ||
      (mod && typeof mod.default === 'function' ? mod.default : null) ||
      (typeof mod === 'function' ? mod : null);

    console.log('[ROUTE]', debugTag, mod ? Object.keys(mod) : '(no module export)');

    if (typeof r !== 'function') {
      throw new Error(`Renderer missing in ${debugTag}`);
    }
    await r(root, params);
  } catch (err) {
    console.error('[ROUTE ERROR]', debugTag, err);
    if (root) {
      root.innerHTML = `
        <div class="p-3 rounded bg-red-50 border border-red-200 text-red-700 text-sm">
          Nepodařilo se načíst modul/sekci.<br>
          <code>${debugTag}</code><br>
          ${err?.message || err}
        </div>`;
    }
  }
}

// ========== Registry modulů z manifestů ==========
const registry = new Map();

// Získá import(path) z lazy funkce () => import('…')
function extractImportPath(fn) {
  try {
    const str = String(fn);
    const m = str.match(/import\((['"])(.*?)\1\)/);
    return m ? m[2] : null;   // ← SPRÁVNĚ: vrací skutečnou cestu z importu
  } catch {
    return null;
  }
}

// v app.js
async function initModules() {
  for (const src of MODULE_SOURCES) {
    const rel = extractImportPath(src);
    if (!rel) continue;

    // relativní -> absolutní vůči /src/app/
    let abs = rel.startsWith('/') ? rel : '/src/app/' + rel;
    abs = abs.replace('/src/app/../', '/src/');

    // baseDir modulu (bez /module.config.js)
    const baseDir = abs.replace(/\/module\.config\.js$/, '');

    // ⬇️ DŮLEŽITÉ: vezmi default nebo getManifest(), případně manifest property
    const mod = await src();
    const manifest =
      mod?.default ||
      (await mod.getManifest?.()) ||
      mod?.manifest ||
      null;

    if (!manifest || !manifest.id) {
      console.warn('[modules] manifest chybí nebo bez id:', mod);
      continue;
    }

    registry.set(manifest.id, { ...manifest, baseDir });
  }
}

// pokud registry ještě nevznikla, vytvoř ji jako Map
window.registry = (window.registry instanceof Map) ? window.registry : registry;


// ========== Router ==========
export async function route() { // <-- export!
  const c = $id('content');
  const crumb = $id('crumb');
  const commonActions = $id('commonactions');

  try {
    const hash = location.hash || '#/';
    const m = hash.match(/^#\/(?:m\/([^/]+)(?:\/(t|f)\/([^/]+))?)?$/);

    // Domů: žádný modul v URL
    if (!m) {
      setBreadcrumb(crumb, [{ icon: 'home', label: 'Domů' }]);
      if (commonActions) commonActions.innerHTML = '';
      renderDashboardTiles(c, Array.from(window.registry.values()));
      return;
    }

    const modId = decodeURIComponent(m[1]);
    const kind = m[2] === 'f' ? 'form' : 'tile';
    // ✂️ odřízneme query string ze jména sekce (např. "form?id=…" -> "form")
    const rawSec = m[3] ? decodeURIComponent(m[3]) : null;
    const secId = rawSec ? rawSec.split('?')[0] : null;
    const mod = registry.get(modId);

    if (!mod) {
      setBreadcrumb(crumb, [{ icon: 'home', label: 'Domů' }]);
      if (commonActions) commonActions.innerHTML = '';
      c.innerHTML = `<div class="p-3 rounded bg-red-50 border border-red-200 text-red-700">
        Modul <b>${modId}</b> nenalezen.
      </div>`;
      return;
    }

    // Pokud není specifikovaná sekce, pošli uživatele na výchozí
    if (!secId) {
      const defaultTile = mod.defaultTile || (mod.tiles?.[0]?.id || mod.forms?.[0]?.id);
      if (defaultTile) {
        if (mod?.tiles?.some(t => t.id === defaultTile)) {
          location.hash = `#/m/${modId}/t/${defaultTile}`;
        } else {
          location.hash = `#/m/${modId}/f/${defaultTile}`;
        }
        return;
      }
    }

    // Dashboard (domů)
    if (!m) {
      setBreadcrumb(crumb, [{ icon: 'home', label: 'Domů' }]);
      if (commonActions) commonActions.innerHTML = '';
      renderDashboardTiles(c, Array.from(window.registry.values()));
      return;
    }

    const tileId = secId || mod.defaultTile || (mod.tiles?.[0]?.id || mod.forms?.[0]?.id || null);

    // Breadcrumbs
    const crumbs = [
      { icon: 'home', label: 'Domů', href: '#/' },
      { icon: mod.icon || 'folder', label: mod.title, href: `#/m/${mod.id}` }
    ];
    if (tileId) {
      const label = (kind === 'tile'
        ? (mod.tiles?.find(t => t.id === tileId)?.title || tileId)
        : (mod.forms?.find(f => f.id === tileId)?.title || tileId));
      crumbs.push({
        icon: kind === 'tile' ? 'list' : 'form',
        label
      });
    }
    setBreadcrumb(crumb, crumbs);

    // Common Actions (demo hvězdička; vlastní akce vykreslují jednotlivé moduly)
    if (commonActions) {
      let starTileId = null;
      if (tileId) starTileId = modId + '/' + tileId;
      const favIds = loadFavorites();
      const isStar = starTileId && favIds.includes(starTileId);

      renderCommonActions(commonActions, {
        onAdd: () => alert('Přidat (demo)'),
        onEdit: () => alert('Upravit (demo)'),
        onArchive: () => alert('Archivovat (demo)'),
        onRefresh: () => alert('Obnovit (demo)'),
        onAttach: () => alert('Příloha (demo)'),
        ...(starTileId && {
          onStar: () => {
            setFavorite(starTileId, !isStar);
            route();
          },
          isStarred: isStar
        })
      });
    }

    // Načtení skutečného obsahu sekce (dynamický import)
    const rel = kind === 'form' ? `forms/${tileId}.js` : `tiles/${tileId}.js`;
    const path = `${mod.baseDir}/${rel}`;
    const pathWithCb = path + (path.includes('?') ? '&' : '?') + 'v=' + Date.now();

    // 🪪 pro rychlou diagnostiku
    window.__lastRouteDebug = { pathWithCb, kind, secId, modId, baseDir: mod.baseDir };

    c.innerHTML = `<div class="p-2 text-slate-500">Načítám ${pathWithCb}…</div>`;
    try {
      const imported = await import(pathWithCb);
      await runRenderer(Promise.resolve(imported), c, {}, `path=${pathWithCb}`);
    } catch (err) {
      c.innerHTML = `<div class="p-3 rounded bg-red-50 border border-red-200 text-red-700">
        Import selhal: ${err?.message || err}
      </div>`;
    }

  } catch (err) {
    c.innerHTML = `<div class="p-3 rounded bg-red-50 border border-red-200 text-red-700">
      Chyba v routeru: ${err?.message || err}
    </div>`;
  }
}

// ========== Varování při neuložených změnách ==========
let hasUnsavedChanges = false;
export function setUnsaved(state) {
  hasUnsavedChanges = !!state;
}
window.addEventListener('beforeunload', function (e) {
  if (hasUnsavedChanges) {
    e.preventDefault();
    e.returnValue = '';
    return '';
  }
});
window.addEventListener('hashchange', function (e) {
  if (hasUnsavedChanges) {
    if (!confirm('Máte rozdělanou práci. Opravdu chcete odejít bez uložení?')) {
      history.back();
      setTimeout(() => { setUnsaved(true); }, 10);
    } else {
      hasUnsavedChanges = false;
    }
  }
});

// ========== Init ==========
(async function start() {
  try {
    // Header: home button a akce
    renderHeaderActions($id('headeractions'));

    await initModules();

    // Render sidebar a zpřístupni closeAll pro homebutton
    renderSidebar($id('sidebarbox'), Array.from(registry.values()));
    // Zpřístupni funkci closeAll globálně
    window.renderSidebar = renderSidebar;

    renderHomeButton($id('homebtnbox'), {
      appName: 'Pronajímatel',
      onHome: () => {
        setBreadcrumb($id('crumb'), [{ icon: 'home', label: 'Domů' }]);
        if ($id('commonactions')) $id('commonactions').innerHTML = '';
        renderDashboardTiles($id('content'), Array.from(window.registry.values()));
      },
      onCloseAll: () => {
        setBreadcrumb($id('crumb'), [{ icon: 'home', label: 'Domů' }]);
        if ($id('commonactions')) $id('commonactions').innerHTML = '';
        renderDashboardTiles($id('content'), Array.from(window.registry.values()));
        renderSidebar($id('sidebarbox'), Array.from(registry.values()), { closeAll: true });
      }
    });

    window.addEventListener('hashchange', route);
    route();

  } catch (err) {
    const c = $id('content');
    if (c) c.innerHTML = `<div class="p-3 rounded bg-red-50 border border-red-200 text-red-700">
      Inicializace selhala: ${err?.message || err}
    </div>`;
  }
})();

// ========== Nepoužívané/legacy funkce (ponecháno zakomentováno) ==========
// import { renderHeader } from './ui/header.js'; // už nepoužíváme
// function renderSidebar() { ... } // už nepoužíváme, vše řeší renderSidebar z ui/sidebar.js
