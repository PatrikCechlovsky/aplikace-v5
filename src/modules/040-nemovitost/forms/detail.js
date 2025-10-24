import { setBreadcrumb } from '/src/ui/breadcrumb.js';
import { renderForm } from '/src/ui/form.js';
import { renderCommonActions } from '/src/ui/commonActions.js';
import { navigateTo } from '/src/app.js';
import { getProperty, archiveProperty } from '/src/modules/040-nemovitost/db.js';
import { showAttachmentsModal } from '/src/ui/attachments.js';
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
  
  // Upravy dat: pronajimatel, prilohy/vybaveni atd.
  data.pronajimatel = data.pronajimatel_nazev || data.pronajimatel_name || data.pronajimatel_id || null;
  if (data.prilohy && typeof data.prilohy !== 'string') {
    try { data.prilohy = JSON.stringify(data.prilohy); } catch(e){ }
  }
  if (data.vybaveni && typeof data.vybaveni !== 'string') {
    try { data.vybaveni = Array.isArray(data.vybaveni) ? data.vybaveni.join(', ') : JSON.stringify(data.vybaveni); } catch(e){ }
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

  // Navigace na seznam jednotek
  handlers.onUnits = () => {
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
