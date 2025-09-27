// ui/headerActions.js
// Jednoduchá, rozšiřitelná komponenta pro akční oblast vpravo v headeru.

const h = (tag, attrs = {}, children = []) => {
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

/**
 * Akce: { id, label, icon, kind: 'icon' | 'button', title, onClick }
 * - kind 'icon' vyrenderuje čtvercovou ikonku (bez textu)
 * - kind 'button' vyrenderuje textové tlačítko
 */
export function renderHeaderActions(container, actions = []) {
  if (!container) return;
  container.innerHTML = '';

  const wrap = h('div', { class: 'flex items-center gap-2' });

  actions.forEach((a) => {
    const common = { title: a.title || a.label || '' };
    let btn;

    if (a.kind === 'icon') {
      btn = h('button', { ...common, class: 'btn iconbtn', 'data-id': a.id }, a.icon || '•');
    } else {
      btn = h('button', { ...common, class: 'btn', 'data-id': a.id }, [
        a.icon ? `${a.icon} ` : '',
        a.label || '',
      ]);
    }

    btn.addEventListener('click', (ev) => {
      ev.preventDefault();
      try { a.onClick && a.onClick(); } catch (e) { console.error('[headerActions] onClick error:', e); }
    });

    wrap.appendChild(btn);
  });

  container.appendChild(wrap);
}

/** Předpřipravené presety, ať je to pohodlné. */
export const ACTION_PRESETS = {
  search: (onClick) => ({ id: 'search', kind: 'icon', icon: '🔍', title: 'Hledat', onClick }),
  help:   (onClick) => ({ id: 'help',   kind: 'icon', icon: '❓', title: 'Nápověda', onClick }),
  account:(onClick) => ({ id: 'account',kind: 'icon', icon: '👤', title: 'Můj účet', onClick }),
  logout: (onClick) => ({ id: 'logout', kind: 'button', label: 'Odhlásit', title: 'Odhlásit', onClick }),
};
