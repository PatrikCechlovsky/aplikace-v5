import { setBreadcrumb } from '/src/ui/breadcrumb.js';
import { renderForm } from '/src/ui/form.js';
import { renderCommonActions } from '/src/ui/commonActions.js';
import { renderTabs, createRelatedEntitiesTable } from '/src/ui/tabs.js';
import { navigateTo } from '/src/app.js';
import { getProperty, getPropertyWithOwner, listUnits, archiveProperty } from '/src/modules/040-nemovitost/db.js';
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

  // Načtení dat nemovitosti z DB s vlastníkem
  const { data, error } = await getPropertyWithOwner(id);
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

  root.innerHTML = `
    <div id="commonactions" class="mb-4"></div>
    <div id="property-tabs" class="mt-6"></div>
  `;

  const myRole = window.currentUserRole || 'admin';

  // --- Akce v liště ---
  const moduleActions = ['edit', 'units', 'attach', 'wizard', 'archive', 'history'];
  const handlers = {};

  handlers.onEdit = () => navigateTo(`#/m/040-nemovitost/f/edit?id=${id}`);
  
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
  
  // Průvodce
  handlers.onWizard = () => {
    alert('Průvodce zatím není k dispozici. Tato funkce bude doplněna.');
  };

  // Tlačítka a akce
  renderCommonActions(document.getElementById('commonactions'), {
    moduleActions,
    userRole: myRole,
    handlers
  });

  // Render tabs with related information
  const tabs = [
    {
      label: 'Detail nemovitosti',
      icon: '🏢',
      content: (container) => {
        // Render the form in this tab
        const sections = [
          { id: 'zakladni', label: 'Základní údaje', fields: [
            'nazev', 'typ_nemovitosti', 'ulice', 'cislo_popisne', 'cislo_orientacni', 'mesto', 'psc',
            'kraj', 'stat', 'pocet_podlazi', 'rok_vystavby', 'rok_rekonstrukce', 'celkova_plocha', 'pocet_jednotek'
          ] },
          { id: 'system', label: 'Systém', fields: [
            'archivedLabel', 'poznamky', 'vybaveni', 'prilohy', 'pronajimatel', 'updated_at', 'updated_by', 'created_at'
          ] },
        ];

        renderForm(container, FIELDS, data, async () => true, {
          readOnly: true,
          showSubmit: false,
          layout: { columns: { base: 1, md: 2, xl: 3 }, density: 'compact' },
          sections
        });
      }
    },
    {
      label: 'Vlastník',
      icon: '👤',
      content: (() => {
        if (!data.owner) {
          return '<div class="p-4 text-gray-500">Vlastník není přiřazen</div>';
        }
        return `
          <div class="p-4">
            <h3 class="text-lg font-semibold mb-4">Informace o vlastníkovi</h3>
            <div class="bg-white shadow rounded-lg p-4 space-y-2">
              <div class="grid grid-cols-2 gap-4">
                <div><strong>Název:</strong> ${data.owner.display_name || '-'}</div>
                <div><strong>Role:</strong> ${data.owner.role || '-'}</div>
                <div><strong>Email:</strong> ${data.owner.primary_email || '-'}</div>
                <div><strong>Telefon:</strong> ${data.owner.primary_phone || '-'}</div>
              </div>
              <div class="mt-4">
                <button 
                  onclick="location.hash='#/m/030-pronajimatel/f/detail?id=${data.owner.id}'"
                  class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                  Zobrazit detail vlastníka
                </button>
              </div>
            </div>
          </div>
        `;
      })()
    },
    {
      label: 'Jednotky',
      icon: '🏠',
      badge: null,
      content: async (container) => {
        container.innerHTML = '<div class="text-center py-4">Načítání jednotek...</div>';
        
        // Load units for this property
        const { data: units, error: unitsError } = await listUnits(id);
        
        if (unitsError) {
          container.innerHTML = `<div class="text-red-600 p-4">Chyba při načítání jednotek: ${unitsError.message}</div>`;
          return;
        }

        container.innerHTML = '';
        
        if (!units || units.length === 0) {
          container.innerHTML = '<div class="text-gray-500 p-4">Žádné jednotky</div>';
          return;
        }

        // Create table with units
        const table = createRelatedEntitiesTable(
          units,
          [
            { 
              label: 'Označení', 
              field: 'oznaceni',
              render: (val) => `<strong>${val || 'Bez označení'}</strong>`
            },
            { 
              label: 'Typ', 
              field: 'typ_jednotky',
              render: (val) => {
                const typeLabels = {
                  'byt': 'Byt',
                  'kancelar': 'Kancelář',
                  'obchod': 'Obchod',
                  'sklad': 'Sklad',
                  'garaz': 'Garáž',
                  'jina_jednotka': 'Jiná'
                };
                return typeLabels[val] || val || '-';
              }
            },
            { 
              label: 'Stav', 
              field: 'stav',
              render: (val) => {
                const statusLabels = {
                  'volna': '🟢 Volná',
                  'obsazena': '🔴 Obsazená',
                  'rezervovana': '🟡 Rezervovaná',
                  'rekonstrukce': '🔧 Rekonstrukce'
                };
                return statusLabels[val] || val || '-';
              }
            },
            { 
              label: 'Plocha', 
              field: 'plocha',
              render: (val) => val ? `${val} m²` : '-'
            },
            { 
              label: 'Nájem', 
              field: 'mesicni_najem',
              render: (val) => val ? `${val} Kč` : '-'
            }
          ],
          {
            emptyMessage: 'Žádné jednotky',
            onRowClick: (row) => {
              navigateTo(`#/m/040-nemovitost/f/unit-detail?id=${row.id}`);
            },
            className: 'cursor-pointer'
          }
        );

        container.appendChild(table);
      }
    },
    {
      label: 'Dokumenty',
      icon: '📄',
      content: `
        <div class="p-4">
          <h3 class="text-lg font-semibold mb-2">Dokumenty a přílohy</h3>
          <button 
            onclick="window.showAttachmentsModal && window.showAttachmentsModal({ entity: 'properties', entityId: '${id}' })"
            class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            Spravovat přílohy
          </button>
        </div>
      `
    }
  ];

  renderTabs(root.querySelector('#property-tabs'), tabs, { defaultTab: 0 });
}

export default { render };
