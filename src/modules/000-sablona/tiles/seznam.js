// src/modules/000-sablona/tiles/seznam.js
export default async function renderSeznam(root) {
  // prázdný / načítací / naplněný stav – jen ukázka bez DB
  root.innerHTML = `
    <div class="space-y-3">
      <h2 class="text-lg font-semibold">Seznam</h2>
      <div class="text-sm text-slate-500">Načítám ukázková data…</div>
    </div>
  `;

  await new Promise(r => setTimeout(r, 300)); // simulace načítání

  // ukázková „data“
  const rows = [
    { id: 1, name: 'Položka A' },
    { id: 2, name: 'Položka B' },
  ];

  if (!rows.length) {
    root.innerHTML = `
      <div class="space-y-2">
        <h2 class="text-lg font-semibold">Seznam</h2>
        <div class="text-slate-500 text-sm">Zatím žádná data.</div>
      </div>`;
    return;
  }

  root.innerHTML = `
    <div class="space-y-2">
      <h2 class="text-lg font-semibold">Seznam</h2>
      <div class="rounded border overflow-hidden">
        <table class="w-full text-sm">
          <thead class="bg-slate-50 text-slate-600">
            <tr><th class="p-2 text-left">Název</th></tr>
          </thead>
          <tbody>
            ${rows.map(r => `<tr class="border-t hover:bg-slate-50 cursor-pointer" data-id="${r.id}">
                <td class="p-2">${r.name}</td>
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
      // přepnutí na form detail (router si to zpracuje)
      location.hash = `#/m/${location.hash.match(/^#\/m\/([^\/]+)/)?.[1]}/f/detail?id=${id}`;
    });
  });
}

