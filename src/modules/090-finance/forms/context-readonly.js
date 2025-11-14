// src/modules/090-finance/forms/context-readonly.js
// Kontext (read-only)

import { setBreadcrumb } from '/src/ui/breadcrumb.js';

export default async function render(root, params) {
  try {
    setBreadcrumb(document.getElementById('crumb'), [
      { icon: 'home', label: 'Domů', href: '#/' },
      { icon: 'account_balance', label: 'Finance', href: '#/m/090-finance' },
      { icon: 'visibility', label: 'Kontext' }
    ]);
  } catch (e) { /* ignore */ }

  root.innerHTML = `
    <div class="p-6 bg-white rounded-lg shadow">
      <h2 class="text-2xl font-bold mb-4 text-slate-800">Kontext</h2>
      <div class="space-y-4">
        <p class="text-slate-600">Formulář bude implementován podle specifikace.</p>
      </div>
    </div>
  `;
}
