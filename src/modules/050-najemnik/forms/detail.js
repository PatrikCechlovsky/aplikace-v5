/**
 * ============================================================================
 * Nájemník Detail View with Tabs
 * ============================================================================
 * Shows tenant details with active contracts, units, and landlords
 * ============================================================================
 */

import { setBreadcrumb } from '/src/ui/breadcrumb.js';
import { renderForm } from '/src/ui/form.js';
import { renderCommonActions } from '/src/ui/commonActions.js';
import { renderTabs, createRelatedEntitiesTable } from '/src/ui/tabs.js';
import { navigateTo } from '/src/app.js';
import { getSubject } from '/src/modules/050-najemnik/db.js';
import { listContracts } from '/src/modules/060-smlouva/db.js';
import { listProperties, listUnits } from '/src/modules/040-nemovitost/db.js';
import { showHistoryModal } from '/src/ui/history.js';
import TYPE_SCHEMAS from '/src/modules/050-najemnik/type-schemas.js';

// Helper to parse hash params
function getHashParams() {
  const q = (location.hash.split('?')[1] || '');
  return Object.fromEntries(new URLSearchParams(q));
}

function formatCzechDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d)) return '';
  return d.toLocaleDateString('cs-CZ') + ' ' + d.toLocaleTimeString('cs-CZ');
}

