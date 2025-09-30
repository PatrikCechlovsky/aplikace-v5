// src/app/app.js

// ========== Imports ==========
import { MODULE_SOURCES } from './modules.index.js';
import { icon } from '../ui/icons.js';

// ========== Mini utils ==========
const $ = (sel) => document.querySelector(sel);
const $id = (id) => document.getElementById(id);
export function navigateTo(hash) {
  if (!hash.startsWith('#')) hash = '#' + hash;
  if (location.hash === hash) {
    // vynutit rerender
    route();
  } else {
    location.hash = hash;
  }
}

// ===== Renderer shim ("airbag") =============================================
// Bezpečně spustí renderer z dynamicky importovaného modulu.
// Podporuje: render, default.render, default (funkce).
// Při chybě zaloguje a zobrazí hezkou hlášku do UI.
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
  try {
    const s = fn.toString();
    const m = s.match(/import\\(['"`]([^'"`]+)['"`]\\)/);
    return m ? m[1] : null;
  } catch {
    return null;
  }
}

async function initModules() {
  for (const src of MODULE_SOURCES) {
    const path = extractImportPath(src); // např. ../modules/010-sprava-uzivatelu/module.config.js
    const baseDir = path ? path.replace(/\\/module\\.config\\.js$/, '') : null;

    const mod = await src(); // načti module.config.js
    const manifest = (await mod.getManifest?.()) || {};
    if (!manifest?.id) continue;

    registry.set(manifest.id, {
      ...manifest,
      baseDir, // důležité pro import tiles/forms
    });
  }
}

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
function parseHash() {
  const h = location.hash || '#/';
  // #/m/:modId
  let m = h.match(/^#\\/m\\/([^\\/]+)(?:\\/([tf])\\/([^\\/]+))?/);
  if (m) {
    return {
      type: 'module',
      modId: decodeURIComponent(m[1]),
      kind: m[2] === 'f' ? 'form' : 'tile',
      secId: m[3] ? decodeURIComponent(m[3]) : null,
    };
  }
  return { type: 'home' };
}

async function route() {
  const c = $id('content');
  if (!c) return;
  const info = parseHash();

  $id('crumb-actions') && ($id('crumb-actions').innerHTML = '');

  if (info.type === 'home') {
    setBreadcrumb([{ icon: 'home', label: 'Domů' }]);
    c.innerHTML = `<div class="p-4 text-slate-500">Vyber modul vlevo…</div>`;
    return;
  }

  const mod = registry.get(info.modId);
  if (!mod) {
    c.innerHTML = `<div class="p-3 rounded bg-red-50 border border-red-200 text-red-700">
      Modul <b>${info.modId}</b> nenalezen.</div>`;
    return;
  }

  const tileId = info.secId || mod.defaultTile || (mod.tiles?.[0]?.id || null);
  const kind = info.kind || 'tile';

  // Breadcrumb
  setBreadcrumb([
    { icon: 'home', label: 'Domů', href: '#/' },
    { icon: mod.icon || 'folder', label: mod.title, href: `#/m/${mod.id}` },
    tileId ? { icon: kind === 'tile' ? 'list' : 'form', label: (kind === 'tile'
              ? (mod.tiles?.find(t => t.id === tileId)?.title || tileId)
              : (mod.forms?.find(f => f.id === tileId)?.title || tileId)) } : null,
  ].filter(Boolean));

  // Načti renderer
  try {
    const baseDir = mod.baseDir; // např. ../modules/010-sprava-uzivatelu
    if (!baseDir) throw new Error('Chybí baseDir pro modul (z MODULE_SOURCES).');

    const rel = kind === 'form' ? `forms/${tileId}.js` : `tiles/${tileId}.js`;
    const path = `${baseDir}/${rel}`; // relativně k tomuto souboru

    c.innerHTML = `<div class="text-slate-500 p-2">Načítám…</div>`;
    const pathWithCb = path + (path.includes('?') ? '&' : '?') + 'v=' + Date.now();

    // Pozn.: import bere cestu relativně k tomuto souboru, takže "../modules/..." je správně.
    await runRenderer(import(pathWithCb), c, {}, `path=${pathWithCb}`);
  } catch (err) {
    console.error('[ROUTE FAIL]', err);
    c.innerHTML = `<div class="p-3 rounded bg-red-50 border border-red-200 text-red-700">
      Chyba při routingu: ${err?.message || err}</div>`;
  }
}

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
      Inicializace selhala: ${err?.message || err}</div>`;
  }
})();
