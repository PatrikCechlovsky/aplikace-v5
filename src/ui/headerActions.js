// ui/headerActions.js
// Pravá akční lišta v headeru (ikonky + tlačítka + notifikace).

export function renderHeaderActions(container, actions = [], options = {}) {
  if (!container) return;
  container.innerHTML = '';

  injectOnce('header-actions-style', `
    .btn { display:inline-flex; align-items:center; gap:.5rem; padding:.40rem .60rem; border:1px solid #e5e7eb; border-radius:.5rem; background:#fff; transition:background .12s }
    .btn:hover { background:#f8fafc }
    .iconbtn { width:34px; height:34px; display:inline-flex; align-items:center; justify-content:center }
    .dropdown { position:relative }
    .dropdown-panel { position:absolute; right:0; top:40px; width:320px; background:#fff; border:1px solid #e5e7eb; border-radius:.75rem; box-shadow:0 10px 24px rgba(2,6,23,.08); padding:.5rem; z-index:60; }
    .notif-item { display:flex; gap:.5rem; padding:.5rem; border-radius:.5rem; }
    .notif-item:hover { background:#f8fafc }
    .notif-empty { color:#64748b; font-size:.9rem; padding:.75rem }
    .menu { display:flex; align-items:center; gap:.5rem }
  `);

  const wrap = h('div', { class: 'menu' });

  actions.forEach((a) => {
    if (a.kind === 'notif') {
      // zvoneček s dropdownem
      const dd = h('div', { class: 'dropdown' });
      const btn = h('button', { class: 'btn iconbtn', title: a.title || 'Notifikace' }, a.icon || '🔔');

      const panel = h('div', { class: 'dropdown-panel', style: { display: 'none' } });
      buildNotifPanel(panel, a.items || [], a.onItemClick);

      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const visible = panel.style.display !== 'none';
        panel.style.display = visible ? 'none' : 'block';
      });
      document.addEventListener('click', () => (panel.style.display = 'none'));

      dd.appendChild(btn);
      dd.appendChild(panel);
      wrap.appendChild(dd);
      return;
    }

    // standardní ikonka/tlačítko
    let btn;
    if (a.kind === 'icon') {
      btn = h('button', { class: 'btn iconbtn', title: a.title || a.label || '', 'data-id': a.id }, a.icon || '•');
    } else {
      btn = h('button', { class: 'btn', title: a.title || a.label || '', 'data-id': a.id }, [
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

  // API pro pozdější aktualizaci notifikací
  return {
    updateNotifications(items = []) {
      const panel = wrap.querySelector('.dropdown-panel');
      if (!panel) return;
      panel.innerHTML = '';
      buildNotifPanel(panel, items, actions.find(x => x.kind === 'notif')?.onItemClick);
    },
  };
}

export const ACTION_PRESETS = {
  search: (onClick) => ({ id: 'search', kind: 'icon', icon: '🔍', title: 'Hledat', onClick }),
  help:   (onClick) => ({ id: 'help',   kind: 'icon', icon: '❓', title: 'Nápověda', onClick }),
  account:(onClick) => ({ id: 'account',kind: 'icon', icon: '👤', title: 'Můj účet', onClick }),
  logout: (onClick) => ({ id: 'logout', kind: 'button', label: 'Odhlásit', title: 'Odhlásit', onClick }),
  notifications: (items = [], onItemClick) =>
    ({ id: 'notifications', kind: 'notif', icon: '🔔', title: 'Notifikace', items, onItemClick }),
};

// --- helpers ---
function buildNotifPanel(panel, items, onItemClick) {
  if (!items.length) {
    panel.appendChild(h('div', { class: 'notif-empty' }, 'Žádné notifikace.'));
    return;
  }
  items.forEach((n, idx) => {
    const row = h('button', { class: 'notif-item w-full text-left' }, [
      h('div', {}, n.icon || '•'),
      h('div', {}, [
        h('div', { class: 'font-medium' }, n.title || 'Upozornění'),
        n.time ? h('div', { class: 'text-xs text-slate-500' }, n.time) : null,
      ]),
    ]);
    row.addEventListener('click', (e) => {
      e.preventDefault();
      onItemClick && onItemClick(n, idx);
    });
    panel.appendChild(row);
  });
}

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
