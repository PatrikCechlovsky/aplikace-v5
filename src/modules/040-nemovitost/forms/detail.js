import { setBreadcrumb } from '/src/ui/breadcrumb.js';
import { renderForm } from '/src/ui/form.js';
import { renderCommonActions } from '/src/ui/commonActions.js';
import { navigateTo } from '/src/app.js';
import { getProperty, archiveProperty } from '/src/modules/040-nemovitost/db.js';
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

// Definice polí formuláře (readonly mode)
// DOPLNĚNO: kraj, stat, celkova_plocha, vybaveni, prilohy, pronajimatel (pokud data obsahují display name bude použito)
const FIELDS = [
  { key: 'nazev', label: 'Název nemovitosti', type: 'text' },
  { key: 'typ_nemovitosti', label: 'Typ nemovitosti', type: 'text' },
  { key: 'ulice', label: 'Ulice', type: 'text' },
  { key: 'cislo_popisne', label: 'Číslo popisné', type: 'text' },
  { key: 'cislo_orientacni', label: 'Číslo orientační', type: 'text' },
  { key: 'mesto', label: 'Město', type: 'text' },
  { key: 'psc', label: 'PSČ', type: 'text' },
  { key: 'kraj', label: 'Kraj', type: 'text' },
  { key: 'stat', label: 'Stát', type: 'text' },
  { key: 'pocet_podlazi', label: 'Počet podlaží', type: 'text' },
  { key: 'rok_vystavby', label: 'Rok výstavby', type: 'text' },
  { key: 'rok_rekonstrukce', label: 'Rok rekonstrukce', type: 'text' },
  { key: 'celkova_plocha', label: 'Celková plocha', type: 'text' },
  { key: 'pocet_jednotek', label: 'Počet jednotek', type: 'text' },

  // metadata / poznámky
  // OPRAVA: pole je v DB 'poznamky' (dříve 'poznamka' bylo překlep), zobrazíme jako textarea
  { key: 'poznamky', label: 'Poznámka', type: 'textarea', fullWidth: true },

  // dodatkové pole pro zobrazení, přílohy a vybavení
  { key: 'vybaveni', label: 'Vybavení', type: 'text' },
  { key: 'prilohy', label: 'Přílohy', type: 'text' },

  // Pronajímatel - pokud getProperty vrátí display name použijeme ho, jinak zobrazíme id
  { key: 'pronajimatel', label: 'Pronajímatel', type: 'text' },

  // stav a audit
  { key: 'archivedLabel', label: 'Archivní', type: 'text' },
  { key: 'updated_at', label: 'Poslední úprava', type: 'label', readOnly: true, format: formatCzechDate },
  { key: 'updated_by', label: 'Upravil', type: 'label', readOnly: true },
  { key: 'created_at', label: 'Vytvořen', type: 'label', readOnly: true, format: formatCzechDate }
];

