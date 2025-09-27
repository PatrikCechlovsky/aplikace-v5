// src/app.js — layout + routing + jemnější UI aktivních prvků

import { renderHeader } from './ui/header.js';
import { renderHeaderActions } from './ui/headerActions.js';

console.log('[APP] start');
window.addEventListener('error', (e) => console.error('[APP] window error', e.error || e));
window.addEventListener('unhandledrejection', (e) => console.error('[APP] unhandled', e.reason || e));

const MODULES = [
  { id:'010-uzivatele',   title:'Uživatelé',   icon:'👥', tiles:[{id:'seznam', title:'Seznam'}],  defaultTile:'seznam' },
  { id:'020-muj-ucet',    title:'Můj účet',    icon:'👤', tiles:[{id:'profil', title:'Profil'}],  defaultTile:'profil' },
  { id:'030-pronajimatel',title:'Pronajímatel',icon:'🏢', tiles:[{id:'prehled', title:'Přehled'}], defaultTile:'prehled' },
  { id:'900-nastaveni',   title:'Nastavení',   icon:'⚙️', tiles:[{id:'aplikace', title:'Aplikace'}],defaultTile:'aplikace' },
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

// jednoduchý signal "dirty" pro budoucí formuláře
const AppState = (() => {
  let dirty = false;
  return { isDirty: () => dirty, setDirty:(v)=>{dirty=!!v;}, clearDirty:()=>{dirty=false;} };
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
  injectOnce('app-base-style', `
    #app_root, #app_root * , #app_root *::before, #app_root *::after {
      color:#0f172a; opacity:1; filter:none; mix-blend-mode:normal;
      text-decoration:none; font-size:16px; line-height:1.4;
    }
    .badge { padding:.15rem .45rem; border:1px solid #dbeafe; border-radius:.5rem; background:#eff6ff; color:#1e40af; font-size:.75rem; font-weight:600 }
  `);

  const root = E('div', { id:'app_root', style:{ maxWidth:'1400px', margin:'0 auto', padding:'16px' } });

  // --- HEADER
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

  // base badge vpravo v headeru
  const baseBadge = E('span', { class:'badge' }, 'BASE');
  const badgeWrap = E('div', { class:'ml-2 inline-flex' }, [baseBadge]);

  // --- GRID
  const grid = E('div', { style:{ display:'grid', gridTemplateColumns:'260px 1fr', gap:'16px' } });
  const sidebar = E('aside', { id:'sidebar', class:'p-3 bg-white rounded-2xl border' });
  const section = E('section');

  // breadcrumbs + akce na JEDNOM řádku
  const crumbs = E('div', { class:'flex items-center justify-between mb-2 gap-3' }, [
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

  // pravá akční lišta v headeru
  try { renderHeaderActions(actionsContainer); }
  catch (e) {
    console.warn('[APP] headerActions failed', e);
    const btn = E('button', { class:'px-3 py-1 border rounded' }, 'Odhlásit');
    btn.onclick = () => location.href = './index.html';
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
    const a = E('a', {
      href, 'data-mod':m.id,
      class:'block px-3 py-2 rounded text-slate-700 hover:bg-slate-100'
    }, `${m.icon || '📁'} ${m.title}`);
    ul.appendChild(E('li', {}, a));
  });

  sb.appendChild(title);
  sb.appendChild(ul);

  function markActive() {
    const m = (/#\/m\/([^\/]+)/.exec(location.hash) || [])[1];
    ul.querySelectorAll('a[data-mod]').forEach(a => {
      const active = a.dataset.mod === m;
      a.classList.toggle('bg-indigo-50', active);
      a.classList.toggle('text-indigo-700', active);
      a.classList.toggle('ring-1', active);
      a.classList.toggle('ring-inset', active);
      a.classList.toggle('ring-indigo-200', active);
      a.classList.toggle('font-semibold', active);
      a.classList.toggle('hover:bg-slate-100', !active);
      a.classList.toggle('text-slate-700', !active);
    });
  }
  ul.addEventListener('click', () => setTimeout(route, 0));
  window.addEventListener('hashchange', markActive);
  markActive();
}

function setBreadcrumbs(parts) {
  // parts: [{label, href?}]
  const bc = $id('breadcrumbs');
  bc.innerHTML = parts.map((p,i) => {
    const sep = i ? '<span class="text-slate-300">/</span>' : '';
    if (p.href) {
      return `${sep}<a class="hover:underline" href="${p.href}">${p.label}</a>`;
    }
    return `${sep}<span>${p.label}</span>`;
  }).join(' ');
}
function clearCrumbActions() {
  const ca = $id('crumb-actions');
  if (ca) ca.innerHTML = '';
}

function mountDashboard() {
  setBreadcrumbs([{label:'Domů'}]);
  clearCrumbActions();
  $id('content').innerHTML = `<div class="text-slate-700">Dashboard – čistá základní verze.</div>`;
}

async function mountModule(modId, tileId) {
  const mod = MODULES.find(m => m.id === modId);
  const tileMeta = mod?.tiles?.find(t => t.id === tileId) || { id: tileId, title: tileId };
  setBreadcrumbs([
    {label:'Domů', href:'#/dashboard'},
    {label: mod?.title || modId, href:`#/m/${modId}/t/${mod?.defaultTile || tileId}`},
    {label: tileMeta.title || tileMeta.id}
  ]);
  clearCrumbActions();

  const c = $id('content');
  c.innerHTML = `<div class="text-slate-500 p-2">Načítám modul…</div>`;

  try {
    if (modId === '010-uzivatele') {
      const tiles = await import('./modules/010-sprava-uzivatelu/tiles/index.js');
      await tiles.renderTile(tileId || 'seznam', c);
      return;
    }
    c.innerHTML = `
      <div class="text-slate-700">
        <div>Modul: <b>${modId}</b>, dlaždice: <b>${tileId || '-'}</b></div>
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
