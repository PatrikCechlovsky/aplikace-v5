/**
 * ============================================================================
 * 080-platby Detail View - Unified Master Tabs Implementation
 * ============================================================================
 * Displays payment details with master tabs showing related contract and allocations
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
import { moduleMeta } from '/src/modules/080-platby/meta.js';
import { loadModuleMetaCached } from '/src/lib/metaLoader.js';
import { getPayment } from '/src/modules/080-platby/db.js';
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
 * Main render function for payment detail view
 */
export default async function render(root) {
  const { id } = getHashParams();
  
  if (!id) {
    root.innerHTML = `<div class="p-4 text-red-600">Chybí ID platby.</div>`;
    return;
  }
  
  // Set breadcrumb
  try {
    setBreadcrumb(document.getElementById('crumb'), [
      { icon: 'home', label: 'Domů', href: '#/' },
      { icon: 'payments', label: 'Platby', href: '#/m/080-platby' },
      { icon: 'visibility', label: 'Detail platby' }
    ]);
  } catch (e) {}
  
  // Load metadata (with DB schema enrichment)
  const enrichedMeta = await loadModuleMetaCached(moduleMeta);
  
  // Load payment data
  const { data, error } = await getPayment(id);
  if (error) {
    root.innerHTML = `<div class="p-4 text-red-600">Chyba při načítání platby: ${error.message}</div>`;
    return;
  }
  if (!data) {
    root.innerHTML = `<div class="p-4 text-red-600">Platba nenalezena.</div>`;
    return;
  }
  
  // Prepare main container
  root.innerHTML = '';
  const mainContainer = document.createElement('div');
  mainContainer.className = 'p-4';
  
  // Payment header summary
  const headerDiv = document.createElement('div');
  headerDiv.className = 'bg-white shadow rounded-lg p-6 mb-6';
  
  const statusLabels = {
    'cekajici': '⏳ Čeká',
    'potvrzeno': '✓ Potvrzeno',
    'uspesne_rekoncilovano': '✅ Zaplaceno',
    'selhalo': '❌ Selhalo',
    'vraceno': '↩️ Vráceno'
  };
  
  headerDiv.innerHTML = `
    <div class="flex justify-between items-start mb-4">
      <div>
        <h2 class="text-2xl font-bold">${formatCurrency(data.amount)}</h2>
        <p class="text-gray-600">${formatCzechDate(data.payment_date)}</p>
      </div>
      <div class="text-right">
        <span class="text-2xl">${statusLabels[data.status] || data.status}</span>
      </div>
    </div>
    <div class="grid grid-cols-3 gap-4">
      <div>
        <h3 class="font-semibold text-sm text-gray-600">Smlouva</h3>
        <p class="text-lg">${escapeHtml(data.contract?.cislo_smlouvy || '-')}</p>
      </div>
      <div>
        <h3 class="font-semibold text-sm text-gray-600">Plátce</h3>
        <p class="text-lg">${escapeHtml(data.party?.display_name || '-')}</p>
      </div>
      <div>
        <h3 class="font-semibold text-sm text-gray-600">Typ platby</h3>
        <p class="text-lg">${escapeHtml(data.payment_type || '-')}</p>
      </div>
    </div>
  `;
  
  mainContainer.appendChild(headerDiv);
  
  const tabsContainer = document.createElement('div');
  tabsContainer.className = 'mt-6';
  mainContainer.appendChild(tabsContainer);
  root.appendChild(mainContainer);

  const tabsConfig = createMasterTabsConfig();

  // Define master tabs
  const tabs = [
    {
      label: tabsConfig.labels.platba,
      icon: tabsConfig.icons.platba,
      content: (container) => {
        // Payment detail
        const paymentDiv = document.createElement('div');
        paymentDiv.className = 'bg-white rounded-lg p-4';
        
        const formattedData = { ...data };
        formattedData.updated_at = formatCzechDate(data.updated_at);
        formattedData.created_at = formatCzechDate(data.created_at);
        formattedData.payment_date = formatCzechDate(data.payment_date);
        formattedData.amount = formatCurrency(data.amount);
        
        // Render form using metadata
        renderMetadataForm(
          paymentDiv,
          enrichedMeta,
          'detail',
          formattedData,
          async () => true,
          {
            readOnly: true,
            showSubmit: false
          }
        );
        
        container.appendChild(paymentDiv);
        
        // Add system metadata
        const metadataDiv = document.createElement('div');
        metadataDiv.className = 'bg-gray-50 rounded-lg p-4 mt-4';
        metadataDiv.innerHTML = `
          <h4 class="font-semibold mb-2">Systémové informace</h4>
          <div class="grid grid-cols-2 gap-2 text-sm">
            <div><strong>Vytvořeno:</strong> ${formatCzechDate(data.created_at) || '-'}</div>
            <div><strong>Upraveno:</strong> ${formatCzechDate(data.updated_at) || '-'}</div>
            <div><strong>Upravil:</strong> ${escapeHtml(data.updated_by || '-')}</div>
            <div><strong>Stav:</strong> ${escapeHtml(data.status || '-')}</div>
          </div>
        `;
        container.appendChild(metadataDiv);
      }
    },
    {
      label: tabsConfig.labels.smlouva,
      icon: tabsConfig.icons.smlouva,
      content: async (container) => {
        container.innerHTML = '<div class="text-center py-4">Načítání smlouvy...</div>';
        
        try {
          if (!data.contract_id) {
            container.innerHTML = '<div class="text-gray-500 p-4">Není přiřazeno</div>';
            return;
          }
          
          const contracts = [data.contract].filter(Boolean);
          
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
                field: 'tenant_id',
                render: (v) => escapeHtml(v || '-')
              },
              { 
                label: 'Pronajímatel', 
                field: 'landlord_id',
                render: (v) => escapeHtml(v || '-')
              }
            ],
            emptyMessage: 'Není přiřazeno',
            detailFields: [
              { key: 'cislo_smlouvy', label: 'Číslo smlouvy', type: 'text' },
              { key: 'id', label: 'ID', type: 'text' }
            ],
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
      label: 'Alokace',
      icon: '📊',
      content: async (container) => {
        container.innerHTML = '<div class="text-center py-4">Načítání alokací...</div>';
        
        try {
          // Get payment allocations
          const { data: allocations, error: allocError } = await supabase
            .from('payment_allocations')
            .select('*')
            .eq('payment_id', id);
          
          if (allocError) {
            container.innerHTML = `<div class="text-red-600 p-4">Chyba: ${allocError.message}</div>`;
            return;
          }
          
          const tableDetail = createTableWithDetail({
            data: allocations || [],
            columns: [
              { 
                label: 'Typ', 
                field: 'allocation_type',
                render: (v) => {
                  const types = {
                    'najem': '🏠 Nájem',
                    'sluzba': '⚡ Služba',
                    'kauce': '💎 Kauce',
                    'poplatek': '💵 Poplatek'
                  };
                  return types[v] || v || '-';
                }
              },
              { 
                label: 'Částka', 
                field: 'amount',
                render: (v) => formatCurrency(v),
                className: 'text-right'
              },
              { 
                label: 'Popis', 
                field: 'description',
                render: (v) => escapeHtml(v || '-')
              }
            ],
            emptyMessage: 'Není přiřazeno',
            detailFields: [
              { key: 'allocation_type', label: 'Typ alokace', type: 'text' },
              { key: 'amount', label: 'Částka', type: 'number' },
              { key: 'description', label: 'Popis', type: 'text' }
            ],
            formatDetailData: (row) => ({
              ...row,
              amount: formatCurrency(row.amount)
            })
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
              
              <div><strong class="text-gray-600">Stav:</strong></div>
              <div>${escapeHtml(data.status || '-')}</div>
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
    onEdit: () => navigateTo(`#/m/080-platby/f/edit?id=${id}`),
    onHistory: () => {
      alert('Historie změn bude doplněna.');
    },
    onDetail: () => {
      if (!id) return;
      navigateTo(`#/m/080-platby/f/detail-tabs?id=${id}`);
    }
  };
  
  // Render common actions in header area
  renderCommonActions(document.getElementById('commonactions'), {
    moduleActions: ['detail', 'edit', 'history'],
    userRole: myRole,
    handlers
  });
}
