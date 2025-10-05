// src/ui/commonActions.js
// Zobrazuje pouze ikonky; text se ukáže jako tooltip při hoveru

import { icon } from './icons.js';
import { getAllowedActions } from '../security/permissions.js';

// Katalog všech podporovaných akcí (centrální definice)
const ACTIONS = {
  // navigační / CRUD
  detail:  { key: 'detail',  label: 'Detail',            title: 'Zobrazit detail',       icon: 'detail',  on: 'onDetail'  },
  add:     { key: 'add',     label: 'Přidat',            title: 'Přidat nový záznam',    icon: 'add',     on: 'onAdd'     },
  edit:    { key: 'edit',    label: 'Upravit',           title: 'Upravit záznam',        icon: 'edit',    on: 'onEdit'    },
  delete:  { key: 'delete',  label: 'Smazat',            title: 'Smazat záznam',         icon: 'delete',  on: 'onDelete'  },
  archive: { key: 'archive', label: 'Archivovat',        title: 'Přesunout do archivu',  icon: 'archive', on: 'onArchive' },
  attach:  { key: 'attach',  label: 'Přílohy',           title: 'Zobrazit přílohy',      icon: 'paperclip', on: 'onAttach' },
  refresh: { key: 'refresh', label: 'Obnovit',           title: 'Obnovit data',          icon: 'refresh', on: 'onRefresh' },
  search:  { key: 'search',  label: 'Hledat',            title: 'Hledat / filtrovat',    icon: 'search',  on: 'onSearch'  },

  // workflow
  approve: { key: 'approve', label: 'Uložit',            title: 'Uložit a zůstat',       icon: 'save',    on: 'onApprove' },
  reject:  { key: 'reject',  label: 'Zpět',              title: 'Zpět bez uložení',      icon: 'reject',  on: 'onReject'  },

  // nové akce
  invite:  { key: 'invite',  label: 'Pozvat',            title: 'Odeslat pozvánku e-mailem', icon: 'invite', on: 'onInvite'  },
  send:    { key: 'send',    label: 'Odeslat',           title: 'Odeslat dokument / e-mail', icon: 'send',   on: 'onSend'    },

  // export/import/print (pro jistotu)
  export:  { key: 'export',  label: 'Export',            title: 'Exportovat data',       icon: 'export',  on: 'onExport'  },
  import:  { key: 'import',  label: 'Import',            title: 'Importovat data',       icon: 'import',  on: 'onImport'  },
  print:   { key: 'print',   label: 'Tisk',              title: 'Vytisknout',            icon: 'print',   on: 'onPrint'   },
};

/**
 * Dynamické akční tlačítka podle oprávnění
 * @param {HTMLElement} root
 * @param {Object} opts - { moduleActions: string[], userRole: string, handlers: Record<string,Function> }
 */
export function renderCommonActions(
  root,
  { moduleActions = [], userRole = 'admin', handlers = {} } = {}
) {
  if (!root) return;
  root.innerHTML = '';

  // 1) vyhodnocení oprávnění – může vracet stringy nebo objekty
  let allowed = [];
  try {
    const res = getAllowedActions(userRole, moduleActions);
    allowed = Array.isArray(res) ? res : [];
  } catch {
    // když permissions nejsou k dispozici, povolíme zadané akce
    allowed = moduleActions.slice();
  }

  // 2) normalizace na pole klíčů
  const toKey = (a) => (typeof a === 'string' ? a : a?.key);
  const keys = (allowed.length ? allowed : moduleActions).map(toKey).filter(Boolean);

  // 3) mapování na známé akce
  const acts = keys.map(k => ACTIONS[k]).filter(Boolean);
  if (!acts.length) {
    root.innerHTML = `<div class="text-slate-400 text-sm italic p-2">Žádné dostupné akce</div>`;
    return;
  }

  // 4) render
  const wrap = document.createElement('div');
  wrap.className = 'flex items-center gap-2';

  for (const act of acts) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = [
      'relative flex items-center justify-center w-8 h-8 rounded-md border transition',
      'border-slate-200 bg-white hover:bg-slate-100',
      'text-slate-700 text-lg'
    ].join(' ');

    // ikona (bez textu)
    btn.innerHTML = icon(act.icon);
    btn.title = act.title || act.label;
    btn.setAttribute('aria-label', act.label);

    // handler – preferujeme explicitní "on" z katalogu, jinak on<Key>
    const handlerName = act.on || ('on' + act.key.charAt(0).toUpperCase() + act.key.slice(1));
    const handler = handlers[handlerName];

    if (typeof handler === 'function') {
      btn.addEventListener('click', handler);
    } else {
      btn.disabled = true;
      btn.classList.add('opacity-40', 'cursor-not-allowed');
      btn.title = `${act.label} – akce není dostupná`;
    }

    wrap.appendChild(btn);
  }

  root.appendChild(wrap);
}

export { ACTIONS };
// src/ui/commonActions.js
// Zobrazuje pouze ikonky; text se ukáže jako tooltip při hoveru

import { icon } from './icons.js';
import { getAllowedActions } from '../security/permissions.js';

/**
 * Dynamické akční tlačítka podle oprávnění
 * @param {HTMLElement} root
 * @param {Object} opts - { moduleActions: [], userRole: '', handlers: {} }
 */
export function renderCommonActions(
  root,
  { moduleActions = [], userRole = 'admin', handlers = {} } = {}
) {
  if (!root) return;
  root.innerHTML = '';

  const allowedActions = getAllowedActions(userRole, moduleActions);
  if (!allowedActions.length) {
    root.innerHTML = `<div class="text-slate-400 text-sm italic p-2">Žádné dostupné akce</div>`;
    return;
  }

  const wrap = document.createElement('div');
  wrap.className = 'flex items-center gap-2';

  for (const act of allowedActions) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = [
      'relative flex items-center justify-center w-8 h-8 rounded-md border transition',
      'border-slate-200 bg-white hover:bg-slate-100',
      'text-slate-700 text-lg'
    ].join(' ');

    // ikona (bez textu)
    btn.innerHTML = icon(act.icon);
    btn.title = act.label; // zobrazí se jako tooltip při hoveru

    // handler
    const handler =
      handlers[`on${act.key.charAt(0).toUpperCase() + act.key.slice(1)}`];
    if (typeof handler === 'function') {
      btn.addEventListener('click', handler);
    } else {
      btn.disabled = true;
      btn.classList.add('opacity-40', 'cursor-not-allowed');
      btn.title = `${act.label} – akce není dostupná`;
    }

    wrap.appendChild(btn);
  }

  root.appendChild(wrap);
}
