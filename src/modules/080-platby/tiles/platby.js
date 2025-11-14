// src/modules/080-platby/tiles/platby.js
// Přehled všech plateb

import { setBreadcrumb } from '/src/ui/breadcrumb.js';
import { renderCommonActions } from '/src/ui/commonActions.js';

export default async function render(root) {
  try {
    setBreadcrumb(document.getElementById('crumb'), [
      { icon: 'home', label: 'Domů', href: '#/' },
      { icon: 'payments', label: 'Platby', href: '#/m/080-platby' },
      { icon: 'list', label: 'Platby' }
    ]);
  } catch (e) { /* ignore */ }

  root.innerHTML = `
    <div class="p-6 bg-white rounded-lg shadow">
      <h2 class="text-2xl font-bold mb-4 text-slate-800">Všechny platby</h2>
      <p class="text-slate-600 mb-6">Centrální evidence všech plateb (příchozí i odchozí).</p>
      
      <div class="space-y-4">
        <div class="p-4 border border-slate-200 rounded">
          <h3 class="font-semibold mb-2">📋 Funkce modulu:</h3>
          <ul class="list-disc list-inside space-y-1 text-sm text-slate-600">
            <li>Evidence příchozích a odchozích plateb</li>
            <li>Vazba na smlouvy, jednotky, nemovitosti</li>
            <li>Sledování stavu plateb (issued, partial, paid, overdue, canceled)</li>
            <li>Automatické párování plateb</li>
            <li>Import bankovních výpisů</li>
            <li>Generování potvrzení o platbě</li>
          </ul>
        </div>
        
        <div class="bg-yellow-50 border border-yellow-200 rounded p-3">
          <p class="text-sm">
            <strong>⚠️ K implementaci:</strong> Seznam plateb se zobrazí po dokončení DB schématu a views.
          </p>
        </div>
      </div>
    </div>
  `;

  try {
    renderCommonActions(document.getElementById('commonactions'), [
      {
        label: 'Nová platba',
        icon: 'add',
        onClick: () => alert('Funkce bude implementována')
      },
      {
        label: 'Import',
        icon: 'upload',
        onClick: () => alert('Import bude implementován')
      }
    ]);
  } catch (e) { /* ignore */ }
}
