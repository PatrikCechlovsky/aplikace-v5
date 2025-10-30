// src/modules/070-sluzby/forms/detail.js
import { renderMetadataForm } from '/src/lib/formRenderer.js';
import { moduleMeta } from '/src/modules/070-sluzby/meta.js';
import { loadModuleMetaCached } from '/src/lib/metaLoader.js';
import { getServiceDefinition } from '/src/modules/070-sluzby/db.js';
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
    root.innerHTML = `<div class="p-4 text-red-600">Chybí ID služby.</div>`;
    return;
  }
  
  // Set breadcrumb
  try {
    setBreadcrumb(document.getElementById('crumb'), [
      { icon: 'home', label: 'Domů', href: '#/' },
      { icon: 'settings', label: 'Služby', href: '#/m/070-sluzby' },
      { icon: 'visibility', label: 'Detail služby' }
    ]);
  } catch (e) {}
  
  // Load metadata (with DB schema enrichment)
  const enrichedMeta = await loadModuleMetaCached(moduleMeta);
  
  // Load service data
  const { data, error } = await getServiceDefinition(id);
  if (error) {
    root.innerHTML = `<div class="p-4 text-red-600">Chyba při načítání služby: ${error.message}</div>`;
    return;
  }
  if (!data) {
    root.innerHTML = `<div class="p-4 text-red-600">Služba nenalezena.</div>`;
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
    navigateTo(`#/m/070-sluzby/f/edit?id=${id}`);
  });
  
  document.getElementById('back-btn')?.addEventListener('click', () => {
    navigateTo('#/m/070-sluzby');
  });
}
