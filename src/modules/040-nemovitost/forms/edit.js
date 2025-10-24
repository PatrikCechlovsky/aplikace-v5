import { setBreadcrumb } from '/src/ui/breadcrumb.js';
import { renderForm } from '/src/ui/form.js';
import { renderCommonActions } from '/src/ui/commonActions.js';
import { navigateTo } from '/src/app.js';
import { getProperty, upsertProperty, archiveProperty } from '/src/modules/040-nemovitost/db.js';
import { useUnsavedHelper } from '/src/ui/unsaved-helper.js';
import { showAttachmentsModal } from '/src/ui/attachments.js';
import { setUnsaved } from '/src/app.js';
import { FIELDS } from '/src/modules/040-nemovitost/forms/fields.js'; // <- sdílená definice polí

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
  { key: 'nazev', label: 'Název nemovitosti', type: 'text', required: true },
  { key: 'typ_nemovitosti', label: 'Typ nemovitosti', type: 'select', required: true, options: [
    { value: 'bytovy_dum', label: 'Bytový dům' },
    { value: 'rodinny_dum', label: 'Rodinný dům' },
    { value: 'admin_budova', label: 'Administrativní budova' },
    { value: 'prumyslovy_objekt', label: 'Průmyslový objekt' },
    { value: 'pozemek', label: 'Pozemek' },
    { value: 'jiny_objekt', label: 'Jiný objekt' }
  ]},
  { key: 'ulice', label: 'Ulice', type: 'text', required: true },
  { key: 'cislo_popisne', label: 'Číslo popisné', type: 'text', required: true },
  { key: 'mesto', label: 'Město', type: 'text', required: true },
  { key: 'psc', label: 'PSČ', type: 'text', required: true },
  { key: 'pocet_podlazi', label: 'Počet podlaží', type: 'number' },
  { key: 'rok_vystavby', label: 'Rok výstavby', type: 'number' },
  { key: 'pocet_jednotek', label: 'Počet jednotek', type: 'number' },
  { key: 'poznamka', label: 'Poznámka', type: 'textarea', fullWidth: true },
  { key: 'archived', label: 'Archivní', type: 'checkbox' },
  { key: 'updated_at', label: 'Poslední úprava', type: 'label', readOnly: true, format: formatCzechDate },
  { key: 'updated_by', label: 'Upravil', type: 'label', readOnly: true },
  { key: 'created_at', label: 'Vytvořen', type: 'label', readOnly: true, format: formatCzechDate }
];

export async function render(root, params) {
  const { id, type } = params || getHashParams();
  
  // Načtení dat nemovitosti z DB, pokud máme id
  let data = {};
  if (id) {
    const { data: propertyData, error } = await getProperty(id);
    if (error) {
      root.innerHTML = `<div class="p-4 text-red-600">Chyba při načítání nemovitosti: ${error.message}</div>`;
      return;
    }
    if (!propertyData) {
      root.innerHTML = `<div class="p-4 text-red-600">Nemovitost nenalezena.</div>`;
      return;
    }
    data = { ...propertyData };
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
  } else if (type) {
    // Pre-fill type if creating new
    data.typ_nemovitosti = type;
  }

  const nazev = data.nazev || id || 'Nová nemovitost';
  
  try {
    setBreadcrumb(document.getElementById('crumb'), [
      { icon: 'home', label: 'Domů', href: '#/' },
      { icon: 'building', label: 'Nemovitosti', href: '#/m/040-nemovitost' },
      { icon: 'form', label: 'Formulář' },
      { icon: 'edit', label: nazev }
    ]);
  } catch (e) {}

  root.innerHTML = `<div id="commonactions" class="mb-4"></div><div id="property-form"></div>`;

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
    
    // If creating new, ensure we have an ID
    if (!id) {
      values.id = crypto.randomUUID ? crypto.randomUUID() : Date.now().toString();
    } else {
      values.id = id;
    }
    
    const { data: updated, error } = await upsertProperty(values);
    if (error) {
      alert('Chyba při ukládání: ' + error.message);
      return;
    }
    alert('Uloženo.');
    setUnsaved(false);
    
    // After saving, navigate to detail or refresh
    if (!id) {
      navigateTo(`#/m/040-nemovitost/f/detail?id=${updated.id}`);
    } else {
      // Po uložení znovu načti data a aktualizuj formulář
      const { data: refreshed } = await getProperty(id);
      if (refreshed) {
        // Formátuj readonly pole (včetně "--" pro null)
        for (const f of FIELDS) {
          if (f.readOnly) {
            if (f.format && refreshed[f.key]) {
              refreshed[f.key] = f.format(refreshed[f.key]);
            }
            if (!refreshed[f.key]) {
              refreshed[f.key] = '--';
            }
          }
        }
        renderForm(root.querySelector('#property-form'), FIELDS, refreshed, async () => true, {
          readOnly: false,
          showSubmit: false,
          layout: { columns: { base: 1, md: 2, xl: 3 }, density: 'compact' },
          sections: [
            { id: 'zakladni', label: 'Základní údaje', fields: [
              'nazev', 'typ_nemovitosti', 'ulice', 'cislo_popisne', 'mesto', 'psc',
              'pocet_podlazi', 'rok_vystavby', 'pocet_jednotek'
            ] },
            { id: 'system', label: 'Systém', fields: [
              'archived', 'poznamka', 'updated_at', 'updated_by', 'created_at'
            ] },
          ]
        });
      }
    }
  };
  
  handlers.onReject = () => navigateTo('#/m/040-nemovitost/t/prehled');
  
  // Archivace (jen pokud není již archivovaný)
  if (id && !data.archived) {
    handlers.onArchive = async () => {
      await archiveProperty(id);
      alert('Nemovitost byla archivována.');
      navigateTo('#/m/040-nemovitost/t/prehled');
    };
  }

  // Přílohy
  handlers.onAttach = () => id && showAttachmentsModal({ entity: 'properties', entityId: id });

  // Historie změn
  handlers.onHistory = () => id && alert('Historie - implementovat');

  // Tlačítka a akce
  renderCommonActions(document.getElementById('commonactions'), {
    moduleActions,
    userRole: myRole,
    handlers
  });

  // Vykreslení formuláře
  renderForm(root.querySelector('#property-form'), FIELDS, data, async () => true, {
    readOnly: false,
    showSubmit: false,
    layout: { columns: { base: 1, md: 2, xl: 3 }, density: 'compact' },
    sections: [
      { id: 'zakladni', label: 'Základní údaje', fields: [
        'nazev', 'typ_nemovitosti', 'ulice', 'cislo_popisne', 'mesto', 'psc',
        'pocet_podlazi', 'rok_vystavby', 'pocet_jednotek'
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

