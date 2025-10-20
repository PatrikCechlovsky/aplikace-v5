// src/modules/999-test-moduly/tiles/seznam.js
export default async function renderSeznam(root) {
  root.innerHTML = `
    <div class="space-y-3">
      <h2 class="text-lg font-semibold">Test moduly - Seznam</h2>
      <div class="text-sm text-slate-500">Načítám testovací data…</div>
    </div>
  `;

  await new Promise(r => setTimeout(r, 300)); // simulace načítání

  const rows = [
    { id: 1, name: 'Testovací položka 1', status: 'Aktivní' },
    { id: 2, name: 'Testovací položka 2', status: 'Neaktivní' },
    { id: 3, name: 'Testovací položka 3', status: 'Aktivní' },
  ];

  if (!rows.length) {
    root.innerHTML = `
      <div class="space-y-2">
        <h2 class="text-lg font-semibold">Test moduly - Seznam</h2>
        <div class="text-slate-500 text-sm">Zatím žádná testovací data.</div>
      </div>`;
    return;
  }

  root.innerHTML = `
    <div class="space-y-2">
      <h2 class="text-lg font-semibold">Test moduly - Seznam</h2>
      <div class="rounded border overflow-hidden">
        <table class="w-full text-sm">
          <thead class="bg-slate-50 text-slate-600">
            <tr>
              <th class="p-2 text-left">Název</th>
              <th class="p-2 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            ${rows.map(r => `<tr class="border-t hover:bg-slate-50 cursor-pointer" data-id="${r.id}">
                <td class="p-2">${r.name}</td>
                <td class="p-2">${r.status}</td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>
      <div class="text-slate-500 text-xs">Dvojklik na řádek → Detail (form).</div>
    </div>
  `;

  root.querySelectorAll('tbody tr[data-id]').forEach(tr => {
    tr.addEventListener('dblclick', () => {
      const id = tr.getAttribute('data-id');
      const modId = location.hash.match(/^#\/m\/([^\/]+)/)?.[1];
      location.hash = `#/m/${modId}/f/detail?id=${id}`;
    });
  });
}
