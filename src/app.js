// src/app/app.js

// ========== Imports ==========
import { MODULE_SOURCES } from './app/modules.index.js';
import { icon } from './ui/icons.js';

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
// Podporuje: render, default.render, default (funkce) a hezky chybuje do UI.
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
/**
 * Z MODULE_SOURCES dostaneme:
 *  - manifest (getManifest)
 *  - baseDir (vytažený z textu funkce: "() => import('.../module.config.js')" )
 */
const registry = new Map(); // modId -> { id, title, icon, tiles, forms, defaultTile, baseDir }

function extractImportPath(fn) {
  // vytáhne z textu funkce cestu z import('...')
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
    const rel = extractImportPath(src); // např. "../modules/010-sprava-uzivatelu/module.config.js"
    // Převeď relativní cestu (z pohledu /src/app/) na absolutní:
    const abs = '/src/app/' + rel;                          // "/src/app/../modules/010-.../module.config.js"
    const norm = abs.replace('/src/app/../', '/src/');      // "/src/modules/010-.../module.config.js"
    const baseDir = norm.replace(/\/module\.config\.js$/, '');

    // načti manifest
    const mod = await src();
    const manifest = (await mod.getManifest?.()) || {};
    if (!manifest?.id) continue;

    registry.set(manifest.id, {
      ...manifest,
      baseDir, // => "/src/modules/010-sprava-uzivatelu" (absolutně)
    });
  }
}
window.registry = registry;
// ========== Sidebar ==========
function renderSidebar() {
  const sb = $id('sidebar');
  if (!sb) return;
  const mods = Array.from(registry.values());

  sb.innerHTML = mods.map(m => `
    <div class="mb-3">
      <button class="w-full flex items-center justify-between px-3 py-2 rounded border bg-white"
              data-mod="${m.id}">
        <span class="flex items-center gap-2">${icon(m.icon || 'folder')} ${m.title}</span>
        <span class="text-slate-400">▸</span>
      </button>
      <div class="pl-4 mt-2 hidden" id="sect-${m.id}">
        ${m.tiles?.length ? `<div class="text-xs uppercase text-slate-400 mb-1">Dlaždice</div>` : ''}
        ${(m.tiles || []).map(t => `
          <a class="block py-1 hover:underline" href="#/m/${m.id}/t/${t.id}">
            ${icon(t.icon || 'list')} ${t.title}
          </a>`).join('')}
        ${m.forms?.length ? `<div class="text-xs uppercase text-slate-400 mt-2 mb-1">Formuláře</div>` : ''}
        ${(m.forms || []).map(f => `
          <a class="block py-1 hover:underline" href="#/m/${m.id}/f/${f.id}">
            ${icon(f.icon || 'form')} ${f.title}
          </a>`).join('')}
      </div>
    </div>
  `).join('');

  sb.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-mod]');
    if (!btn) return;
    const modId = btn.dataset.mod;
    const box = $id(`sect-${modId}`);
    if (!box) return;
    box.classList.toggle('hidden');
    // otočení šipky
    const caret = btn.querySelector('span:last-child');
    if (caret) caret.style.transform = box.classList.contains('hidden') ? 'rotate(0deg)' : 'rotate(90deg)';
  });
}

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
      // Home
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

    // Breadcrumb aktuální stránky
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
// ... (ostatní importy a kód)

let hasUnsavedChanges = false;

// Použij tuto proměnnou v komponentách při editaci/formulářích:
export function setUnsaved(flag) {
  hasUnsavedChanges = !!flag;
}

// Ochrana při odchodu ze stránky (reload, zavření tabu)
window.addEventListener('beforeunload', function (e) {
  if (hasUnsavedChanges) {
    e.preventDefault();
    e.returnValue = '';
    return '';
  }
});

// Ochrana i při navigaci v rámci SPA (hashchange)
window.addEventListener('hashchange', function (e) {
  if (hasUnsavedChanges) {
    if (!confirm('Máte rozdělanou práci. Opravdu chcete odejít bez uložení?')) {
      // Vrátí hash zpět (ne vždy spolehlivě, záleží na browseru)
      history.back();
      setTimeout(() => { setUnsaved(true); }, 10);
      // Pozor: pro robustní řešení budeš muset lépe spravovat historii hashů
    } else {
      hasUnsavedChanges = false;
    }
  }
});
// ========== Init ==========
(async function start() {
  try {
    await initModules();
    renderSidebar();
    window.addEventListener('hashchange', route);

    if (!location.hash || location.hash === '#') {
      // přesměruj na první modul na jeho výchozí tile
      const first = registry.values().next().value;
      if (first) navigateTo(`#/m/${first.id}/t/${first.defaultTile || (first.tiles?.[0]?.id || '')}`);
      else route();
    } else {
      route();
    }
  } catch (err) {
    console.error('[INIT ERROR]', err);
    const c = $id('content');
    if (c) c.innerHTML = `<div class="p-3 rounded bg-red-50 border border-red-200 text-red-700">
      Inicializace selhala: ${err?.message || err}
    </div>`;
  }
})();
