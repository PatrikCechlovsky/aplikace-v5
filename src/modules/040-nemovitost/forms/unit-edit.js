import { setBreadcrumb } from '/src/ui/breadcrumb.js';
import { renderForm } from '/src/ui/form.js';
import { renderCommonActions } from '/src/ui/commonActions.js';
import { navigateTo } from '/src/app.js';
import { getUnit, upsertUnit, archiveUnit, getProperty } from '/src/modules/040-nemovitost/db.js';
import { useUnsavedHelper } from '/src/ui/unsaved-helper.js';
import { showAttachmentsModal } from '/src/ui/attachments.js';
import { setUnsaved } from '/src/app.js';

// Pomocná funkce pro získání parametrů z hash části URL
function getHashParams() {
  const q = (location.hash.split('?')[1] || '');
  return Object.fromEntries(new URLSearchParams(q));
}

// Pomocná funkce pro formátování českého data+času
function formatCzechDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d)) return '';
  return d.toLocaleDateString('cs-CZ') + ' ' + d.toLocaleTimeString('cs-CZ');
}

// Definice polí formuláře
const FIELDS = [
  { key: 'oznaceni', label: 'Označení jednotky', type: 'text', required: true, placeholder: 'např. 1.01, A12' },
  { key: 'typ_jednotky', label: 'Typ jednotky', type: 'select', required: true, options: [
    { value: 'byt', label: 'Byt' },
    { value: 'kancelar', label: 'Kancelář' },
    { value: 'obchod', label: 'Obchodní prostor' },
    { value: 'sklad', label: 'Sklad' },
    { value: 'garaz', label: 'Garáž/Parking' },
    { value: 'sklep', label: 'Sklep' },
    { value: 'puda', label: 'Půda' },
    { value: 'jina_jednotka', label: 'Jiná jednotka' }
  ]},
  { key: 'podlazi', label: 'Podlaží', type: 'text', placeholder: 'např. 1, přízemí, -1' },
  { key: 'plocha', label: 'Plocha (m²)', type: 'number', required: true, step: '0.01' },
  { key: 'pocet_mistnosti', label: 'Počet místností', type: 'number' },
  { key: 'dispozice', label: 'Dispozice', type: 'text', placeholder: 'např. 2+kk, 3+1' },
  { key: 'stav', label: 'Stav', type: 'select', required: true, options: [
    { value: 'volna', label: 'Volná' },
    { value: 'obsazena', label: 'Obsazená' },
    { value: 'rezervovana', label: 'Rezervovaná' },
    { value: 'rekonstrukce', label: 'Rekonstrukce' }
  ]},
  { key: 'mesicni_najem', label: 'Měsíční nájem (Kč)', type: 'number', step: '0.01' },
  { key: 'kauce', label: 'Kauce (Kč)', type: 'number', step: '0.01' },
  { key: 'najemce_id', label: 'Nájemce', type: 'chooser', entity: 'subjects', role: 'najemnik', 
    buttonLabel: 'Vybrat nájemce', 
    displayField: 'display_name',
    helpText: 'Vyberte nájemce z modulu 050 (Nájemníci)' },
  { key: 'datum_zahajeni_najmu', label: 'Začátek nájmu', type: 'date' },
  { key: 'datum_ukonceni_najmu', label: 'Konec nájmu', type: 'date' },
  { key: 'poznamka', label: 'Poznámka', type: 'textarea', fullWidth: true },
  { key: 'archived', label: 'Archivní', type: 'checkbox' },
  { key: 'updated_at', label: 'Poslední úprava', type: 'label', readOnly: true, format: formatCzechDate },
  { key: 'updated_by', label: 'Upravil', type: 'label', readOnly: true },
  { key: 'created_at', label: 'Vytvořen', type: 'label', readOnly: true, format: formatCzechDate }
];

