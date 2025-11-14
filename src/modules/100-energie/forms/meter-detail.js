// src/modules/100-energie/forms/meter-detail.js
import { setBreadcrumb } from '/src/ui/breadcrumb.js';

export default async function render(root, params) {
  try {
    setBreadcrumb(document.getElementById('crumb'), [
      { icon: 'home', label: 'Domů', href: '#/' },
      { icon: 'bolt', label: 'Energie', href: '#/m/100-energie' },
      { icon: 'visibility', label: 'Detail měřidla' }
    ]);
  } catch (e) { /* ignore */ }

  root.innerHTML = `<div class="p-6 bg-white rounded-lg shadow">
    <h2 class="text-2xl font-bold mb-4">Detail měřidla</h2>
    <p class="text-slate-600">Formulář bude implementován.</p>
  </div>`;
}
