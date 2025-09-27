// DIAG v3 — tvrdé DOM renderování + jasné logy
console.log('[DIAG3] app.js loaded');

const $ = (id) => document.getElementById(id);

function ensureLayout() {
  // main
  let main = document.querySelector('main');
  if (!main) {
    main = document.createElement('main');
    main.style.maxWidth = '1400px';
    main.style.margin = '0 auto';
    main.style.padding = '16px';
    document.body.appendChild(main);
  }
  // wrapper (2 sloupce)
  let grid = main.querySelector('.diag-grid');
  if (!grid) {
    grid = document.createElement('div');
    grid.className = 'diag-grid';
    grid.style.display = 'grid';
    grid.style.gridTemplateColumns = '260px 1fr';
    grid.style.gap = '16px';
    main.appendChild(grid);
  }
  // sidebar
  if (!$('#sidebar')) {
    const aside = document.createElement('aside');
    aside.id = 'sidebar';
    aside.style.background = '#fff';
    aside.style.border = '1px solid #e5e7eb';
    aside.style.borderRadius = '16px';
    aside.style.padding = '12px';
    aside.style.minHeight = '120px';
    grid.insertAdjacentElement('afterbegin', aside);
  }
  // section + breadcrumbs + actions + content
  let section = grid.querySelector('section');
  if (!section) {
    section = document.createElement('section');
    grid.appendChild(section);
  }
  if (!$('#breadcrumbs')) {
    const row = document.createElement('div');
    row.style.display = 'flex';
    row.style.justifyContent = 'space-between';
    row.style.marginBottom = '8px';
    row.innerHTML = `
      <div id="breadcrumbs" style="font-size:12px;color:#64748b">Dashboard</div>
      <div id="crumb-actions"></div>`;
    section.appendChild(row);
  }
  if (!$('#actions-bar')) {
    const ab = document.createElement('div');
    ab.id = 'actions-bar';
    ab.style.marginBottom = '12px';
    section.appendChild(ab);
  }
  if (!$('#content')) {
    const c = document.createElement('div');
    c.id = 'content';
    c.style.minHeight = '60vh';
    c.style.background = '#fff';
    c.style.border = '1px solid #e5e7eb';
    c.style.borderRadius = '16px';
    c.style.padding = '16px';
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
  if (!root) { console.error('[DIAG3] #sidebar nenalezen'); return; }

  // Vykreslit čistým DOM API
  root.textContent = ''; // wipe
  const title = document.createElement('div');
  title.textContent = 'SIDEBAR';
  title.style.fontWeight = '600';
  title.style.marginBottom = '8px';
  root.appendChild(title);

  const ul = document.createElement('ul');
  ul.id = 'sb-list';
  ul.style.listStyle = 'none';
  ul.style.padding = '0';
  ul.style.margin = '0';
  root.appendChild(ul);

  mods.forEach(m => {
    const li = document.createElement('li');
    li.style.marginBottom = '6px';
    const a = document.createElement('a');
    a.href = `#/m/${m.id}/t/${m.defaultTile || (m.tiles && m.tiles[0] && m.tiles[0].id) || ''}`;
    a.dataset.mod = m.id;
    a.textContent = `${m.icon || '📁'} ${m.title}`;
    a.style.display = 'block';
    a.style.padding = '6px 8px';
    a.style.borderRadius = '8px';
    a.style.textDecoration = 'none';
    a.style.color = '#0f172a';
    a.onmouseenter = () => { a.style.background = '#f1f5f9'; };
    a.onmouseleave = () => { a.style.background = 'transparent'; };
    li.appendChild(a);
    ul.appendChild(li);
  });

  console.log('[DIAG3] sidebar items:', ul.children.length);
}

function breadcrumbsHome() {
  const b = $('#breadcrumbs');
  if (!b) return;
  b.innerHTML = `<span>🏠 Domů</span>`;
}

function mountDashboard() {
  breadcrumbsHome();
  const c = $('#content');
  if (!c) return;
  c.innerHTML = '';
  const h = document.createElement('div');
  h.textContent = 'Dashboard – DIAG placeholder.';
  c.appendChild(h);
}

function mountModule(modId, tileId) {
  breadcrumbsHome();
  const c = $('#content'); if (!c) return;
  c.innerHTML = '';
  const h = document.createElement('div');
  h.innerHTML = `Modul: <b>${modId}</b>, dlaždice: <b>${tileId || '-'}</b>`;
  c.appendChild(h);
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
  const tile = h.kind === 't'
    ? (h.id || mod?.defaultTile || mod?.tiles?.[0]?.id)
    : (mod?.defaultTile || mod?.tiles?.[0]?.id);
  mountModule(h.mod, tile);
}

document.addEventListener('DOMContentLoaded', () => {
  console.log('[DIAG3] DOM ready');
  ensureLayout();          // vytvoří chybějící #sidebar/#content
  renderSidebar(MODULES);  // naplní menu
  route();
  window.addEventListener('hashchange', route);
});
