// CLEAN BASE v3 — root, sidebar, routing + headerActions jako komponenta

import { renderHeaderActions, ACTION_PRESETS } from './ui/headerActions.js';

const MODULES = [
  { id:'010-uzivatele',   title:'Uživatelé',   icon:'👥', tiles:[{id:'seznam'}],  defaultTile:'seznam' },
  { id:'020-muj-ucet',    title:'Můj účet',    icon:'👤', tiles:[{id:'profil'}],  defaultTile:'profil' },
  { id:'030-pronajimatel',title:'Pronajímatel',icon:'🏢', tiles:[{id:'prehled'}], defaultTile:'prehled' },
  { id:'900-nastaveni',   title:'Nastavení',   icon:'⚙️', tiles:[{id:'aplikace'}],defaultTile:'aplikace' },
];

const $id = (x) => document.getElementById(x);
const el = (tag, attrs={}, children=[]) => {
  const e = document.createElement(tag);
  Object.entries(attrs).forEach(([k,v]) => {
    if (k === 'style' && typeof v === 'object') Object.assign(e.style, v);
    else if (k === 'class') e.className = v;
    else e.setAttribute(k, v);
  });
  (Array.isArray(children) ? children : [children]).forEach(ch => {
    if (typeof ch === 'string') e.appendChild(document.createTextNode(ch));
    else if (ch) e.appendChild(ch);
  });
  return e;
};

function buildRoot() {
  // skryj cokoli, co by mohlo zůstat v <body> (pojistka proti duplikátům)
  Array.from(document.body.children).forEach(ch => ch.tagName !== 'SCRIPT' && (ch.style.display = 'none'));

  // pojistka proti globálním CSS (neviditelný text apod.)
  const style = document.createElement('style');
  style.textContent = `
    #app_root, #app_root * , #app_root *::before, #app_root *::after {
      color:#0f172a !important; opacity:1 !important; filter:none !important; mix-blend-mode:normal !important;
      text-decoration:none !important; font-size:16px; line-height:1.4;
    }
    .btn {
      display:inline-flex; align-items:center; gap:.5rem;
      padding:.4rem .6rem; border:1px solid #e5e7eb; border-radius:.5rem; background:#fff;
      transition:background .12s ease-in-out;
    }
    .btn:hover { background:#f8fafc; }
    .iconbtn { width:34px; height:34px; display:inline-flex; align-items:center; justify-content:center; }
    .badge { padding:.15rem .45rem; border:1px solid #f59e0b; border-radius:.5rem; background:#fef3c7; color:#92400e; font-size:.75rem; font-weight:600; }
  `;
  document.head.appendChild(style);

  const root = el('div', { id:'app_root', style:{ maxWidth:'1400px', margin:'0 auto', padding:'16px' } });

  // HEADER
  const headerLeft = el('div', { class:'font-bold text-xl' }, 'Pronajímatel');

  // kontejner na akce vpravo (sem komponenta vyrenderuje tlačítka)
  const actionsContainer = el('div', { id:'header_actions' });

  const baseBadge = el('span', { class:'badge' }, 'BASE');

  const header = el('div', { class:'flex items-center gap-2 mb-3' }, [
    headerLeft,
    el('div', { class:'ml-auto flex items-center gap-2' }, [ actionsContainer, baseBadge ])
  ]);

  // LAYOUT
  const grid = el('div', { style:{ display:'grid', gridTemplateColumns:'260px 1fr', gap:'16px' } });
  const sidebar = el('aside', { id:'sidebar', class:'p-3 bg-white rounded-2xl border' });
  const section = el('section');

  const crumbs = el('div', { class:'flex items-center justify-between mb-2' }, [
    el('div', { id:'breadcrumbs', class:'text-xs text-slate-500' }, 'Dashboard'),
    el('div', { id:'crumb-actions', class:'flex items-center gap-2' })
  ]);
  const actionsBar = el('div', { id:'actions-bar', class:'mb-3 flex flex-wrap gap-2' });
  const content = el('div', { id:'content', class:'min-h-[60vh] bg-white rounded-2xl border p-4' });

  section.appendChild(crumbs);
  section.appendChild(actionsBar);
  section.appendChild(content);

  grid.appendChild(sidebar);
  grid.appendChild(section);

  root.appendChild(header);
  root.appendChild(grid);
  document.body.appendChild(root);

  // ❱❱ tady zavoláme komponentu headerActions s konfigurací
  const actions = [
    ACTION_PRESETS.search(() => {
      const q = prompt('Hledat:');
      if (q) $id('content').innerHTML = `<div class="text-slate-700">Výsledek hledání pro: <b>${q}</b> (placeholder)</div>`;
    }),
    ACTION_PRESETS.help(() => {
      $id('content').innerHTML = `<div class="text-slate-700">Nápověda – zatím prázdné. Přidáme později.</div>`;
    }),
    ACTION_PRESETS.account(() => {
      location.hash = '#/m/020-muj-ucet/t/profil';
      route();
    }),
    ACTION_PRESETS.logout(() => {
      // Později napojíme supabase.auth.signOut(); zatím návrat na login
      location.href = './index.html';
    }),
  ];

  renderHeaderActions(actionsContainer, actions);
}

function renderSidebar(mods) {
  const sb = $id('sidebar');
  sb.innerHTML = '';
  const title = el('div', { class:'font-semibold mb-2' }, 'Menu');
  const ul = el('ul', { class:'space-y-1' });

  mods.forEach(m => {
    const first = m.defaultTile || m.tiles?.[0]?.id || '';
    const href  = `#/m/${m.id}/t/${first}`;
    const a = el('a', { href, 'data-mod':m.id, class:'block px-3 py-2 rounded hover:bg-slate-100' }, `${m.icon || '📁'} ${m.title}`);
    ul.appendChild(el('li', {}, a));
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
  $id('breadcrumbs').innerHTML = `<a class="inline-flex items-center gap-1 px-2 py-1 rounded border bg-white text-sm" href="#/dashboard">🏠 Domů</a>`;
}

function mountDashboard() {
  breadcrumbsHome();
  $id('content').innerHTML = `<div class="text-slate-700">Dashboard – čistá základní verze.</div>`;
}

function mountModule(modId, tileId) {
  breadcrumbsHome();
  $id('content').innerHTML = `
    <div class="text-slate-700">
      <div class="mb-2 text-sm text-slate-500">Modul: <b>${modId}</b>, dlaždice: <b>${tileId || '-'}</b></div>
      <div>Obsah zatím bez dat (krok po kroku přidáme).</div>
    </div>`;
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
  mountModule(h.mod, tile);
}

document.addEventListener('DOMContentLoaded', () => {
  buildRoot();
  renderSidebar(MODULES);
  route();
});