export async function render(root, params) {
  // Robustní parsování parametrů: přijmeme více variant (id, unitId, propertyId, property_id, nemovitost_id)
  const rawParams = params || getHashParams() || {};
  const id = rawParams.id || rawParams.unitId || rawParams.unit_id || null;
  const propertyId = rawParams.propertyId || rawParams.property_id || rawParams.nemovitost_id || rawParams.property || null;
  const type = rawParams.type || null;
  
  if (!propertyId && !id) {
    root.innerHTML = `<div class="p-4 text-red-600">Chybí ID nemovitosti. Jednotka musí být přiřazena k nemovitosti.</div>`;
    return;
  }
  
  // Načtení dat jednotky z DB, pokud máme id
  let data = { nemovitost_id: propertyId };
  let propertyData = null;
  
  if (id) {
    const { data: unitData, error } = await getUnit(id);
    if (error) {
      root.innerHTML = `<div class="p-4 text-red-600">Chyba při načítání jednotky: ${error.message}</div>`;
      return;
    }
    if (!unitData) {
      root.innerHTML = `<div class="p-4 text-red-600">Jednotka nenalezena.</div>`;
      return;
    }
    data = { ...unitData };
    // Formátování datumů pro readonly pole a nahrazení null za '--'
    for (const f of FIELDS) {
      if (f.readOnly) {
        if (f.format && data[f.key]) {
          data[f.key] = f.format(data[f.key]);
        }
        if (!data[f.key]) {
          data[f.key] = '--';
        }
      }
    }
    // Zajistit, že archived má boolean (ne null/undefined)
    if (typeof data.archived === 'undefined') data.archived = false;
    // ensure nemovitost_id is set from either params or data
    if (!data.nemovitost_id && propertyId) data.nemovitost_id = propertyId;
  } else if (type) {
    // Pre-fill type if creating new
    data.typ_jednotky = type;
    data.stav = 'volna'; // Default state
  }
  
  // Load property data for breadcrumb
  if (data.nemovitost_id) {
    const result = await getProperty(data.nemovitost_id);
    if (result.data) {
      propertyData = result.data;
    }
  }

  const oznaceni = data.oznaceni || id || 'Nová jednotka';
  const propertyName = propertyData ? propertyData.nazev : data.nemovitost_id;
  
  try {
    setBreadcrumb(document.getElementById('crumb'), [
      { icon: 'home', label: 'Domů', href: '#/' },
      { icon: 'building', label: 'Nemovitosti', href: '#/m/040-nemovitost' },
      { icon: 'building', label: propertyName, href: `#/m/040-nemovitost/f/detail?id=${data.nemovitost_id}` },
      { icon: 'form', label: 'Formulář' },
      { icon: 'edit', label: oznaceni }
    ]);
  } catch (e) {}

  root.innerHTML = `<div id="commonactions" class="mb-4"></div><div id="unit-form"></div>`;

  const myRole = window.currentUserRole || 'admin';

  // --- Akce v liště ---
  const moduleActions = ['save', 'attach', 'archive', 'reject', 'history'];
  const handlers = {};

  // Uložit (disketa)
  handlers.onSave = async () => {
    const values = grabValues(root);
    // Nastav pole "updated_by" podle požadavku
    if (window.currentUser) {
      values.updated_by =
        window.currentUser.display_name ||
        window.currentUser.username ||
        window.currentUser.email;
    }
    
    // Ensure nemovitost_id is set
    values.nemovitost_id = data.nemovitost_id;
    
    // If creating new, ensure we have an ID
    if (!id) {
      values.id = crypto.randomUUID ? crypto.randomUUID() : Date.now().toString();
    } else {
      values.id = id;
    }
    
    const { data: updated, error } = await upsertUnit(values);
    if (error) {
      alert('Chyba při ukládání: ' + error.message);
      return;
    }
    alert('Uloženo.');
    setUnsaved(false);
    
    // After saving, navigate back to property detail
    navigateTo(`#/m/040-nemovitost/f/detail?id=${data.nemovitost_id}`);
  };
  
  handlers.onReject = () => navigateTo(`#/m/040-nemovitost/f/detail?id=${data.nemovitost_id}`);
  
  // Archivace (jen pokud není již archivovaný)
  if (id && !data.archived) {
    handlers.onArchive = async () => {
      await archiveUnit(id);
      alert('Jednotka byla archivována.');
      navigateTo(`#/m/040-nemovitost/f/detail?id=${data.nemovitost_id}`);
    };
  }

  // Přílohy
  handlers.onAttach = () => id && showAttachmentsModal({ entity: 'units', entityId: id });

  // Historie změn
  handlers.onHistory = () => id && alert('Historie - implementovat');

  // Tlačítka a akce
  renderCommonActions(document.getElementById('commonactions'), {
    moduleActions,
    userRole: myRole,
    handlers
  });

  // Vykreslení formuláře
  renderForm(root.querySelector('#unit-form'), FIELDS, data, async () => true, {
    readOnly: false,
    showSubmit: false,
    layout: { columns: { base: 1, md: 2, xl: 3 }, density: 'compact' },
    sections: [
      { id: 'zakladni', label: 'Základní údaje', fields: [
        'oznaceni', 'typ_jednotky', 'podlazi', 'plocha', 'pocet_mistnosti', 'dispozice', 'stav'
      ] },
      { id: 'najem', label: 'Nájem a finance', fields: [
        'mesicni_najem', 'kauce', 'najemce_id', 'datum_zahajeni_najmu', 'datum_ukonceni_najmu'
      ] },
      { id: 'system', label: 'Systém', fields: [
        'archived', 'poznamka', 'updated_at', 'updated_by', 'created_at'
      ] },
    ]
  });

  const formEl = root.querySelector("form");
  if (formEl) useUnsavedHelper(formEl);
}

// Pomocná funkce pro získání hodnot z formuláře
function grabValues(scopeEl) {
  const obj = {};
  for (const f of FIELDS) {
    if (f.readOnly) continue; // readonly pole nikdy neukládat!
    const el = scopeEl.querySelector(`[name="${f.key}"]`);
    if (!el) continue;
    obj[f.key] = (el.type === 'checkbox') ? !!el.checked : el.value;
  }
  return obj;
}

export default { render };
