// src/ui/commonActions.js
// Kompaktní ikonové akce s kompatibilitou pro různé tvary permissions.
// Přidán jednoduchý export `toast(message, type, opts)` pro kompatibilitu s formuláři.

import { icon as uiIcon } from './icons.js';
import { getAllowedActions } from '../security/permissions.js';

// Katalog známých akcí (label/title jen pro tooltipy)
const CATALOG = {
  detail:  { key: 'detail',  icon: 'grid',     label: 'Přehled vazeb',    title: 'Zobrazit přehled vazeb' },
  add:     { key: 'add',     icon: 'add',        label: 'Přidat',    title: 'Přidat nový záznam' },
  edit:    { key: 'edit',    icon: 'edit',       label: 'Upravit',   title: 'Upravit záznam' },
  delete:  { key: 'delete',  icon: 'delete',     label: 'Smazat',    title: 'Smazat záznam' },
  archive: { key: 'archive', icon: 'archive',    label: 'Archivovat',title: 'Přesunout do archivu' },
  attach:  { key: 'attach',  icon: 'paperclip',  label: 'Přílohy',   title: 'Zobrazit přílohy' },
  refresh: { key: 'refresh', icon: 'refresh',    label: 'Obnovit',   title: 'Obnovit data' },
  search:  { key: 'search',  icon: 'search',     label: 'Hledat',    title: 'Hledat / filtrovat' },

  approve: { key: 'approve', icon: 'save',       label: 'Uložit',    title: 'Uložit a zůstat' },
  reject:  { key: 'reject',  icon: 'reject',     label: 'Zpět',      title: 'Zpět bez uložení' },

  invite:  { key: 'invite',  icon: 'invite',     label: 'Pozvat',    title: 'Odeslat pozvánku e-mailem' },
  send:    { key: 'send',    icon: 'send',       label: 'Odeslat',   title: 'Odeslat dokument / e-mail' },

  export:  { key: 'export',  icon: 'export',     label: 'Export',    title: 'Exportovat' },
  import:  { key: 'import',  icon: 'import',     label: 'Import',    title: 'Importovat' },
  print:   { key: 'print',   icon: 'print',      label: 'Tisk',      title: 'Vytisknout' },

  // oblíbené (renderuj jen pokud existuje handler onStar)
  star:    { key: 'star',    icon: 'star',       label: 'Oblíbené',  title: 'Přidat/odebrat z oblíbených' },

  history: { key: 'history', icon: 'history',    label: 'Historie',  title: 'Zobrazit historii změn' },

  units:   { key: 'units',   icon: 'grid',       label: 'Jednotky',  title: 'Správa jednotek' },
  wizard:  { key: 'wizard',  icon: 'compass',    label: 'Průvodce',  title: 'Spustit průvodce' },
};

// Když nepředáš moduleActions, odvozujeme je z názvů handlerů (onAdd → 'add'…)
function deriveFromHandlers(handlers = {}) {
  return Object.keys(handlers)
    .filter(k => k.startsWith('on'))
    .map(k => k.slice(2).replace(/^[A-Z]/, c => c.toLowerCase()));
}

// Normalizace výsledku getAllowedActions
function normalizeAllowed(input = [], fallbackKeys = []) {
  if (!Array.isArray(input) || !input.length) {
    return fallbackKeys.map(k => ({ ...(CATALOG[k] || { key: k, icon: k }), key: k }));
  }
  return input.map(a => {
    if (typeof a === 'string') {
      const k = a;
      return { ...(CATALOG[k] || { key: k, icon: k }), key: k };
    }
    const k = a.key || a.id;
    const base = CATALOG[k] || {};
    return {
      key: k,
      icon: a.icon || base.icon || k,
      label: a.label || base.label || k,
      title: a.title || base.title || a.label || k,
      href: a.href || base.href || null,
      // allow passing entityId via action descriptor (optional)
      entityId: a.entityId || a.id || null
    };
  });
}

/**
 * @param {HTMLElement} root
 * @param {{ moduleActions?:string[]|object[], userRole?:string, handlers?:Record<string,Function>, isStarred?:boolean }} param1
 */
