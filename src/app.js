// DIAG v6 — tvrdé přebití stylů + velké debug texty
console.log('[DIAG6] app.js loaded');

const MODULES = [
  { id:'010-uzivatele',   title:'Uživatelé',   icon:'👥', tiles:[{id:'seznam'}],  defaultTile:'seznam' },
  { id:'020-muj-ucet',    title:'Můj účet',    icon:'👤', tiles:[{id:'profil'}],  defaultTile:'profil' },
  { id:'030-pronajimatel',title:'Pronajímatel',icon:'🏢', tiles:[{id:'prehled'}], defaultTile:'prehled' },
  { id:'900-nastaveni',   title:'Nastavení',   icon:'⚙️', tiles:[{id:'aplikace'}],defaultTile:'aplikace' },
];

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

function buildAppRoot() {
  // 1) schovej vše ostatní na stránce
  Array.from(document.body.children).forEach(ch => { ch.style.display = 'none'; });

  // 2) náš root
  const root = make('div', { id:'__diag_root__', style:{
    maxWidth:'1400px', margin:'0 auto', padding:'16px'
  }});

  // 3) tvrdé přebití stylů (barva, opacity, blend, filter, font-size)
  const style = document.createElement('style');
  style.textContent = `
    #__diag_root__, #__diag_root__ * , #__diag_root__ *::before, #__diag_root__ *::after {
      color: #0f172a !important;
      opacity: 1 !important;
      filter: none !important;
      mix-blend-mode: normal !important;
      text-decoration: none !important;
      font-size: 16px !important;
      line-height: 1.4 !important;
    }
    #__diag_root__ .dbg { font-weight: 800 !important; font-size: 22px !important; }
  `;
  document.head.appendChild(style);

  // Header
  const header = make('div', { style:{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'12px' }}, [
    make('div', { class:'dbg' }, 'Pronajímatel'),
    make('span', { style:{
      marginLeft:'auto', padding:'2px 6px', border:'1px solid #f59e0b',
      borderRadius:'8px', background:'#fef3c7', color:'#92400e', fontSize:'12px',
    }}, 'DIAG ROOT')
  ]);

  // Debug bar
  const dbgBar = make('div', { id:'__dbg__', style:{
    marginTop:'8px', marginBottom:'12px', padding:'8px',
    background:'#fff3cd', border:'1px solid #f8d7da', borderRadius:'8px', color:'#1f2937'
  }}, 'loading…');

  // Grid
  const grid = make('div', { id:'__grid__', style:{ display:'grid', gridTemplateColumns:'260px 1fr', gap:'16px' }});

  const sidebar = make('aside', { id:'sidebar', style:{
    background:'#fff', border:'1px solid #e5e7eb', borderRadius:'16px', padding:'12px', minHeight:'120px'
  }});

  const section = make('section');
  const crumbsRow = make('div', { style:{ display:'flex', justifyContent:'space-between', marginBottom:'8px' }}, [
    make('div', { id:'breadcrumbs' }, 'Dashboard'),
    make('div', { id:'crumb-actions' })
  ]);
  const actions = make('div', { id:'actions-bar', style:{ marginBottom:'12px' }});
  const content = make('div', { id:'content', style:{
    minHeight:'60vh', background:'#fff', border:'1px solid #e5e7eb', borderRadius:'16px', padding:'16px'
  }});

  section.appendChild(crumbsRow);
  section.appendChild(actions);
  section.appendChild(content);

  grid.appendChild(sidebar);
  grid.appendChild(section);

  root.appendChild(header);
  root.appendChild(dbgBar);
  root.appendChild(grid);

  document.body.appendChild(root);
  return { root, sidebar, content, dbgBar };
}

function renderSidebar(mods) {
  const sb = document.getElementById('sidebar');
  sb.innerHTML = '';
  const head = make('div', { class:'dbg', style:{ marginBottom:'8px', color:'#b91c1c' }}, 'SIDEBAR (DEBUG)');
  const ul = make('ul', { style:{ listStyle:'none', padding:'0', margin:'0' }});
  mods.forEach((m, i) => {
    const href = `#/m/${m.id}/t/${m.defaultTile || (m.tiles && m.tiles[0] && m.tiles[0].id) || ''}`;
    const a = make('a', { href, 'data-mod':m.id, style:{
      display:'block', padding:'10px 12px', borderRadius:'8px', color:'#0f172a', background: i%2? '#eef2f7':'transparent'
    }}, `${i+1}. ${m.icon || '📁'} ${m.title}`);
    a.onmouseenter = () => a.style.background = '#e2e8f0';
    a.onmouseleave = () => a.style.background = (i%2? '#eef2f7':'transparent');
    ul.appendChild(make('li', { style:{ marginBottom:'6px' }}, a));
  });
  sb.appendChild(head);
  sb.appendChild(ul);

  const cs = getComputedStyle(sb);
  console.log('[DIAG6] sidebar items:', ul.children.length, 'color:', cs.color, 'opacity:', cs.opacity);
  document.getElementById('__dbg__').textContent =
    `Sidebar items: ${ul.children.length} | color: ${cs.color} | opacity: ${cs.opacity}`;

  function markActive() {
    const hash = location.hash || '';
    const m = (/#\/m\/([^\/]+)/.exec(hash) || [])[1];
    ul.querySelectorAll('a[data-mod]').forEach(a => {
      const active = a.dataset.mod === m;
      a.style.background = active ? '#0f172a' : '#eef2f7';
      a.style.color = active ? '#fff' : '#0f172a';
    });
  }
  ul.addEventListener('click', () => setTimeout(route, 0));
  window.addEventListener('hashchange', markActive);
  markActive();
}

function breadcrumbsHome() {
  const b = document.getElementById('breadcrumbs');
  b.textContent = '🏠 Domů (DEBUG)';
}

function mountDashboard() {
  breadcrumbsHome();
  const c = document.getElementById('content');
  c.innerHTML = '';
  c.appendChild(make('div', { class:'dbg', style:{ color:'#065f46' }}, 'Dashboard – DIAG placeholder.'));
}

function mountModule(modId, tileId) {
  breadcrumbsHome();
  const c = document.getElementById('content');
  c.innerHTML = '';
  c.appendChild(make('div', { class:'dbg', style:{ color:'#1d4ed8' }}, `Modul: ${modId}, dlaždice: ${tileId || '-'}`));
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
  console.log('[DIAG6] DOM ready');
  buildAppRoot();
  renderSidebar(MODULES);
  route();
});
