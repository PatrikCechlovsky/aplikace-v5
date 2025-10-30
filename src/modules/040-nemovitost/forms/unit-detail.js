import { setBreadcrumb } from '/src/ui/breadcrumb.js';
import { renderForm } from '/src/ui/form.js';
import { renderCommonActions } from '/src/ui/commonActions.js';
import { renderTabs } from '/src/ui/tabs.js';
import { navigateTo } from '/src/app.js';
import { getUnit, getUnitWithDetails, archiveUnit, getProperty } from '/src/modules/040-nemovitost/db.js';
import { showAttachmentsModal } from '/src/ui/attachments.js';

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

// Definice polí formuláře (readonly verze)
const FIELDS = [
  { key: 'oznaceni', label: 'Označení jednotky', type: 'text', readOnly: true },
  { key: 'typ_jednotky', label: 'Typ jednotky', type: 'select', readOnly: true, options: [
    { value: 'byt', label: 'Byt' },
    { value: 'kancelar', label: 'Kancelář' },
    { value: 'obchod', label: 'Obchodní prostor' },
    { value: 'sklad', label: 'Sklad' },
    { value: 'garaz', label: 'Garáž/Parking' },
    { value: 'sklep', label: 'Sklep' },
    { value: 'puda', label: 'Půda' },
    { value: 'jina_jednotka', label: 'Jiná jednotka' }
  ]},
  { key: 'podlazi', label: 'Podlaží', type: 'text', readOnly: true },
  { key: 'plocha', label: 'Plocha (m²)', type: 'text', readOnly: true },
  { key: 'pocet_mistnosti', label: 'Počet místností', type: 'text', readOnly: true },
  { key: 'dispozice', label: 'Dispozice', type: 'text', readOnly: true },
  { key: 'stav', label: 'Stav', type: 'select', readOnly: true, options: [
    { value: 'volna', label: 'Volná' },
    { value: 'obsazena', label: 'Obsazená' },
    { value: 'rezervovana', label: 'Rezervovaná' },
    { value: 'rekonstrukce', label: 'Rekonstrukce' }
  ]},
  { key: 'mesicni_najem', label: 'Měsíční nájem (Kč)', type: 'text', readOnly: true },
  { key: 'kauce', label: 'Kauce (Kč)', type: 'text', readOnly: true },
  { key: 'najemce', label: 'Nájemce', type: 'text', readOnly: true },
  { key: 'datum_zahajeni_najmu', label: 'Začátek nájmu', type: 'date', readOnly: true },
  { key: 'datum_ukonceni_najmu', label: 'Konec nájmu', type: 'date', readOnly: true },
  { key: 'poznamka', label: 'Poznámka', type: 'textarea', fullWidth: true, readOnly: true },
  { key: 'archivedLabel', label: 'Archivní', type: 'label', readOnly: true },
  { key: 'updated_at', label: 'Poslední úprava', type: 'label', readOnly: true, format: formatCzechDate },
  { key: 'updated_by', label: 'Upravil', type: 'label', readOnly: true },
  { key: 'created_at', label: 'Vytvořen', type: 'label', readOnly: true, format: formatCzechDate }
];

