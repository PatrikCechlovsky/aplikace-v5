/**
 * ============================================================================
 * Tabs UI Component
 * ============================================================================
 * Reusable tabs component for showing related entity information in forms.
 * Used across modules to display relationships between entities.
 * ============================================================================
 */

/**
 * Renders a tabbed interface with multiple panels
 * @param {HTMLElement} container - Container element to render tabs into
 * @param {Array<Object>} tabs - Array of tab configurations
 * @param {Object} options - Options for tab rendering
 * @returns {Object} API for interacting with tabs
 */
export function renderTabs(container, tabs, options = {}) {
  const {
    defaultTab = 0,
    onTabChange = null,
    className = ''
  } = options;

  // Clear container
  container.innerHTML = '';
  container.className = `tabs-container ${className}`;

  // Create tab headers container
  const tabHeaders = document.createElement('div');
  tabHeaders.className = 'border-b border-gray-200 mb-4';
  
  const tabHeadersList = document.createElement('div');
  tabHeadersList.className = 'flex space-x-2 -mb-px';
  
  // Create tab content container
  const tabContents = document.createElement('div');
  tabContents.className = 'tab-contents';

  let activeTabIndex = defaultTab;

  // Function to activate a specific tab
  const activateTab = (index) => {
    if (index < 0 || index >= tabs.length) return;
    
    activeTabIndex = index;
    
    // Update header active states
    Array.from(tabHeadersList.children).forEach((header, i) => {
      if (i === index) {
        header.className = 'px-4 py-2 border-b-2 border-blue-500 text-blue-600 font-medium cursor-pointer';
      } else {
        header.className = 'px-4 py-2 border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 cursor-pointer';
      }
    });
    
    // Update content visibility
    Array.from(tabContents.children).forEach((content, i) => {
      content.style.display = i === index ? 'block' : 'none';
    });
    
    // Call the tab's onActivate callback if it exists
    if (tabs[index].onActivate) {
      try {
        tabs[index].onActivate(tabContents.children[index]);
      } catch (err) {
        console.error('Error in tab onActivate handler:', err);
      }
    }
    
    // Call global onTabChange callback
    if (onTabChange) {
      try {
        onTabChange(index, tabs[index]);
      } catch (err) {
        console.error('Error in global onTabChange handler:', err);
      }
    }
  };

  // Create tab headers and content panels
  tabs.forEach((tab, index) => {
    // Create header
    const header = document.createElement('div');
    header.className = 'px-4 py-2 border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 cursor-pointer';
    
    // Add icon if provided
    if (tab.icon) {
      const icon = document.createElement('span');
      icon.className = 'mr-2';
      icon.innerHTML = tab.icon;
      header.appendChild(icon);
    }
    
    // Add label
    const label = document.createElement('span');
    label.textContent = tab.label;
    header.appendChild(label);
    
    // Add badge if provided
    if (tab.badge !== undefined && tab.badge !== null) {
      const badge = document.createElement('span');
      badge.className = 'ml-2 px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-800';
      badge.textContent = tab.badge;
      header.appendChild(badge);
    }
    
    header.addEventListener('click', () => activateTab(index));
    tabHeadersList.appendChild(header);
    
    // Create content panel
    const content = document.createElement('div');
    content.className = 'tab-content';
    content.style.display = 'none';
    
    // If tab has content, render it
    if (tab.content) {
      if (typeof tab.content === 'function') {
        // Show loading placeholder for function-based content (may render sync or async)
        content.innerHTML = '<div class="text-center py-4">Načítání...</div>';
      } else if (typeof tab.content === 'string') {
        content.innerHTML = tab.content;
      } else if (tab.content instanceof HTMLElement) {
        content.appendChild(tab.content);
      } else {
        // unknown content type - show nothing but keep panel for safety
      }
    }
    
    tabContents.appendChild(content);
  });

  // Assemble the tabs UI
  tabHeaders.appendChild(tabHeadersList);
  container.appendChild(tabHeaders);
  container.appendChild(tabContents);

  // Activate default tab
  activateTab(activeTabIndex);

  // Load content for tabs that provide a function as content
  // Robust handling: content function may be sync (rendering directly) or async returning a Promise or value.
  tabs.forEach((tab, index) => {
    if (typeof tab.content === 'function') {
      const contentPanel = tabContents.children[index];

      // execute content in try/catch to catch synchronous throws
      try {
        const result = tab.content(contentPanel);
        // Normalize to a Promise - handles sync return (undefined/null), DOM rendering in-place, or Promise
        Promise.resolve(result).then(resolved => {
          // If the content function returned a string or a node, render/append it.
          if (typeof resolved === 'string') {
            contentPanel.innerHTML = resolved;
          } else if (resolved instanceof HTMLElement) {
            contentPanel.innerHTML = '';
            contentPanel.appendChild(resolved);
          } else {
            // If resolved is undefined/null or not a value we can use,
            // assume the function rendered into the provided container itself.
            // If the container still contains the loading placeholder, clear it.
            if (contentPanel.innerHTML && contentPanel.innerHTML.indexOf('Načítání...') !== -1) {
              contentPanel.innerHTML = '';
            }
          }

          // If this tab is active, re-activate to ensure styles / layout updates
          if (index === activeTabIndex) {
            try { activateTab(activeTabIndex); } catch (e) { /* ignore */ }
          }
        }).catch(error => {
          console.error('Error loading tab content (async):', error);
          contentPanel.innerHTML = `<div class="text-red-600 p-4">Chyba při načítání: ${escapeHtml(error?.message || String(error))}</div>`;
        });
      } catch (err) {
        // synchronous error while executing the content function
        console.error('Error while executing tab content function:', err);
        contentPanel.innerHTML = `<div class="text-red-600 p-4">Chyba při načítání: ${escapeHtml(err?.message || String(err))}</div>`;
      }
    }
  });

  // Return API for external control
  return {
    activateTab,
    getActiveTab: () => activeTabIndex,
    updateBadge: (tabIndex, badge) => {
      if (tabIndex >= 0 && tabIndex < tabs.length) {
        const header = tabHeadersList.children[tabIndex];
        // find existing badge by class (match classes set above)
        const existingBadge = header.querySelector('.ml-2.px-2.py-0.5');
        if (existingBadge) {
          existingBadge.textContent = badge;
        } else {
          const badgeEl = document.createElement('span');
          badgeEl.className = 'ml-2 px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-800';
          badgeEl.textContent = badge;
          header.appendChild(badgeEl);
        }
      }
    },
    refresh: (tabIndex) => {
      if (tabIndex !== undefined) {
        const tab = tabs[tabIndex];
        if (typeof tab.content === 'function') {
          const contentPanel = tabContents.children[tabIndex];
          contentPanel.innerHTML = '<div class="text-center py-4">Načítání...</div>';
          try {
            const result = tab.content(contentPanel);
            Promise.resolve(result).then(resolved => {
              if (typeof resolved === 'string') {
                contentPanel.innerHTML = resolved;
              } else if (resolved instanceof HTMLElement) {
                contentPanel.innerHTML = '';
                contentPanel.appendChild(resolved);
              } else {
                if (contentPanel.innerHTML && contentPanel.innerHTML.indexOf('Načítání...') !== -1) {
                  contentPanel.innerHTML = '';
                }
              }
            }).catch(error => {
              contentPanel.innerHTML = `<div class="text-red-600 p-4">Chyba při načítání: ${escapeHtml(error?.message || String(error))}</div>`;
            });
          } catch (err) {
            contentPanel.innerHTML = `<div class="text-red-600 p-4">Chyba při načítání: ${escapeHtml(err?.message || String(err))}</div>`;
          }
        }
      } else {
        // Refresh active tab
        activateTab(activeTabIndex);
      }
    }
  };
}

