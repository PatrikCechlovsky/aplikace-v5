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

// Helper: list subjects without active contract via RPC (migration creates this fn)
async function listSubjectsWithoutActiveContract() {
  try {
    const { data, error } = await supabase.rpc('subjects_without_active_contracts');
    if (error) return { data: [], error };
    return { data: data || [], error: null };
  } catch (err) {
    console.error('Exception listing subjects without active contract', err);
    return { data: [], error: err };
  }
}

// Helper: list units (optionally we could filter units without active contract)
async function listUnits(options = {}) {
  try {
    const { data, error } = await supabase
      .from('units')
      .select('id,oznaceni,property_id,properties(landlord_id,nazev)')
      .order('oznaceni', { ascending: true })
      .limit(1000);
    if (error) return { data: [], error };
    return { data: data || [], error: null };
  } catch (err) {
    console.error('Exception listing units', err);
    return { data: [], error: err };
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
  
  // We'll render form inside formWrap so we can attach extra UI (services, prefill box) around it
  const wrapper = document.createElement('div');
  wrapper.className = 'p-4 max-w-5xl mx-auto';
  const prefillBox = document.createElement('div');
  prefillBox.className = 'mb-4 bg-white rounded-lg p-3';
  wrapper.appendChild(prefillBox);

  const formWrap = document.createElement('div');
  formWrap.className = 'mb-4';
  wrapper.appendChild(formWrap);

  // Create container for services UI (will live below the form)
  const servicesSectionContainer = document.createElement('div');
  servicesSectionContainer.className = 'mb-6';
  wrapper.appendChild(servicesSectionContainer);

  // Append wrapper to root only at the end
  root.innerHTML = '';
  root.appendChild(wrapper);

  // ------------ Prefill / top chooser UI ------------
  // Purpose: allow user to pick a tenant (without contract) or pick an existing unit and auto-fill form
  async function renderPrefillBox() {
    prefillBox.innerHTML = '';
    const title = document.createElement('div');
    title.className = 'text-sm font-semibold mb-2';
    title.textContent = 'Rychlé vyplnění stran smlouvy';
    prefillBox.appendChild(title);

    const row = document.createElement('div');
    row.className = 'grid grid-cols-12 gap-2 items-center';

    // radio: choose mode
    const modeWrap = document.createElement('div');
    modeWrap.className = 'col-span-12 flex gap-3 items-center mb-2';
    const modeTenant = document.createElement('label');
    modeTenant.className = 'inline-flex items-center gap-2';
    modeTenant.innerHTML = `<input type="radio" name="prefill_mode" value="tenant" ${initialData.tenant_id ? 'checked' : ''}> Vybrat nájemníka`;
    const modeUnit = document.createElement('label');
    modeUnit.className = 'inline-flex items-center gap-2';
    modeUnit.innerHTML = `<input type="radio" name="prefill_mode" value="unit" ${initialData.unit_id ? 'checked' : ''}> Vybrat jednotku`;
    modeWrap.appendChild(modeTenant); modeWrap.appendChild(modeUnit);
    prefillBox.appendChild(modeWrap);

    // tenant select
    const tenantWrap = document.createElement('div');
    tenantWrap.className = 'col-span-6';
    const tenantSel = document.createElement('select');
    tenantSel.className = 'w-full border rounded px-2 py-1';
    tenantSel.appendChild(new Option('--- Vyberte nájemníka (bez aktivní smlouvy) ---', ''));
    tenantWrap.appendChild(tenantSel);
    row.appendChild(tenantWrap);

    // unit select
    const unitWrap = document.createElement('div');
    unitWrap.className = 'col-span-6';
    const unitSel = document.createElement('select');
    unitSel.className = 'w-full border rounded px-2 py-1';
    unitSel.appendChild(new Option('--- Vyberte jednotku ---', ''));
    unitWrap.appendChild(unitSel);
    row.appendChild(unitWrap);

    prefillBox.appendChild(row);

    // info area
    const info = document.createElement('div');
    info.className = 'text-sm text-slate-600 mt-2';
    prefillBox.appendChild(info);

    // load tenants without active contract
    const { data: tenants, error: tenantsErr } = await listSubjectsWithoutActiveContract();
    if (!tenantsErr) {
      (tenants || []).forEach(t => {
        const opt = new Option(t.display_name || t.subject_id || t.id || '---', t.subject_id || t.id || '');
        tenantSel.appendChild(opt);
      });
    }

    // load units
    const { data: units, error: unitsErr } = await listUnits();
    if (!unitsErr) {
      (units || []).forEach(u => {
        const label = u.oznaceni + (u.properties?.nazev ? ` — ${u.properties.nazev}` : '');
        unitSel.appendChild(new Option(label, u.id));
      });
    }

    // helper to set form values (will update initialData and visible inputs)
    function applyPrefill(pref) {
      if (!pref) return;
      if (pref.tenant_id) {
        initialData.tenant_id = pref.tenant_id;
      }
      if (pref.unit_id) {
        initialData.unit_id = pref.unit_id;
      }
      if (pref.property_id) initialData.property_id = pref.property_id;
      if (pref.landlord_id) initialData.landlord_id = pref.landlord_id;

      // update visible inputs inside the formWrap (if rendered)
      const setInput = (name, value) => {
        const el = formWrap.querySelector(`[name="${name}"]`);
        if (el) {
          if (el.type === 'checkbox') el.checked = !!value;
          else el.value = value ?? '';
          // trigger input event for any onChange logic in renderForm
          el.dispatchEvent(new Event('input', { bubbles: true }));
        }
      };

      setInput('tenant_id', initialData.tenant_id);
      setInput('unit_id', initialData.unit_id);
      setInput('property_id', initialData.property_id);
      setInput('landlord_id', initialData.landlord_id);

      // set info text
      const lines = [];
      if (initialData.tenant_id) lines.push(`Nájemník: ${tenantSel.options[tenantSel.selectedIndex]?.text || initialData.tenant_id}`);
      if (initialData.unit_id) lines.push(`Jednotka: ${unitSel.options[unitSel.selectedIndex]?.text || initialData.unit_id}`);
      if (initialData.property_id) lines.push(`Nemovitost: ${initialData.property_id}`);
      if (initialData.landlord_id) lines.push(`Pronajímatel: ${initialData.landlord_id}`);
      info.textContent = lines.join(' • ');
    }

    // selection handlers
    tenantSel.addEventListener('change', async () => {
      const val = tenantSel.value;
      if (!val) return;
      // fetch full subject info
      try {
        const { data: subj } = await supabase.from('subjects').select('id,display_name,email,phone').eq('id', val).single();
        applyPrefill({ tenant_id: subj.id });
      } catch (e) {
        console.error('Error fetching subject', e);
      }
    });

    unitSel.addEventListener('change', async () => {
      const val = unitSel.value;
      if (!val) return;
      try {
        const { data: unit, error: uerr } = await supabase
          .from('units')
          .select('id,oznaceni,property_id,properties(landlord_id,nazev)')
          .eq('id', val)
          .single();
        if (uerr) {
          console.error('Error fetching unit', uerr);
          return;
        }
        applyPrefill({
          unit_id: unit.id,
          property_id: unit.property_id,
          landlord_id: unit.properties?.landlord_id
        });
      } catch (e) {
        console.error('Exception fetching unit', e);
      }
    });

    // radio toggle to guide UX: disable other select depending on mode
    prefillBox.querySelectorAll('input[name="prefill_mode"]').forEach(r => {
      r.addEventListener('change', (e) => {
        if (e.target.value === 'tenant') {
          tenantSel.disabled = false; unitSel.disabled = true;
        } else {
          tenantSel.disabled = true; unitSel.disabled = false;
        }
      });
    });

    // initial state: if we have tenant_id from initialData, set it; else enable unit selection
    if (initialData.tenant_id) {
      const opt = Array.from(tenantSel.options).find(o => o.value === initialData.tenant_id);
      if (opt) { tenantSel.value = initialData.tenant_id; tenantSel.dispatchEvent(new Event('change')); }
      tenantSel.disabled = false; unitSel.disabled = true;
      prefillBox.querySelector('input[name="prefill_mode"][value="tenant"]').checked = true;
    } else if (initialData.unit_id) {
      const opt = Array.from(unitSel.options).find(o => o.value === initialData.unit_id);
      if (opt) { unitSel.value = initialData.unit_id; unitSel.dispatchEvent(new Event('change')); }
      tenantSel.disabled = true; unitSel.disabled = false;
      prefillBox.querySelector('input[name="prefill_mode"][value="unit"]').checked = true;
    } else {
      tenantSel.disabled = false; unitSel.disabled = false;
    }
  } // end renderPrefillBox

  // ------------ Form fields definition ------------
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
        if (value) {
          try {
            const { data: unit, error } = await supabase
              .from('units')
              .select('id,oznaceni,property_id,properties(landlord_id,nazev)')
              .eq('id', value)
              .single();
            if (error) { console.error('Error auto-filling from unit:', error); return; }
            formData.property_id = unit.property_id;
            formData.landlord_id = unit.properties?.landlord_id;
          } catch (err) {
            console.error('Error auto-filling from unit:', err);
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
      section: 'Strany a nemovitost',
      onChange: async (value, formData) => {
        // optionally auto-fill related data from subject (contact info) if you need
        if (value) {
          try {
            const { data: subj, error } = await supabase
              .from('subjects')
              .select('id,display_name,email,phone')
              .eq('id', value)
              .single();
            if (error) {
              console.error('Error loading subject', error);
            } else {
              // can't deduce unit/property from subject reliably; leave for manual selection or other business logic
              // but we can store display name for UI if needed
              formData._tenant_display = subj?.display_name;
            }
          } catch (err) {
            console.error('Exception loading subject', err);
          }
        }
      }
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

  // ------------ sections builder (explicit) ------------
  function slugifyLabel(label) {
    return String(label || '').toLowerCase()
      .replace(/\s+/g, '_')
      .replace(/[^\w\-]/g, '')
      .replace(/^_+|_+$/g, '');
  }

  const sectionsFromFields = (() => {
    const groups = new Map();
    fields.forEach(f => {
      const secLabel = f.section || 'Default';
      if (!groups.has(secLabel)) groups.set(secLabel, []);
      groups.get(secLabel).push(f.key);
    });
    // prioritize: Základní údaje first
    const order = Array.from(groups.keys());
    const result = order.map(label => ({
      id: slugifyLabel(label),
      label,
      fields: groups.get(label)
    }));
    return result;
  })();

  // ------------ Service lines UI integration (kept external to renderForm) ------------
  let serviceLines = [];
  let removedServiceLineIds = [];

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

  async function renderAddServiceBox(container) {
    const box = document.createElement('div');
    box.className = 'grid grid-cols-12 gap-2 items-center mb-3';

    const selWrap = document.createElement('div'); selWrap.className = 'col-span-5';
    const sel = document.createElement('select'); sel.className = 'w-full border rounded px-2 py-1';
    sel.appendChild(new Option('--- Vyberte službu ---', ''));
    const { data: services } = await listServiceDefinitions();
    (services || []).forEach(s => sel.appendChild(new Option(s.nazev, s.id)));
    selWrap.appendChild(sel);
    box.appendChild(selWrap);

    const priceWrap = document.createElement('div'); priceWrap.className = 'col-span-2';
    const priceIn = document.createElement('input'); priceIn.type='number'; priceIn.step='0.01'; priceIn.className='w-full border rounded px-2 py-1'; priceWrap.appendChild(priceIn);
    box.appendChild(priceWrap);

    const qWrap = document.createElement('div'); qWrap.className='col-span-1';
    const qIn = document.createElement('input'); qIn.type='number'; qIn.step='0.001'; qIn.value = 1; qIn.className='w-full border rounded px-2 py-1';
    qWrap.appendChild(qIn); box.appendChild(qWrap);

    const payerWrap = document.createElement('div'); payerWrap.className='col-span-2';
    const payerSel = document.createElement('select'); payerSel.className='w-full border rounded px-2 py-1';
    ['najemnik','pronajimatel','sdilene'].forEach(v => payerSel.appendChild(new Option(v,v)));
    payerWrap.appendChild(payerSel); box.appendChild(payerWrap);

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
      serviceLines.push(newLine);
      renderServiceLines(container);
      computeRentSum();
      sel.value = '';
      priceIn.value = '';
      qIn.value = 1;
      payerSel.value = 'najemnik';
    });
    addWrap.appendChild(addBtn);
    box.appendChild(addWrap);

    container.appendChild(box);
  }

  function renderServiceLines(container) {
    const existing = container.querySelector('.service-lines-table');
    if (existing) existing.remove();
    const table = document.createElement('div');
    table.className = 'service-lines-table space-y-2';
    serviceLines.forEach((ln, idx) => {
      const row = document.createElement('div');
      row.className = 'grid grid-cols-12 gap-2 items-center bg-slate-50 p-2 rounded';
      const title = document.createElement('div');
      title.className = 'col-span-4';
      title.innerHTML = `<strong>${ln.service_definition?.nazev || ln._service_name || '---'}</strong><div class="text-xs text-slate-500">${ln.unit || ''}</div>`;
      row.appendChild(title);

      const priceWrap = document.createElement('div'); priceWrap.className = 'col-span-2';
      const priceInput = document.createElement('input'); priceInput.type='number'; priceInput.step='0.01'; priceInput.className='w-full border rounded px-2 py-1 text-sm';
      priceInput.value = (ln.price ?? 0);
      priceInput.addEventListener('input', (e) => { ln.price = parseFloat(e.target.value || 0); computeRentSum(); });
      priceWrap.appendChild(priceInput);
      row.appendChild(priceWrap);

      const qWrap = document.createElement('div'); qWrap.className='col-span-1';
      const qInput = document.createElement('input'); qInput.type='number'; qInput.step='0.001'; qInput.className='w-full border rounded px-2 py-1 text-sm';
      qInput.value = (ln.quantity ?? 1);
      qInput.addEventListener('input', (e) => { ln.quantity = parseFloat(e.target.value || 1); computeRentSum(); });
      qWrap.appendChild(qInput); row.appendChild(qWrap);

      const payer = document.createElement('div'); payer.className='col-span-2';
      const payerSel = document.createElement('select'); payerSel.className='w-full border rounded px-2 py-1 text-sm';
      ['najemnik','pronajimatel','sdilene'].forEach(v => {
        const o = document.createElement('option'); o.value = v; o.textContent = v; if(ln.plati_for===v) o.selected=true;
        payerSel.appendChild(o);
      });
      payerSel.addEventListener('change', e => ln.plati_for = e.target.value);
      payer.appendChild(payerSel); row.appendChild(payer);

      const actions = document.createElement('div'); actions.className='col-span-3 flex gap-2 justify-end';
      const del = document.createElement('button'); del.type='button'; del.className='px-3 py-1 rounded border text-sm'; del.textContent='Smazat';
      del.addEventListener('click', async () => {
        if (ln.id) removedServiceLineIds.push(ln.id);
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

  function computeRentSum() {
    const sum = serviceLines.reduce((s, ln) => s + (parseFloat(ln.price || 0) * parseFloat(ln.quantity || 1)), 0);
    initialData.najem_vyse = sum;
    // try update the form input inside formWrap
    const el = formWrap.querySelector('input[name="najem_vyse"]');
    if (el) el.value = sum;
  }

  async function saveServiceLinesAfterContractSaved(contractId) {
    // delete removed
    for (const delId of removedServiceLineIds || []) {
      try { await deleteContractServiceLine(delId); } catch (e) { console.error('Error deleting service line', delId, e); }
    }
    // upsert current
    for (const ln of serviceLines) {
      const payload = { ...ln, contract_id: contractId };
      delete payload._service_name;
      try {
        const { data, error } = await upsertContractServiceLine(payload);
        if (error) console.error('Chyba ukládání služby:', error);
        else { ln.id = data.id; ln.contract_id = contractId; }
      } catch (e) {
        console.error('Exception saving service line', e);
      }
    }
    removedServiceLineIds = [];
  }

  // ------------ handle submit (with validation) ------------
  async function handleSubmit(formData) {
    // ensure required parties are filled
    if (!formData.tenant_id) {
      alert('Chyba: Smlouva musí mít vybraného nájemníka (tenant).');
      return false;
    }
    if (!formData.unit_id) {
      alert('Chyba: Smlouva musí být přiřazena k jednotce.');
      return false;
    }
    if (!formData.property_id) {
      alert('Chyba: Smlouva musí mít přiřazenou nemovitost.');
      return false;
    }
    if (!formData.landlord_id) {
      alert('Chyba: Smlouva musí mít přiřazeného pronajímatele.');
      return false;
    }

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
      }
    }

    if (id) dataToSave.id = id;

    if (dataToSave.typ_ukonceni === 'indefinite') dataToSave.datum_konec = null;

    // Save contract first
    const { data, error } = await upsertContract(dataToSave);
    if (error) {
      alert(`Chyba při ukládání: ${error.message}`);
      return false;
    }

    // Save service lines
    try {
      await saveServiceLinesAfterContractSaved(data.id);
    } catch (e) {
      console.error('Error saving service lines:', e);
      alert('Smlouva uložena, ale nastala chyba při ukládání služeb. Zkontrolujte konzoli.');
    }

    alert('Smlouva byla úspěšně uložena.');
    navigateTo(`#/m/060-smlouva/f/detail?id=${data.id}`);
    return true;
  }

  // ------------ render prefill, services, and form ------------
  await renderPrefillBox();
  await loadServiceLines();
  await renderAddServiceBox(servicesSectionContainer);
  renderServiceLines(servicesSectionContainer);
  computeRentSum();

  // Render the form into formWrap (so services UI and prefill box remain outside of the renderForm's root clearing)
  renderForm(formWrap, fields, initialData, handleSubmit, {
    submitLabel: id ? 'Uložit změny' : 'Vytvořit smlouvu',
    showSubmit: true,
    layout: { columns: { base: 1, md: 2 } },
    sections: sectionsFromFields
  });

  // Append services UI header inside wrapper if not already present
  const servicesHeader = document.createElement('h3');
  servicesHeader.className = 'text-lg font-medium my-3';
  servicesHeader.textContent = 'Služby k této smlouvě';
  // insert header before servicesSectionContainer if not already
  if (!servicesSectionContainer.previousElementSibling || servicesSectionContainer.previousElementSibling !== servicesHeader) {
    wrapper.insertBefore(servicesHeader, servicesSectionContainer);
  }
}
