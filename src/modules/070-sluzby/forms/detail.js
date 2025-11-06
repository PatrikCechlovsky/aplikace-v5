/**
 * ============================================================================
 * 070-sluzby Detail View - Unified Master Tabs Implementation
 * ============================================================================
 * Displays service definition details with master tabs showing usage in contracts
 * Following the unified UX pattern with table + detail view
 * ============================================================================
 */

import { setBreadcrumb } from '/src/ui/breadcrumb.js';
import { renderForm } from '/src/ui/form.js';
import { renderCommonActions } from '/src/ui/commonActions.js';
import { renderTabs } from '/src/ui/tabs.js';
import { createTableWithDetail, createMasterTabsConfig } from '/src/ui/masterTabsDetail.js';
import { navigateTo } from '/src/app.js';
import { renderMetadataForm } from '/src/lib/formRenderer.js';
import { moduleMeta } from '/src/modules/070-sluzby/meta.js';
import { loadModuleMetaCached } from '/src/lib/metaLoader.js';
import { getServiceDefinition } from '/src/modules/070-sluzby/db.js';
import { supabase } from '/src/supabase.js';

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

// Helper to format currency
function formatCurrency(amount) {
  if (!amount) return '-';
  return new Intl.NumberFormat('cs-CZ', { style: 'currency', currency: 'CZK' }).format(amount);
}

/**
 * Main render function for service definition detail view
 */
export default async function render(root) {
  const { id } = getHashParams();
  
  if (!id) {
    root.innerHTML = `<div class="p-4 text-red-600">Chybí ID služby.</div>`;
    return;
  }
  
  // Set breadcrumb
  try {
    setBreadcrumb(document.getElementById('crumb'), [
      { icon: 'home', label: 'Domů', href: '#/' },
      { icon: 'settings', label: 'Služby', href: '#/m/070-sluzby' },
      { icon: 'visibility', label: 'Detail služby' }
    ]);
  } catch (e) {}
  
  // Load metadata (with DB schema enrichment)
  const enrichedMeta = await loadModuleMetaCached(moduleMeta);
  
  // Load service data
  const { data, error } = await getServiceDefinition(id);
  if (error) {
    root.innerHTML = `<div class="p-4 text-red-600">Chyba při načítání služby: ${error.message}</div>`;
    return;
  }
  if (!data) {
    root.innerHTML = `<div class="p-4 text-red-600">Služba nenalezena.</div>`;
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

  const tabsConfig = createMasterTabsConfig();

  // Define master tabs
  const tabs = [
    {
      label: tabsConfig.labels.sluzba,
      icon: tabsConfig.icons.sluzba,
      content: (container) => {
        // Service definition detail
        const serviceDiv = document.createElement('div');
        serviceDiv.className = 'bg-white rounded-lg p-4';
        
        const formattedData = { ...data };
        formattedData.updated_at = formatCzechDate(data.updated_at);
        formattedData.created_at = formatCzechDate(data.created_at);
        
        // Render form using metadata
        renderMetadataForm(
          serviceDiv,
          enrichedMeta,
          'detail',
          formattedData,
          async () => true,
          {
            readOnly: true,
            showSubmit: false
          }
        );
        
        container.appendChild(serviceDiv);
        
        // Add system metadata
        const metadataDiv = document.createElement('div');
        metadataDiv.className = 'bg-gray-50 rounded-lg p-4 mt-4';
        metadataDiv.innerHTML = `
          <h4 class="font-semibold mb-2">Systémové informace</h4>
          <div class="grid grid-cols-2 gap-2 text-sm">
            <div><strong>Vytvořeno:</strong> ${formatCzechDate(data.created_at) || '-'}</div>
            <div><strong>Upraveno:</strong> ${formatCzechDate(data.updated_at) || '-'}</div>
            <div><strong>Upravil:</strong> ${escapeHtml(data.updated_by || '-')}</div>
            <div><strong>Aktivní:</strong> ${data.aktivni ? 'Ano' : 'Ne'}</div>
          </div>
        `;
        container.appendChild(metadataDiv);
      }
    },
    {
      label: 'Použití',
      icon: '📊',
      content: async (container) => {
        container.innerHTML = '<div class="text-center py-4">Načítání použití služby...</div>';
        
        try {
          // Get contracts that use this service
          const { data: serviceLines, error: linesError } = await supabase
            .from('contract_service_lines')
            .select(`
              *,
              contract:contracts(
                id, 
                cislo_smlouvy, 
                nazev, 
                stav,
                tenant:subjects!tenant_id(id, display_name),
                unit:units(id, oznaceni),
                property:properties(id, nazev)
              )
            `)
            .eq('service_definition_id', id);
          
          if (linesError) {
            container.innerHTML = `<div class="text-red-600 p-4">Chyba: ${linesError.message}</div>`;
            return;
          }
          
          const contracts = (serviceLines || []).map(line => ({
            ...line.contract,
            service_line: line
          })).filter(Boolean);
          
          const tableDetail = createTableWithDetail({
            data: contracts,
            columns: [
              { 
                label: 'Číslo smlouvy', 
                field: 'cislo_smlouvy',
                render: (v) => `<strong>${escapeHtml(v || 'Bez čísla')}</strong>`
              },
              { 
                label: 'Nájemník', 
                field: 'tenant',
                render: (v) => v ? escapeHtml(v.display_name || '-') : '-'
              },
              { 
                label: 'Jednotka', 
                field: 'unit',
                render: (v) => v ? escapeHtml(v.oznaceni || '-') : '-'
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
              }
            ],
            emptyMessage: 'Není přiřazeno',
            detailFields: [
              { key: 'cislo_smlouvy', label: 'Číslo smlouvy', type: 'text' },
              { key: 'nazev', label: 'Název smlouvy', type: 'text' },
              { key: 'stav', label: 'Stav', type: 'text' }
            ],
            formatDetailData: (row) => ({
              cislo_smlouvy: row.cislo_smlouvy,
              nazev: row.nazev,
              stav: row.stav,
              tenant: row.tenant?.display_name || '-',
              unit: row.unit?.oznaceni || '-',
              property: row.property?.nazev || '-'
            }),
            moduleLink: '#/m/060-smlouva/f/detail?id=:id'
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
              
              <div><strong class="text-gray-600">Aktivní:</strong></div>
              <div>${data.aktivni ? 'Ano' : 'Ne'}</div>
            </div>
          </div>
        </div>
      `
    }
  ];
  
  // Render tabs
  renderTabs(tabsContainer, tabs, { defaultTab: 0 });
  
  // Common actions
  const myRole = window.currentUserRole || 'admin';
  const handlers = {
    onEdit: () => navigateTo(`#/m/070-sluzby/f/edit?id=${id}`),
    onHistory: () => {
      alert('Historie změn bude doplněna.');
    }
  };
  
  // Render common actions in header area
  renderCommonActions(document.getElementById('commonactions'), {
    moduleActions: ['edit', 'history'],
    userRole: myRole,
    handlers
  });
}
