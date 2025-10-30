// src/modules/070-sluzby/forms/edit.js
import { renderMetadataForm } from '/src/lib/formRenderer.js';
import { moduleMeta } from '/src/modules/070-sluzby/meta.js';
import { loadModuleMetaCached } from '/src/lib/metaLoader.js';
import { upsertServiceDefinition, getServiceDefinition } from '/src/modules/070-sluzby/db.js';
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
      { icon: 'settings', label: 'Služby', href: '#/m/070-sluzby' },
      { icon: 'edit', label: id ? 'Editace služby' : 'Nová služba' }
    ]);
  } catch (e) {}
  
  // Load metadata (with DB schema enrichment)
  const enrichedMeta = await loadModuleMetaCached(moduleMeta);
  
  // Load existing data if editing
  let initialData = { aktivni: true, typ_uctovani: 'pevna_sazba', sazba_dph: 0.21 };
  if (id) {
    const { data, error } = await getServiceDefinition(id);
    if (error) {
      root.innerHTML = `<div class="p-4 text-red-600">Chyba při načítání služby: ${error.message}</div>`;
      return;
    }
    if (!data) {
      root.innerHTML = `<div class="p-4 text-red-600">Služba nenalezena.</div>`;
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
    
    const { data, error } = await upsertServiceDefinition(dataToSave);
    
    if (error) {
      alert(`Chyba při ukládání: ${error.message}`);
      return false;
    }
    
    alert('Služba byla úspěšně uložena.');
    navigateTo(`#/m/070-sluzby/f/detail?id=${data.id}`);
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
      submitLabel: id ? 'Uložit změny' : 'Vytvořit službu',
      showSubmit: true
    }
  );
}