export async function render(root) {
  const { id, type: qtype } = getHashParams();
  const type = qtype || 'osoba';

  if (!id) {
    root.innerHTML = `<div class="p-4 text-red-600">Chybí ID nájemníka.</div>`;
    return;
  }

  // set breadcrumb
  try {
    setBreadcrumb(document.getElementById('crumb'), [
      { icon: 'home',  label: 'Domů', href: '#/' },
      { icon: 'users', label: 'Nájemník', href: '#/m/050-najemnik' },
      { icon: 'account', label: 'Detail' }
    ]);
  } catch (e) {}

  // Load tenant data
  const { data, error } = await getSubject(id);
  if (error) {
    root.innerHTML = `<div class="p-4 text-red-600">Chyba při načítání: ${error.message || JSON.stringify(error)}</div>`;
    return;
  }
  if (!data) {
    root.innerHTML = `<div class="p-4 text-red-600">Nájemník nenalezen.</div>`;
    return;
  }

  // Format date fields
  data.updated_at = formatCzechDate(data.updated_at);
  data.created_at = formatCzechDate(data.created_at);

  // Build fields from TYPE_SCHEMAS for the given type
  const schema = TYPE_SCHEMAS[type] || [];
  const fields = schema.map(f => ({ ...f, readOnly: true }));

  // Create main container
  root.innerHTML = '';
  const mainContainer = document.createElement('div');
  mainContainer.className = 'p-4';

  // Create tabs container
  const tabsContainer = document.createElement('div');
  tabsContainer.className = 'mt-6';
  mainContainer.appendChild(tabsContainer);

  root.appendChild(mainContainer);

  // Define tabs according to requirements from Modul 030.docx
  const tabs = [
    {
      label: 'Pronajímatel',
      icon: '🏠',
      content: async (container) => {
        container.innerHTML = '<div class="text-center py-4">Načítání pronajímatelů...</div>';
        container.innerHTML = '<div class="text-gray-500 p-4">Funkce pro zobrazení pronajímatelů spojených s tímto nájemníkem bude doplněna.</div>';
      }
    },
    {
      label: 'Nemovitosti',
      icon: '🏢',
      content: async (container) => {
        container.innerHTML = '<div class="text-center py-4">Načítání nemovitostí...</div>';
        
        // Load active contracts to get properties
        const { data: contracts } = await listContracts({ tenantId: id, status: 'aktivni' });
        
        if (!contracts || contracts.length === 0) {
          container.innerHTML = '<div class="text-gray-500 p-4">Žádné nemovitosti</div>';
          return;
        }

        const properties = contracts.map(c => c.property).filter(p => p);
        
        if (properties.length === 0) {
          container.innerHTML = '<div class="text-gray-500 p-4">Žádné nemovitosti</div>';
          return;
        }

        const table = createRelatedEntitiesTable(
          properties,
          [
            { label: 'Název', field: 'nazev', render: (val) => `<strong>${val || '-'}</strong>` },
            { label: 'Adresa', field: 'ulice', render: (val, row) => `${val || ''} ${row.cislo_popisne || ''}, ${row.mesto || ''}` },
            { label: 'Typ', field: 'typ_nemovitosti' }
          ],
          {
            emptyMessage: 'Žádné nemovitosti',
            onRowClick: (row) => navigateTo(`#/m/040-nemovitost/f/detail?id=${row.id}`),
            className: 'cursor-pointer'
          }
        );

        container.innerHTML = '';
        container.appendChild(table);
      }
    },
    {
      label: '—',
      icon: '📌',
      content: '<div class="p-4 text-gray-500">Rezervováno pro budoucí použití</div>'
    },
    {
      label: 'Jednotky',
      icon: '📦',
      content: async (container) => {
        container.innerHTML = '<div class="text-center py-4">Načítání jednotek...</div>';
        
        // Load active contracts to get units
        const { data: contracts } = await listContracts({ tenantId: id, status: 'aktivni' });
        
        if (!contracts || contracts.length === 0) {
          container.innerHTML = '<div class="text-gray-500 p-4">Žádné jednotky</div>';
          return;
        }

        const units = contracts.map(c => c.unit).filter(u => u);
        
        if (units.length === 0) {
          container.innerHTML = '<div class="text-gray-500 p-4">Žádné jednotky</div>';
          return;
        }

        const table = createRelatedEntitiesTable(
          units,
          [
            { label: 'Označení', field: 'oznaceni', render: (val) => `<strong>${val || '-'}</strong>` },
            { label: 'Typ', field: 'typ_jednotky' },
            { label: 'Stav', field: 'stav' },
            { label: 'Plocha', field: 'plocha', render: (val) => val ? `${val} m²` : '-' }
          ],
          {
            emptyMessage: 'Žádné jednotky',
            onRowClick: (row) => navigateTo(`#/m/040-nemovitost/f/unit-detail?id=${row.id}`),
            className: 'cursor-pointer'
          }
        );

        container.innerHTML = '';
        container.appendChild(table);
      }
    },
    {
      label: 'Detail nájemníka',
      icon: '👤',
      content: (container) => {
        // Render the form in this tab
        const sections = [
          { id: 'profil', label: 'Profil', fields: fields.map(f => f.key) },
          { id: 'system', label: 'Systém', fields: ['archived','created_at','updated_at','updated_by'] }
        ];

        renderForm(container, fields, data, null, {
          readOnly: true,
          showSubmit: false,
          layout: { columns: { base: 1, md: 2, xl: 2 }, density: 'compact' },
          sections
        });
      }
    },
    {
      label: 'Účty nájemníka',
      icon: '💳',
      content: '<div class="p-4"><h3 class="text-lg font-semibold mb-2">Bankovní účty nájemníka</h3><p class="text-gray-500">Funkce pro správu bankovních účtů bude doplněna.</p></div>'
    },
    {
      label: 'Smlouvy',
      icon: '📄',
      badge: null,
      content: async (container) => {
        container.innerHTML = '<div class="text-center py-4">Načítání smluv...</div>';
        
        // Load contracts for this tenant
        const { data: contracts, error: contractsError } = await listContracts({ tenantId: id });
        
        if (contractsError) {
          container.innerHTML = `<div class="text-red-600 p-4">Chyba při načítání smluv: ${contractsError.message}</div>`;
          return;
        }

        container.innerHTML = '';
        
        if (!contracts || contracts.length === 0) {
          container.innerHTML = '<div class="text-gray-500 p-4">Žádné smlouvy</div>';
          return;
        }

        // Create table with contracts
        const table = createRelatedEntitiesTable(
          contracts,
          [
            { 
              label: 'Číslo smlouvy', 
              field: 'cislo_smlouvy',
              render: (val) => `<strong>${val || 'Bez čísla'}</strong>`
            },
            { 
              label: 'Jednotka', 
              field: 'unit',
              render: (val) => val ? `${val.oznaceni || '-'} (${val.typ_jednotky || '-'})` : '-'
            },
            { 
              label: 'Nemovitost', 
              field: 'property',
              render: (val) => val ? `${val.nazev || '-'}, ${val.mesto || '-'}` : '-'
            },
            { 
              label: 'Stav', 
              field: 'stav',
              render: (val) => {
                const statusLabels = {
                  'koncept': '📝 Koncept',
                  'cekajici_podepsani': '⏳ Čeká na podpis',
                  'aktivni': '✅ Aktivní',
                  'ukoncena': '❌ Ukončená',
                  'zrusena': '🚫 Zrušená'
                };
                return statusLabels[val] || val || '-';
              }
            },
            { 
              label: 'Nájem', 
              field: 'najem_vyse',
              render: (val) => val ? `${val} Kč/měsíc` : '-'
            },
            { 
              label: 'Začátek', 
              field: 'datum_zacatek',
              render: (val) => val ? new Date(val).toLocaleDateString('cs-CZ') : '-'
            }
          ],
          {
            emptyMessage: 'Žádné smlouvy',
            onRowClick: (row) => {
              navigateTo(`#/m/060-smlouva/f/detail?id=${row.id}`);
            },
            className: 'cursor-pointer'
          }
        );

        container.appendChild(table);
      }
    },
    {
      label: 'Služby',
      icon: '🔧',
      content: '<div class="p-4"><h3 class="text-lg font-semibold mb-2">Služby</h3><p class="text-gray-500">Funkce pro zobrazení služeb bude doplněna.</p></div>'
    },
    {
      label: 'Platby',
      icon: '💰',
      content: '<div class="p-4"><h3 class="text-lg font-semibold mb-2">Rozpis plateb</h3><p class="text-gray-500">Funkce pro zobrazení plateb bude doplněna.</p></div>'
    },
    {
      label: 'Systém',
      icon: '⚙️',
      content: `
        <div class="p-4">
          <h3 class="text-lg font-semibold mb-2">Systémové informace</h3>
          <div class="space-y-2">
            <div><strong>Vytvořeno:</strong> ${data.created_at || '-'}</div>
            <div><strong>Poslední úprava:</strong> ${data.updated_at || '-'}</div>
            <div><strong>Upravil:</strong> ${data.updated_by || '-'}</div>
            <div><strong>Archivní:</strong> ${data.archived ? 'Ano' : 'Ne'}</div>
          </div>
        </div>
      `
    }
  ];

  // Render tabs
  renderTabs(tabsContainer, tabs, { defaultTab: 0 });

  // common actions - per requirements: remove 'refresh', add 'wizard'
  const myRole = window.currentUserRole || 'admin';
  const handlers = {
    onEdit: () => navigateTo(`#/m/050-najemnik/f/form?id=${id}&type=${type}`),
    onAttach: () => id && window.showAttachmentsModal && window.showAttachmentsModal({ entity: 'subjects', entityId: id }),
    onWizard: () => {
      alert('Průvodce zatím není k dispozici. Tato funkce bude doplněna.');
    },
    onHistory: () => {
      if (!id) { alert('Historie dostupná po uložení'); return; }
      showHistoryModal(async (subjectId) => {
        return await (await import('/src/modules/050-najemnik/db.js')).getSubjectHistory(subjectId);
      }, id);
    },
    onArchive: async () => {
      if (!id) { alert('Uložte nejprve záznam.'); return; }
      const { data, error } = await (await import('/src/modules/050-najemnik/db.js')).archiveSubject(id, window.currentUser);
      if (error) alert('Chyba: ' + (error.message || JSON.stringify(error))); else { alert('Archivováno'); navigateTo('#/m/050-najemnik/t/prehled'); }
    }
  };

  // render common actions in header area
  renderCommonActions(document.getElementById('commonactions'), {
    moduleActions: ['edit','attach','wizard','archive','history'],
    userRole: myRole,
    handlers
  });
}

export default { render };
