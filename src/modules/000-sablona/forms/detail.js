// src/modules/000-sablona/forms/detail.js
export default async function renderDetail(root) {
  const qs = new URLSearchParams((location.hash.split('?')[1] || ''));
  const id = qs.get('id') || '—';

  root.innerHTML = `
    <div class="space-y-2">
      <h2 class="text-lg font-semibold">Detail</h2>
      <div class="p-3 rounded border bg-white">
        <div class="text-sm">Záznam ID: <b>${id}</b></div>
        <div class="text-slate-500 text-sm mt-2">Tady bude čtecí detail záznamu.</div>
      </div>
    </div>
  `;
}
