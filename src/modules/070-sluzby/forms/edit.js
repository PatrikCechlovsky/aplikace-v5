// src/modules/070-sluzby/forms/edit.js
import { renderForm } from '/src/ui/form.js';
import { upsertServiceDefinition, getServiceDefinition } from '/src/modules/070-sluzby/db.js';
import { setBreadcrumb } from '/src/ui/breadcrumb.js';
import { navigateTo } from '/src/app.js';
import { supabase } from '/src/supabase.js';

// Helper to parse hash params
function getHashParams() {
  const q = (location.hash.split('?')[1] || '');
  return Object.fromEntries(new URLSearchParams(q));
}

// Helper to generate service code
async function generateServiceCode() {
  try {
    // Call the database function to generate next ID
    const { data, error } = await supabase.rpc('generate_next_id', {
      p_scope: 'module:070',
      p_entity_type: 'service'
    });
    
    if (error) {
      console.error('Error generating service code:', error);
      return null;
    }
    
    return data;
  } catch (err) {
    console.error('Exception generating service code:', err);
    return null;
  }
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
  
  // Load existing data if editing
  let initialData = { 
    aktivni: true, 
    typ_uctovani: 'pevna_sazba', 
    sazba_dph: 0.21,
    kategorie: 'jina'
  };
  
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
  
  // Create form container
  const formContainer = document.createElement('div');
  formContainer.className = 'p-4';
  
  // Define form fields
  const fields = [
    {
      key: 'kod',
      label: 'Kód služby',
      type: 'text',
      required: true,
      help: 'Unikátní kód služby (např. VODA, ELEKTRINA). Bude automaticky vygenerován nebo můžete zadat vlastní.',
      section: 'Základní údaje'
    },
    {
      key: 'nazev',
      label: 'Název služby',
      type: 'text',
      required: true,
      help: 'Název služby zobrazovaný v seznamech a dokumentech',
      section: 'Základní údaje'
    },
    {
      key: 'popis',
      label: 'Popis',
      type: 'textarea',
      rows: 3,
      help: 'Volitelný popis služby',
      section: 'Základní údaje'
    },
    {
      key: 'kategorie',
      label: 'Kategorie',
      type: 'select',
      required: true,
      options: [
        { value: 'energie', label: 'Energie' },
        { value: 'voda', label: 'Voda' },
        { value: 'internet', label: 'Internet' },
        { value: 'spravne_poplatky', label: 'Správné poplatky' },
        { value: 'jina', label: 'Jiná' }
      ],
      section: 'Základní údaje'
    },
    {
      key: 'typ_uctovani',
      label: 'Typ účtování (výpočet služby)',
      type: 'select',
      required: true,
      options: [
        { value: 'pevna_sazba', label: 'Pevná sazba' },
        { value: 'merena_spotreba', label: 'Podle měřidla (měřená spotřeba)' },
        { value: 'na_pocet_osob', label: 'Na počet osob v nájmu' },
        { value: 'na_m2', label: 'Na m² (podle plochy)' },
        { value: 'procento_z_najmu', label: 'Procento z nájmu' }
      ],
      help: 'Způsob výpočtu ceny služby',
      section: 'Výpočet a cena'
    },
    {
      key: 'jednotka',
      label: 'Jednotka',
      type: 'text',
      help: 'Např.: Kč/měsíc, Kč/m³, Kč/kWh, Kč/m², Kč/osoba',
      section: 'Výpočet a cena'
    },
    {
      key: 'zakladni_cena',
      label: 'Cena za jednotku (Kč)',
      type: 'number',
      step: '0.01',
      help: 'Základní cena za jednotku (bude použita jako výchozí při přiřazení ke smlouvě)',
      section: 'Výpočet a cena'
    },
    {
      key: 'sazba_dph',
      label: 'Sazba DPH',
      type: 'number',
      step: '0.01',
      help: 'Např. 0.21 pro 21% DPH, 0.15 pro 15% DPH',
      section: 'Výpočet a cena'
    },
    {
      key: 'meridlo_propojeni',
      label: 'Propojení na měřidlo',
      type: 'select',
      options: [
        { value: 'ne', label: 'Ne - bez propojení' },
        { value: 'ano', label: 'Ano - propojeno na měřidlo' }
      ],
      help: 'Zda se služba propojuje s měřidlem pro odečet spotřeby',
      section: 'Propojení na měřidlo'
    },
    {
      key: 'aktivni',
      label: 'Služba je aktivní',
      type: 'checkbox',
      help: 'Aktivní služby jsou k dispozici pro přiřazení ke smlouvám',
      section: 'Stav'
    },
    {
      key: 'poznamky',
      label: 'Poznámky',
      type: 'textarea',
      fullWidth: true,
      rows: 4,
      section: 'Další informace'
    }
  ];
  
  // Handle form submission
  async function handleSubmit(formData) {
    const dataToSave = { ...formData };
    
    // Generate service code if creating new and not provided
    if (!id && !dataToSave.kod) {
      const serviceCode = await generateServiceCode();
      if (serviceCode) {
        dataToSave.kod = serviceCode;
      } else {
        const shouldContinue = confirm('Nepodařilo se vygenerovat kód služby automaticky.\n\nMožné příčiny:\n- Není nastavena konfigurace číslování v Nastavení\n- Databázová chyba\n\nChcete zadat kód ručně?\n\nKlikněte OK pro pokračování nebo Zrušit pro návrat.');
        if (!shouldContinue) {
          return false;
        }
        // User chose to continue - they must fill in the code manually
      }
    }
    
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
  
  // Render form
  renderForm(formContainer, fields, initialData, handleSubmit, {
    submitLabel: id ? 'Uložit změny' : 'Vytvořit službu',
    showSubmit: true,
    layout: { columns: { base: 1, md: 2 } },
    sections: ['Základní údaje', 'Výpočet a cena', 'Propojení na měřidlo', 'Stav', 'Další informace']
  });
  
  root.innerHTML = '';
  root.appendChild(formContainer);
}
