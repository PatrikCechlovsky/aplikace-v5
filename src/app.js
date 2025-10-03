// ========== Imports ==========
import { MODULE_SOURCES } from './app/modules.index.js';
import { icon } from './ui/icons.js';
import { renderHomeButton } from './ui/homebutton.js';
import { renderHeaderActions } from './ui/headerActions.js';
import { renderSidebar } from './ui/sidebar.js';
import { setBreadcrumb } from './ui/breadcrumb.js';
import { renderCommonActions } from './ui/commonActions.js';
import { renderDashboardTiles } from './ui/content.js'; // <-- přidáno pro dashboard tiles

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

    registry.set(manifest.id, {
      ...manifest,
      baseDir,
    });
  }
}
window.registry = registry;

// ========== Router ==========
async function route() {
  const c = $id('content');
  const crumb = $id('crumb');
  const commonActions = $id('commonactions');
  if (!c) return;

  try {
    const h = location.hash || '#/';
    const m = h.match(/^#\/m\/([^/]+)(?:\/([tf])\/([^/]+))?/);

    if (!m) {
      setBreadcrumb(crumb, [{ icon: 'home', label: 'Domů' }]);
      if (commonActions) commonActions.innerHTML = '';
      // Zobrazit dashboard tiles místo prostého textu:
      renderDashboardTiles(c, Array.from(window.registry.values()));
      return;
    }

    const modId = decodeURIComponent(m[1]);
    const kind = m[2] === 'f' ? 'form' : 'tile';
    const secId = m[3] ? decodeURIComponent(m[3]) : null;

    const mod = registry.get(modId);
    if (!mod) {
      setBreadcrumb(crumb, [{ icon: 'home', label: 'Domů' }]);
      if (commonActions) commonActions.innerHTML = '';
      c.innerHTML = `<div class="p-3 rounded bg-red-50 border border-red-200 text-red-700">
        Modul <b>${modId}</b> nenalezen.
      </div>`;
      return;
    }

    const tileId = secId || mod.defaultTile || (mod.tiles?.[0]?.id || null);
    if (!tileId) {
      setBreadcrumb(crumb, [
        { icon: 'home', label: 'Domů', href: '#/' },
        { icon: mod.icon || 'folder', label: mod.title, href: `#/m/${mod.id}` }
      ]);
      if (commonActions) commonActions.innerHTML = '';
      c.innerHTML = `<div class="p-3">Modul nemá žádné sekce.</div>`;
      return;
    }

    // Breadcrumbs
    setBreadcrumb(crumb, [
      { icon: 'home', label: 'Domů', href: '#/' },
      { icon: mod.icon || 'folder', label: mod.title, href: `#/m/${mod.id}` },
      {
        icon: kind === 'tile' ? 'list' : 'form',
        label: (kind === 'tile'
          ? (mod.tiles?.find(t => t.id === tileId)?.title || tileId)
          : (mod.forms?.find(f => f.id === tileId)?.title || tileId))
      },
    ]);

    // Render common actions – případně přidej další podle potřeby
    if (commonActions) {
      renderCommonActions(commonActions, {
        onAdd: () => alert('Přidat (demo)'),
        onEdit: () => alert('Upravit (demo)'),
        onArchive: () => alert('Archivovat (demo)'),
        onRefresh: () => alert('Obnovit (demo)'),
        onAttach: () => alert('Příloha (demo)')
      });
    }

    // Render content
    c.innerHTML = `<div class="p-6 text-slate-500">Zde bude obsah modulu <b>${mod.title}</b> sekce <b>${tileId}</b>.</div>`;

    // Pokud chceš načítat skutečný modul dynamicky, odkomentuj:
    /*
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
    */
  } catch (err) {
    c.innerHTML = `<div class="p-3 rounded bg-red-50 border border-red-200 text-red-700">
      Chyba v routeru: ${err?.message || err}
    </div>`;
  }
}

// ========== Ochrana rozdělané práce ==========
let hasUnsavedChanges = false;
export function setUnsaved(flag) {
  hasUnsavedChanges = !!flag;
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
        // Zavřít sidebar pokud funkce existuje
        if (window.renderSidebar && typeof window.renderSidebar.closeAll === 'function') {
          window.renderSidebar.closeAll();
        }
        // Ochrana rozpracované práce (globální)
        if (hasUnsavedChanges) {
          if (!confirm('Máte rozdělanou práci. Opravdu chcete odejít bez uložení?')) return;
        }
        // Přepnout na dashboard nebo domovskou stránku
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

// ========== Nepoužívané/legacy funkce (ponecháno zakomentováno) ==========
// import { renderHeader } from './ui/header.js'; // už nepoužíváme
// function renderSidebar() { ... } // už nepoužíváme, vše řeší renderSidebar z ui/sidebar.js
