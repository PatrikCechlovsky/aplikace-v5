/**
 * ============================================================================
 * 050-najemnik Detail View - Unified Master Tabs Implementation
 * ============================================================================
 * Displays tenant details with master tabs showing all related entities
 * Following the unified UX pattern with table + detail view
 * ============================================================================
 */

import { setBreadcrumb } from '/src/ui/breadcrumb.js';
import { renderForm } from '/src/ui/form.js';
import { renderCommonActions } from '/src/ui/commonActions.js';
import { renderTabs } from '/src/ui/tabs.js';
import { createTableWithDetail, createMasterTabsConfig } from '/src/ui/masterTabsDetail.js';
import { navigateTo } from '/src/app.js';
import { getSubject } from '/src/modules/050-najemnik/db.js';
import { listContracts } from '/src/modules/060-smlouva/db.js';
import { listUnits, listProperties } from '/src/modules/040-nemovitost/db.js';
import { showHistoryModal } from '/src/ui/history.js';
import TYPE_SCHEMAS from '/src/modules/050-najemnik/type-schemas.js';

// Helper to parse hash params
function getHashParams() {
  const q = (location.hash.split('?')[1] || '');
  return Object.fromEntries(new URLSearchParams(q));
}

// Helper to format Czech date
function formatCzechDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d)) return '';
  return d.toLocaleDateString('cs-CZ') + ' ' + d.toLocaleTimeString('cs-CZ');
}

