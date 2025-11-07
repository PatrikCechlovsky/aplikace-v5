// src/modules/060-smlouva/forms/edit.js
import { renderForm } from '/src/ui/form.js';
import { upsertContract, getContract } from '/src/modules/060-smlouva/db.js';
import { setBreadcrumb } from '/src/ui/breadcrumb.js';
import { navigateTo } from '/src/app.js';
import { supabase } from '/src/supabase.js';

// Helper to parse hash params
function getHashParams() {
  const q = (location.hash.split('?')[1] || '');
  return Object.fromEntries(new URLSearchParams(q));
}

// Helper to generate next contract number
async function generateContractNumber() {
  try {
    // Call the database function to generate next ID
    const { data, error } = await supabase.rpc('generate_next_id', {
      p_scope: 'module:060',
      p_entity_type: 'contract'
    });
    
    if (error) {
      console.error('Error generating contract number:', error);
      return null;
    }
    
    return data;
  } catch (err) {
    console.error('Exception generating contract number:', err);
    return null;
  }
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
  
  // Load existing data if editing
  let initialData = { 
    stav: 'koncept', 
    periodicita_najmu: 'mesicni',
    typ_ukonceni: 'indefinite',  // Default to indefinite
    najem_vyse: 0
  };
  
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
  
  // Create form container
  const formContainer = document.createElement('div');
  formContainer.className = 'p-4';
  
  // Define form fields
  const fields = [
    {
      key: 'cislo_smlouvy',
      label: 'Číslo smlouvy',
      type: 'text',
      required: true,
      help: 'Automaticky vygenerováno při vytvoření nebo můžete zadat vlastní',
      section: 'Základní údaje'
    },
    {
      key: 'nazev',
      label: 'Název smlouvy',
      type: 'text',
      help: 'Volitelný název pro lepší identifikaci',
      section: 'Základní údaje'
    },
    {
      key: 'stav',
      label: 'Stav smlouvy',
      type: 'select',
      required: true,
      options: [
        { value: 'koncept', label: 'Koncept' },
        { value: 'cekajici_podepsani', label: 'Čeká na podpis' },
        { value: 'aktivni', label: 'Aktivní' },
        { value: 'ukoncena', label: 'Ukončená' },
        { value: 'zrusena', label: 'Zrušená' },
        { value: 'propadla', label: 'Propadlá' }
      ],
      section: 'Základní údaje'
    },
    {
      key: 'unit_id',
      label: 'Jednotka',
      type: 'chooser',
      entity: 'units',
      required: true,
      help: 'Vyberte jednotku - nemovitost a pronajímatel se doplní automaticky',
      section: 'Strany a nemovitost',
      onChange: async (value, formData) => {
        // Auto-fill property and landlord when unit is selected
        if (value) {
          try {
            const { data: unit, error } = await supabase
              .from('units')
              .select('property_id, properties!inner(landlord_id)')
              .eq('id', value)
              .single();
            
            if (error) {
              console.error('Error auto-filling from unit:', error);
              alert('Chyba: Nepodařilo se načíst informace o jednotce. Zkontrolujte prosím nemovitost a pronajímatele ručně.');
              return;
            }
            
            if (unit) {
              formData.property_id = unit.property_id;
              formData.landlord_id = unit.properties?.landlord_id;
            } else {
              alert('Upozornění: Jednotka nemá přiřazenou nemovitost nebo pronajímatele.');
            }
          } catch (err) {
            console.error('Error auto-filling from unit:', err);
            alert('Chyba: Nepodařilo se automaticky doplnit nemovitost a pronajímatele. Zkontrolujte prosím tato pole ručně.');
          }
        }
      }
    },
    {
      key: 'property_id',
      label: 'Nemovitost',
      type: 'chooser',
      entity: 'properties',
      readOnly: true,
      help: 'Doplněno automaticky podle vybrané jednotky',
      section: 'Strany a nemovitost'
    },
    {
      key: 'landlord_id',
      label: 'Pronajímatel',
      type: 'chooser',
      entity: 'subjects',
      role: 'pronajimatel',
      required: true,
      readOnly: true,
      help: 'Doplněno automaticky podle vybrané jednotky',
      section: 'Strany a nemovitost'
    },
    {
      key: 'tenant_id',
      label: 'Nájemník',
      type: 'chooser',
      entity: 'subjects',
      role: 'najemnik',
      required: true,
      help: 'Vyberte nájemníka',
      section: 'Strany a nemovitost'
    },
    {
      key: 'typ_ukonceni',
      label: 'Typ ukončení',
      type: 'select',
      required: true,
      options: [
        { value: 'fixed_term', label: 'Na dobu určitou' },
        { value: 'indefinite', label: 'Na dobu neurčitou' }
      ],
      help: 'Na dobu určitou = nastavte datum konce, Na dobu neurčitou = bez konce',
      section: 'Období platnosti'
    },
    {
      key: 'datum_zacatek',
      label: 'Datum začátku',
      type: 'date',
      required: true,
      section: 'Období platnosti'
    },
    {
      key: 'datum_konec',
      label: 'Datum konce',
      type: 'date',
      help: 'Vyplňte pouze pro smlouvy na dobu určitou',
      section: 'Období platnosti',
      showIf: (formData) => formData.typ_ukonceni === 'fixed_term'
    },
    {
      key: 'najem_vyse',
      label: 'Výše nájmu (Kč)',
      type: 'number',
      step: '0.01',
      required: true,
      readOnly: false,  // Will be calculated from services but can be manually set
      help: 'Celková výše nájmu (bude vypočítána ze služeb)',
      section: 'Platební podmínky'
    },
    {
      key: 'periodicita_najmu',
      label: 'Periodicita platby',
      type: 'select',
      required: true,
      options: [
        { value: 'tydenni', label: 'Týdenní' },
        { value: 'mesicni', label: 'Měsíční' },
        { value: 'ctvrtletni', label: 'Čtvrtletní' },
        { value: 'rocni', label: 'Roční' }
      ],
      section: 'Platební podmínky'
    },
    {
      key: 'kauce_potreba',
      label: 'Kauce požadována',
      type: 'checkbox',
      section: 'Kauce'
    },
    {
      key: 'kauce_castka',
      label: 'Výše kauce (Kč)',
      type: 'number',
      step: '0.01',
      section: 'Kauce',
      showIf: (formData) => formData.kauce_potreba
    },
    {
      key: 'stav_kauce',
      label: 'Stav kauce',
      type: 'select',
      options: [
        { value: 'nevyzadovana', label: 'Nevyžadována' },
        { value: 'drzena', label: 'Držena' },
        { value: 'vracena', label: 'Vrácena' },
        { value: 'castecne_vracena', label: 'Částečně vrácena' }
      ],
      section: 'Kauce',
      showIf: (formData) => formData.kauce_potreba
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
    
    // Generate contract number if creating new and not provided
    if (!id && !dataToSave.cislo_smlouvy) {
      const contractNumber = await generateContractNumber();
      if (contractNumber) {
        dataToSave.cislo_smlouvy = contractNumber;
      } else {
        const shouldContinue = confirm('Nepodařilo se vygenerovat číslo smlouvy automaticky. Chcete zadat číslo ručně?\n\nKlikněte OK pro pokračování (budete muset zadat číslo ručně) nebo Zrušit pro návrat.');
        if (!shouldContinue) {
          return false;
        }
        // User chose to continue - they must fill in the number manually
        // The form validation will catch if it's empty
      }
    }
    
    if (id) {
      dataToSave.id = id;
    }
    
    // If indefinite, clear end date
    if (dataToSave.typ_ukonceni === 'indefinite') {
      dataToSave.datum_konec = null;
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
  
  // Render form
  renderForm(formContainer, fields, initialData, handleSubmit, {
    submitLabel: id ? 'Uložit změny' : 'Vytvořit smlouvu',
    showSubmit: true,
    layout: { columns: { base: 1, md: 2 } },
    sections: ['Základní údaje', 'Strany a nemovitost', 'Období platnosti', 'Platební podmínky', 'Kauce', 'Další informace']
  });
  
  root.innerHTML = '';
  root.appendChild(formContainer);
}
