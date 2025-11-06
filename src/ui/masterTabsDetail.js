/**
 * ============================================================================
 * Master Tabs Detail Component
 * ============================================================================
 * Provides unified UI pattern for detail views across modules with:
 * - Tabbed interface showing related entities
 * - Table with max 8 visible rows (scrollable)
 * - Detail form under table for selected row
 * - Archived items filter and visual indication
 * - Common actions in header
 * ============================================================================
 */

import { renderForm } from '/src/ui/form.js';
import { renderTabs } from '/src/ui/tabs.js';

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
 * Create a table with detail view for master tabs
 * @param {Object} config - Configuration object
 * @returns {HTMLElement} Container with table and detail view
 */
export function createTableWithDetail(config) {
  const {
    data = [],
    columns = [],
    emptyMessage = 'Není přiřazeno',
    showArchivedCheckbox = false,
    onArchivedFilterChange = null,
    detailFields = [],
    detailSections = null,
    onRowClick = null,
    onOpenDetail = null,
    formatDetailData = (row) => row,
    moduleLink = null
  } = config;

  const container = document.createElement('div');
  container.className = 'master-tabs-detail-container';

  // Archived filter checkbox
  if (showArchivedCheckbox) {
    const filterDiv = document.createElement('div');
    filterDiv.className = 'mb-3 flex items-center gap-2';
    
    // Use crypto.randomUUID if available, fallback to timestamp-based ID
    const checkboxId = 'show-archived-' + (
      typeof crypto !== 'undefined' && crypto.randomUUID 
        ? crypto.randomUUID() 
        : Date.now().toString(36) + Math.random().toString(36).substr(2)
    );
    
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = checkboxId;
    checkbox.className = 'rounded border-gray-300';
    
    const label = document.createElement('label');
    label.htmlFor = checkboxId;
    label.className = 'text-sm text-gray-700 cursor-pointer';
    label.textContent = 'Zobrazit archivované';
    
    checkbox.addEventListener('change', () => {
      if (onArchivedFilterChange) {
        onArchivedFilterChange(checkbox.checked);
      }
    });
    
    filterDiv.appendChild(checkbox);
    filterDiv.appendChild(label);
    container.appendChild(filterDiv);
  }

  // Table container with max 8 rows visible
  const tableContainer = document.createElement('div');
  tableContainer.className = 'border rounded-lg overflow-hidden mb-4';
  
  const scrollWrapper = document.createElement('div');
  scrollWrapper.className = 'overflow-y-auto';
  scrollWrapper.style.maxHeight = 'calc(8 * 3rem)'; // ~8 rows
  
  const table = document.createElement('table');
  table.className = 'min-w-full divide-y divide-gray-200';
  
  // Table header
  const thead = document.createElement('thead');
  thead.className = 'bg-gray-50 sticky top-0 z-10';
  const headerRow = document.createElement('tr');
  
  columns.forEach(col => {
    const th = document.createElement('th');
    th.className = 'px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider';
    th.textContent = col.label;
    if (col.className) th.className += ' ' + col.className;
    headerRow.appendChild(th);
  });
  
  thead.appendChild(headerRow);
  table.appendChild(thead);
  
  // Table body
  const tbody = document.createElement('tbody');
  tbody.className = 'bg-white divide-y divide-gray-200';
  
  if (!data || data.length === 0) {
    const emptyRow = document.createElement('tr');
    const emptyCell = document.createElement('td');
    emptyCell.colSpan = columns.length;
    emptyCell.className = 'px-4 py-8 text-center text-gray-500';
    emptyCell.textContent = emptyMessage;
    emptyRow.appendChild(emptyCell);
    tbody.appendChild(emptyRow);
  } else {
    let selectedRow = null;
    
    data.forEach((row, index) => {
      const tr = document.createElement('tr');
      tr.className = 'hover:bg-gray-50 cursor-pointer transition';
      tr.tabIndex = 0; // Make keyboard focusable
      
      // Grey out archived rows
      if (row.archived) {
        tr.className += ' bg-gray-100 text-gray-500 opacity-60';
      }
      
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
        
        // Call external handler if provided
        if (onRowClick) {
          onRowClick(row, index);
        }
      };
      
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
        
        if (col.className) td.className += ' ' + col.className;
        tr.appendChild(td);
      });
      
      tbody.appendChild(tr);
      
      // Select first row by default
      if (index === 0) {
        // Use requestAnimationFrame to ensure DOM is ready
        requestAnimationFrame(() => handleRowClick());
      }
    });
  }
  
  table.appendChild(tbody);
  scrollWrapper.appendChild(table);
  tableContainer.appendChild(scrollWrapper);
  container.appendChild(tableContainer);
  
  // Detail container
  const detailContainer = document.createElement('div');
  detailContainer.className = 'detail-container bg-gray-50 border rounded-lg p-4 min-h-[200px]';
  detailContainer.innerHTML = '<div class="text-gray-500 text-center py-8">Vyberte řádek pro zobrazení detailu</div>';
  container.appendChild(detailContainer);
  
  // Function to show detail for selected row
  function showDetail(row) {
    detailContainer.innerHTML = '';
    
    const detailWrapper = document.createElement('div');
    detailWrapper.className = 'space-y-4';
    
    // Detail form
    const formContainer = document.createElement('div');
    formContainer.className = 'bg-white rounded-lg p-4';
    
    const detailData = formatDetailData(row);
    
    // Add formatted dates
    if (detailData.created_at) {
      detailData.created_at = formatCzechDate(detailData.created_at);
    }
    if (detailData.updated_at) {
      detailData.updated_at = formatCzechDate(detailData.updated_at);
    }
    
    // Render readonly form
    if (detailFields && detailFields.length > 0) {
      const fields = detailFields.map(f => ({ ...f, readOnly: true }));
      renderForm(formContainer, fields, detailData, null, {
        readOnly: true,
        showSubmit: false,
        layout: { columns: { base: 1, md: 2 }, density: 'compact' },
        sections: detailSections
      });
    } else {
      // Simple key-value display if no fields provided
      const dl = document.createElement('dl');
      dl.className = 'grid grid-cols-2 gap-3';
      
      Object.entries(detailData).forEach(([key, value]) => {
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
    
    // Link to open full detail
    if (moduleLink && row.id) {
      const linkDiv = document.createElement('div');
      linkDiv.className = 'flex justify-end';
      
      const linkBtn = document.createElement('button');
      linkBtn.className = 'px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition';
      linkBtn.textContent = 'Otevřít detail';
      linkBtn.addEventListener('click', () => {
        if (onOpenDetail) {
          onOpenDetail(row);
        } else if (typeof window.navigateTo === 'function') {
          const link = typeof moduleLink === 'function' ? moduleLink(row) : moduleLink.replace(':id', row.id);
          window.navigateTo(link);
        } else {
          const link = typeof moduleLink === 'function' ? moduleLink(row) : moduleLink.replace(':id', row.id);
          location.hash = link;
        }
      });
      
      linkDiv.appendChild(linkBtn);
      detailWrapper.appendChild(linkDiv);
    }
    
    detailContainer.appendChild(detailWrapper);
  }
  
  return container;
}

/**
 * Helper to create master tabs configuration
 */
export function createMasterTabsConfig() {
  return {
    icons: {
      pronajimatel: '🏦',
      nemovitost: '🏢',
      jednotka: '📦',
      najemnik: '👤',
      smlouva: '📄',
      sluzba: '⚡',
      platba: '💰',
      system: '⚙️'
    },
    labels: {
      pronajimatel: 'Pronajímatel',
      nemovitost: 'Nemovitost',
      jednotka: 'Jednotka',
      najemnik: 'Nájemníci',
      smlouva: 'Smlouvy',
      sluzba: 'Služby',
      platba: 'Platby',
      system: 'Systém'
    }
  };
}

export default {
  createTableWithDetail,
  createMasterTabsConfig,
  formatCzechDate,
  escapeHtml
};
