// DIAG v2 – vytvoří layout, když v HTML chybí
console.log('[DIAG] app.js loaded');

const $ = (id) => document.getElementById(id);
const setHTML = (el, html) => { if (el) el.innerHTML = html; };

function ensureLayout() {
  // main
  let main = document.querySelector('main');
  if (!main) {
    main = document.createElement('main');
    main.className = 'max-w-[1400px] mx-auto p-4';
    document.body.appendChild(main);
  }
  // grid
  let grid = main.querySelector('.grid');
  if (!grid) {
    grid = document.createElement('div');
    grid.className = 'grid grid-cols-[260px_1fr] gap-4';
    main.appendChild(grid);
  }
  // sidebar
  if (!$('#sidebar')) {
    const aside = document.createElement('aside');
    aside.id = 'sidebar';
    aside.className = 'p-2 bg-white rounded-2xl border';
    grid.insertAdjacentElement('afterbegin', aside);
  }
  // section
  let section = grid.querySelector('section');
  if (!section) {
    section = document.createElement('section');
    grid.appendChild(section);
  }
  // breadcrumbs + actions
  if (!$('#breadcrumbs')) {
    const row = document.createElement('div');
    row.className = 'flex items-center justify-between mb-2';
    row.innerHTML = `
      <div id="breadcrumbs" class="text-xs text-slate-500">Dashboard</div>
      <div id="crumb-actions" class="flex items-center gap-2"></div>`;
    section.appendChild(row);
  }
  // actions bar
  if (!$('#actions-bar')) {
    const ab = document.createElement('div');
    ab.id = 'actions-bar';
    ab.className = 'mb-3 flex flex-wrap gap-2';
    section.appendChild(ab);
  }
  // content
  if (!$('#content')) {
    const c = document.createElement('div');
    c.id = 'content';
    c.className = 'min-h-[60vh]';
    section.appendChild(c);
  }
}

const MODULES = [
  { id:'010-uzivatele',   title:'Uživatelé',   icon:'👥', tiles:[{id:'seznam'}],  defaultTile:'seznam' },
  { id:'020-muj-ucet',    title:'Můj účet',    icon:'👤', tiles:[{id:'profil'}],  defaultTile:'profil' },
  { id:'030-pronajimatel',title:'Pronajímatel',icon:'🏢', tiles:[{id:'prehled'}], defaultTile:'prehled' },
  { id:'900-nastaveni',   title:'Nastavení',   icon:'⚙️', tiles:[{id:'aplikace'}],defaultTile:'aplikace' },
];

function renderSidebar(mods) {
  const root = $('#sidebar');
  root.innerHTML = `
    <nav class="space-y-1 text-slate-900">
      <ul id="sb-list" class="space-y-1">
        ${mods.map(m => {
          const first = m.defaultTile || m.tiles?.[0]?.id || '';
          const href  = `#/m/${m.id}${first ? `/t/${first}` : ''}`;
          return `<li>
            <a data-mod="${m.id}" href="${href}" class="block px-3 py-2 rounded hover:bg-slate-100">
              <span class="mr-2">${m.icon || '📁'}</span><span>${m.title}</span>
            </a>
          </li>`;
        }).join('')}
      </ul>
    </nav>
  `;
  function markActive() {
    const hash = location.hash || '';
    const m = (/#\/m\/([^\/]+)/.exec(hash) || [])[1];
    root.querySelectorAll('a[data-mod]').forEach(a => {
      const active = a.dataset.mod === m;
      a.classList.toggle('bg-slate-900', active);
      a.classList.toggle('text-white', active);
      a.classList.toggle('hover:bg-slate-100', !active);
    });
  }
  root.addEventListener('click', e => {
    const a = e.target.closest('a[data-mod]');
    if (!a) return;
    setTimeout(() => route(), 0);
  });
  window.addEventListener('hashchange', markActive);
  markActive();
}

function breadcrumbsHome() {
  setHTML($('#breadcrumbs'),
    `<a class="inline-flex items-center gap-1 px-2 py-1 rounded border bg-white text-sm" href="#/dashboard">🏠 Domů</a>`
  );
}
function mountDashboard() {
  breadcrumbsHome();
  setHTML($('#content'), `<div class="p-4 bg-white rounded-2xl border">Dashboard – DIAG placeholder.</div>`);
}
function mountModule(modId, tileId) {
  const mod = MODULES.find(m => m.id === modId);
  breadcrumbsHome();
  setHTML($('#content'), `
    <div class="p-4 bg-white rounded-2xl border">
      <div class="text-sm text-slate-500 mb-2">Modul: <b>${mod?.title || modId}</b>, dlaždice: <b>${tileId || '-'}</b></div>
      <div>DIAG obsah (zatím bez dat).</div>
    </div>
  `);
}
function parseHash() {
  const raw = (location.hash || '').replace(/^#\/?/, '');
  const p = raw.split('?')[0].split('/').filter(Boolean);
  if (p[0] !== 'm') return { view:'dashboard' };
  return { view:'module', mod:p[1], kind:p[2], id:p[3] };
}
function route() {
  const h = parseHash();
  if (h.view === 'dashboard') { mountDashboard(); return; }
  const mod = MODULES.find(m => m.id === h.mod);
  const tile = h.kind === 't' ? (h.id || mod?.defaultTile || mod?.tiles?.[0]?.id) : (mod?.defaultTile || mod?.tiles?.[0]?.id);
  mountModule(h.mod, tile);
}

document.addEventListener('DOMContentLoaded', () => {
  console.log('[DIAG] DOM ready');
  ensureLayout();          // ← vytvoří chybějící #sidebar/#content/…
  renderSidebar(MODULES);  // ← teď už určitě existuje
  route();
});