// Helper to escape HTML
function escapeHtml(s = '') {
  return String(s ?? '').replace(/[&<>"']/g, m => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[m]));
}

/**
 * Main render function for tenant detail view
 */
export async function render(root) {
  const { id, type: qtype } = getHashParams();
  const type = qtype || 'osoba';

  if (!id) {
    root.innerHTML = `<div class="p-4 text-red-600">Chybí ID nájemníka.</div>`;
    return;
  }

  // Set breadcrumb
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

  // Prepare main container
  root.innerHTML = '';
  const mainContainer = document.createElement('div');
  mainContainer.className = 'p-4';
  
  const tabsContainer = document.createElement('div');
  tabsContainer.className = 'mt-6';
  mainContainer.appendChild(tabsContainer);
  root.appendChild(mainContainer);

  const schema = TYPE_SCHEMAS[type] || [];
  const fields = schema.map(f => ({ ...f, readOnly: true }));
  const tabsConfig = createMasterTabsConfig();

  // Define master tabs following the specification
  const tabs = [
    {
      label: tabsConfig.labels.najemnik,
      icon: tabsConfig.icons.najemnik,
      content: (container) => {
        // Main tenant profile - show as form view
        const profileDiv = document.createElement('div');
        profileDiv.className = 'bg-white rounded-lg p-4';
        
        const formattedData = { ...data };
        formattedData.updated_at = formatCzechDate(data.updated_at);
        formattedData.created_at = formatCzechDate(data.created_at);
        
        const sections = [
          { id: 'profil', label: 'Profil', fields: fields.map(f => f.key) },
          { id: 'system', label: 'Systém', fields: ['archived','created_at','updated_at','updated_by'] }
        ];
        
        renderForm(profileDiv, fields, formattedData, null, {
          readOnly: true,
          showSubmit: false,
          layout: { columns: { base: 1, md: 2 }, density: 'compact' },
          sections
        });
        
        container.appendChild(profileDiv);
      }
    },
    {
      label: tabsConfig.labels.smlouva,
      icon: tabsConfig.icons.smlouva,
      content: async (container) => {
        container.innerHTML = '<div class="text-center py-4">Načítání smluv...</div>';
        
        try {
          const { data: contracts, error: contractsError } = await listContracts({ tenantId: id, showArchived: false });
          
          if (contractsError) {
            container.innerHTML = `<div class="text-red-600 p-4">Chyba: ${contractsError.message}</div>`;
            return;
          }
          
          const allContracts = contracts || [];
          let filteredContracts = allContracts.filter(c => !c.archived);
          
          const tableDetail = createTableWithDetail({
            data: filteredContracts,
            columns: [
              { 
                label: 'Číslo smlouvy', 
                field: 'cislo_smlouvy',
                render: (v) => `<strong>${escapeHtml(v || 'Bez čísla')}</strong>`
              },
              { 
                label: 'Stav', 
                field: 'stav',
                render: (v) => {
                  const states = {
                    'koncept': '📝 Koncept',
                    'aktivni': '✅ Aktivní',
                    'ukoncena': '❌ Ukončená'
                  };
                  return states[v] || v || '-';
                }
              },
              { 
                label: 'Jednotka', 
                field: 'unit',
                render: (v) => v ? escapeHtml(`${v.oznaceni || '-'} (${v.typ_jednotky || '-'})`) : '-'
              },
              { 
                label: 'Nemovitost', 
                field: 'property',
                render: (v) => v ? escapeHtml(`${v.nazev || '-'}`) : '-'
              }
            ],
            emptyMessage: 'Není přiřazeno',
            showArchivedCheckbox: true,
            onArchivedFilterChange: async (showArchived) => {
              filteredContracts = showArchived ? allContracts : allContracts.filter(c => !c.archived);
              // Re-render
              container.innerHTML = '';
              const newTable = createTableWithDetail({
                data: filteredContracts,
                columns: tableDetail._columns,
                emptyMessage: 'Není přiřazeno',
                showArchivedCheckbox: true,
                onArchivedFilterChange: tableDetail._onArchivedFilterChange,
                detailFields: tableDetail._detailFields,
                moduleLink: '#/m/060-smlouva/f/detail?id=:id'
              });
              container.appendChild(newTable);
            },
            detailFields: [
              { key: 'cislo_smlouvy', label: 'Číslo smlouvy', type: 'text' },
              { key: 'nazev', label: 'Název', type: 'text' },
              { key: 'stav', label: 'Stav', type: 'text' },
              { key: 'datum_zacatek', label: 'Datum začátku', type: 'date' },
              { key: 'datum_konec', label: 'Datum konce', type: 'date' }
            ],
            moduleLink: '#/m/060-smlouva/f/detail?id=:id'
          });
          
          // Store config for re-render
          tableDetail._columns = tableDetail.columns;
          tableDetail._onArchivedFilterChange = tableDetail.onArchivedFilterChange;
          tableDetail._detailFields = tableDetail.detailFields;
          
          container.innerHTML = '';
          container.appendChild(tableDetail);
        } catch (e) {
          container.innerHTML = `<div class="text-red-600 p-4">${escapeHtml(e.message)}</div>`;
        }
      }
    },
    {
      label: tabsConfig.labels.jednotka,
      icon: tabsConfig.icons.jednotka,
      content: async (container) => {
        container.innerHTML = '<div class="text-center py-4">Načítání jednotek...</div>';
        
        try {
          const { data: contracts } = await listContracts({ tenantId: id, status: 'aktivni' });
          const units = (contracts || []).map(c => c.unit).filter(Boolean);
          
          // Remove duplicates by id
          const uniqueUnits = Array.from(new Map(units.map(u => [u.id, u])).values());
          
          const tableDetail = createTableWithDetail({
            data: uniqueUnits,
            columns: [
              { label: 'Označení', field: 'oznaceni', render: (v) => `<strong>${escapeHtml(v || '-')}</strong>` },
              { label: 'Typ', field: 'typ_jednotky' },
              { label: 'Stav', field: 'stav' }
            ],
            emptyMessage: 'Není přiřazeno',
            detailFields: [
              { key: 'oznaceni', label: 'Označení', type: 'text' },
              { key: 'typ_jednotky', label: 'Typ jednotky', type: 'text' },
              { key: 'stav', label: 'Stav', type: 'text' },
              { key: 'plocha', label: 'Plocha (m²)', type: 'number' },
              { key: 'podlazi', label: 'Podlaží', type: 'text' }
            ],
            moduleLink: '#/m/040-nemovitost/f/unit-detail?id=:id'
          });
          
          container.innerHTML = '';
          container.appendChild(tableDetail);
        } catch (e) {
          container.innerHTML = `<div class="text-red-600 p-4">${escapeHtml(e.message)}</div>`;
        }
      }
    },
    {
      label: tabsConfig.labels.nemovitost,
      icon: tabsConfig.icons.nemovitost,
      content: async (container) => {
        container.innerHTML = '<div class="text-center py-4">Načítání nemovitostí...</div>';
        
        try {
          const { data: contracts } = await listContracts({ tenantId: id, status: 'aktivni' });
          const properties = (contracts || []).map(c => c.property).filter(Boolean);
          
          // Remove duplicates by id
          const uniqueProperties = Array.from(new Map(properties.map(p => [p.id, p])).values());
          
          const tableDetail = createTableWithDetail({
            data: uniqueProperties,
            columns: [
              { label: 'Název', field: 'nazev', render: (v) => `<strong>${escapeHtml(v || '-')}</strong>` },
              { label: 'Adresa', field: 'ulice' },
              { label: 'Město', field: 'mesto' }
            ],
            emptyMessage: 'Není přiřazeno',
            detailFields: [
              { key: 'nazev', label: 'Název', type: 'text' },
              { key: 'ulice', label: 'Ulice', type: 'text' },
              { key: 'mesto', label: 'Město', type: 'text' },
              { key: 'psc', label: 'PSČ', type: 'text' }
            ],
            moduleLink: '#/m/040-nemovitost/f/detail?id=:id'
          });
          
          container.innerHTML = '';
          container.appendChild(tableDetail);
        } catch (e) {
          container.innerHTML = `<div class="text-red-600 p-4">${escapeHtml(e.message)}</div>`;
        }
      }
    },
    {
      label: tabsConfig.labels.system,
      icon: tabsConfig.icons.system,
      content: `
        <div class="p-4">
          <h3 class="text-lg font-semibold mb-4">Systémové informace</h3>
          <div class="bg-white rounded-lg p-4 space-y-3">
            <div class="grid grid-cols-2 gap-2">
              <div><strong class="text-gray-600">Vytvořeno:</strong></div>
              <div>${formatCzechDate(data.created_at) || '-'}</div>
              
              <div><strong class="text-gray-600">Poslední úprava:</strong></div>
              <div>${formatCzechDate(data.updated_at) || '-'}</div>
              
              <div><strong class="text-gray-600">Upravil:</strong></div>
              <div>${escapeHtml(data.updated_by || '-')}</div>
              
              <div><strong class="text-gray-600">Archivováno:</strong></div>
              <div>${data.archived ? 'Ano' : 'Ne'}</div>
            </div>
          </div>
        </div>
      `
    }
  ];

  // Render tabs
  renderTabs(tabsContainer, tabs, { defaultTab: 0 });

  // Render common actions
  const handlers = {
    onEdit: () => navigateTo(`#/m/050-najemnik/f/form?id=${id}&type=${type}`),
    onAttach: () => id && window.showAttachmentsModal && window.showAttachmentsModal({ entity: 'subjects', entityId: id }),
    onHistory: () => {
      if (!id) { alert('Historie dostupná po uložení'); return; }
      showHistoryModal(async (subjectId) => {
        return await (await import('/src/modules/050-najemnik/db.js')).getSubjectHistory(subjectId);
      }, id);
    },
    onArchive: async () => {
      if (!id) { alert('Uložte nejprve záznam.'); return; }
      const confirmed = confirm('Opravdu chcete archivovat tohoto nájemníka?');
      if (!confirmed) return;
      const { data: d, error: err } = await (await import('/src/modules/050-najemnik/db.js')).archiveSubject(id, window.currentUser);
      if (err) alert('Chyba: ' + (err.message || JSON.stringify(err))); 
      else { alert('Archivováno'); navigateTo('#/m/050-najemnik/t/prehled'); }
    }
  };

  renderCommonActions(document.getElementById('commonactions'), {
    moduleActions: ['edit','attach','history','archive'],
    userRole: window.currentUserRole || 'admin',
    handlers
  });
}

export default { render };
