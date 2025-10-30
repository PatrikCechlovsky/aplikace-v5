// src/modules/060-smlouva/forms/edit.js
import { renderMetadataForm } from '/src/lib/formRenderer.js';
import { moduleMeta } from '/src/modules/060-smlouva/meta.js';
import { loadModuleMetaCached } from '/src/lib/metaLoader.js';
import { upsertContract, getContract } from '/src/modules/060-smlouva/db.js';
import { setBreadcrumb } from '/src/ui/breadcrumb.js';
import { navigateTo } from '/src/app.js';

// Helper to parse hash params
function getHashParams() {
  const q = (location.hash.split('?')[1] || '');
  return Object.fromEntries(new URLSearchParams(q));
}

export default async function render(root) {
  const { id } = getHashParams();
  
  // Set breadcrumb
  try {
    setBreadcrumb(document.getElementById('crumb'), [
      { icon: 'home', label: 'Domů', href: '#/' },
      { icon: 'description', label: 'Smlouvy', href: '#/m/060-smlouva' },
      { icon: 'edit', label: id ? 'Editace smlouvy' : 'Nová smlouva' }
    ]);
  } catch (e) {}
  
  // Load metadata (with DB schema enrichment)
  const enrichedMeta = await loadModuleMetaCached(moduleMeta);
  
  // Load existing data if editing
  let initialData = { stav: 'koncept', periodicita_najmu: 'mesicni' };
  if (id) {
    const { data, error } = await getContract(id);
    if (error) {
      root.innerHTML = `<div class="p-4 text-red-600">Chyba při načítání smlouvy: ${error.message}</div>`;
      return;
    }
    if (!data) {
      root.innerHTML = `<div class="p-4 text-red-600">Smlouva nenalezena.</div>`;
      return;
    }
    initialData = data;
  }
  
  // Handle form submission
  async function handleSubmit(formData) {
    const dataToSave = { ...formData };
    if (id) {
      dataToSave.id = id;
    }
    
    const { data, error } = await upsertContract(dataToSave);
    
    if (error) {
      alert(`Chyba při ukládání: ${error.message}`);
      return false;
    }
    
    alert('Smlouva byla úspěšně uložena.');
    navigateTo(`#/m/060-smlouva/f/detail?id=${data.id}`);
    return true;
  }
  
  // Render form using metadata
  renderMetadataForm(
    root,
    enrichedMeta,
    'edit',
    initialData,
    handleSubmit,
    {
      submitLabel: id ? 'Uložit změny' : 'Vytvořit smlouvu',
      showSubmit: true
    }
  );
}
