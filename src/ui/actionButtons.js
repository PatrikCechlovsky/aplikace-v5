// src/ui/actionButtons.js
import { icon } from './icons.js';

export const ACTIONS = {
  // KLÍČE: používáme to, co je v icons.js (add/edit/archive/detail/…)
  add:     ({ onClick, disabled=false, reason='' }={}) => ({ key:'add',     label:'Přidat',     icon:'add',     onClick, disabled, reason }),
  edit:    ({ onClick, disabled=false, reason='' }={}) => ({ key:'edit',    label:'Upravit',   icon:'edit',    onClick, disabled, reason }),
  archive: ({ onClick, disabled=false, reason='' }={}) => ({ key:'archive', label:'Archivovat',icon:'archive', onClick, disabled, reason }),
  refresh: ({ onClick, disabled=false, reason='' }={}) => ({ key:'refresh', label:'Obnovit',   icon:'refresh', onClick, disabled, reason }), // viz alias níže
  detail:  ({ onClick, disabled=false, reason='' }={}) => ({ key:'detail',  label:'Zobrazit',  icon:'detail',  onClick, disabled, reason }),
};

export function renderActions(container, actions, opts={}) {
  if (!container) return;
  const { iconOnly=true, compact=true } = opts;
  container.innerHTML = '';

  const wrap = document.createElement('div');
  wrap.className = 'flex items-center gap-2';

  actions.forEach(a => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = [
      'inline-flex items-center rounded-md border text-sm',
      compact ? 'px-2.5 py-1.5' : 'px-3 py-2',
      a.disabled ? 'text-slate-400 border-slate-200 bg-slate-50 cursor-not-allowed'
                 : 'text-slate-700 border-slate-200 hover:bg-slate-50'
    ].join(' ');
    btn.title = a.reason || a.label;

    if (iconOnly) {
      btn.textContent = icon(a.icon);  // <— používá tvůj icons.js
      btn.setAttribute('aria-label', a.label);
    } else {
      btn.innerHTML = `${icon(a.icon)}<span class="ml-2">${a.label}</span>`;
    }

    if (!a.disabled && typeof a.onClick === 'function') btn.onclick = a.onClick;
    wrap.appendChild(btn);
  });

  container.appendChild(wrap);
}
