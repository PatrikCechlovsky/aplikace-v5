// DEBUG
console.log('[APP] start');

import { supabase } from './supabase.js';
import { MODULES } from './app/modules.index.js';
import { renderSidebar } from './ui/sidebar.js';
import { renderBreadcrumbs } from './ui/breadcrumbs.js';
import { renderContent } from './ui/content.js';
import { renderHeaderActions } from './ui/headerActions.js';
import { renderCommonActions } from './ui/commonActions.js';

const $ = (id) => document.getElementById(id);
const setHTML = (el, html) => { if (el) el.innerHTML = html; };
const clear = (el) => { if (el) el.innerHTML = ''; };

let currentSession = null;
window.appDirty = false;
window.setAppDirty = (v) => { window.appDirty = !!v; };

// --- 1) Auto-fix layout (vytvoří chybějící prvky, když v app.html nejsou) ---
function ensureLayout() {
  // hlavní <main>
  let main = document.querySelector('main');
  if (!main) {
    main = document.createElement('main');
    main.className = 'max-w-[1400px] mx-auto p-4';
    document.body.appendChild(main);
  }

  // wrapper se dvěma sloupci
  let grid = main.querySelector('.grid');
  if (!grid) {
    grid = document.createElement('div');
    grid.className = 'grid grid-cols-[260px_1fr] gap-4';
    main.appendChild(grid);
  }

  // SIDEBAR
  if (!$('#sidebar')) {
    const aside = document.createElement('aside');
    aside.id = 'sidebar';
    aside.className = 'p-2 bg-white rounded-2xl border';
    // vlož na začátek gridu (levý sloupec)
    if (grid.firstChild) grid.insertBefore(aside, grid.firstChild); else grid.appendChild(aside);
  }

  // SECTION a jeho vnitřek
  let section = grid.querySelector('section');
  if (!section) {
    section = document.createElement('section');
    grid.appendChild(section);
  }

  if (!$('#breadcrumbs') || !$('#crumb-actions')) {
    const row = document.createElement('div');
    row.className = 'flex items-center justify-between mb-2';
    row.innerHTML = `
      <div id="breadcrumbs" class="text-xs text-slate-500">Dashboard</div>
      <div id="crumb-actions" class="flex items-center gap-2"></div>
    `;
    section.appendChild(row);
  }

  if (!$('#actions-bar')) {
    const ab = document.createElement('div');
    ab.id = 'actions-bar';
    ab.className = 'mb-3 flex flex-wrap gap-2';
    section.appendChild(ab);
  }

  if (!$('#content')) {
    const c = document.createElement('div');
    c.id = 'content';
    c.className = 'min-h-[60vh]';
    section.appendChild(c);
  }
}

// ---------- Auth ----------
async function ensureSignedIn() {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { location.replace('./index.html'); return null; }
    return session;
  } catch (e) {
    console.error('[APP] getSession failed:', e);
    location.replace('./index.html'); return null;
  }
}
async function hardLogout() {
  try { await supabase.auth.signOut({ scope: 'local' }); } catch {}
  try { await supabase.auth.signOut(); } catch {}
  try {
    Object.keys(localStorage).forEach(k => { if (k.startsWith('sb-')) localStorage.removeItem(k); });
    Object.keys(sessionStorage).forEach(k => { if (k.startsWith('sb-')) sessionStorage.removeItem(k); });
  } catch {}
  location.replace('./index.html?_' + Date.now());
}

