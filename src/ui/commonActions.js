// src/ui/commonActions.js
// Kompaktní ikonové akce s kompatibilitou pro různé tvary permissions.
// Přidán jednoduchý export `toast(message, type, opts)` pro kompatibilitu s formuláři.

import { icon as uiIcon } from './icons.js';
import { getAllowedActions } from '../security/permissions.js';

// Katalog známých akcí (label/title jen pro tooltipy)
const CATALOG = {
  detail:  { key: 'detail',  icon: 'detail',     label: 'Detail',    title: 'Zobrazit detail' },
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

  // HISTORIE změn
  history: { key: 'history', icon: 'history',    label: 'Historie',  title: 'Zobrazit historii změn' },

  // Jednotky (správa jednotek) - nově v katalogu
  units:   { key: 'units',   icon: 'grid',       label: 'Jednotky',  title: 'Správa jednotek' },
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
    // pokud je objekt, podpůrně přeneseme href/icon/label/title
    const k = a.key || a.id;
    const base = CATALOG[k] || {};
    return {
      key: k,
      icon: a.icon || base.icon || k,
      label: a.label || base.label || k,
      title: a.title || base.title || a.label || k,
      href: a.href || base.href || null
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

  // 1) jaké akce chceme?
  const wantedKeys = (moduleActions && moduleActions.length)
    ? moduleActions
    : deriveFromHandlers(handlers);

  // 2) permissions (bez pádu, když nejsou)
  let allowedRaw = [];
  try {
    allowedRaw = getAllowedActions(userRole, wantedKeys) || [];
  } catch {
    allowedRaw = wantedKeys;
  }

  // 3) normalizace
  let acts = normalizeAllowed(allowedRaw, wantedKeys);

  // 4) hvězdička jen pokud je handler
  if (typeof handlers.onStar === 'function') {
    acts = acts.concat([{ ...CATALOG.star, title: isStarred ? 'Odebrat z oblíbených' : 'Přidat do oblíbených' }]);
  }

  // 4.5) defaultní inteligentní řazení (intuitivní pořadí)
  const PREFERRED_ORDER = [
    'save', 'approve', 'add', 'edit', 'invite', 'send', 'attach', 'units', 'history',
    'refresh', 'search', 'print', 'export', 'import', 'archive', 'delete',
    'reject', 'exit', 'star', 'detail'
  ];
  const LAST_KEYS = new Set(['reject', 'exit']);

  function orderIndex(key) {
    if (LAST_KEYS.has(key)) return 1000; // force to end
    const idx = PREFERRED_ORDER.indexOf(key);
    if (idx === -1) return 500; // unknown actions land in middle
    return idx;
  }

  acts.sort((a, b) => orderIndex(a.key) - orderIndex(b.key));

  if (!acts.length) {
    root.innerHTML = `<div class="text-slate-400 text-sm italic p-2">Žádné dostupné akce</div>`;
    return;
  }

  // 5) render
  const wrap = document.createElement('div');
  wrap.className = 'flex items-center gap-2';

  acts.forEach(act => {
    // handlerName podle klíče, např. 'onEdit', 'onUnits' atd.
    const handlerName = 'on' + act.key.charAt(0).toUpperCase() + act.key.slice(1);
    const handler = handlers[handlerName];

    // Pokud máme handler -> renderovat button s handlerem
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
      btn.addEventListener('click', handler);
      if (act.key === 'star' && isStarred) btn.classList.add('!bg-yellow-100');
      wrap.appendChild(btn);
      return;
    }

    // Pokud nemáme handler, ale máme href (nebo act obsahuje href), renderuj odkaz
    if (act.href) {
      const a = document.createElement('a');
      a.href = act.href;
      a.className = [
        'relative inline-flex items-center justify-center w-8 h-8 rounded-md border transition',
        'border-slate-200 bg-white hover:bg-slate-100',
        'text-slate-700 text-lg no-underline'
      ].join(' ');
      a.innerHTML = uiIcon(act.icon);
      a.title = act.title || act.label || act.key;
      a.setAttribute('aria-label', act.label || act.key);
      // pokud app poskytuje navigateTo, použij ji pro single-page navigation
      if (typeof window.navigateTo === 'function') {
        a.addEventListener('click', (ev) => {
          ev.preventDefault();
          try { window.navigateTo(a.getAttribute('href')); } catch (e) { location.href = a.getAttribute('href'); }
        });
      }
      wrap.appendChild(a);
      return;
    }

    // fallback: žádný handler a žádný href -> render disabled button (star/other handled above)
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
 * - If your app already exposes window.showAppToast(...) it uses that.
 * - Otherwise it renders a small DOM toast container with auto-dismiss.
 */
export function toast(message, type = 'info', opts = {}) {
  try {
    if (typeof window.showAppToast === 'function') {
      // prefer app's native toast if available (keeps consistent UX)
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
    // graceful fallback to console
    try { console.log('toast:', type, message); } catch (e2) {}
    return false;
  }
}
