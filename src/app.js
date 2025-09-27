// DIAG v5 — vlastní root + tvrdé přebarvení textu !important
console.log('[DIAG5] app.js loaded');

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
  // schovat vše ostatní na stránce (aby nebyly duplikáty)
  Array.from(document.body.children).forEach(ch => { ch.style.display = 'none'; });

  // náš root
  const root = make('div', { id: '__diag_root__', style:{
    maxWidth:'1400px', margin:'0 auto', padding:'16px'
  }});

  // tvrdé přebarvení textu v rootu (CSS s !important)
  const style = document.createElement('style');
  style.textContent = `
    #__diag_root__, #__diag_root__ * { color: #0f172a !important; font-family: system-ui, sans-serif; }
    #__diag_root__ a { text-decoration: none !important; }
  `;
  document.head.appendChild(style);

  // header
  const header = make('div', { style:{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'12px' }}, [
    make('div', { style:{ fontWeight:'700', fontSize:'18px' }}, 'Pronajímatel'),
    make('span', { style:{
      marginLeft:'auto', padding:'2px 6px', border:'1px solid #f59e0b',
      borderRadius:'8px', background:'#fef3c7', color:'#92400e', fontSize:'12px',
    }}, 'DIAG ROOT')
  ]);

  // grid
  const grid = make('div', { id:'__grid__', style:{ display:'grid', gridTemplateColumns:'260px 1fr', gap:'16px' }});

  const sidebar = make('aside', { id:'sidebar', style:{
    background:'#fff', border:'1px solid #e5e7eb', borderRadius:'16px', padding:'12px', minHeight:'120px'
  }});

  const section = make('section');
  const crumbsRow = make('div', { style:{ display:'flex', justifyContent:'space-between', marginBottom:'8px' }}, [
    make('div', { id:'breadcrumbs', style:{ fontSize:'12px' }}, 'Dashboard'),
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
  root.appendChild(grid);

  document.body.appendChild(root);
  return { root, sidebar, content };
}

function renderSidebar(mods) {
  const sb = document.getElementById('sidebar');
  sb.innerHTML = '';
  const title = make('div', { style:{ fontWeight:'700', marginBottom:'8px', fontSize:'14px' }}, 'SIDEBAR');
  const ul = make('ul', { style:{ listStyle:'none', padding:'0', margin:'0' }});
  mods.forEach(m => {
    const href = `#/m/${m.id}/t/${m.defaultTile || (m.tiles && m.tiles[0] && m.tiles[0].id) || ''}`;
    const a = make('a', { href, 'data-mod':m.id, style:{
      display:'block', padding:'8px 10px', borderRadius:'8px', color:'#0f172a'
    }}, `${m.icon || '📁'} ${m.title}`);
    a.onmouseenter = () => a.style.background = '#eef2f7';
    a.onmouseleave = () => a.style.background = 'transparent';
    ul.appendChild(make('li', { style:{ marginBottom:'6px' }}, a));
  });
  sb.appendChild(title);
  sb.appendChild(ul);

  console.log('[DIAG5] sidebar items:', ul.children.length, 'color:', getComputedStyle(sb).color);

  function markActive() {
    const hash = location.hash || '';
    const m = (/#\/m\/([^\/]+)/.exec(hash) || [])[1];
    ul.querySelectorAll('a[data-mod]').forEach(a => {
      const active = a.dataset.mod === m;
      a.style.background = active ? '#0f172a' : 'transparent';
      a.style.color = active ? '#fff' : '#0f172a';
    });
  }
  ul.addEventListener('click', () => setTimeout(route, 0));
  window.addEventListener('hashchange', markActive);
  markActive();
}

function breadcrumbsHome() {
  const b = document.getElementById('breadcrumbs');
  b.textContent = '🏠 Domů';
}

function mountDashboard() {
  breadcrumbsHome();
  const c = document.getElementById('content');
  c.innerHTML = '';
  c.appendChild(make('div', { style:{ fontSize:'16px', fontWeight:'600' }}, 'Dashboard – DIAG placeholder.'));
}

function mountModule(modId, tileId) {
  breadcrumbsHome();
  const c = document.getElementById('content');
  c.innerHTML = '';
  c.appendChild(make('div', { style:{ fontSize:'16px', fontWeight:'600' }}, `Modul: ${modId}, dlaždice: ${tileId || '-'}`));
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
  console.log('[DIAG5] DOM ready');
  buildAppRoot();
  renderSidebar(MODULES);
  route();
});
