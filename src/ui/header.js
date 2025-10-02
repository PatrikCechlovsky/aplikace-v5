// ui/header.js
// Hlavička: Home button (s ikonou aplikace) a kontejner pro pravou akční lištu.
export function renderHeader(container, options = {}) {
  const { appName = 'Pronajímatel', onHome } = options;

  // sidebar width = w-64, home box tedy také w-64 a zarovnáno vlevo s mezerou
  container.innerHTML = `
    <div class="flex items-start pt-2 pl-2 pr-2 bg-transparent">
      <div class="w-64">
        <button 
          class="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border font-bold text-lg shadow-sm hover:bg-slate-50 transition w-full"
          id="homebtn"
          title="Domů"
        >
          <span class="text-2xl">🏠</span>
          <span>${appName}</span>
        </button>
      </div>
      <div class="flex-1 flex items-center justify-end gap-3 pr-2" id="header_actions"></div>
    </div>
  `;

  // Home click
  const btn = container.querySelector('#homebtn');
  if (btn && typeof onHome === 'function') {
    btn.addEventListener('click', onHome);
  }
  return {
    actionsContainer: container.querySelector('#header_actions')
  };
}

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
