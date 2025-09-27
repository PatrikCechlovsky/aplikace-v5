// UI akční lišta s jednotnými presety tlačítek/ikon.
// Použití:
//   import { renderActions, ACTIONS } from '../ui/actionButtons.js';
//   renderActions(container, [
//     ACTIONS.add({ onClick(){ ... } }),
//     ACTIONS.edit({ disabled:true, reason:'Vyberte záznam' }),
//     ACTIONS.archive({ onClick(){ ... } }),
//   ]);

import { icon } from './icons.js';

function h(tag, attrs = {}, children = []) {
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
}

function injectOnce(id, css) {
  if (document.getElementById(id)) return;
  const style = document.createElement('style');
  style.id = id;
  style.textContent = css;
  document.head.appendChild(style);
}

injectOnce('action-buttons-style', `
  .ab-btn {
    display:inline-flex; align-items:center; gap:.5rem;
    padding:.40rem .60rem; border:1px solid #e5e7eb; border-radius:.5rem; background:#fff;
    transition:background .12s; font-size:14px;
  }
  .ab-btn:hover { background:#f8fafc }
  .ab-btn[disabled] { opacity:.5; cursor:not-allowed }
  .ab-group { display:flex; flex-wrap:wrap; gap:.5rem }
`);

export function renderActions(container, actions = []) {
  if (!container) return;
  container.innerHTML = '';
  const wrap = h('div', { class: 'ab-group' });

  actions.forEach(a => {
    const text = a.text ?? a.label ?? '';
    const icn  = a.icon ?? '•';
    const btn  = h('button', { class: 'ab-btn', title: a.title || a.reason || text });
    btn.appendChild(document.createTextNode(`${icn} ${text}`));
    if (a.disabled) btn.setAttribute('disabled', 'disabled');
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      if (btn.hasAttribute('disabled')) return;
      try { a.onClick && a.onClick(); } catch (err) { console.error('[actionButtons] onClick error', err); }
    });
    wrap.appendChild(btn);
  });

  container.appendChild(wrap);
}

// Presety pro konzistentní vzhled napříč appkou
export const ACTIONS = {
  add:      (o={}) => ({ key:'add',      icon:icon('add'),      text:'Přidat',     ...o }),
  edit:     (o={}) => ({ key:'edit',     icon:icon('edit'),     text:'Upravit',    ...o }),
  view:     (o={}) => ({ key:'view',     icon:icon('detail'),   text:'Zobrazit',   ...o }),
  archive:  (o={}) => ({ key:'archive',  icon:icon('archive'),  text:'Archivovat', ...o }),
  delete:   (o={}) => ({ key:'delete',   icon:icon('delete'),   text:'Smazat',     ...o }),
  export:   (o={}) => ({ key:'export',   icon:icon('export'),   text:'Export',     ...o }),
  import:   (o={}) => ({ key:'import',   icon:icon('import'),   text:'Import',     ...o }),
  print:    (o={}) => ({ key:'print',    icon:icon('print'),    text:'Tisk',       ...o }),
  filter:   (o={}) => ({ key:'filter',   icon:icon('filter'),   text:'Filtr',      ...o }),
  refresh:  (o={}) => ({ key:'refresh',  icon:'↻',              text:'Obnovit',    ...o }),
  save:     (o={}) => ({ key:'save',     icon:icon('approve'),  text:'Uložit',     ...o }),
  cancel:   (o={}) => ({ key:'cancel',   icon:'✖️',             text:'Zrušit',     ...o }),
};
