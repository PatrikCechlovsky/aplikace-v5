// src/modules/070-sluzby/forms/detail.js
import { renderMetadataForm } from '/src/lib/formRenderer.js';
import { moduleMeta } from '/src/modules/070-sluzby/meta.js';
import { loadModuleMetaCached } from '/src/lib/metaLoader.js';
import { getServiceDefinition } from '/src/modules/070-sluzby/db.js';
import { setBreadcrumb } from '/src/ui/breadcrumb.js';
import { renderCommonActions } from '/src/ui/commonActions.js';
import { renderTabs } from '/src/ui/tabs.js';
import { navigateTo } from '/src/app.js';

// Helper to parse hash params
function getHashParams() {
  const q = (location.hash.split('?')[1] || '');
  return Object.fromEntries(new URLSearchParams(q));
}

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
  
  // Format dates for display
  const formatCzechDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d)) return '';
    return d.toLocaleDateString('cs-CZ') + ' ' + d.toLocaleTimeString('cs-CZ');
  };
  
  data.updated_at = formatCzechDate(data.updated_at);
  data.created_at = formatCzechDate(data.created_at);
  
  // Create main container
  root.innerHTML = '';
  const mainContainer = document.createElement('div');
  mainContainer.className = 'p-4';
  
  // Create tabs container
  const tabsContainer = document.createElement('div');
  tabsContainer.className = 'mt-6';
  mainContainer.appendChild(tabsContainer);
  
  root.appendChild(mainContainer);
  
  // Define tabs according to requirements
  const tabs = [
    {
      label: 'Detail služby',
      icon: '⚙️',
      content: (container) => {
        // Render form in read-only mode using metadata
        renderMetadataForm(
          container,
          enrichedMeta,
          'detail',
          data,
          async () => true,
          {
            readOnly: true,
            showSubmit: false
          }
        );
      }
    },
    {
      label: 'Použití',
      icon: '📊',
      content: `
        <div class="p-4">
          <h3 class="text-lg font-semibold mb-2">Použití služby ve smlouvách</h3>
          <p class="text-gray-500">Funkce pro zobrazení smluv využívajících tuto službu bude doplněna.</p>
        </div>
      `
    },
    {
      label: 'Systém',
      icon: '🔧',
      content: `
        <div class="p-4">
          <h3 class="text-lg font-semibold mb-2">Systémové informace</h3>
          <div class="space-y-2">
            <div><strong>Vytvořeno:</strong> ${data.created_at || '-'}</div>
            <div><strong>Poslední úprava:</strong> ${data.updated_at || '-'}</div>
            <div><strong>Upravil:</strong> ${data.updated_by || '-'}</div>
            <div><strong>Aktivní:</strong> ${data.aktivni ? 'Ano' : 'Ne'}</div>
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
    onWizard: () => {
      alert('Průvodce zatím není k dispozici. Tato funkce bude doplněna.');
    },
    onHistory: () => {
      alert('Historie změn bude doplněna.');
    }
  };
  
  // Render common actions in header area
  renderCommonActions(document.getElementById('commonactions'), {
    moduleActions: ['edit', 'wizard', 'history'],
    userRole: myRole,
    handlers
  });
}
