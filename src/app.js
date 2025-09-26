// v5 – sidebar, breadcrumbs, content, header actions + lazy modul „Můj účet“
import { supabase } from './supabase.js';
import { MODULES } from './app/modules.index.js';
import { renderSidebar } from './ui/sidebar.js';
import { renderBreadcrumbs } from './ui/breadcrumbs.js';
import { renderContent } from './ui/content.js';
import { renderHeaderActions } from './ui/headerActions.js';

const $ = (id) => document.getElementById(id);
let currentSession = null;

// --- auth guard + logout ---
async function ensureSignedIn() {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { location.replace('./index.html'); return null; }
    return session;
  } catch {
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

// --- routing z hash ---
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

// --- modul-specifický renderer (lazy) ---
async function renderModuleSpecific(root, { mod, kind, id }) {
  // podle ID modulu zkusíme načíst specifický renderer
  try {
    switch (mod.id) {
      case '020-muj-ucet': {
        const m = await import('./modules/my-account.js');
        await m.default(root, { mod, kind, id, session: currentSession });
        return true;
      }
      default:
        return false;
    }
  } catch (e) {
    console.debug('Module renderer fallback:', e?.message || e);
    return false;
  }
}

// --- mounty ---
function mountDashboard() {
  $('breadcrumbs').innerHTML =
    `<a class="inline-flex items-center gap-1 px-2 py-1 rounded border bg-white text-sm" href="#/dashboard">🏠 Domů</a>`;
  $('crumb-actions').innerHTML = '';
  $('actions-bar').innerHTML = '';
  $('content').innerHTML = `<div class="p-4 bg-white rounded-2xl border">Dashboard – placeholder.</div>`;
}

async function mountModuleView({ mod, kind, id }) {
  renderBreadcrumbs($('breadcrumbs'), { mod, kind, id });
  $('crumb-actions').innerHTML = '';
  $('actions-bar').innerHTML = '';

  // pokus o modul-specifické vykreslení, jinak fallback
  const ok = await renderModuleSpecific($('content'), { mod, kind, id });
  if (!ok) renderContent($('content'), { mod, kind, id });
}

async function route() {
  const h = parseHash();
  if (h.view === 'dashboard') { mountDashboard(); return; }

  const mod = findModule(h.mod);
  if (!mod) {
    $('content').innerHTML = `<div class="p-4 bg-white rounded-2xl border">Neznámý modul.</div>`;
    return;
  }

  const activeTile = h.kind === 'tile'
    ? (h.id || mod.defaultTile || (mod.tiles && mod.tiles[0] && mod.tiles[0].id) || null)
    : (mod.defaultTile || (mod.tiles && mod.tiles[0] && mod.tiles[0].id) || null);

  await mountModuleView({ mod, kind: h.kind, id: h.kind === 'tile' ? activeTile : h.id });
}

// --- start ---
document.addEventListener('DOMContentLoaded', async () => {
  currentSession = await ensureSignedIn();
  if (!currentSession) return;

  // email do headeru
  try {
    const { data: { user } } = await supabase.auth.getUser();
    $('userName').textContent = (user && user.email) || (currentSession.user && currentSession.user.email) || '—';
  } catch {
    $('userName').textContent = (currentSession.user && currentSession.user.email) || '—';
  }

  // globální akce
  renderHeaderActions($('header-actions'));

  // logout
  const logoutBtn = $('logoutBtn');
  if (logoutBtn) logoutBtn.addEventListener('click', hardLogout);

  // sidebar
  renderSidebar($('sidebar'), MODULES, {
    onSelect: () => setTimeout(route, 0) // po změně hash proveď route
  });

  // první vykreslení
  await route();
});
window.addEventListener('hashchange', route);
