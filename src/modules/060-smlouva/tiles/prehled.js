// src/modules/060-smlouva/tiles/prehled.js
// Přehled všech smluv

export default async function render(root) {
  root.innerHTML = `
    <div class="p-4">
      <div class="bg-blue-50 border border-blue-200 rounded p-4">
        <h2 class="text-xl font-semibold mb-2 flex items-center gap-2">
          <span class="material-icons">description</span>
          Přehled smluv
        </h2>
        <p class="text-slate-600 mb-4">
          Modul pro správu nájemních smluv je připraven. Čeká na implementaci databázového schématu a CRUD operací.
        </p>
        <div class="bg-white rounded p-3 mb-3">
          <h3 class="font-semibold mb-2">📋 Funkce modulu:</h3>
          <ul class="list-disc list-inside space-y-1 text-sm">
            <li>Tvorba nájemních smluv</li>
            <li>Propojení pronajímatele, nájemníka a jednotky</li>
            <li>Správa kauce a služeb</li>
            <li>Předávací protokoly</li>
            <li>Elektronický podpis dokumentů</li>
          </ul>
        </div>
        <div class="bg-yellow-50 border border-yellow-200 rounded p-3">
          <p class="text-sm">
            <strong>⚠️ K implementaci:</strong> Databázové tabulky contracts, handover_protocols, contract_service_lines
          </p>
        </div>
      </div>
    </div>
  `;
}
export default { render };
