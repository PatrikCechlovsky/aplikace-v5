// src/modules/100-energie/tiles/meridla.js
// Přehled měřidel

import { setBreadcrumb } from '/src/ui/breadcrumb.js';
import { renderCommonActions } from '/src/ui/commonActions.js';

export default async function render(root) {
  try {
    setBreadcrumb(document.getElementById('crumb'), [
      { icon: 'home', label: 'Domů', href: '#/' },
      { icon: 'bolt', label: 'Energie', href: '#/m/100-energie' },
      { icon: 'speed', label: 'Měřidla' }
    ]);
  } catch (e) { /* ignore */ }

  root.innerHTML = `
    <div class="p-6 bg-white rounded-lg shadow">
      <h2 class="text-2xl font-bold mb-4 text-slate-800">Měřidla</h2>
      <p class="text-slate-600 mb-6">Správa měřidel energie (elektřina, plyn, voda, teplo).</p>
      
      <div class="space-y-4">
        <div class="p-4 border border-slate-200 rounded">
          <h3 class="font-semibold mb-2">Seznam měřidel</h3>
          <p class="text-sm text-slate-500">Zatím nejsou evidována žádná měřidla.</p>
          <button class="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Přidat měřidlo
          </button>
        </div>
      </div>
    </div>
  `;

  try {
    renderCommonActions(document.getElementById('commonactions'), [
      {
        label: 'Přidat měřidlo',
        icon: 'add',
        onClick: () => alert('Funkce bude implementována')
      }
    ]);
  } catch (e) { /* ignore */ }
}
