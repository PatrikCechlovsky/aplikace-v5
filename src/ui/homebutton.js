export function renderHomeButton(container, { appName = 'Pronajímatel', onHome } = {}) {
  container.innerHTML = `
    <div class="panel-box mb-4 mx-auto mt-4">
      <button 
        class="flex items-center gap-2 w-full px-4 py-2 rounded-xl font-bold text-lg hover:bg-slate-50 transition"
        id="homebtn"
        title="Domů"
      >
        <span class="text-2xl">🏠</span>
        <span>${appName}</span>
      </button>
    </div>
  `;
  // Home click
  const btn = container.querySelector('#homebtn');
  if (btn && typeof onHome === 'function') {
    btn.addEventListener('click', onHome);
  }
}
