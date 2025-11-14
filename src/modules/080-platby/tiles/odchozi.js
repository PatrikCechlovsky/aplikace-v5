// src/modules/080-platby/tiles/odchozi.js
// Odchozí platby (direction = outgoing)

import { setBreadcrumb } from '/src/ui/breadcrumb.js';
import { renderCommonActions } from '/src/ui/commonActions.js';

export default async function render(root) {
  try {
    setBreadcrumb(document.getElementById('crumb'), [
      { icon: 'home', label: 'Domů', href: '#/' },
      { icon: 'payments', label: 'Platby', href: '#/m/080-platby' },
      { icon: 'north', label: 'Odchozí' }
    ]);
  } catch (e) { /* ignore */ }

  root.innerHTML = `
    <div class="p-6 bg-white rounded-lg shadow">
      <h2 class="text-2xl font-bold mb-4 text-slate-800">Odchozí platby</h2>
      <p class="text-slate-600 mb-6">Přehled odchozích plateb (direction = outgoing).</p>
      
      <div class="space-y-4">
        <div class="p-4 border border-slate-200 rounded">
          <h3 class="font-semibold mb-2">Seznam odchozích plateb</h3>
          <p class="text-sm text-slate-500">Filtr: direction = outgoing</p>
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
      }
    ]);
  } catch (e) { /* ignore */ }
}
