// src/modules/000-sablona/tiles/prehled.js
export default async function renderPrehled(root) {
  root.innerHTML = `
    <div class="space-y-2">
      <h2 class="text-lg font-semibold">Přehled</h2>
      <p class="text-slate-600 text-sm">
        Toto je ukázková dlaždice „Přehled“. Sem patří rychlé statistiky, karty, krátké seznamy…
      </p>
      <div class="p-3 rounded border bg-white">Obsah přehledu…</div>
    </div>
  `;
}

