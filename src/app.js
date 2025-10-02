// ========== Imports ==========
import { MODULE_SOURCES } from './app/modules.index.js';
import { icon } from './ui/icons.js';
import { renderHeader } from './ui/header.js';
import { renderHeaderActions } from './ui/headerActions.js';
import { renderHomeButton } from './ui/homebutton.js';
import { renderSidebar } from './ui/sidebar.js';

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

// ========== Sidebar (už NEpoužívej tuto funkci, ale importuj renderSidebar z ui/sidebar.js) ==========

// ========== Breadcrumb ==========
function setBreadcrumb(items = []) {
  const root = $id('crumb');
  if (!root) return;
  root.innerHTML = items.map((it, i) => {
    const c = i === items.length - 1 ? 'opacity-70' : '';
    const body = `${it.icon ? icon(it.icon) + ' ' : ''}${it.label ?? ''}`;
    const piece = it.href ? `<a href="${it.href}" class="hover:underline">${body}</a>` : `<span class="${c}">${body}</span>`;
    return i ? `<span class="mx-1">›</span>${piece}` : piece;
  }).join('');
}

// ========== Router ==========
async function route() {
  const c = $id('content');
  if (!c) return;

  try {
    const h = location.hash || '#/';
    const m = h.match(/^#\/m\/([^/]+)(?:\/([tf])\/([^/]+))?/);

    if (!m) {
      setBreadcrumb([{ icon: 'home', label: 'Domů' }]);
      c.innerHTML = `<div class="p-4 text-slate-500">Vyber modul vlevo…</div>`;
      return;
    }

    const modId = decodeURIComponent(m[1]);
    const kind = m[2] === 'f' ? 'form' : 'tile';
    const secId = m[3] ? decodeURIComponent(m[3]) : null;

    const mod = registry.get(modId);
    if (!mod) {
      c.innerHTML = `<div class="p-3 rounded bg-red-50 border border-red-200 text-red-700">
        Modul <b>${modId}</b> nenalezen.
      </div>`;
      return;
    }

    const tileId = secId || mod.defaultTile || (mod.tiles?.[0]?.id || null);
    if (!tileId) {
      c.innerHTML = `<div class="p-3">Modul nemá žádné sekce.</div>`;
      return;
    }

    setBreadcrumb([
      { icon: 'home', label: 'Domů', href: '#/' },
      { icon: mod.icon || 'folder', label: mod.title, href: `#/m/${mod.id}` },
      {
        icon: kind === 'tile' ? 'list' : 'form',
        label: (kind === 'tile'
          ? (mod.tiles?.find(t => t.id === tileId)?.title || tileId)
          : (mod.forms?.find(f => f.id === tileId)?.title || tileId))
      },
    ]);

    // Import a vykreslení
    const rel = kind === 'form' ? `forms/${tileId}.js` : `tiles/${tileId}.js`;
    const path = `${mod.baseDir}/${rel}`;
    const pathWithCb = path + (path.includes('?') ? '&' : '?') + 'v=' + Date.now();

    console.log('[ROUTE try import]', pathWithCb);
    c.innerHTML = `<div class="p-2 text-slate-500">Načítám ${pathWithCb}…</div>`;

    try {
      const imported = await import(pathWithCb);
      console.log('[ROUTE loaded]', pathWithCb, Object.keys(imported));
      await runRenderer(Promise.resolve(imported), c, {}, `path=${pathWithCb}`);
    } catch (err) {
      console.error('[IMPORT ERROR]', pathWithCb, err);
      c.innerHTML = `<div class="p-3 rounded bg-red-50 border border-red-200 text-red-700">
        Import selhal: ${err?.message || err}
      </div>`;
    }

  } catch (err) {
    console.error('[ROUTE ERROR]', err);
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
    // Header a akce (pokud máš)
    const headerRoot = $id('header');
    let actionsContainer = null;
    if (headerRoot) {
      const out = renderHeader(headerRoot, { appName: 'Pronajímatel' });
      actionsContainer = out && out.actionsContainer;
    }
    if (actionsContainer) {
      renderHeaderActions(actionsContainer);
    }

    // Home button a sidebar – volat do správných kontejnerů
    renderHomeButton($id('homebtnbox'), { appName: 'Pronajímatel', onHome: () => location.hash = "#/" });

    await initModules();
    renderSidebar($id('sidebarbox'), Array.from(registry.values()));
    window.addEventListener('hashchange', route);

    route();
  } catch (err) {
    console.error('[INIT ERROR]', err);
    const c = $id('content');
    if (c) c.innerHTML = `<div class="p-3 rounded bg-red-50 border border-red-200 text-red-700">
      Inicializace selhala: ${err?.message || err}
    </div>`;
  }
})();
