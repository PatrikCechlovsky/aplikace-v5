// src/ui/commonActions.js
// Dynamická verze – tlačítka se načítají podle modulu a oprávnění uživatele

import { icon } from './icons.js';
import { getAllowedActions } from '../security/permissions.js';

/**
 * Vykreslí akční tlačítka podle modulu a oprávnění uživatele
 * @param {HTMLElement} root - cílový DOM element (#commonactions)
 * @param {Object} opts - { moduleActions: ['add','edit',...], userRole: 'admin', handlers: {...} }
 */
export function renderCommonActions(root, { moduleActions = [], userRole = 'admin', handlers = {} } = {}) {
  if (!root) return;
  root.innerHTML = '';

  // Zjistíme, které akce uživatel smí
  const allowedActions = getAllowedActions(userRole, moduleActions);
  if (!allowedActions.length) {
    root.innerHTML = `<div class="text-slate-400 text-sm italic p-2">Žádné dostupné akce</div>`;
    return;
  }

  // Kontejner
  const wrap = document.createElement('div');
  wrap.className = 'flex items-center gap-2';

  // Vytvoření tlačítek
  for (const act of allowedActions) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = [
      'inline-flex items-center gap-1 rounded-md border px-2 py-1 text-sm font-medium transition',
      'border-slate-200 hover:bg-slate-50',
      'text-slate-700'
    ].join(' ');

    // Obsah tlačítka
    btn.innerHTML = `${icon(act.icon)} <span>${act.label}</span>`;
    btn.title = act.label;

    // Handler
    const handler = handlers[`on${act.key.charAt(0).toUpperCase() + act.key.slice(1)}`];
    if (typeof handler === 'function') {
      btn.addEventListener('click', handler);
    } else {
      // Pokud modul neobsahuje handler, deaktivuj tlačítko
      btn.disabled = true;
      btn.classList.add('opacity-50', 'cursor-not-allowed');
      btn.title = `${act.label} – akce není dostupná v této sekci`;
    }

    wrap.appendChild(btn);
  }

  root.appendChild(wrap);
}

/**
 * Pomocná funkce – ukázkové volání
 * 
 * renderCommonActions(document.getElementById('commonactions'), {
 *   moduleActions: ['add','edit','archive','refresh'],
 *   userRole: 'pronajimatel',
 *   handlers: {
 *     onAdd: () => alert('Přidat'),
 *     onEdit: () => alert('Upravit'),
 *     onArchive: () => alert('Archivovat'),
 *     onRefresh: () => alert('Obnovit')
 *   }
 * });
 */
