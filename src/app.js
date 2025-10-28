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
import { getMyProfile, getRolePermissions } from './db.js';
import { loadPermissionsForRole, registerPermissionsLoader } from './security/permissions.js';

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
    // zachováme dynamické importy přes pathWithCb (bez změny chování načítání)
    const imported = await import(pathWithCb);

    // ROZŠÍŘENÁ DETEKCE render() FUNKCE
    // Podporujeme:
    // - export function render(...) { ... }             (named export)
    // - export default function(...) { ... }           (default export as function)
    // - export default { render(...) { ... } }         (default export object with render)
    // - export const render = async (...) => { ... }   (named async arrow fn)
    let renderFn = null;

    if (imported && typeof imported.render === 'function') {
      // named export
      renderFn = imported.render;
    } else if (imported && typeof imported.default === 'function') {
      // default exported directly as a function -> treat it as render
      renderFn = imported.default;
    } else if (imported && imported.default && typeof imported.default.render === 'function') {
      // default is object with render() method
      renderFn = imported.default.render;
    } else if (imported && imported.default && typeof imported.default === 'object' && typeof imported.default.default === 'function') {
      // some bundlers may wrap default again -> try to be tolerant
      renderFn = imported.default.default;
    }

    if (typeof renderFn !== 'function') {
      c.innerHTML = `<div style="color: red;">Modul je poškozen: chybí exportovaná funkce <code>render</code>.</div>`;
      return;
    }

    await renderFn(c, params);
  } catch (err) {
    // detailní chybová hláška pro debug
    c.innerHTML = `<div style="color: red;">Chyba načtení modulu: ${err?.message || err}</div>`;
    console.error('[route] import/render error for', pathWithCb, err);
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

    // ---- Načti profil uživatele a ulož do window.currentUser ----
    const { data: currentUser, error } = await getMyProfile();
    window.currentUser = currentUser || null;
    window.currentUserRole = currentUser?.role || 'user';

    // --- REGISTER: loader using db.getRolePermissions (if available)
    registerPermissionsLoader(async (role) => {
      try {
        const { data, error } = await getRolePermissions(role);
        if (!error && Array.isArray(data)) return data;
        return null; // signal to fallback to static ROLE_PERMISSIONS
      } catch (e) {
        return null;
      }
    });

    // --- DYNAMIC: pokusit se načíst aktuální permissions pro roli (loader/DB)
    try {
      await loadPermissionsForRole(window.currentUserRole);
      console.log('[app] role permissions loaded for', window.currentUserRole);
    } catch (e) {
      console.warn('[app] loadPermissionsForRole failed', e);
    }

    if (error) console.warn("Nepodařilo se načíst profil uživatele:", error);

    console.log('Obsah registry:', Array.from(registry.values()));
    renderLayout();
    window.addEventListener('hashchange', route);
    route();
  } catch (err) {
    const c = $id('content');
    if (c) c.innerHTML = `<div style="color: red;">Inicializace selhala: ${err?.message || err}</div>`;
  }
})();
