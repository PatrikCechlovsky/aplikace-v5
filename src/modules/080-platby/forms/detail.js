// src/modules/080-platby/forms/detail.js
import { renderMetadataForm } from '/src/lib/formRenderer.js';
import { moduleMeta } from '/src/modules/080-platby/meta.js';
import { loadModuleMetaCached } from '/src/lib/metaLoader.js';
import { getPayment } from '/src/modules/080-platby/db.js';
import { setBreadcrumb } from '/src/ui/breadcrumb.js';
import { navigateTo } from '/src/app.js';

// Helper to parse hash params
function getHashParams() {
  const q = (location.hash.split('?')[1] || '');
  return Object.fromEntries(new URLSearchParams(q));
}

export default async function render(root) {
  const { id } = getHashParams();
  
  if (!id) {
    root.innerHTML = `<div class="p-4 text-red-600">Chybí ID platby.</div>`;
    return;
  }
  
  // Set breadcrumb
  try {
    setBreadcrumb(document.getElementById('crumb'), [
      { icon: 'home', label: 'Domů', href: '#/' },
      { icon: 'payments', label: 'Platby', href: '#/m/080-platby' },
      { icon: 'visibility', label: 'Detail platby' }
    ]);
  } catch (e) {}
  
  // Load metadata (with DB schema enrichment)
  const enrichedMeta = await loadModuleMetaCached(moduleMeta);
  
  // Load payment data
  const { data, error } = await getPayment(id);
  if (error) {
    root.innerHTML = `<div class="p-4 text-red-600">Chyba při načítání platby: ${error.message}</div>`;
    return;
  }
  if (!data) {
    root.innerHTML = `<div class="p-4 text-red-600">Platba nenalezena.</div>`;
    return;
  }
  
  // Render form in read-only mode using metadata
  renderMetadataForm(
    root,
    enrichedMeta,
    'detail',
    data,
    async () => true,
    {
      readOnly: true,
      showSubmit: false
    }
  );
  
  // Add action buttons
  const buttonContainer = document.createElement('div');
  buttonContainer.className = 'mt-4 flex gap-2';
  buttonContainer.innerHTML = `
    <button id="edit-btn" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
      Upravit
    </button>
    <button id="back-btn" class="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400">
      Zpět
    </button>
  `;
  root.appendChild(buttonContainer);
  
  // Add button event listeners
  document.getElementById('edit-btn')?.addEventListener('click', () => {
    navigateTo(`#/m/080-platby/f/edit?id=${id}`);
  });
  
  document.getElementById('back-btn')?.addEventListener('click', () => {
    navigateTo('#/m/080-platby');
  });
}
