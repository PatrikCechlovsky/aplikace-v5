// src/app.js — layout, router a „hloupý“ sidebar s outline dle manifestu

import { renderHeader } from './ui/header.js';
import { renderHeaderActions } from './ui/headerActions.js';
import { MODULE_SOURCES } from './app/modules.index.js';

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

// ===== Manifest loader & cache ==============================================
const _manifestCache = new Map();      // modId -> modul (exporty)
const _lightManifests = new Map();     // modId -> { id, title, icon, defaultTile, tiles, forms }

async function loadModuleById(modId) {
  if (_manifestCache.has(modId)) return _manifestCache.get(modId);
  for (const src of MODULE_SOURCES) {
    const mod = await src();
    const mf = await mod.getManifest?.();
    if (mf?.id === modId) {
      _manifestCache.set(modId, mod);
      _lightManifests.set(modId, {
        id: mf.id, title: mf.title, icon: mf.icon,
        defaultTile: mf.defaultTile, tiles: mf.tiles || [], forms: mf.forms || []
      });
      return mod;
    }
  }
  throw new Error(`Manifest pro modul '${modId}' nenalezen`);
}

// Načti lehké manifesty všech modulů (kvůli sidebaru)
async function loadAllLightManifests() {
  const promises = MODULE_SOURCES.map(async (src) => {
    try {
      const mod = await src();
      const mf = await mod.getManifest?.();
      if (mf && !_lightManifests.has(mf.id)) {
        _lightManifests.set(mf.id, {
          id: mf.id, title: mf.title, icon: mf.icon,
          defaultTile: mf.defaultTile, tiles: mf.tiles || [], forms: mf.forms || []
        });
      }
    } catch (_) {}
  });
  await Promise.all(promises);
}

// ===== Sidebar render (hloupý + outline jen u aktivního) ====================
async function renderSidebarModules(activeModId, activeManifest) {
  const sb = $id('sidebar');
  if (!sb) return;

  await loadAllLightManifests();

  const items = Array.from(_lightManifests.values()).sort((a,b) => a.id.localeCompare(b.id));

  sb.innerHTML = '';
  const title = E('div', { class:'font-semibold mb-2' }, 'Menu');
  const list  = E('ul', { class:'space-y-1' });
  sb.appendChild(title);
  sb.appendChild(list);

  items.forEach(mf => {
    const li = E('li');

    // modul button
    const btn = E('button', {
      class: `w-full text-left px-3 py-2 rounded flex items-center justify-between ${
        mf.id===activeModId ? 'bg-indigo-50 ring-1 ring-indigo-200 text-indigo-700 font-semibold' : 'text-slate-700 hover:bg-slate-50'
      }`
    }, [
      E('span', {}, `${mf.icon || '📁'} ${mf.title}`),
      E('span', { class:'text-slate-300' }, '›')
    ]);

    btn.onclick = (ev) => {
      ev.preventDefault();
      if (window.AppState?.isDirty?.()) {
        const ok = confirm('Máte rozdělanou práci. Odejít bez uložení?');
        if (!ok) return;
        window.AppState.clearDirty?.();
      }
      const first = mf.defaultTile || mf.tiles?.[0]?.id || '';
      navigateTo(`#/m/${mf.id}/t/${first}`);
    };

    li.appendChild(btn);

    // outline (jen u aktivního)
    if (mf.id === activeModId && activeManifest) {
      const ol = E('ul', { class:'mt-1 ml-2 space-y-1' });

      (activeManifest.tiles || []).forEach(t => {
        const a = E('a', {
          href: `#/m/${mf.id}/t/${t.id}`,
          class: 'block px-3 py-1.5 rounded text-slate-600 hover:bg-slate-50'
        }, `• ${t.title}`);
        a.onclick = (e)=> {
          e.preventDefault();
          if (window.AppState?.isDirty?.()) {
            const ok = confirm('Máte rozdělanou práci. Odejít bez uložení?');
            if (!ok) return;
            window.AppState.clearDirty?.();
          }
          navigateTo(a.getAttribute('href'));
        };
        ol.appendChild(E('li', {}, a));
      });

      (activeManifest.forms || []).forEach(f => {
        const a = E('a', {
          href: `#/m/${mf.id}/f/${f.id}`,
          class: 'block px-3 py-1.5 rounded text-slate-600 hover:bg-slate-50'
        }, `• ${f.title}`);
        a.onclick = (e)=> {
          e.preventDefault();
          if (window.AppState?.isDirty?.()) {
            const ok = confirm('Máte rozdělanou práci. Odejít bez uložení?');
            if (!ok) return;
            window.AppState.clearDirty?.();
          }
          navigateTo(a.getAttribute('href'));
        };
        ol.appendChild(E('li', {}, a));
      });

      li.appendChild(ol);
    }

    list.appendChild(li);
  });
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

// === HASH PARSER =============================================================
function parseHash() {
  const h = location.hash || '';
  // #/m/<mod>               → pouze modul (rozbalí outline, přesměrujeme na defaultTile)
  // #/m/<mod>/t/<tile>      → dlaždice
  // #/m/<mod>/f/<form>      → formulář
  const m = h.match(/^#\/m\/([^\/]+)(?:\/([tf])\/([^\/?#]+))?/);
  if (!m) return { view:'dashboard' };
  return {
    view: 'module',
    mod:  m[1],
    kind: m[2] === 'f' ? 'form' : (m[2] === 't' ? 'tile' : undefined),
    id:   m[3],
  };
}

// === ROUTER ==================================================================
async function route() {
  const h = parseHash();

  if (h.view === 'dashboard') {
    renderSidebarModules(null, null); // nic aktivního
    return mountDashboard();
  }

  try {
    const mod = await loadModuleById(h.mod);
    const manifest = await mod.getManifest();

    // Sidebar: zobraz moduly a outline aktivního
    await renderSidebarModules(manifest.id, manifest);

    // Sekce: když není v hash, vyber defaultTile
    const kind = h.kind || 'tile';
    const secId = h.id || manifest.defaultTile;

    // Breadcrumbs
    const tileTitle = manifest.tiles?.find(t=>t.id===secId)?.title;
    const formTitle = manifest.forms?.find(f=>f.id===secId)?.title;
    setBreadcrumbs([
      { label:'Domů', href:'#/dashboard' },
      { label: manifest.title, href:`#/m/${manifest.id}` },
      { label: tileTitle || formTitle || secId }
    ]);

    // Vykresli obsah
    const c = $id('content');
    c.innerHTML = `<div class="text-slate-500 p-2">Načítám…</div>`;
    await mod.render(kind, secId, c);

    // Akce vpravo (volitelné)
    const acts = await (mod.getActions?.({ kind, id: secId }) || []);
    renderCrumbActions(acts);

    // Pokud hash neměl sekci, doplň ji (bez smyčky)
    if (!h.kind || !h.id) {
      const frag = `#/m/${manifest.id}/${kind === 'form' ? 'f' : 't'}/${secId}`;
      if (location.hash !== frag) location.replace(frag);
    }
  } catch (err) {
    console.error('[APP] route error', err);
    $id('content').innerHTML = `
      <div class="p-3 bg-rose-50 border border-rose-200 rounded text-rose-700">
        Nepodařilo se načíst modul/sekci. Otevři konzoli pro detail.
      </div>`;
  }
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
      // prvotní render sidebaru bez aktivního modulu
      renderSidebarModules(null, null);
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
