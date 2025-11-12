/**
 * ============================================================================
 * Detail Tabs Panel Component
 * ============================================================================
 * Unified detail layout component for modules 020, 030, 040, 050, 060, 080, 090
 * Implements the specification from src/modules/ui-detail-layout-mock.md
 * 
 * Features:
 * - Breadcrumbs navigation
 * - Tabbed interface showing related entities
 * - List view (max 10 items, ~300px height)
 * - Detail pane for selected item
 * - Double-click to open full detail
 * - URL pattern: /m/<module>/<id>?tab=<tabKey>
 * ============================================================================
 */

import { setBreadcrumb } from './breadcrumb.js';
import { renderForm } from './form.js';

/**
 * Helper to escape HTML
 */
function escapeHtml(s = '') {
  return String(s ?? '').replace(/[&<>"']/g, m => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[m]));
}

/**
 * Format Czech date
 */
function formatCzechDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d)) return '';
  return d.toLocaleDateString('cs-CZ') + ' ' + d.toLocaleTimeString('cs-CZ');
}

/**
 * Parse URL query parameters
 */
function getQueryParams() {
  const q = (location.hash.split('?')[1] || '');
  return Object.fromEntries(new URLSearchParams(q));
}

/**
 * Update URL with tab parameter
 */
function updateUrlTab(tabKey) {
  const params = getQueryParams();
  params.tab = tabKey;
  const hash = location.hash.split('?')[0];
  const newUrl = `${hash}?${new URLSearchParams(params)}`;
  history.replaceState(null, '', newUrl);
}

/**
 * Tab configuration icons and labels
 */
const TAB_CONFIG = {
  pronajimatel: { icon: '🏦', label: 'Pronajímatel' },
  nemovitost: { icon: '🏢', label: 'Nemovitost' },
  jednotka: { icon: '📦', label: 'Jednotka' },
  najemnik: { icon: '👤', label: 'Nájemník' },
  smlouva: { icon: '📄', label: 'Smlouva' },
  sluzba: { icon: '⚡', label: 'Služba' },
  platba: { icon: '💰', label: 'Platba' },
  finance: { icon: '💵', label: 'Finance' },
  dokumenty: { icon: '📁', label: 'Dokumenty' },
  system: { icon: '⚙️', label: 'Systém' }
};

/**
 * Render DetailTabsPanel component
 * 
 * @param {HTMLElement} root - Container element
 * @param {Object} config - Configuration object
 * @param {string} config.moduleId - Module ID (e.g., '030-pronajimatel')
 * @param {string} config.moduleLabel - Module label (e.g., 'Pronajímatel')
 * @param {string} config.entityId - Entity ID being viewed
 * @param {string} config.entityLabel - Entity label for breadcrumb
 * @param {Array} config.breadcrumbs - Array of breadcrumb items
 * @param {Array} config.tabs - Array of tab configurations
 * @param {string} config.activeTab - Active tab key
 * @param {Function} config.onTabChange - Callback when tab changes
 */
