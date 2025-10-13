// ========== Imports ==========
import './auth.js'; // vyžádá přihlášení na app.html
import { MODULE_SOURCES } from './app/modules.index.js';
import { renderHomeButton } from './ui/homebutton.js';
import { renderHeaderActions } from './ui/headerActions.js';
import { renderSidebar } from './ui/sidebar.js';
import { setBreadcrumb } from './ui/breadcrumb.js';
import { renderCommonActions } from './ui/commonActions.js';
import { renderDashboardTiles, loadFavorites, setFavorite, sanitizeFavorites } from './ui/content.js';
import './supabase.js';

// ========== Mini utils ==========
const $id = (id) => document.getElementById(id);

export function navigateTo(hash) {
  if (!hash.startsWith('#')) hash = '#' + hash;
  if (location.hash === hash) {
    route(); // vynutit rerender
  } else {
    location.hash = hash;
  }
}
window.navigateTo = navigateTo;

// ===== Renderer shim =============================================
async function runRenderer(modPromise, root, params, debugTag) {
  try {
    const mod = await modPromise;
    const r =
      (mod && mod.render) ||
      (mod && mod.default && mod.default.render) ||
      (mod && typeof mod.default === 'function' ? mod.default : null) ||
      (typeof mod === 'function' ? mod : null);

    if (typeof r !== 'function') throw new Error(`Renderer missing in ${debugTag}`);
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

// ========== Registr modulů ==========
const registry = new Map();

function extractImportPath(fn) {
  try {
    const s = fn.toString();
    const m = s.match(/import\(['"`]([^'"`]+)['"`]\)/);
    return m ? m[1] : null;
  } catch {
    return null;
  }
}

async function initModules() {
  for (const src of MODULE_SOURCES) {
    const rel = extractImportPath(src);
    const abs = '/src/app/' + rel;
    const norm = abs.replace('/src/app/../', '/src/');
    const baseDir = norm.replace(/\/module\.config\.js$/, '');

    const mod = await src();
    const manifest = (await mod.getManifest?.()) || {};
    if (!manifest?.id) continue;

    registry.set(manifest.id, { ...manifest, baseDir });
  }
}
window.registry = registry;

// ========== Router ==========
export async function route() {
  const c = $id('content');
  const crumb = $id('crumb');
  const commonActions = $id('commonactions');
  if (!c) return;

  try {
    const h = location.hash || '#/';
    const m = h.match(/^#\/m\/([^/]+)(?:\/([tf])\/([^/]+))?/);

    // Dashboard
    if (!m) {
      setBreadcrumb(crumb, [{ icon: 'home', label: 'Domů' }]);
      if (commonActions) commonActions.innerHTML = '';
      renderDashboardTiles(c, Array.from(window.registry.values()));
      return;
    }

    // Parsování modulu
    const rawModId = m[1];
    const modId = rawModId ? decodeURIComponent(rawModId) : null;

    // Fallbacky: prázdný/undefined/neexistující modul → dashboard
    if (!modId || modId === 'undefined' || !registry.get(modId)) {
      if (location.hash !== '#/') {
        navigateTo('#/');
        return;
      }
      setBreadcrumb(crumb, [{ icon: 'home', label: 'Domů' }]);
      if (commonActions) commonActions.innerHTML = '';
      renderDashboardTiles(c, Array.from(window.registry.values()));
      return;
    }

    const kind = m[2] === 'f' ? 'form' : 'tile';
    const secId = m[3] ? decodeURIComponent(m[3]) : null;
    const mod = registry.get(modId);

    // Pokud je pouze modul bez sekce, přesměruj na default sekci
    if (mod && !m[2]) {
      const def = mod?.defaultTile || (mod?.tiles?.[0]?.id || mod?.forms?.[0]?.id);
      if (def) {
        if (mod?.tiles?.some(t => t.id === def)) {
          location.hash = `#/m/${modId}/t/${def}`;
        } else {
          location.hash = `#/m/${modId}/f/${def}`;
        }
        return;
      }
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
      crumbs.push({ icon: kind === 'tile' ? 'list' : 'form', label });
    }
    setBreadcrumb(crumb, crumbs);

    // Common actions (demo + hvězdička)
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

    // Dynamický import rendereru
    const rel = kind === 'form' ? `forms/${tileId}.js` : `tiles/${tileId}.js`;
    const path = `${mod.baseDir}/${rel}`;
    const pathWithCb = path + (path.includes('?') ? '&' : '?') + 'v=' + Date.now();
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

// ========== Ochrana rozdělané práce ==========
let hasUnsavedChanges = false;
export function setUnsaved(flag) { hasUnsavedChanges = !!flag; }

window.addEventListener('beforeunload', (e) => {
  if (hasUnsavedChanges) { e.preventDefault(); e.returnValue = ''; return ''; }
});
window.addEventListener('hashchange', () => {
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
    renderHeaderActions($id('headeractions'));
    await initModules();

    // po načtení registru očistíme oblíbené od neexistujících dlaždic
    sanitizeFavorites(Array.from(registry.values()));

    renderSidebar($id('sidebarbox'), Array.from(registry.values()));

    // Zpřístupni closeAll pro home button
    window.renderSidebar = renderSidebar;

    renderHomeButton($id('homebtnbox'), {
      appName: 'Pronajímatel',
      onHome: () => {
        if (window.renderSidebar && typeof window.renderSidebar.closeAll === 'function') {
          window.renderSidebar.closeAll();
        }
        if (hasUnsavedChanges) {
          if (!confirm('Máte rozdělanou práci. Opravdu chcete odejít bez uložení?')) return;
        }
        location.hash = "#/";
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
