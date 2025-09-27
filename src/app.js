// src/app.js — stabilní základ bez ACTION_PRESETS (oprava importu)
// - bezpečné logování chyb
// - render header (home + akční lišta z headerActions)
// - sidebar + jednoduché routování
// - žádné závislosti na neexistujících exportech

import { renderHeader } from './ui/header.js';
import { renderHeaderActions } from './ui/headerActions.js';

console.log('[APP] start');
window.addEventListener('error', (e) => console.error('[APP] window error', e.error || e));
window.addEventListener('unhandledrejection', (e) => console.error('[APP] unhandled', e.reason || e));

const MODULES = [
  { id:'010-uzivatele',   title:'Uživatelé',   icon:'👥', tiles:[{id:'seznam'}],  defaultTile:'seznam' },
  { id:'020-muj-ucet',    title:'Můj účet',    icon:'👤', tiles:[{id:'profil'}],  defaultTile:'profil' },
  { id:'030-pronajimatel',title:'Pronajímatel',icon:'🏢', tiles:[{id:'prehled'}], defaultTile:'prehled' },
  { id:'900-nastaveni',   title:'Nastavení',   icon:'⚙️', tiles:[{id:'aplikace'}],defaultTile:'aplikace' },
];

const $id = (x) => document.getElementById(x);
const E = (tag, attrs={}, children=[]) => {
  const el = document.createElement(tag);
  Object.entries(attrs).forEach(([k,v]) => {
    if (k === 'style' && typeof v === 'object') Object.assign(el.style, v);
    else if (k === 'class') el.className = v;
    else el.setAttribute(k, v);
  });
  (Array.isArray(children) ? children : [children]).forEach(ch => {
    if (typeof ch === 'string') el.appendChild(document.createTextNode(ch));
    else if (ch) el.appendChild(ch);
  });
  return el;
};

// Jednoduchý "dirty" stav pro budoucí formuláře (home ho bude respektovat)
const AppState = (() => {
  let dirty = false;
  return {
    isDirty: () => dirty,
    setDirty: (v) => { dirty = !!v; },
    clearDirty: () => { dirty = false; },
  };
})();
window.AppState = AppState;

function injectOnce(id, css) {
  if (document.getElementById(id)) return;
  const style = document.createElement('style');
  style.id = id;
  style.textContent = css;
  document.head.appendChild(style);
}

function buildRoot() {
  // skryj případné zbytky v <body> (když by tam něco bylo)
  Array.from(document.body.children).forEach(ch => ch.tagName !== 'SCRIPT' && (ch.style.display = 'none'));

  // pojistka proti globálním stylům (neviditelný text apod.)
  injectOnce('app-base-style', `
    #app_root, #app_root * , #app_root *::before, #app_root *::after {
      color:#0f172a !important; opacity:1 !important; filter:none !important; mix-blend-mode:normal !important;
      text-decoration:none !important; font-size:16px; line-height:1.4;
    }
    .badge { padding:.15rem .45rem; border:1px solid #f59e0b; border-radius:.5rem; background:#fef3c7; color:#92400e; font-size:.75rem; font-weight:600 }
  `);

  const root = E('div', { id:'app_root', style:{ maxWidth:'1400px', margin:'0 auto', padding:'16px' } });

  // HEADER (komponenta vytvoří: Home + kontejner pro akce vpravo)
  const headerHost = E('div');
  const { actionsContainer } = renderHeader(headerHost, {
    appName: 'Pronajímatel',
    onHome: () => {
      if (window.AppState?.isDirty?.()) {
        const ok = confirm('Máte rozdělanou neuloženou práci.\nChcete odejít bez uložení (OK) nebo zůstat (Zrušit)?');
        if (!ok) return;
        window.AppState.clearDirty?.();
      }
      location.hash = '#/dashboard';
      route();
    },
  });

  // BASE badge (stavový odznak vpravo u akcí)
  const baseBadge = E('span', { class:'badge' }, 'BASE');
  const badgeWrap = E('div', { class:'ml-2 inline-flex' }, [baseBadge]);

  // LAYOUT (sidebar + obsah)
  const grid = E('div', { style:{ display:'grid', gridTemplateColumns:'260px 1fr', gap:'16px' } });
  const sidebar = E('aside', { id:'sidebar', class:'p-3 bg-white rounded-2xl border' });
  const section = E('section');

  const crumbs = E('div', { class:'flex items-center justify-between mb-2' }, [
    E('div', { id:'breadcrumbs', class:'text-xs text-slate-500' }, 'Dashboard'),
    E('div', { id:'crumb-actions', class:'flex items-center gap-2' })
  ]);
  const actionsBar = E('div', { id:'actions-bar', class:'mb-3 flex flex-wrap gap-2' });
  const content = E('div', { id:'content', class:'min-h-[60vh] bg-white rounded-2xl border p-4' });

  section.appendChild(crumbs);
  section.appendChild(actionsBar);
  section.appendChild(content);

  grid.appendChild(sidebar);
  grid.appendChild(section);

  // mount do DOM
  root.appendChild(headerHost);
  // připnout BASE badge vedle akční lišty v headeru
  actionsContainer?.parentElement?.appendChild(badgeWrap);
  root.appendChild(grid);
  document.body.appendChild(root);

  // Pravá akční lišta v headeru (bez presetů – vše řeší komponenta)
  try {
    renderHeaderActions(actionsContainer);
  } catch (e) {
    console.warn('[APP] headerActions failed, rendering minimal logout only', e);
    // nouzové odhlášení
    const btn = E('button', { class:'px-3 py-1 bg-slate-800 text-white rounded' }, 'Odhlásit');
    btn.onclick = () => { location.href = './index.html'; };
    actionsContainer.appendChild(btn);
  }
}

