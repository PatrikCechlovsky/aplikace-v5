// src/modules/080-platby/forms/edit.js
import { renderMetadataForm } from '/src/lib/formRenderer.js';
import { moduleMeta } from '/src/modules/080-platby/meta.js';
import { loadModuleMetaCached } from '/src/lib/metaLoader.js';
import { upsertPayment, getPayment } from '/src/modules/080-platby/db.js';
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
      { icon: 'payments', label: 'Platby', href: '#/m/080-platby' },
      { icon: 'add', label: id ? 'Editace platby' : 'Nová platba' }
    ]);
  } catch (e) {}
  
  // Load metadata (with DB schema enrichment)
  const enrichedMeta = await loadModuleMetaCached(moduleMeta);
  
  // Load existing data if editing
  let initialData = { 
    status: 'cekajici', 
    payment_type: 'najem',
    payment_method: 'bankovni_prevod',
    currency: 'CZK',
    payment_date: new Date().toISOString().split('T')[0]
  };
  if (id) {
    const { data, error } = await getPayment(id);
    if (error) {
      root.innerHTML = `<div class="p-4 text-red-600">Chyba při načítání platby: ${error.message}</div>`;
      return;
    }
    if (!data) {
      root.innerHTML = `<div class="p-4 text-red-600">Platba nenalezena.</div>`;
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
    
    const { data, error } = await upsertPayment(dataToSave);
    
    if (error) {
      alert(`Chyba při ukládání: ${error.message}`);
      return false;
    }
    
    alert('Platba byla úspěšně uložena.');
    navigateTo(`#/m/080-platby/f/detail?id=${data.id}`);
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
      submitLabel: id ? 'Uložit změny' : 'Vytvořit platbu',
      showSubmit: true
    }
  );
}
