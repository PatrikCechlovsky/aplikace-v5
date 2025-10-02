export function renderHomeButton(container, { appName = 'Pronajímatel', onHome } = {}) {
  container.innerHTML = `
    <button 
      class="flex items-center gap-2 w-full px-4 py-2 rounded-xl bg-white border font-bold text-lg shadow-sm hover:bg-slate-50 transition"
      id="homebtn"
      title="Domů"
      style="min-height: 52px"
    >
      <span class="text-2xl">🏠</span>
      <span>${appName}</span>
    </button>
  `;
  const btn = container.querySelector('#homebtn');
  if (btn && typeof onHome === 'function') {
    btn.addEventListener('click', onHome);
  }
}
