// src/modules/080-platby/tiles/prehled.js
// Přehled plateb

export default async function render(root) {
  root.innerHTML = `
    <div class="p-4">
      <div class="bg-purple-50 border border-purple-200 rounded p-4">
        <h2 class="text-xl font-semibold mb-2 flex items-center gap-2">
          <span class="material-icons">payments</span>
          Přehled plateb
        </h2>
        <p class="text-slate-600 mb-4">
          Modul pro správu plateb je připraven. Čeká na implementaci databázového schématu a CRUD operací.
        </p>
        <div class="bg-white rounded p-3 mb-3">
          <h3 class="font-semibold mb-2">📋 Funkce modulu:</h3>
          <ul class="list-disc list-inside space-y-1 text-sm">
            <li>Evidence příchozích plateb</li>
            <li>Alokace plateb na nájem a služby</li>
            <li>Import bankovních výpisů</li>
            <li>Automatické párování plateb ke smlouvám</li>
            <li>Generování potvrzení o platbě</li>
            <li>Integrace s elektronickým podpisem (BankID)</li>
          </ul>
        </div>
        <div class="bg-yellow-50 border border-yellow-200 rounded p-3">
          <p class="text-sm">
            <strong>⚠️ K implementaci:</strong> Databázové tabulky payments, payment_service_items, payment_allocations
          </p>
        </div>
      </div>
    </div>
  `;
}
