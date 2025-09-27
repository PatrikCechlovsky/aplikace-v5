// ui/header.js
// Hlavička: Home button (s ikonou aplikace) a kontejner pro pravou akční lištu.

export function renderHeader(container, options = {}) {
  const { appName = 'Pronajímatel', onHome } = options;

  injectOnce('header-base-style', `
    .hdr-btn { display:inline-flex; align-items:center; gap:.5rem; padding:.40rem .60rem; border:1px solid #e5e7eb; border-radius:.5rem; background:#fff; transition:background .12s }
    .hdr-btn:hover { background:#f8fafc }
    .hdr-icon { width:34px; height:34px; display:inline-flex; align-items:center; justify-content:center }
  `);

  container.innerHTML = '';

  // Home (ikonka + název aplikace)
  const homeBtn = h('button', { class: 'hdr-btn', title: 'Domů' }, [
    h('span', { class: 'hdr-icon' }, '🏠'),
    h('span', { class: 'font-semibold' }, appName),
  ]);
  homeBtn.addEventListener('click', (e) => {
    e.preventDefault();
    onHome && onHome();
  });

  // Pravá akční zóna (renderuje se mimo tuto komponentu)
  const actionsContainer = h('div', { id: 'header_actions', class: 'ml-auto flex items-center gap-2' });

  const header = h('div', { class: 'flex items-center gap-2 mb-3' }, [homeBtn, actionsContainer]);
  container.appendChild(header);

  return { actionsContainer };
}

// --- utils ---
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
function injectOnce(id, css) {
  if (document.getElementById(id)) return;
  const style = document.createElement('style');
  style.id = id;
  style.textContent = css;
  document.head.appendChild(style);
}
