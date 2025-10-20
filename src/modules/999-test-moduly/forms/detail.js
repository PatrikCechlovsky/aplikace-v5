// src/modules/999-test-moduly/forms/detail.js
export default async function renderDetail(root) {
  const qs = new URLSearchParams((location.hash.split('?')[1] || ''));
  const id = qs.get('id') || '—';

  root.innerHTML = `
    <div class="space-y-2">
      <h2 class="text-lg font-semibold">Test moduly - Detail</h2>
      <div class="p-3 rounded border bg-white">
        <div class="text-sm">Testovací záznam ID: <b>${id}</b></div>
        <div class="text-slate-500 text-sm mt-2">Tady je detail testovacího záznamu.</div>
        <div class="mt-4 space-y-2">
          <div><span class="font-medium">Název:</span> Testovací položka ${id}</div>
          <div><span class="font-medium">Status:</span> Aktivní</div>
          <div><span class="font-medium">Vytvořeno:</span> ${new Date().toLocaleDateString('cs-CZ')}</div>
        </div>
      </div>
      <button 
        id="back-btn" 
        class="px-3 py-1.5 border rounded hover:bg-slate-50"
      >
        Zpět
      </button>
    </div>
  `;

  const backBtn = root.querySelector('#back-btn');
  backBtn.addEventListener('click', () => history.back());
}
