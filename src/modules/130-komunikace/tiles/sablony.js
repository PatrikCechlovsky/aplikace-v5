// src/modules/130-komunikace/tiles/sablony.js
// Šablony komunikace

import { setBreadcrumb } from '/src/ui/breadcrumb.js';
import { renderCommonActions } from '/src/ui/commonActions.js';

export default async function render(root) {
  try {
    setBreadcrumb(document.getElementById('crumb'), [
      { icon: 'home', label: 'Domů', href: '#/' },
      { icon: 'email', label: 'Komunikace', href: '#/m/130-komunikace' },
      { icon: 'mail', label: 'Šablony' }
    ]);
  } catch (e) { /* ignore */ }

  root.innerHTML = `
    <div class="p-6 bg-white rounded-lg shadow">
      <h2 class="text-2xl font-bold mb-4 text-slate-800">Šablony zpráv</h2>
      <p class="text-slate-600 mb-6">Správa šablon e-mailů a SMS.</p>
      
      <div class="space-y-4">
        <div class="p-4 border border-slate-200 rounded">
          <h3 class="font-semibold mb-2">Seznam šablon</h3>
          <p class="text-sm text-slate-500">Zatím nejsou vytvořeny žádné šablony.</p>
          <button class="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Vytvořit šablonu
          </button>
        </div>
      </div>
    </div>
  `;

  try {
    renderCommonActions(document.getElementById('commonactions'), [
      {
        label: 'Nová šablona',
        icon: 'add',
        onClick: () => alert('Funkce bude implementována')
      }
    ]);
  } catch (e) { /* ignore */ }
}