export async function renderDetailTabsPanel(root, config) {
  const {
    moduleId,
    moduleLabel,
    entityId,
    entityLabel,
    breadcrumbs = [],
    tabs = [],
    activeTab = null,
    onTabChange = null
  } = config;

  // Set breadcrumbs
  if (breadcrumbs && breadcrumbs.length > 0) {
    try {
      setBreadcrumb(document.getElementById('crumb'), breadcrumbs);
    } catch (e) {
      console.error('Error setting breadcrumb:', e);
    }
  }

  // Clear root
  root.innerHTML = '';
  root.className = 'detail-tabs-panel';

  // Create main container
  const container = document.createElement('div');
  container.className = 'p-4';

  // Create tabs bar
  const tabsBar = document.createElement('div');
  tabsBar.className = 'border-b border-gray-200 mb-6';
  
  const tabsList = document.createElement('div');
  tabsList.className = 'flex space-x-1 -mb-px overflow-x-auto';
  
  // Determine active tab
  const params = getQueryParams();
  let currentTab = activeTab || params.tab || (tabs.length > 0 ? tabs[0].key : null);

  // Create tab buttons
  tabs.forEach(tab => {
    const tabBtn = document.createElement('button');
    const isActive = tab.key === currentTab;
    
    tabBtn.className = isActive
      ? 'px-4 py-2 border-b-2 border-blue-500 text-blue-600 font-medium whitespace-nowrap'
      : 'px-4 py-2 border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap';
    
    // Add icon if available
    const tabConfig = TAB_CONFIG[tab.key] || {};
    const icon = tab.icon || tabConfig.icon || '';
    const label = tab.label || tabConfig.label || tab.key;
    
    tabBtn.innerHTML = `${icon} ${escapeHtml(label)}`;
    
    // Add badge if provided
    if (tab.badge !== undefined && tab.badge !== null) {
      const badge = document.createElement('span');
      badge.className = 'ml-2 px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-800';
      badge.textContent = tab.badge;
      tabBtn.appendChild(badge);
    }
    
    tabBtn.addEventListener('click', () => {
      currentTab = tab.key;
      updateUrlTab(tab.key);
      renderTabContent(tab);
      
      // Update tab button styles
      Array.from(tabsList.children).forEach(btn => {
        btn.className = 'px-4 py-2 border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap';
      });
      tabBtn.className = 'px-4 py-2 border-b-2 border-blue-500 text-blue-600 font-medium whitespace-nowrap';
      
      // Call callback
      if (onTabChange) {
        onTabChange(tab.key, tab);
      }
    });
    
    tabsList.appendChild(tabBtn);
  });

  tabsBar.appendChild(tabsList);
  container.appendChild(tabsBar);

  // Create tab content container
  const tabContent = document.createElement('div');
  tabContent.id = 'tab-content';
  tabContent.className = 'tab-content-area';
  container.appendChild(tabContent);

  root.appendChild(container);

  // Function to render tab content
  async function renderTabContent(tab) {
    tabContent.innerHTML = '<div class="text-center py-8 text-gray-500">Načítání...</div>';
    
    try {
      // Create list and detail layout
      const layout = document.createElement('div');
      layout.className = 'space-y-4';

      // List container (max 10 items, ~300px height)
      const listContainer = document.createElement('div');
      listContainer.className = 'border rounded-lg overflow-hidden';
      
      const listWrapper = document.createElement('div');
      listWrapper.className = 'overflow-y-auto';
      listWrapper.style.maxHeight = '300px';
      
      // Fetch data for this tab
      let data = [];
      if (tab.fetchData && typeof tab.fetchData === 'function') {
        const result = await tab.fetchData(entityId);
        data = result.data || [];
      }

      // Render list
      if (data.length === 0) {
        listWrapper.innerHTML = `
          <div class="p-8 text-center text-gray-500">
            <p class="mb-4">Žádné položky</p>
            ${tab.onAdd ? `<button class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700" onclick="handleAdd_${tab.key}()">Přidat</button>` : ''}
          </div>
        `;
        if (tab.onAdd) {
          window[`handleAdd_${tab.key}`] = tab.onAdd;
        }
      } else {
        // Create table
        const table = document.createElement('table');
        table.className = 'min-w-full divide-y divide-gray-200';
        
        // Table header
        const thead = document.createElement('thead');
        thead.className = 'bg-gray-50 sticky top-0 z-10';
        const headerRow = document.createElement('tr');
        
        const columns = tab.columns || [];
        columns.forEach(col => {
          const th = document.createElement('th');
          th.className = 'px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider';
          th.textContent = col.label;
          headerRow.appendChild(th);
        });
        
        thead.appendChild(headerRow);
        table.appendChild(thead);
        
        // Table body (max 10 items)
        const tbody = document.createElement('tbody');
        tbody.className = 'bg-white divide-y divide-gray-200';
        
        let selectedRow = null;
        const displayData = data.slice(0, 10);
        
        displayData.forEach((row, index) => {
          const tr = document.createElement('tr');
          tr.className = 'hover:bg-gray-50 cursor-pointer transition';
          tr.tabIndex = 0;
          
          // Row click handler
          const handleRowClick = () => {
            // Update selected state
            if (selectedRow) {
              selectedRow.classList.remove('bg-blue-50', 'ring-2', 'ring-blue-500', 'ring-inset');
            }
            tr.classList.add('bg-blue-50', 'ring-2', 'ring-blue-500', 'ring-inset');
            selectedRow = tr;
            
            // Show detail
            showDetail(row);
          };
          
          // Double-click to open full detail
          tr.addEventListener('dblclick', () => {
            if (tab.onOpenDetail && typeof tab.onOpenDetail === 'function') {
              tab.onOpenDetail(row);
            } else if (tab.detailRoute) {
              const route = typeof tab.detailRoute === 'function' 
                ? tab.detailRoute(row) 
                : tab.detailRoute.replace(':id', row.id);
              location.hash = route;
            }
          });
          
          tr.addEventListener('click', handleRowClick);
          tr.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleRowClick();
            }
          });
          
          // Create cells
          columns.forEach(col => {
            const td = document.createElement('td');
            td.className = 'px-4 py-3 text-sm';
            
            const value = col.field ? row[col.field] : '';
            
            if (col.render) {
              const rendered = col.render(value, row);
              if (typeof rendered === 'string') {
                td.innerHTML = rendered;
              } else if (rendered instanceof HTMLElement) {
                td.appendChild(rendered);
              } else {
                td.textContent = value || '-';
              }
            } else {
              td.textContent = value || '-';
            }
            
            tr.appendChild(td);
          });
          
          tbody.appendChild(tr);
          
          // Select first row by default
          if (index === 0) {
            requestAnimationFrame(() => handleRowClick());
          }
        });
        
        table.appendChild(tbody);
        listWrapper.appendChild(table);
      }
      
      listContainer.appendChild(listWrapper);
      layout.appendChild(listContainer);

      // Detail container
      const detailContainer = document.createElement('div');
      detailContainer.id = 'detail-pane';
      detailContainer.className = 'detail-container bg-gray-50 border rounded-lg p-4 min-h-[200px]';
      detailContainer.innerHTML = '<div class="text-gray-500 text-center py-8">Vyberte řádek pro zobrazení detailu</div>';
      layout.appendChild(detailContainer);
      
      // Function to show detail for selected row
      function showDetail(row) {
        detailContainer.innerHTML = '';
        
        const detailWrapper = document.createElement('div');
        detailWrapper.className = 'space-y-4';
        
        // Detail form
        const formContainer = document.createElement('div');
        formContainer.className = 'bg-white rounded-lg p-4';
        
        const detailFields = tab.detailFields || [];
        if (detailFields.length > 0) {
          const fields = detailFields.map(f => ({ ...f, readOnly: true }));
          renderForm(formContainer, fields, row, null, {
            readOnly: true,
            showSubmit: false,
            layout: { columns: { base: 1, md: 2 }, density: 'compact' }
          });
        } else {
          // Simple key-value display
          const dl = document.createElement('dl');
          dl.className = 'grid grid-cols-2 gap-3';
          
          Object.entries(row).forEach(([key, value]) => {
            if (key !== 'id' && value !== null && value !== undefined) {
              const dt = document.createElement('dt');
              dt.className = 'text-sm font-medium text-gray-500';
              dt.textContent = key;
              
              const dd = document.createElement('dd');
              dd.className = 'text-sm text-gray-900';
              dd.textContent = String(value);
              
              dl.appendChild(dt);
              dl.appendChild(dd);
            }
          });
          
          formContainer.appendChild(dl);
        }
        
        detailWrapper.appendChild(formContainer);
        
        // System metadata section
        const metadataDiv = document.createElement('div');
        metadataDiv.className = 'bg-white rounded-lg p-4 border-t-2 border-gray-200';
        
        const metadataTitle = document.createElement('h4');
        metadataTitle.className = 'text-sm font-semibold text-gray-700 mb-3';
        metadataTitle.textContent = 'Systémové informace';
        metadataDiv.appendChild(metadataTitle);
        
        const metadataGrid = document.createElement('div');
        metadataGrid.className = 'grid grid-cols-2 gap-2 text-sm';
        
        const metadata = [
          { label: 'Vytvořeno', value: formatCzechDate(row.created_at) || '-' },
          { label: 'Poslední úprava', value: formatCzechDate(row.updated_at) || '-' },
          { label: 'Upravil', value: row.updated_by || '-' },
          { label: 'Archivováno', value: row.archived ? 'Ano' : 'Ne' }
        ];
        
        metadata.forEach(({ label, value }) => {
          const item = document.createElement('div');
          item.innerHTML = `<span class="font-medium text-gray-600">${escapeHtml(label)}:</span> <span class="text-gray-900">${escapeHtml(value)}</span>`;
          metadataGrid.appendChild(item);
        });
        
        metadataDiv.appendChild(metadataGrid);
        detailWrapper.appendChild(metadataDiv);
        
        detailContainer.appendChild(detailWrapper);
      }
      
      tabContent.innerHTML = '';
      tabContent.appendChild(layout);
      
    } catch (error) {
      console.error('Error rendering tab content:', error);
      tabContent.innerHTML = `<div class="p-4 text-red-600">Chyba při načítání: ${escapeHtml(error.message || String(error))}</div>`;
    }
  }

  // Render initial tab
  const initialTab = tabs.find(t => t.key === currentTab) || tabs[0];
  if (initialTab) {
    await renderTabContent(initialTab);
  }
}

export default {
  renderDetailTabsPanel,
  formatCzechDate,
  escapeHtml
};
