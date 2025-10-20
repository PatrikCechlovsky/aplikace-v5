// src/modules/999-test-moduly/tiles/prehled.js
export default async function renderPrehled(root) {
  root.innerHTML = `
    <div class="space-y-2">
      <h2 class="text-lg font-semibold">Test moduly - Přehled</h2>
      <p class="text-slate-600 text-sm">
        Toto je testovací modul pro vývojové účely.
      </p>
      <div class="p-3 rounded border bg-white">
        <div class="space-y-2">
          <h3 class="font-medium">Testovací funkce</h3>
          <ul class="text-sm text-slate-600 space-y-1 list-disc list-inside">
            <li>Testování nových komponent</li>
            <li>Experimentování s UI</li>
            <li>Ověřování funkcionality</li>
          </ul>
        </div>
      </div>
    </div>
  `;
}