// ---------- Routing ----------
function parseHash() {
  const raw = (location.hash || '').replace(/^#\/?/, '');
  const [path, q] = raw.split('?');
  const p = (path || '').split('/').filter(Boolean);
  const params = new URLSearchParams(q || '');
  if (p[0] !== 'm') return { view: 'dashboard', params };
  const mod = p[1]; if (!mod) return { view: 'dashboard', params };
  if (p[2] === 't' && p[3]) return { view: 'module', mod, kind: 'tile', id: p[3], params };
  if (p[2] === 'f' && p[3]) return { view: 'module', mod, kind: 'form', id: p[3], params };
  return { view: 'module', mod, kind: 'tile', id: null, params };
}
function findModule(id) { return MODULES.find(m => m.id === id); }

// ---------- Views ----------
function mountDashboard() {
  console.log('[APP] mountDashboard');
  setHTML($('#breadcrumbs'),
    `<a class="inline-flex items-center gap-1 px-2 py-1 rounded border bg-white text-sm" href="#/dashboard">🏠 Domů</a>`
  );
  clear($('#crumb-actions'));
  clear($('#actions-bar'));
  setHTML($('#content'), `<div class="p-4 bg-white rounded-2xl border">Dashboard – placeholder.</div>`);
}

async function renderModuleSpecific(root, { mod, kind, id }) {
  try {
    switch (mod.id) {
      case '010-uzivatele': {
        const cfg = await import('./modules/010-sprava-uzivatelu/module.config.js');
        const tiles = await import('./modules/010-sprava-uzivatelu/tiles/index.js');
        const tileId = id || cfg.default.tiles?.[0]?.id || 'seznam';
        await tiles.renderTile(tileId, root);
        return true;
      }
      case '020-muj-ucet': {
        const m = await import('./modules/my-account.js');
        await m.default(root);
        return true;
      }
      default: return false;
    }
  } catch (e) {
    console.error('[APP] module render failed:', e);
    return false;
  }
}

async function mountModuleView({ mod, kind, id }) {
  console.log('[APP] mountModuleView', mod?.id, kind, id);
  try { renderBreadcrumbs($('#breadcrumbs'), { mod, kind, id }); } catch (e) { console.warn('[APP] breadcrumbs error:', e); }
  try { renderCommonActions($('#crumb-actions')); } catch {}
  clear($('#actions-bar'));

  const ok = await renderModuleSpecific($('#content'), { mod, kind, id });
  if (!ok) renderContent($('#content'), { mod, kind, id });
}

async function route() {
  console.log('[APP] route', location.hash);
  const h = parseHash();
  if (h.view === 'dashboard') { mountDashboard(); return; }
  const mod = findModule(h.mod);
  if (!mod) { setHTML($('#content'), `<div class="p-4 bg-white rounded-2xl border">Neznámý modul.</div>`); return; }
  const activeTile = h.kind === 'tile'
    ? (h.id || mod.defaultTile || mod.tiles?.[0]?.id || null)
    : (mod.defaultTile || mod.tiles?.[0]?.id || null);
  await mountModuleView({ mod, kind: h.kind, id: h.kind === 'tile' ? activeTile : h.id });
}

// ---------- Home ----------
function goHome() {
  if (window.appDirty) {
    const ok = confirm('Máš rozpracované změny. Pokračovat bez uložení a otevřít hlavní stránku?');
    if (!ok) return;
  }
  location.hash = '#/dashboard';
}

// ---------- Start ----------
document.addEventListener('DOMContentLoaded', async () => {
  console.log('[APP] DOMContentLoaded');

  // >>> DŮLEŽITÉ: vytvoř si chybějící layout prvky
  ensureLayout();

  const session = await ensureSignedIn(); if (!session) return;
  currentSession = session;

  try { renderHeaderActions($('#header-actions')); } catch (e) { console.warn(e); }

  const btn = $('#btnProfile');
  if (btn) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      btn.title = user?.email || session.user?.email || '—';
    } catch {
      btn.title = session.user?.email || '—';
    }
    btn.addEventListener('click', () => { location.hash = '#/m/020-muj-ucet/t/profil'; });
  }

  $('#logoutBtn')?.addEventListener('click', () => hardLogout());
  $('#homeBtn')?.addEventListener('click', goHome);

  try {
    renderSidebar($('#sidebar'), MODULES, { onSelect: () => setTimeout(route, 0) });
    const sb = $('#sidebar');
    console.log('[APP] sidebar innerHTML length:', sb ? sb.innerHTML.length : 'no-root');
  } catch (e) {
    console.error('[APP] sidebar render failed:', e);
  }

  await route();
});

window.addEventListener('hashchange', route);
