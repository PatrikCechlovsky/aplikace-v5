// src/app.js — základní layout appky + router + sidebar + 010 napojení

import { renderHeader } from './ui/header.js';
import { renderHeaderActions } from './ui/headerActions.js';

// ===== Definice modulů =======================================================
const MODULES = [
  {
    id: '010-sprava-uzivatelu',
    title: 'Uživatelé',
    icon: '👥',
    defaultTile: 'seznam',
    tiles: [
      { id: 'prehled', title: 'Přehled' },
      { id: 'seznam',  title: 'Seznam'  },
    ],
  },
  {
    id: '020-muj-ucet',
    title: 'Můj účet',
    icon: '👤',
    defaultTile: 'profil',
    tiles: [{ id: 'profil', title: 'Profil' }],
  },
  {
    id: '030-pronajimatel',
    title: 'Pronajímatel',
    icon: '🏢',
    defaultTile: 'prehled',
    tiles: [{ id: 'prehled', title: 'Přehled' }],
  },
  {
    id: '900-nastaveni',
    title: 'Nastavení',
    icon: '⚙️',
    defaultTile: 'aplikace',
    tiles: [{ id: 'aplikace', title: 'Aplikace' }],
  },
];

// ===== Pomocníci =============================================================
const $id = (x) => document.getElementById(x);
const E = (tag, attrs = {}, children = []) => {
  const el = document.createElement(tag);
  Object.entries(attrs).forEach(([k, v]) => {
    if (k === 'style' && typeof v === 'object') Object.assign(el.style, v);
    else if (k === 'class') el.className = v;
    else el.setAttribute(k, v);
  });
  (Array.isArray(children) ? children : [children]).forEach((ch) => {
    if (typeof ch === 'string') el.appendChild(document.createTextNode(ch));
    else if (ch) el.appendChild(ch);
  });
  return el;
};

function injectOnce(id, css) {
  if (document.getElementById(id)) return;
  const style = document.createElement('style');
  style.id = id;
  style.textContent = css;
  document.head.appendChild(style);
}

// --- stav rozdělané práce (dirty) ---
const AppState = (() => {
  let dirty = false;
  return {
    isDirty: () => dirty,
    setDirty: (v) => { dirty = !!v; },
    clearDirty: () => { dirty = false; },
  };
})();
window.AppState = AppState;

// --- jednotná navigace s kontrolou dirty ---
function navigateTo(hash) {
  if (window.AppState?.isDirty?.()) {
    const ok = confirm('Máte rozdělanou neuloženou práci.\nChcete odejít bez uložení (OK) nebo zůstat (Zrušit)?');
    if (!ok) return false;
    window.AppState.clearDirty?.();
  }
  if (hash.startsWith('#')) location.hash = hash;
  else location.href = hash;
  return true;
}

// ===== Root / Layout =========================================================
function buildRoot() {
  injectOnce('app-base-style', `
    #app_root, #app_root * , #app_root *::before, #app_root *::after {
      color:#0f172a; opacity:1; filter:none; mix-blend-mode:normal;
      text-decoration:none; font-size:16px; line-height:1.4;
    }
    .badge { padding:.15rem .45rem; border:1px solid #dbeafe; border-radius:.5rem; background:#eff6ff; color:#1e40af; font-size:.75rem; font-weight:600 }
  `);

  const root = E('div', { id:'app_root', style:{ maxWidth:'1400px', margin:'0 auto', padding:'16px' } });

  // Header
  const headerHost = E('div');
  const { actionsContainer } = renderHeader(headerHost, {
    appName: 'Pronajímatel',
    onHome: () => navigateTo('#/dashboard'),
  });

  // BASE badge vpravo
  const baseBadge = E('span', { class:'badge' }, 'BASE');
  const badgeWrap = E('div', { class:'ml-2 inline-flex' }, [baseBadge]);

  // Grid (sidebar + obsah)
  const grid = E('div', { style:{ display:'grid', gridTemplateColumns:'260px 1fr', gap:'16px' } });
  const sidebar = E('aside', { id:'sidebar', class:'p-3 bg-white rounded-2xl border' });
  const section = E('section');

  const crumbs = E('div', { class:'flex items-center justify-between mb-3 gap-3' }, [
    E('div', { id:'breadcrumbs', class:'text-sm text-slate-600 flex items-center gap-2' }, 'Domů'),
    E('div', { id:'crumb-actions', class:'flex items-center gap-2' })
  ]);
  const content = E('div', { id:'content', class:'min-h-[60vh] bg-white rounded-2xl border p-4' });

  section.appendChild(crumbs);
  section.appendChild(content);

  grid.appendChild(sidebar);
  grid.appendChild(section);

  root.appendChild(headerHost);
  actionsContainer?.parentElement?.appendChild(badgeWrap);
  root.appendChild(grid);
  document.body.appendChild(root);

  // Pravá akční lišta v headeru
  try { renderHeaderActions(actionsContainer); }
  catch (e) {
    console.warn('[APP] headerActions failed', e);
    const btn = E('button', { class:'px-3 py-1 border rounded' }, 'Odhlásit');
    btn.onclick = () => location.href = './index.html';
    actionsContainer.appendChild(btn);
  }
}

