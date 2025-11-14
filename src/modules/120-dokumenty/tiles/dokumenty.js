// src/modules/120-dokumenty/tiles/dokumenty.js
// Přehled dokumentů

import { setBreadcrumb } from '/src/ui/breadcrumb.js';
import { renderCommonActions } from '/src/ui/commonActions.js';

export default async function render(root) {
  try {
    setBreadcrumb(document.getElementById('crumb'), [
      { icon: 'home', label: 'Domů', href: '#/' },
      { icon: 'description', label: 'Dokumenty', href: '#/m/120-dokumenty' },
      { icon: 'folder', label: 'Dokumenty' }
    ]);
  } catch (e) { /* ignore */ }

  root.innerHTML = `
    <div class="p-6 bg-white rounded-lg shadow">
      <h2 class="text-2xl font-bold mb-4 text-slate-800">Dokumenty</h2>
      <p class="text-slate-600 mb-6">Centrální úložiště dokumentů (smlouvy, faktury, přílohy).</p>
      
      <div class="space-y-4">
        <div class="p-4 border border-slate-200 rounded">
          <h3 class="font-semibold mb-2">Seznam dokumentů</h3>
          <p class="text-sm text-slate-500">Zatím nejsou nahrány žádné dokumenty.</p>
          <button class="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Nahrát dokument
          </button>
        </div>
      </div>
    </div>
  `;

  try {
    renderCommonActions(document.getElementById('commonactions'), [
      {
        label: 'Nahrát dokument',
        icon: 'upload',
        onClick: () => alert('Funkce bude implementována')
      }
    ]);
  } catch (e) { /* ignore */ }
}
