// src/ui/commonActions.js
// Kompaktní ikonové akce s kompatibilitou pro různé tvary permissions.

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
      title: a.title || base.title || a.label || k
    };
  });
}

/**
 * @param {HTMLElement} root
 * @param {{ moduleActions?:string[], userRole?:string, handlers?:Record<string,Function>, isStarred?:boolean }} param1
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
  // - uložit / potvrdit první
  // - akutní / editace / přidat blízko začátku
  // - pomocné (history, attach, refresh) uprostřed
  // - nebezpečné akce (archive, delete) později
  // - "zpět / zavřít" (reject/exit) vždy poslední
  const PREFERRED_ORDER = [
    'save', 'approve', 'add', 'edit', 'invite', 'send', 'attach', 'history',
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
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = [
      'relative flex items-center justify-center w-8 h-8 rounded-md border transition',
      'border-slate-200 bg-white hover:bg-slate-100',
      'text-slate-700 text-lg'
    ].join(' ');

    btn.innerHTML = uiIcon(act.icon); // ← použij aliasovaný import
    btn.title = act.title || act.label || act.key;
    btn.setAttribute('aria-label', act.label || act.key);

    const handlerName = 'on' + act.key.charAt(0).toUpperCase() + act.key.slice(1);
    const handler = handlers[handlerName];
    if (typeof handler === 'function') {
      btn.addEventListener('click', handler);
      if (act.key === 'star' && isStarred) btn.classList.add('!bg-yellow-100');
    } else {
      btn.disabled = true;
      btn.classList.add('opacity-40', 'cursor-not-allowed');
      btn.title = (btn.title + ' – akce není dostupná');
    }

    wrap.appendChild(btn);
  });

  root.appendChild(wrap);
}

export { CATALOG };
