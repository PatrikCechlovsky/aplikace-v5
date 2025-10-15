// ========== Imports – hlavní stavební části aplikace ==========
import { MODULE_SOURCES } from './app/modules.index.js';
import { icon } from './ui/icons.js';
import { renderHomeButton } from './ui/homebutton.js';
import { renderHeaderActions } from './ui/headerActions.js';
import { renderSidebar } from './ui/sidebar.js';
import { setBreadcrumb } from './ui/breadcrumb.js';
import { renderCommonActions } from './ui/commonActions.js';
import { renderDashboardTiles, loadFavorites, setFavorite } from './ui/content.js';
import './supabase.js';
import './auth.js';

// ========== Mini utils ==========
const $ = (sel) => document.querySelector(sel);
const $id = (id) => document.getElementById(id);

// ========== Registry modulů ==========
const registry = new Map();

function extractImportPath(fn) {
  try {
    const str = String(fn);
    const m = str.match(/import\((['"])(.*?)\1\)/);
    return m ? m[2] : null;
  } catch {
    return null;
  }
}

async function initModules() {
  for (const src of MODULE_SOURCES) {
    const rel = extractImportPath(src);
    if (!rel) continue;
    let abs = rel.startsWith('/') ? rel : '/src/app/' + rel;
    abs = abs.replace('/src/app/../', '/src/');
    const baseDir = abs.replace(/\/module\.config\.js$/, '');
    const mod = await src();

    // Správně získej manifest i přes asynchronní getManifest
    let manifest = null;
    if (typeof mod.getManifest === "function") {
      manifest = await mod.getManifest();
    } else if (mod?.default && typeof mod.default.getManifest === "function") {
      manifest = await mod.default.getManifest();
    } else if (mod?.default && typeof mod.default === "object") {
      manifest = mod.default;
    } else if (mod?.manifest) {
      manifest = mod.manifest;
    }

    if (!manifest || !manifest.id) continue;
    registry.set(manifest.id, { ...manifest, baseDir });
  }
}
window.registry = (window.registry instanceof Map) ? window.registry : registry;

// ... všechny importy atd.

export function navigateTo(hash) {
  if (!hash.startsWith('#')) hash = '#' + hash;
  if (location.hash === hash) {
    route(); // vynutit rerender
  } else {
    location.hash = hash;
  }
}

// ========== Layout – inicializace hlavních částí ==========
function renderLayout() {
  renderHeaderActions($id('headeractions'));
  renderSidebar($id('sidebarbox'), Array.from(registry.values()));
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
}

// ========== Generický router ==========
export async function route() {
  const c = $id('content');
  const crumb = $id('crumb');
  const commonActions = $id('commonactions');
  const hash = location.hash || '#/';
  const m = hash.match(/^#\/m\/([^/]+)\/(t|f)\/([^/?]+)(?:\?(.*))?$/);

  if (!m) {
    setBreadcrumb(crumb, [{ icon: 'home', label: 'Domů' }]);
    if (commonActions) commonActions.innerHTML = '';
    renderDashboardTiles(c, Array.from(window.registry.values()));
    return;
  }

  const modId = m[1];
  const kind = m[2];
  const section = m[3];
  const query = m[4] || '';

  const mod = window.registry.get(modId);
  if (!mod) {
    c.innerHTML = `<div style="color: red; font-weight: bold;">Modul <b>${modId ?? 'undefined'}</b> nenalezen.</div>`;
    return;
  }

  // Dynamický import JS souboru podle sekce
  const rel = kind === 'f' ? `forms/${section}.js` : `tiles/${section}.js`;
  const path = `${mod.baseDir}/${rel}`;
  const pathWithCb = path + '?v=' + Date.now();

  const params = { modId, kind, section };
  if (query) {
    for (const [k, v] of new URLSearchParams(query)) params[k] = v;
  }

  try {
    const imported = await import(pathWithCb);
    const renderFn = imported.render || imported.default?.render;
    if (typeof renderFn !== 'function') {
      c.innerHTML = `<div style="color: red;">Modul je poškozen: chybí exportovaná funkce <code>render</code>.</div>`;
      return;
    }
    await renderFn(c, params);
  } catch (err) {
    c.innerHTML = `<div style="color: red;">Chyba načtení modulu: ${err?.message || err}</div>`;
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
window.addEventListener('hashchange', function () {
  if (hasUnsavedChanges) {
    if (!confirm('Máte rozdělanou práci. Opravdu chcete odejít bez uložení?')) {
      history.back();
      setTimeout(() => { setUnsaved(true); }, 10);
    } else {
      hasUnsavedChanges = false;
    }
  }
  route();
});

// ========== Inicializace ==========
(async function start() {
  try {
    await initModules();
    console.log('Obsah registry:', Array.from(registry.values()));
    renderLayout();
    window.addEventListener('hashchange', route);
    route();
  } catch (err) {
    const c = $id('content');
    if (c) c.innerHTML = `<div style="color: red;">Inicializace selhala: ${err?.message || err}</div>`;
  }
})();

/*
========================= TODO: Další funkce pro moduly =========================

- Breadcrumbs (drobečková navigace)
  -> Každý modul může vykreslit své breadcrumbs podle potřeby.

- Common actions (Přidat, Upravit, Archivovat, hvězdička, atd.)
  -> Řeš v jednotlivých modulech, nebo sdílej jako widget/helper.

- Logika pro dashboard, tiles, forms atd.
  -> Není potřeba v app.js, vše řeší dynamický import a logika v modulu.

===============================================================================
*/
