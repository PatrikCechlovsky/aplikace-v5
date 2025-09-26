// v5 – sidebar, breadcrumbs, content, header actions + lazy moduly 010 a 020
import { supabase } from './supabase.js';
import { MODULES } from './app/modules.index.js';
import { renderSidebar } from './ui/sidebar.js';
import { renderBreadcrumbs } from './ui/breadcrumbs.js';
import { renderContent } from './ui/content.js';
import { renderHeaderActions } from './ui/headerActions.js';
import { renderCommonActions } from './ui/commonActions.js';

const $ = (id) => document.getElementById(id);
let currentSession = null;

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

function mountDashboard() {
  $('breadcrumbs').innerHTML =
    `<a class="inline-flex items-center gap-1 px-2 py-1 rounded border bg-white text-sm" href="#/dashboard">🏠 Domů</a>`;
  $('crumb-actions').innerHTML = '';
  $('actions-bar').innerHTML = '';
  $('content').innerHTML = `<div class="p-4 bg-white rounded-2xl border">Dashboard – placeholder.</div>`;
}

async function renderModuleSpecific(root, { mod, kind, id }) {
  try {
    switch (mod.id) {
      case '010-uzivatele': {
        const m = await import('./modules/users-list.js');
        await m.default(root);
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
    console.debug('Module renderer error:', e?.message || e);
    return false;
  }
}

async function mountModuleView({ mod, kind, id }) {
  renderBreadcrumbs($('breadcrumbs'), { mod, kind, id });
  // konzistentní 3 tlačítka vpravo od breadcrumbs (může si je modul přepsat)
  renderCommonActions($('crumb-actions'));
  $('actions-bar').innerHTML = ''; // další drobné akce/chipy později

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

document.addEventListener('DOMContentLoaded', async () => {
  currentSession = await ensureSignedIn();
  if (!currentSession) return;

  try {
    const { data: { user } } = await supabase.auth.getUser();
    $('userName').textContent = (user && user.email) || (currentSession.user && currentSession.user.email) || '—';
  } catch {
    $('userName').textContent = (currentSession.user && currentSession.user.email) || '—';
  }

  renderHeaderActions($('header-actions'));
  $('logoutBtn')?.addEventListener('click', hardLogout);

  renderSidebar($('sidebar'), MODULES, { onSelect: () => setTimeout(route, 0) });
  await route();
});

window.addEventListener('hashchange', route);
