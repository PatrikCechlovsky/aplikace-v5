// src/modules/090-finance/tiles/finance.js
// Přehled bankovních účtů subjektu

import { setBreadcrumb } from '/src/ui/breadcrumb.js';
import { renderCommonActions } from '/src/ui/commonActions.js';

export default async function render(root) {
  try {
    setBreadcrumb(document.getElementById('crumb'), [
      { icon: 'home', label: 'Domů', href: '#/' },
      { icon: 'account_balance', label: 'Finance', href: '#/m/090-finance' },
      { icon: 'account_balance_wallet', label: 'Finance' }
    ]);
  } catch (e) { /* ignore */ }

  root.innerHTML = `
    <div class="p-6 bg-white rounded-lg shadow">
      <h2 class="text-2xl font-bold mb-4 text-slate-800">Finance</h2>
      <p class="text-slate-600 mb-4">Přehled bankovních účtů subjektu.</p>
      
      <div class="space-y-4">
        <div class="p-4 border border-slate-200 rounded">
          <h3 class="font-semibold mb-2">Bankovní účty</h3>
          <p class="text-sm text-slate-500">Zde budou zobrazeny bankovní účty subjektu.</p>
        </div>
      </div>
    </div>
  `;

  try {
    renderCommonActions(document.getElementById('commonactions'), [
      {
        label: 'Přidat účet',
        icon: 'add',
        onClick: () => alert('Funkce bude implementována')
      }
    ]);
  } catch (e) { /* ignore */ }
}