export async function render(root, params) {
  const { id } = params || getHashParams();
  
  if (!id) {
    root.innerHTML = `<div class="p-4 text-red-600">Chybí ID nemovitosti.</div>`;
    return;
  }

  // Načtení dat nemovitosti z DB
  const { data, error } = await getProperty(id);
  if (error) {
    root.innerHTML = `<div class="p-4 text-red-600">Chyba při načítání nemovitosti: ${error.message}</div>`;
    return;
  }
  if (!data) {
    root.innerHTML = `<div class="p-4 text-red-600">Nemovitost nenalezena.</div>`;
    return;
  }
  
  // Upravíme data: opravíme pole poznamky, sestavíme pronajimatel display value, formátujeme data
  // Pokud DB vrací pronajimatel display name jako pronajimatel_name nebo pronajimatel_nazev, použijeme ho
  data.pronajimatel = data.pronajimatel_nazev || data.pronajimatel_name || data.pronajimatel_id || null;

  // Případ, kdy jsou prilohy/vybaveni uložené jako JSONB - zobrazíme jako string (můžete upravit)
  if (data.prilohy && typeof data.prilohy !== 'string') {
    try { data.prilohy = JSON.stringify(data.prilohy); } catch(e){ /* ignore */ }
  }
  if (data.vybaveni && typeof data.vybaveni !== 'string') {
    try { data.vybaveni = Array.isArray(data.vybaveni) ? data.vybaveni.join(', ') : JSON.stringify(data.vybaveni); } catch(e){ /* ignore */ }
  }

  // Formátování datumů pro readonly pole a nahrazení null za '--'
  for (const f of FIELDS) {
    if (f.readOnly || f.format) {
      if (f.format && data[f.key]) {
        data[f.key] = f.format(data[f.key]);
      }
      if (!data[f.key]) {
        data[f.key] = '--';
      }
    } else {
      // pro běžná pole také nahraďme null/undefined prázdným řetězcem, aby renderForm správně zobrazil hodnotu
      if (data[f.key] === undefined || data[f.key] === null) data[f.key] = '';
    }
  }
  
  // Convert archived boolean to label
  data.archivedLabel = data.archived ? 'Ano' : 'Ne';
  
  try {
    setBreadcrumb(document.getElementById('crumb'), [
      { icon: 'home', label: 'Domů', href: '#/' },
      { icon: 'building', label: 'Nemovitosti', href: '#/m/040-nemovitost' },
      { icon: 'eye', label: 'Detail nemovitosti' },
      { icon: 'building', label: data.nazev || id }
    ]);
  } catch (e) {}

  root.innerHTML = `<div id="commonactions" class="mb-4"></div><div id="property-detail"></div>`;

  const myRole = window.currentUserRole || 'admin';

  // --- Akce v liště ---
  // DOPLNĚNO: přidána akce 'units' pro přechod na seznam jednotek
  const moduleActions = ['edit', 'units', 'attach', 'archive', 'refresh', 'history'];
  const handlers = {};

  handlers.onEdit = () => navigateTo(`#/m/040-nemovitost/f/edit?id=${id}`);
  handlers.onRefresh = () => render(root, params);
  
  // Archivace (jen pokud není již archivovaný)
  if (!data.archived) {
    handlers.onArchive = async () => {
      await archiveProperty(id);
      alert('Nemovitost byla archivována.');
      navigateTo('#/m/040-nemovitost/t/prehled');
    };
  }

  // Přílohy
  handlers.onAttach = () => showAttachmentsModal({ entity: 'properties', entityId: id });

  // Historie změn
  handlers.onHistory = () => alert('Historie - implementovat');

  // NOVÉ: navigace na seznam jednotek (upravit cílovou route podle vaší aplikace)
  handlers.onUnits = () => {
    // tato cesta je návrh: přesměruje na stránku seznamu jednotek modulu s filtrem podle nemovitosti
    navigateTo(`#/m/040-nemovitost/t/jednotky?propertyId=${id}`);
  };

  // Tlačítka a akce
  renderCommonActions(document.getElementById('commonactions'), {
    moduleActions,
    userRole: myRole,
    handlers
  });

  // Vykreslení formuláře v readonly režimu
  renderForm(root.querySelector('#property-detail'), FIELDS, data, async () => true, {
    readOnly: true,
    showSubmit: false,
    layout: { columns: { base: 1, md: 2, xl: 3 }, density: 'compact' },
    sections: [
      { id: 'zakladni', label: 'Základní údaje', fields: [
        'nazev', 'typ_nemovitosti', 'ulice', 'cislo_popisne', 'cislo_orientacni', 'mesto', 'psc',
        'kraj', 'stat', 'pocet_podlazi', 'rok_vystavby', 'rok_rekonstrukce', 'celkova_plocha', 'pocet_jednotek'
      ] },
      { id: 'system', label: 'Systém', fields: [
        'archivedLabel', 'poznamky', 'vybaveni', 'prilohy', 'pronajimatel', 'updated_at', 'updated_by', 'created_at'
      ] },
    ]
  });
}

export default { render };
