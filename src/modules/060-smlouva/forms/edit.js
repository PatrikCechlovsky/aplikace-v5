// src/modules/060-smlouva/forms/edit.js
import { renderForm } from '/src/ui/form.js';
import { upsertContract, getContract } from '/src/modules/060-smlouva/db.js';
import { setBreadcrumb } from '/src/ui/breadcrumb.js';
import { navigateTo } from '/src/app.js';
import { supabase } from '/src/supabase.js';
import {
  listServiceDefinitions,
  listContractServiceLines,
  upsertContractServiceLine,
  deleteContractServiceLine
} from '/src/modules/070-sluzby/db.js';

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
  
  // debug: zjistit, odkud je render volán (odstranit po vyřešení)
  console.trace('render:060-smlouva called, id=', id);
  window.__render_060_calls = (window.__render_060_calls || 0) + 1;
  console.log('render:060-smlouva call #', window.__render_060_calls);

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
  // We'll integrate saving of service lines after contract is saved
  let removedServiceLineIds = []; // track deleted lines
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
    
    // Save contract first
    const { data, error } = await upsertContract(dataToSave);
    
    if (error) {
      alert(`Chyba při ukládání: ${error.message}`);
      return false;
    }
    
    // Save service lines (if any) using contract id
    try {
      await saveServiceLinesAfterContractSaved(data.id);
    } catch (e) {
      console.error('Error saving service lines:', e);
      alert('Smlouva uložena, ale nastala chyba při ukládání služeb položek. Zkontrolujte prosím konzoli.');
      // We proceed to navigate anyway, or you might choose to stop
    }
    
    alert('Smlouva byla úspěšně uložena.');
    navigateTo(`#/m/060-smlouva/f/detail?id=${data.id}`);
    return true;
  }
  
  // --- build sections automatically from fields (fixes duplicate rendering when passing strings) ---
  function slugifyLabel(label) {
    return String(label || '').toLowerCase()
      .replace(/\s+/g, '_')
      .replace(/[^\w\-]/g, '')
      .replace(/^_+|_+$/g, '');
  }

  const sectionsFromFields = (() => {
    const map = new Map();
    fields.forEach(f => {
      const sec = f.section || 'Default';
      if (!map.has(sec)) map.set(sec, []);
      map.get(sec).push(f.key);
    });
    return Array.from(map.entries()).map(([label, keys]) => ({
      id: slugifyLabel(label),
      label,
      fields: keys
    }));
  })();
  // -------------------------------------------------------------------------

  // --- Service lines UI integration ---
  // will hold current lines (loaded from DB or newly created)
  let serviceLines = [];
  // track ids removed by user (to delete server-side)
  removedServiceLineIds = [];

  async function loadServiceLines() {
    if (!id) { serviceLines = []; return; }
    const { data, error } = await listContractServiceLines(id);
    if (error) {
      console.error('Error loading service lines', error);
      serviceLines = [];
      return;
    }
    serviceLines = (data || []).map(d => ({
      id: d.id,
      contract_id: d.contract_id,
      service_definition_id: d.service_definition_id,
      price: parseFloat(d.price || 0),
      quantity: parseFloat(d.quantity || 1),
      unit: d.unit || '',
      typ_uctovani: d.typ_uctovani,
      plati_for: d.plati_for,
      note: d.note,
      service_definition: d.service_definition
    }));
  }

  // render the add / chooser box
  async function renderAddServiceBox(container) {
    const box = document.createElement('div');
    box.className = 'grid grid-cols-12 gap-2 items-center mb-3';
  
    // service select (simple select)
    const selWrap = document.createElement('div'); selWrap.className = 'col-span-5';
    const sel = document.createElement('select'); sel.className = 'w-full border rounded px-2 py-1';
    sel.appendChild(new Option('--- Vyberte službu ---', ''));
    const { data: services } = await listServiceDefinitions();
    (services || []).forEach(s => sel.appendChild(new Option(s.nazev, s.id)));
    selWrap.appendChild(sel);
    box.appendChild(selWrap);
  
    // price input
    const priceWrap = document.createElement('div'); priceWrap.className = 'col-span-2';
    const priceIn = document.createElement('input'); priceIn.type='number'; priceIn.step='0.01'; priceIn.className='w-full border rounded px-2 py-1'; priceWrap.appendChild(priceIn);
    box.appendChild(priceWrap);
  
    // quantity
    const qWrap = document.createElement('div'); qWrap.className='col-span-1';
    const qIn = document.createElement('input'); qIn.type='number'; qIn.step='0.001'; qIn.value = 1; qIn.className='w-full border rounded px-2 py-1';
    qWrap.appendChild(qIn); box.appendChild(qWrap);
  
    // payer
    const payerWrap = document.createElement('div'); payerWrap.className='col-span-2';
    const payerSel = document.createElement('select'); payerSel.className='w-full border rounded px-2 py-1';
    ['najemnik','pronajimatel','sdilene'].forEach(v => payerSel.appendChild(new Option(v,v)));
    payerWrap.appendChild(payerSel); box.appendChild(payerWrap);
  
    // add button
    const addWrap = document.createElement('div'); addWrap.className='col-span-2 flex justify-end';
    const addBtn = document.createElement('button'); addBtn.type='button'; addBtn.className='px-4 py-2 rounded bg-slate-900 text-white';
    addBtn.textContent = 'Přidat službu';
    addBtn.addEventListener('click', async () => {
      if (!sel.value) return alert('Vyberte službu.');
      const svc = (services || []).find(s => s.id === sel.value);
      const newLine = {
        contract_id: id || null,
        service_definition_id: svc.id,
        price: parseFloat(priceIn.value || svc.zakladni_cena || 0),
        quantity: parseFloat(qIn.value || 1),
        unit: svc.jednotka || '',
        typ_uctovani: svc.typ_uctovani || null,
        plati_for: payerSel.value,
        _service_name: svc.nazev
      };
      // optimistically push locally
      serviceLines.push(newLine);
      renderServiceLines(container);
      computeRentSum();
      // reset inputs
      sel.value = '';
      priceIn.value = '';
      qIn.value = 1;
      payerSel.value = 'najemnik';
    });
    addWrap.appendChild(addBtn);
    box.appendChild(addWrap);
  
    container.appendChild(box);
  }

  // render lines list in a simple grid
  function renderServiceLines(container) {
    // remove existing table if present
    const existing = container.querySelector('.service-lines-table');
    if (existing) existing.remove();

    const table = document.createElement('div');
    table.className = 'service-lines-table space-y-2';
  
    serviceLines.forEach((ln, idx) => {
      const row = document.createElement('div');
      row.className = 'grid grid-cols-12 gap-2 items-center bg-slate-50 p-2 rounded';
      // label
      const title = document.createElement('div');
      title.className = 'col-span-4';
      title.innerHTML = `<strong>${ln.service_definition?.nazev || ln._service_name || '---'}</strong><div class="text-xs text-slate-500">${ln.unit || ''}</div>`;
      row.appendChild(title);
  
      // price
      const priceWrap = document.createElement('div');
      priceWrap.className = 'col-span-2';
      const priceInput = document.createElement('input');
      priceInput.type = 'number';
      priceInput.step = '0.01';
      priceInput.className = 'w-full border rounded px-2 py-1 text-sm';
      priceInput.value = (ln.price ?? 0);
      priceInput.addEventListener('input', (e) => {
        ln.price = parseFloat(e.target.value || 0);
        computeRentSum();
      });
      priceWrap.appendChild(priceInput);
      row.appendChild(priceWrap);
  
      // quantity
      const qWrap = document.createElement('div');
      qWrap.className = 'col-span-1';
      const qInput = document.createElement('input');
      qInput.type = 'number';
      qInput.step = '0.001';
      qInput.className = 'w-full border rounded px-2 py-1 text-sm';
      qInput.value = (ln.quantity ?? 1);
      qInput.addEventListener('input', (e) => {
        ln.quantity = parseFloat(e.target.value || 1);
        computeRentSum();
      });
      qWrap.appendChild(qInput);
      row.appendChild(qWrap);
  
      // payer
      const payer = document.createElement('div');
      payer.className = 'col-span-2';
      const payerSel = document.createElement('select');
      payerSel.className = 'w-full border rounded px-2 py-1 text-sm';
      ['najemnik','pronajimatel','sdilene'].forEach(v => {
        const o = document.createElement('option'); o.value = v; o.textContent = v; if(ln.plati_for===v) o.selected=true;
        payerSel.appendChild(o);
      });
      payerSel.addEventListener('change', e => ln.plati_for = e.target.value);
      payer.appendChild(payerSel);
      row.appendChild(payer);
  
      // actions
      const actions = document.createElement('div');
      actions.className = 'col-span-3 flex gap-2 justify-end';
      const del = document.createElement('button');
      del.type = 'button';
      del.className = 'px-3 py-1 rounded border text-sm';
      del.textContent = 'Smazat';
      del.addEventListener('click', async () => {
        if (ln.id) {
          // mark for deletion
          removedServiceLineIds.push(ln.id);
        }
        serviceLines.splice(idx, 1);
        renderServiceLines(container);
        computeRentSum();
      });
      actions.appendChild(del);
  
      row.appendChild(actions);
  
      table.appendChild(row);
    });
  
    container.appendChild(table);
  }

  // compute sum into najem_vyse in form data object
  function computeRentSum() {
    const sum = serviceLines.reduce((s, ln) => s + (parseFloat(ln.price || 0) * parseFloat(ln.quantity || 1)), 0);
    initialData.najem_vyse = sum;
    // if price input exists in form UI, update it (optional)
    const el = document.querySelector('input[name="najem_vyse"]');
    if (el) el.value = sum;
  }

  // persist service lines after contract has an id
  async function saveServiceLinesAfterContractSaved(contractId) {
    // delete removed
    for (const delId of removedServiceLineIds || []) {
      try {
        await deleteContractServiceLine(delId);
      } catch (e) {
        console.error('Error deleting service line', delId, e);
      }
    }
    // upsert current
    for (const ln of serviceLines) {
      const payload = { ...ln, contract_id: contractId };
      delete payload._service_name;
      try {
        const { data, error } = await upsertContractServiceLine(payload);
        if (error) console.error('Chyba ukládání služby:', error);
        else {
          ln.id = data.id;
          ln.contract_id = contractId;
        }
      } catch (e) {
        console.error('Exception saving service line', e);
      }
    }
    // reset removed list
    removedServiceLineIds = [];
  }

  // create container for services UI and load initial lines
  const servicesSectionContainer = document.createElement('div');
  servicesSectionContainer.className = 'mb-4';

  // load existing lines and render add box + lines
  await loadServiceLines();
  await renderAddServiceBox(servicesSectionContainer);
  renderServiceLines(servicesSectionContainer);
  computeRentSum();

  // Append services UI to form container (after form fields)
  formContainer.appendChild(document.createElement('hr'));
  const h3 = document.createElement('h3');
  h3.className = 'text-lg font-medium my-3';
  h3.textContent = 'Služby k této smlouvě';
  formContainer.appendChild(h3);
  formContainer.appendChild(servicesSectionContainer);
  // --- end service lines UI integration ---

  // Render form
  renderForm(formContainer, fields, initialData, handleSubmit, {
    submitLabel: id ? 'Uložit změny' : 'Vytvořit smlouvu',
    showSubmit: true,
    layout: { columns: { base: 1, md: 2 } },
    sections: sectionsFromFields
  });
  
  root.innerHTML = '';
  root.appendChild(formContainer);
}