function renderSidebar(mods) {
  const sb = $id('sidebar');
  sb.innerHTML = '';
  const title = E('div', { class:'font-semibold mb-2' }, 'Menu');
  const ul = E('ul', { class:'space-y-1' });

  mods.forEach(m => {
    const first = m.defaultTile || m.tiles?.[0]?.id || '';
    const href  = `#/m/${m.id}/t/${first}`;
    const a = E('a', { href, 'data-mod':m.id, class:'block px-3 py-2 rounded hover:bg-slate-100' }, `${m.icon || '📁'} ${m.title}`);
    ul.appendChild(E('li', {}, a));
  });

  sb.appendChild(title);
  sb.appendChild(ul);

  function markActive() {
    const m = (/#\/m\/([^\/]+)/.exec(location.hash) || [])[1];
    ul.querySelectorAll('a[data-mod]').forEach(a => {
      const active = a.dataset.mod === m;
      a.classList.toggle('bg-slate-900', active);
      a.classList.toggle('text-white', active);
      a.classList.toggle('hover:bg-slate-100', !active);
    });
  }
  ul.addEventListener('click', () => setTimeout(route, 0));
  window.addEventListener('hashchange', markActive);
  markActive();
}

function breadcrumbsHome() {
  $id('breadcrumbs').innerHTML =
    `<a class="inline-flex items-center gap-1 px-2 py-1 rounded border bg-white text-sm" href="#/dashboard">🏠 Domů</a>`;
}

function mountDashboard() {
  breadcrumbsHome();
  $id('content').innerHTML = `<div class="text-slate-700">Dashboard – čistá základní verze.</div>`;
}

async function mountModule(modId, tileId) {
  breadcrumbsHome();
  const c = $id('content');
  c.innerHTML = `<div class="text-slate-500 p-2">Načítám modul…</div>`;

  try {
    // lazy import podle modulu
    if (modId === '010-uzivatele') {
      const tiles = await import('./modules/010-sprava-uzivatelu/tiles/index.js');
      await tiles.renderTile(tileId || 'seznam', c);
      return;
    }
    // fallback
    c.innerHTML = `
      <div class="text-slate-700">
        <div class="mb-2 text-sm text-slate-500">Modul: <b>${modId}</b>, dlaždice: <b>${tileId || '-'}</b></div>
        <div>Obsah zatím bez dat.</div>
      </div>`;
  } catch (err) {
    console.error('[APP] mountModule error', err);
    c.innerHTML = `<div class="p-3 bg-rose-50 border border-rose-200 rounded text-rose-700">
      Nepodařilo se načíst modul: ${modId}. Otevři konzoli pro detail.
    </div>`;
  }
}

function parseHash() {
  const raw = (location.hash || '').replace(/^#\/?/, '');
  const p = raw.split('?')[0].split('/').filter(Boolean);
  if (p[0] !== 'm') return { view:'dashboard' };
  return { view:'module', mod:p[1], kind:p[2], id:p[3] };
}

function route() {
  const h = parseHash();
  if (h.view === 'dashboard') return mountDashboard();
  const mod = MODULES.find(m => m.id === h.mod);
  const tile = h.kind === 't'
    ? (h.id || mod?.defaultTile || mod?.tiles?.[0]?.id)
    : (mod?.defaultTile || mod?.tiles?.[0]?.id);
  return mountModule(h.mod, tile);
}

// BOOT
document.addEventListener('DOMContentLoaded', () => {
  console.log('[APP] DOM ready');
  try {
    buildRoot();
    renderSidebar(MODULES);
    route();
  } catch (err) {
    console.error('[APP] boot failed', err);
    const el = document.body;
    const box = document.createElement('div');
    box.className = 'm-4 p-4 border rounded bg-amber-50';
    box.textContent = 'Aplikace se nepodařila spustit. Otevři konzoli pro více informací.';
    el.appendChild(box);
  }
});
