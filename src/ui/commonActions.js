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