/**
 * Helper function to create a simple table for displaying related entities
 * @param {Array<Object>} data - Array of data objects
 * @param {Array<Object>} columns - Column definitions
 * @param {Object} options - Options
 * @returns {HTMLElement} Table element
 */
export function createRelatedEntitiesTable(data, columns, options = {}) {
  const {
    emptyMessage = 'Žádná data k zobrazení',
    onRowClick = null,
    className = ''
  } = options;

  const table = document.createElement('table');
  table.className = `min-w-full divide-y divide-gray-200 ${className}`;

  // Create header
  const thead = document.createElement('thead');
  thead.className = 'bg-gray-50';
  const headerRow = document.createElement('tr');
  
  columns.forEach(col => {
    const th = document.createElement('th');
    th.className = 'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider';
    th.textContent = col.label;
    headerRow.appendChild(th);
  });
  
  thead.appendChild(headerRow);
  table.appendChild(thead);

  // Create body
  const tbody = document.createElement('tbody');
  tbody.className = 'bg-white divide-y divide-gray-200';

  if (!data || data.length === 0) {
    const emptyRow = document.createElement('tr');
    const emptyCell = document.createElement('td');
    emptyCell.colSpan = columns.length;
    emptyCell.className = 'px-6 py-4 text-center text-gray-500';
    emptyCell.textContent = emptyMessage;
    emptyRow.appendChild(emptyCell);
    tbody.appendChild(emptyRow);
  } else {
    data.forEach((row, rowIndex) => {
      const tr = document.createElement('tr');
      if (onRowClick) {
        tr.className = 'hover:bg-gray-50 cursor-pointer';
        tr.addEventListener('click', () => onRowClick(row, rowIndex));
      }
      
      columns.forEach(col => {
        const td = document.createElement('td');
        td.className = 'px-6 py-4 whitespace-nowrap text-sm text-gray-900';
        
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
    });
  }

  table.appendChild(tbody);
  return table;
}

// small helper escapeHtml used in error rendering
function escapeHtml(s = '') {
  return ('' + s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

export default {
  renderTabs,
  createRelatedEntitiesTable
};