export async function render(root, params) {
  const { id } = params || getHashParams();
  
  if (!id) {
    root.innerHTML = `<div class="p-4 text-red-600">Chybí ID jednotky.</div>`;
    return;
  }

  // Načtení dat jednotky z DB s detaily
  const { data, error } = await getUnitWithDetails(id);
  if (error) {
    root.innerHTML = `<div class="p-4 text-red-600">Chyba při načítání jednotky: ${error.message}</div>`;
    return;
  }
  if (!data) {
    root.innerHTML = `<div class="p-4 text-red-600">Jednotka nenalezena.</div>`;
    return;
  }
  
  // Property data is now included in data.property
  const propertyData = data.property;

  // Formátování datumů pro readonly pole a nahrazení null za '--'
  for (const f of FIELDS) {
    if (f.readOnly || f.format) {
      if (f.format && data[f.key]) {
        data[f.key] = f.format ? f.format(data[f.key]) : data[f.key];
      }
      if (!data[f.key]) {
        data[f.key] = '--';
      }
    } else {
      if (data[f.key] === undefined || data[f.key] === null) data[f.key] = '';
    }
  }
  
  // Convert archived boolean to label
  data.archivedLabel = data.archived ? 'Ano' : 'Ne';

  const oznaceni = data.oznaceni || data.cislo_jednotky || id;
  const propertyName = propertyData ? propertyData.nazev : data.nemovitost_id;
  
  try {
    setBreadcrumb(document.getElementById('crumb'), [
      { icon: 'home', label: 'Domů', href: '#/' },
      { icon: 'building', label: 'Nemovitosti', href: '#/m/040-nemovitost' },
      { icon: 'building', label: propertyName, href: `#/m/040-nemovitost/f/detail?id=${data.nemovitost_id}` },
      { icon: 'eye', label: 'Detail jednotky' },
      { icon: 'grid', label: oznaceni }
    ]);
  } catch (e) {}

  root.innerHTML = `
    <div id="commonactions" class="mb-4"></div>
    <div id="unit-detail"></div>
    <div id="unit-tabs" class="mt-6"></div>
  `;

  const myRole = window.currentUserRole || 'admin';

  // --- Akce v liště ---
  const moduleActions = ['edit', 'attach', 'archive', 'refresh', 'history'];
  const handlers = {};

  handlers.onEdit = () => navigateTo(`#/m/040-nemovitost/f/unit-edit?id=${id}`);
  handlers.onRefresh = () => render(root, params);
  
  // Archivace (jen pokud není již archivovaný)
  if (!data.archived) {
    handlers.onArchive = async () => {
      await archiveUnit(id);
      alert('Jednotka byla archivována.');
      navigateTo(`#/m/040-nemovitost/f/detail?id=${data.nemovitost_id}`);
    };
  }

  // Přílohy
  handlers.onAttach = () => showAttachmentsModal({ entity: 'units', entityId: id });

  // Historie změn
  handlers.onHistory = () => alert('Historie - implementovat');

  // Tlačítka a akce
  renderCommonActions(document.getElementById('commonactions'), {
    moduleActions,
    userRole: myRole,
    handlers
  });

  // Vykreslení formuláře v readonly režimu
  renderForm(root.querySelector('#unit-detail'), FIELDS, data, async () => true, {
    readOnly: true,
    showSubmit: false,
    layout: { columns: { base: 1, md: 2, xl: 3 }, density: 'compact' },
    sections: [
      { id: 'zakladni', label: 'Základní údaje', fields: [
        'oznaceni', 'typ_jednotky', 'podlazi', 'plocha', 'pocet_mistnosti', 'dispozice',
        'stav', 'mesicni_najem', 'kauce'
      ] },
      { id: 'najem', label: 'Nájem', fields: [
        'najemce', 'datum_zahajeni_najmu', 'datum_ukonceni_najmu'
      ] },
      { id: 'system', label: 'Systém', fields: [
        'archivedLabel', 'poznamka', 'updated_at', 'updated_by', 'created_at'
      ] },
    ]
  });

  // Render tabs with related information
  const tabs = [
    {
      label: 'Nemovitost',
      icon: '🏢',
      content: (() => {
        if (!data.property) {
          return '<div class="p-4 text-gray-500">Nemovitost není přiřazena</div>';
        }
        const prop = data.property;
        return `
          <div class="p-4">
            <h3 class="text-lg font-semibold mb-4">Informace o nemovitosti</h3>
            <div class="bg-white shadow rounded-lg p-4 space-y-2">
              <div class="grid grid-cols-2 gap-4">
                <div><strong>Název:</strong> ${prop.nazev || '-'}</div>
                <div><strong>Adresa:</strong> ${prop.ulice || ''} ${prop.mesto || ''}</div>
                <div><strong>PSČ:</strong> ${prop.psc || '-'}</div>
                ${prop.owner ? `
                  <div><strong>Vlastník:</strong> ${prop.owner.display_name || '-'}</div>
                ` : ''}
              </div>
              <div class="mt-4">
                <button 
                  onclick="location.hash='#/m/040-nemovitost/f/detail?id=${prop.id}'"
                  class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                  Zobrazit detail nemovitosti
                </button>
              </div>
            </div>
          </div>
        `;
      })()
    },
    {
      label: 'Nájemce',
      icon: '👤',
      content: (() => {
        if (!data.active_contract || !data.active_contract.tenant) {
          return '<div class="p-4 text-gray-500">Jednotka není obsazená</div>';
        }
        const contract = data.active_contract;
        const tenant = contract.tenant;
        return `
          <div class="p-4">
            <h3 class="text-lg font-semibold mb-4">Informace o nájemci</h3>
            <div class="bg-white shadow rounded-lg p-4 space-y-2">
              <div class="grid grid-cols-2 gap-4">
                <div><strong>Jméno:</strong> ${tenant.display_name || '-'}</div>
                <div><strong>Email:</strong> ${tenant.primary_email || '-'}</div>
                <div><strong>Telefon:</strong> ${tenant.primary_phone || '-'}</div>
                <div><strong>Smlouva:</strong> ${contract.cislo_smlouvy || '-'}</div>
                <div><strong>Začátek:</strong> ${contract.datum_zacatek ? new Date(contract.datum_zacatek).toLocaleDateString('cs-CZ') : '-'}</div>
                <div><strong>Konec:</strong> ${contract.datum_konec ? new Date(contract.datum_konec).toLocaleDateString('cs-CZ') : 'Neurčeno'}</div>
                <div><strong>Nájem:</strong> ${contract.najem_vyse ? contract.najem_vyse + ' Kč' : '-'}</div>
                <div><strong>Stav smlouvy:</strong> ${contract.stav || '-'}</div>
              </div>
              <div class="mt-4 space-x-2">
                <button 
                  onclick="location.hash='#/m/050-najemnik/f/detail?id=${tenant.id}'"
                  class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                  Zobrazit detail nájemce
                </button>
                <button 
                  onclick="location.hash='#/m/060-smlouva/f/detail?id=${contract.id}'"
                  class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
                  Zobrazit smlouvu
                </button>
              </div>
            </div>
          </div>
        `;
      })()
    },
    {
      label: 'Vlastník',
      icon: '🏦',
      content: (() => {
        if (!data.property || !data.property.owner) {
          return '<div class="p-4 text-gray-500">Vlastník není přiřazen</div>';
        }
        const owner = data.property.owner;
        return `
          <div class="p-4">
            <h3 class="text-lg font-semibold mb-4">Informace o vlastníkovi</h3>
            <div class="bg-white shadow rounded-lg p-4 space-y-2">
              <div class="grid grid-cols-2 gap-4">
                <div><strong>Název:</strong> ${owner.display_name || '-'}</div>
                <div><strong>Email:</strong> ${owner.primary_email || '-'}</div>
                <div><strong>Telefon:</strong> ${owner.primary_phone || '-'}</div>
              </div>
              <div class="mt-4">
                <button 
                  onclick="location.hash='#/m/030-pronajimatel/f/detail?id=${owner.id}'"
                  class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                  Zobrazit detail vlastníka
                </button>
              </div>
            </div>
          </div>
        `;
      })()
    }
  ];

  renderTabs(root.querySelector('#unit-tabs'), tabs, { defaultTab: 0 });
}

export default { render };
