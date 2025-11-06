/**
 * ============================================================================
 * Pronajímatel Detail View with Tabs
 * ============================================================================
 * Shows landlord details with related properties in tabs
 * ============================================================================
 */

import { setBreadcrumb } from '/src/ui/breadcrumb.js';
import { renderForm } from '/src/ui/form.js';
import { renderCommonActions } from '/src/ui/commonActions.js';
import { renderTabs, createRelatedEntitiesTable } from '/src/ui/tabs.js';
import { navigateTo } from '/src/app.js';
import { getSubject } from '/src/modules/030-pronajimatel/db.js';
import { listProperties, listUnits } from '/src/modules/040-nemovitost/db.js';
import { showHistoryModal } from '/src/ui/history.js';
import TYPE_SCHEMAS from '/src/modules/030-pronajimatel/type-schemas.js';

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
  const type = qtype || 'spolek';

  if (!id) {
    root.innerHTML = `<div class="p-4 text-red-600">Chybí ID pronajímatele.</div>`;
    return;
  }

  // set breadcrumb
  try {
    setBreadcrumb(document.getElementById('crumb'), [
      { icon: 'home',  label: 'Domů', href: '#/' },
      { icon: 'users', label: 'Pronajímatel', href: '#/m/030-pronajimatel' },
      { icon: 'account', label: 'Detail' }
    ]);
  } catch (e) {}

  // Load landlord data
  const { data, error } = await getSubject(id);
  if (error) {
    root.innerHTML = `<div class="p-4 text-red-600">Chyba při načítání: ${error.message || JSON.stringify(error)}</div>`;
    return;
  }
  if (!data) {
    root.innerHTML = `<div class="p-4 text-red-600">Pronajímatel nenalezen.</div>`;
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
      label: 'Detail pronajímatele',
      icon: '👤',
      content: (container) => {
        // Render the editable form in this tab
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
      label: 'Účty',
      icon: '💳',
      content: `
        <div class="p-4">
          <h3 class="text-lg font-semibold mb-2">Bankovní účty</h3>
          <p class="text-gray-500">Funkce pro správu bankovních účtů bude doplněna.</p>
        </div>
      `
    },
    {
      label: 'Nemovitosti',
      icon: '🏢',
      badge: null,
      content: async (container) => {
        container.innerHTML = '<div class="text-center py-4">Načítání nemovitostí...</div>';
        
        // Load properties for this landlord
        const { data: properties, error: propError } = await listProperties({ landlordId: id });
        
        if (propError) {
          container.innerHTML = `<div class="text-red-600 p-4">Chyba při načítání nemovitostí: ${propError.message}</div>`;
          return;
        }

        container.innerHTML = '';
        
        if (!properties || properties.length === 0) {
          container.innerHTML = '<div class="text-gray-500 p-4">Žádné nemovitosti</div>';
          return;
        }

        // Create table with properties
        const table = createRelatedEntitiesTable(
          properties,
          [
            { 
              label: 'Název', 
              field: 'nazev',
              render: (val, row) => `<strong>${val || 'Bez názvu'}</strong>`
            },
            { 
              label: 'Adresa', 
              field: 'ulice',
              render: (val, row) => `${val || ''} ${row.cislo_popisne || ''}, ${row.mesto || ''}`
            },
            { 
              label: 'Typ', 
              field: 'typ_nemovitosti',
              render: (val) => {
                const typeLabels = {
                  'bytovy_dum': 'Bytový dům',
                  'rodinny_dum': 'Rodinný dům',
                  'kancelar': 'Kancelář',
                  'obchod': 'Obchod',
                  'sklad': 'Sklad',
                  'jina_nemovitost': 'Jiná nemovitost'
                };
                return typeLabels[val] || val || '-';
              }
            },
            { 
              label: 'Vytvořeno', 
              field: 'created_at',
              render: (val) => val ? new Date(val).toLocaleDateString('cs-CZ') : '-'
            }
          ],
          {
            emptyMessage: 'Žádné nemovitosti',
            onRowClick: (row) => {
              navigateTo(`#/m/040-nemovitost/f/detail?id=${row.id}`);
            },
            className: 'cursor-pointer'
          }
        );

        container.appendChild(table);
      }
    },
    {
      label: 'Jednotky',
      icon: '📦',
      badge: null,
      content: async (container) => {
        container.innerHTML = '<div class="text-center py-4">Načítání jednotek...</div>';
        
        // Load properties first, then get units for all properties
        const { data: properties, error: propError } = await listProperties({ landlordId: id });
        
        if (propError) {
          container.innerHTML = `<div class="text-red-600 p-4">Chyba při načítání: ${propError.message}</div>`;
          return;
        }

        if (!properties || properties.length === 0) {
          container.innerHTML = '<div class="text-gray-500 p-4">Žádné jednotky</div>';
          return;
        }

        // Collect all units from all properties
        const allUnits = [];
        for (const prop of properties) {
          const { data: units } = await listUnits(prop.id, { showArchived: false });
          if (units && units.length > 0) {
            units.forEach(unit => {
              unit.property_name = prop.nazev;
              allUnits.push(unit);
            });
          }
        }

        container.innerHTML = '';
        
        if (allUnits.length === 0) {
          container.innerHTML = '<div class="text-gray-500 p-4">Žádné jednotky</div>';
          return;
        }

        const table = createRelatedEntitiesTable(
          allUnits,
          [
            { 
              label: 'Označení', 
              field: 'oznaceni',
              render: (val) => `<strong>${val || '-'}</strong>`
            },
            { 
              label: 'Nemovitost', 
              field: 'property_name'
            },
            { 
              label: 'Typ', 
              field: 'typ_jednotky'
            },
            { 
              label: 'Stav', 
              field: 'stav'
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
      label: 'Nájemníci',
      icon: '👥',
      badge: null,
      content: async (container) => {
        container.innerHTML = '<div class="text-center py-4">Načítání nájemníků...</div>';
        
        // Load tenants related to this landlord's properties
        // For now, just show placeholder
        container.innerHTML = '<div class="text-gray-500 p-4">Funkce pro zobrazení nájemníků bude doplněna.</div>';
      }
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
    onEdit: () => navigateTo(`#/m/030-pronajimatel/f/form?id=${id}&type=${type}`),
    onAttach: () => id && window.showAttachmentsModal && window.showAttachmentsModal({ entity: 'subjects', entityId: id }),
    onWizard: () => {
      alert('Průvodce zatím není k dispozici. Tato funkce bude doplněna.');
    },
    onHistory: () => {
      if (!id) { alert('Historie dostupná po uložení'); return; }
      showHistoryModal(async (subjectId) => {
        return await (await import('/src/modules/030-pronajimatel/db.js')).getSubjectHistory(subjectId);
      }, id);
    },
    onArchive: async () => {
      if (!id) { alert('Uložte nejprve záznam.'); return; }
      const { data, error } = await (await import('/src/modules/030-pronajimatel/db.js')).archiveSubject(id, window.currentUser);
      if (error) alert('Chyba: ' + (error.message || JSON.stringify(error))); else { alert('Archivováno'); navigateTo('#/m/030-pronajimatel/t/prehled'); }
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