// ===== Sidebar (rozbalování dlaždic jen u aktivního modulu) =================
function renderSidebar(mods) {
  const sb = $id('sidebar');
  sb.innerHTML = '';

  const title = E('div', { class:'font-semibold mb-2' }, 'Menu');
  const list  = E('ul', { class:'space-y-1' });
  sb.appendChild(title);
  sb.appendChild(list);

  function makeModuleItem(m) {
    const li = E('li');

    const btn = E('button', {
      'data-mod': m.id,
      class: 'w-full text-left px-3 py-2 rounded text-slate-700 hover:bg-slate-100 flex items-center justify-between'
    }, [
      E('span', {}, `${m.icon || '📁'} ${m.title}`),
      E('span', { class:'text-slate-300' }, '›')
    ]);
    btn.onclick = (ev) => {
      ev.preventDefault();
      const first = m.defaultTile || m.tiles?.[0]?.id || '';
      navigateTo(`#/m/${m.id}/t/${first}`);
    };

    const tilesWrap = E('ul', { class:'mt-1 ml-2 space-y-1', 'data-tiles-for': m.id });
    li.appendChild(btn);
    li.appendChild(tilesWrap);
    return li;
  }

  mods.forEach(m => list.appendChild(makeModuleItem(m)));

  function renderTilesForActive() {
    const activeModId = (/#\/m\/([^\/]+)/.exec(location.hash) || [])[1];

    // zvýraznění modulu
    list.querySelectorAll('button[data-mod]').forEach(b => {
      const active = b.dataset.mod === activeModId;
      b.classList.toggle('bg-indigo-50', active);
      b.classList.toggle('text-indigo-700', active);
      b.classList.toggle('ring-1', active);
      b.classList.toggle('ring-inset', active);
      b.classList.toggle('ring-indigo-200', active);
      b.classList.toggle('font-semibold', active);
      b.classList.toggle('hover:bg-slate-100', !active);
      b.classList.toggle('text-slate-700', !active);
    });

    // vyčisti sub-seznamy
    list.querySelectorAll('ul[data-tiles-for]').forEach(ul => ul.innerHTML = '');

    const mod = mods.find(m => m.id === activeModId);
    if (!mod) return;

    const host = list.querySelector(`ul[data-tiles-for="${mod.id}"]`);
    if (!host) return;

    (mod.tiles || []).forEach(t => {
      const a = E('a', {
        href: `#/m/${mod.id}/t/${t.id}`,
        'data-tile': `${mod.id}:${t.id}`,
        class: 'block px-3 py-1.5 rounded text-slate-600 hover:bg-slate-50'
      }, `• ${t.title || t.id}`);
      a.onclick = (ev) => { ev.preventDefault(); navigateTo(a.getAttribute('href')); };
      host.appendChild(E('li', {}, a));
    });

    // zvýrazni aktivní dlaždici
    const activeTile = (/#\/m\/[^\/]+\/t\/([^\/]+)/.exec(location.hash) || [])[1];
    list.querySelectorAll('a[data-tile]').forEach(a => {
      const mine = a.dataset.tile === `${mod.id}:${activeTile}`;
      a.classList.toggle('bg-indigo-50', mine);
      a.classList.toggle('text-indigo-700', mine);
      a.classList.toggle('ring-1', mine);
      a.classList.toggle('ring-indigo-200', mine);
      a.classList.toggle('font-medium', mine);
    });
  }

  window.addEventListener('hashchange', renderTilesForActive);
  renderTilesForActive();
}

// ===== Breadcrumbs / Actions / routing ======================================
function setBreadcrumbs(parts) {
  const bc = $id('breadcrumbs');
  bc.innerHTML = parts.map((p,i) => {
    const sep = i ? '<span class="text-slate-300">/</span>' : '';
    if (p.href) return `${sep}<a class="hover:underline" href="${p.href}">${p.label}</a>`;
    return `${sep}<span>${p.label}</span>`;
  }).join(' ');
}
function clearCrumbActions() {
  const ca = $id('crumb-actions');
  if (ca) ca.innerHTML = '';
}
function renderCrumbActions(acts = []) {
  const host = $id('crumb-actions');
  host.innerHTML = '';
  acts.forEach(a => {
    const el = document.createElement(a.href ? 'a' : 'button');
    if (a.href) el.href = a.href;
    el.className = 'px-3 py-1.5 border rounded text-sm hover:bg-slate-50';
    el.textContent = `${a.icon || ''} ${a.label}`;
    if (!a.href && typeof a.onClick === 'function') el.onclick = a.onClick;
    host.appendChild(el);
  });
}

function mountDashboard() {
  setBreadcrumbs([{label:'Domů'}]);
  clearCrumbActions();
  $id('content').innerHTML = `<div class="text-slate-700">Dashboard – čistá základní verze.</div>`;
}

async function mountModule(modId, tileOrFormId, kind = 'tile') {
  const mod = MODULES.find(m => m.id === modId);
  const tileMeta = mod?.tiles?.find(t => t.id === tileOrFormId) || { id: tileOrFormId, title: tileOrFormId };

  setBreadcrumbs([
    { label: 'Domů', href: '#/dashboard' },
    { label: mod?.title || modId, href: `#/m/${modId}/t/${mod?.defaultTile || 'seznam'}` },
    { label: tileMeta.title || tileMeta.id }
  ]);
  clearCrumbActions();

  const c = $id('content');
  c.innerHTML = `<div class="text-slate-500 p-2">Načítám…</div>`;

  try {
    // === 010: Správa uživatelů ===
    if (modId === '010-sprava-uzivatelu') {
      const tiles = await import('./modules/010-sprava-uzivatelu/tiles/index.js');
      await tiles.renderTile(tileOrFormId || 'seznam', c);
      // (volitelné) dynamické akce u breadcrumb:
      if (tiles.getActions) {
        const acts = await tiles.getActions({ kind, id: tileOrFormId });
        renderCrumbActions(acts);
      }
      return;
    }

    // fallback pro ostatní moduly (zatím bez obsahu)
    c.innerHTML = `
      <div class="text-slate-700">
        <div>Modul: <b>${modId}</b>, dlaždice: <b>${tileOrFormId || '-'}</b></div>
        <div class="mt-2 text-slate-500">Obsah zatím bez dat.</div>
      </div>`;
  } catch (err) {
    console.error('[APP] mountModule error', err);
    c.innerHTML = `<div class="p-3 bg-rose-50 border border-rose-200 rounded text-rose-700">
      Nepodařilo se načíst modul: ${modId}. Otevři konzoli pro detail.
    </div>`;
  }
}

function parseHash() {
  const h = location.hash || '';
  const m = h.match(/^#\/m\/([^\/]+)\/([tf])\/([^\/?#]+)(?:\?(.*))?$/);
  if (!m) return { view: 'dashboard' };
  return {
    view: 'module',
    mod:  m[1],
    kind: m[2] === 'f' ? 'form' : 'tile',
    id:   m[3],
    qs:   new URLSearchParams(m[4] || '')
  };
}

function route() {
  const h = parseHash();
  if (h.view === 'dashboard') return mountDashboard();
  const mod = MODULES.find(m => m.id === h.mod);
  const firstTile = mod?.defaultTile || mod?.tiles?.[0]?.id || 'seznam';
  const id = h.id || (h.kind === 'tile' ? firstTile : '');
  return mountModule(h.mod, id, h.kind);
}

// ===== SAFE BOOT (nech na konci souboru) ====================================
(() => {
  if (window.__APP_BOOTED__) return;
  window.__APP_BOOTED__ = true;

  window.addEventListener('error', (e) => {
    console.error('[APP] error', e.error || e);
    document.body.insertAdjacentHTML(
      'beforeend',
      '<div style="margin:1rem;padding:1rem;border:1px solid #fecaca;background:#fee2e2;color:#991b1b;border-radius:12px">Chyba při startu aplikace – otevři konzoli (F12 → Console) a pošli první červený řádek.</div>'
    );
  });
  window.addEventListener('unhandledrejection', (e) => {
    console.error('[APP] unhandled', e.reason || e);
  });

  document.addEventListener('DOMContentLoaded', () => {
    try {
      buildRoot();
      renderSidebar(MODULES);
      window.addEventListener('hashchange', route);
      route();
    } catch (err) {
      console.error('[APP] boot failed', err);
      document.body.insertAdjacentHTML(
        'beforeend',
        '<div style="margin:1rem;padding:1rem;border:1px solid #fecaca;background:#fee2e2;color:#991b1b;border-radius:12px">Aplikace se nepodařila spustit – viz konzole.</div>'
      );
    }
  });
})();
