export function renderHeader(container, options = {}) {
  const { appName = 'Pronajímatel', onHome } = options;

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
