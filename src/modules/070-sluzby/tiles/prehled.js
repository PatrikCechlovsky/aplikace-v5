// src/modules/070-sluzby/tiles/prehled.js
// Přehled služeb

export default async function render(root) {
  root.innerHTML = `
    <div class="p-4">
      <div class="bg-green-50 border border-green-200 rounded p-4">
        <h2 class="text-xl font-semibold mb-2 flex items-center gap-2">
          <span class="material-icons">settings</span>
          Přehled služeb
        </h2>
        <p class="text-slate-600 mb-4">
          Modul pro správu služeb (energie, voda, internet) je připraven. Čeká na implementaci databázového schématu.
        </p>
        <div class="bg-white rounded p-3 mb-3">
          <h3 class="font-semibold mb-2">📋 Funkce modulu:</h3>
          <ul class="list-disc list-inside space-y-1 text-sm">
            <li>Katalog služeb (voda, elektřina, plyn, internet)</li>
            <li>Definice typů účtování (pevná sazba, měřená spotřeba, na osobu, na m²)</li>
            <li>Přiřazení služeb ke smlouvám</li>
            <li>Výpočet měsíčních nákladů</li>
            <li>Rozdělení plateb mezi nájemníka a pronajímatele</li>
          </ul>
        </div>
        <div class="bg-yellow-50 border border-yellow-200 rounded p-3">
          <p class="text-sm">
            <strong>⚠️ K implementaci:</strong> Databázové tabulky service_definitions, contract_service_lines
          </p>
        </div>
      </div>
    </div>
  `;
}