export function renderCommonActions(
  root,
  { moduleActions = null, userRole = 'admin', handlers = {}, isStarred = false } = {}
) {
  if (!root) return;
  root.innerHTML = '';

  const wantedKeys = (moduleActions && moduleActions.length)
    ? moduleActions
    : deriveFromHandlers(handlers);

  let allowedRaw = [];
  try {
    allowedRaw = getAllowedActions(userRole, wantedKeys) || [];
  } catch {
    allowedRaw = wantedKeys;
  }

  let acts = normalizeAllowed(allowedRaw, wantedKeys);

  if (typeof handlers.onStar === 'function') {
    acts = acts.concat([{ ...CATALOG.star, title: isStarred ? 'Odebrat z oblíbených' : 'Přidat do oblíbených' }]);
  }

  const PREFERRED_ORDER = [
    'save', 'approve', 'add', 'edit', 'invite', 'send', 'attach', 'units', 'history',
    'refresh', 'search', 'print', 'export', 'import', 'archive', 'delete',
    'reject', 'exit', 'star', 'detail'
  ];
  const LAST_KEYS = new Set(['reject', 'exit']);

  function orderIndex(key) {
    if (LAST_KEYS.has(key)) return 1000;
    const idx = PREFERRED_ORDER.indexOf(key);
    if (idx === -1) return 500;
    return idx;
  }

  acts.sort((a, b) => orderIndex(a.key) - orderIndex(b.key));

  if (!acts.length) {
    root.innerHTML = `<div class="text-slate-400 text-sm italic p-2">Žádné dostupné akce</div>`;
    return;
  }

  const wrap = document.createElement('div');
  wrap.className = 'flex items-center gap-2';

  acts.forEach(act => {
    const handlerName = 'on' + act.key.charAt(0).toUpperCase() + act.key.slice(1);
    const handler = handlers[handlerName];

    if (typeof handler === 'function') {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = [
        'relative flex items-center justify-center w-8 h-8 rounded-md border transition',
        'border-slate-200 bg-white hover:bg-slate-100',
        'text-slate-700 text-lg'
      ].join(' ');
      btn.innerHTML = uiIcon(act.icon);
      btn.title = act.title || act.label || act.key;
      btn.setAttribute('aria-label', act.label || act.key);
      btn.addEventListener('click', (ev) => {
        try {
          handler(ev);
        } catch (e) {
          console.error('commonAction handler error', act.key, e);
          alert('Chyba akce: ' + (e?.message || String(e)));
        }
      });
      if (act.key === 'star' && isStarred) btn.classList.add('!bg-yellow-100');
      wrap.appendChild(btn);
      return;
    }

    if (act.href) {
      const a = document.createElement('a');
      // allow act.href templates like "/.../detail-tabs" and optionally attach entity id
      a.href = act.href;
      if (act.entityId) a.dataset.entityId = String(act.entityId);
      a.className = [
        'relative inline-flex items-center justify-center w-8 h-8 rounded-md border transition',
        'border-slate-200 bg-white hover:bg-slate-100',
        'text-slate-700 text-lg no-underline'
      ].join(' ');
      a.innerHTML = uiIcon(act.icon);
      a.title = act.title || act.label || act.key;
      a.setAttribute('aria-label', act.label || act.key);
      if (typeof window.navigateTo === 'function') {
        a.addEventListener('click', (ev) => {
          ev.preventDefault();
          try { window.navigateTo(a.getAttribute('href')); } catch (e) { location.href = a.getAttribute('href'); }
        });
      }
      wrap.appendChild(a);
      return;
    }

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = [
      'relative flex items-center justify-center w-8 h-8 rounded-md border transition',
      'border-slate-200 bg-white',
      'text-slate-700 text-lg opacity-40 cursor-not-allowed'
    ].join(' ');
    btn.innerHTML = uiIcon(act.icon);
    btn.title = (act.title || act.label || act.key) + ' – akce není dostupná';
    btn.setAttribute('aria-label', act.label || act.key);
    btn.disabled = true;
    wrap.appendChild(btn);
  });

  root.appendChild(wrap);
}

export { CATALOG };

/**
 * Small exported toast helper for forms and other UI parts.
 */
export function toast(message, type = 'info', opts = {}) {
  try {
    if (typeof window.showAppToast === 'function') {
      window.showAppToast({ message, type, ...opts });
      return true;
    }

    const containerId = 'app-toast-container';
    let container = document.getElementById(containerId);
    if (!container) {
      container = document.createElement('div');
      container.id = containerId;
      container.style.position = 'fixed';
      container.style.right = '18px';
      container.style.top = '18px';
      container.style.zIndex = 9999;
      container.style.display = 'flex';
      container.style.flexDirection = 'column';
      container.style.alignItems = 'flex-end';
      document.body.appendChild(container);
    }

    const el = document.createElement('div');
    el.textContent = message;
    el.style.marginTop = '8px';
    el.style.padding = '8px 12px';
    el.style.borderRadius = '8px';
    el.style.background = type === 'error' ? '#fee2e2' : '#ecfeff';
    el.style.color = '#111827';
    el.style.boxShadow = '0 2px 6px rgba(0,0,0,0.08)';
    el.style.maxWidth = '360px';
    el.style.fontSize = '13px';
    el.style.lineHeight = '1.2';
    container.appendChild(el);

    setTimeout(() => {
      el.style.transition = 'opacity 250ms ease';
      el.style.opacity = '0';
      setTimeout(() => el.remove(), 260);
    }, opts.duration || 3500);

    return true;
  } catch (e) {
    try { console.log('toast:', type, message); } catch (e2) {}
    return false;
  }
}

/**
 * Delegated click handler (fallback) to ensure links that point to "detail-tabs" navigate to entity-specific URL
 * if a data-entity-id is present on the anchor but the href does not already include the id.
 *
 * This helps when sidebar/menu links are rendered in a context without the id embedded in href.
 */
(function setupDetailTabsHandler() {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  // avoid double-registration (module is singleton, but be defensive)
  if (window.__commonActions_detailTabsHandlerRegistered) return;
  window.__commonActions_detailTabsHandlerRegistered = true;

  document.addEventListener('click', function (e) {
    try {
      const a = e.target.closest && e.target.closest('a');
      if (!a) return;
      const href = a.getAttribute('href') || '';
      if (!href.includes('/detail-tabs')) return;
      const eid = a.dataset && a.dataset.entityId;
      if (!eid) return; // nothing to do
      // if href already includes an id segment after detail-tabs, do nothing
      if (/\/detail-tabs\/[^\/#?]+/.test(href)) return;
      // otherwise prevent default and navigate to composed hash/path
      e.preventDefault();
      const newHref = href.replace(/(#?)/, '#').replace(/\/+$/, '') + '/' + encodeURIComponent(eid);
      if (typeof window.navigateTo === 'function') {
        try { window.navigateTo(newHref); return; } catch (_) {}
      }
      // set location.hash for SPA style navigation if href is hash-based
      if (newHref.startsWith('#')) {
        location.hash = newHref.slice(1);
      } else {
        location.href = newHref;
      }
    } catch (err) {
      // swallow errors in click handler
      console.error('detail-tabs click handler error', err);
    }
  }, true);
})();
