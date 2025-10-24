import { setBreadcrumb } from '/src/ui/breadcrumb.js';
import { renderForm } from '/src/ui/form.js';
import { renderCommonActions } from '/src/ui/commonActions.js';
import { navigateTo } from '/src/app.js';
import { getUnit, archiveUnit, getProperty } from '/src/modules/040-nemovitost/db.js';
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

  // Načtení dat jednotky z DB
  const { data, error } = await getUnit(id);
  if (error) {
    root.innerHTML = `<div class="p-4 text-red-600">Chyba při načítání jednotky: ${error.message}</div>`;
    return;
  }
  if (!data) {
    root.innerHTML = `<div class="p-4 text-red-600">Jednotka nenalezena.</div>`;
    return;
  }
  
  // Load property data for breadcrumb
  let propertyData = null;
  if (data.nemovitost_id) {
    const result = await getProperty(data.nemovitost_id);
    if (result.data) {
      propertyData = result.data;
    }
  }

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

  root.innerHTML = `<div id="commonactions" class="mb-4"></div><div id="unit-detail"></div>`;

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
}

export default { render };
