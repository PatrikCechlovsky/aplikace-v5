// CLEAN BASE v1 — jeden soubor, žádné importy, vlastní root, sidebar + obsah

const MODULES = [
  { id:'010-uzivatele',   title:'Uživatelé',   icon:'👥', tiles:[{id:'seznam'}],  defaultTile:'seznam' },
  { id:'020-muj-ucet',    title:'Můj účet',    icon:'👤', tiles:[{id:'profil'}],  defaultTile:'profil' },
  { id:'030-pronajimatel',title:'Pronajímatel',icon:'🏢', tiles:[{id:'prehled'}], defaultTile:'prehled' },
  { id:'900-nastaveni',   title:'Nastavení',   icon:'⚙️', tiles:[{id:'aplikace'}],defaultTile:'aplikace' },
];

const $id = (x) => document.getElementById(x);

function make(tag, attrs={}, children=[]) {
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
}

function buildRoot() {
  // skryj cokoli v <body> (kdyby tam něco zůstalo)
  Array.from(document.body.children).forEach(ch => ch.tagName !== 'SCRIPT' && (ch.style.display = 'none'));

  // pojistka proti „neviditelnému“ textu z globálních CSS
  const style = document.createElement('style');
  style.textContent = `
    #app_root, #app_root * , #app_root *::before, #app_root *::after {
      color:#0f172a !important; opacity:1 !important; filter:none !important; mix-blend-mode:normal !important;
      text-decoration:none !important; font-size:16px; line-height:1.4;
    }
  `;
  document.head.appendChild(style);

  const root = make('div', { id:'app_root', style:{ maxWidth:'1400px', margin:'0 auto', padding:'16px' } });

  const header = make('div', { class:'flex items-center gap-2 mb-3' }, [
    make('div', { class:'font-bold text-xl' }, 'Pronajímatel'),
    make('span', { class:'ml-auto px-2 py-0.5 rounded text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200' }, 'BASE')
  ]);

  const grid = make('div', { class:'grid', style:{ display:'grid', gridTemplateColumns:'260px 1fr', gap:'16px' } });

  const sidebar = make('aside', { id:'sidebar', class:'p-3 bg-white rounded-2xl border' });
  const section = make('section');

  const crumbs = make('div', { class:'flex items-center justify-between mb-2' }, [
    make('div', { id:'breadcrumbs', class:'text-xs text-slate-500' }, 'Dashboard'),
    make('div', { id:'crumb-actions', class:'flex items-center gap-2' })
  ]);
  const actions = make('div', { id:'actions-bar', class:'mb-3 flex flex-wrap gap-2' });
  const content = make('div', { id:'content', class:'min-h-[60vh] bg-white rounded-2xl border p-4' });

  section.appendChild(crumbs);
  section.appendChild(actions);
  section.appendChild(content);

  grid.appendChild(sidebar);
  grid.appendChild(section);

  root.appendChild(header);
  root.appendChild(grid);
  document.body.appendChild(root);
}

function renderSidebar(mods) {
  const sb = $id('sidebar');
  sb.innerHTML = '';
  const title = make('div', { class:'font-semibold mb-2' }, 'Menu');
  const ul = make('ul', { class:'space-y-1' });

  mods.forEach(m => {
    const first = m.defaultTile || m.tiles?.[0]?.id || '';
    const href  = `#/m/${m.id}/t/${first}`;
    const a = make('a', { href, 'data-mod':m.id, class:'block px-3 py-2 rounded hover:bg-slate-100' }, `${m.icon || '📁'} ${m.title}`);
    ul.appendChild(make('li', {}, a));
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
