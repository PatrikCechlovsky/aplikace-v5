/**
 * ============================================================================
 * 060-smlouva Detail View - Unified Master Tabs Implementation
 * ============================================================================
 * Displays contract details with master tabs showing all related entities
 * Following the unified UX pattern with table + detail view
 * ============================================================================
 */

import { setBreadcrumb } from '/src/ui/breadcrumb.js';
import { renderForm } from '/src/ui/form.js';
import { renderCommonActions } from '/src/ui/commonActions.js';
import { renderTabs } from '/src/ui/tabs.js';
import { createTableWithDetail, createMasterTabsConfig } from '/src/ui/masterTabsDetail.js';
import { navigateTo } from '/src/app.js';
import { getContractWithDetails, listContracts } from '/src/modules/060-smlouva/db.js';
import { listContractServices } from '/src/modules/070-sluzby/db.js';
import { listPayments } from '/src/modules/080-platby/db.js';
import { getSubject } from '/src/modules/050-najemnik/db.js';

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
  return d.toLocaleDateString('cs-CZ');
}

// Helper to format currency
function formatCurrency(amount) {
  if (!amount) return '-';
  return new Intl.NumberFormat('cs-CZ', { style: 'currency', currency: 'CZK' }).format(amount);
}

// Helper to escape HTML
function escapeHtml(s = '') {
  return String(s ?? '').replace(/[&<>"']/g, m => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[m]));
}

/**
 * Main render function for contract detail view
 */
export default async function render(root) {
  const { id } = getHashParams();

  if (!id) {
    root.innerHTML = `<div class="p-4 text-red-600">Chybí ID smlouvy.</div>`;
    return;
  }

  // Set breadcrumb
  try {
    setBreadcrumb(document.getElementById('crumb'), [
      { icon: 'home',  label: 'Domů', href: '#/' },
      { icon: 'file', label: 'Smlouvy', href: '#/m/060-smlouva' },
      { icon: 'eye', label: 'Detail smlouvy' }
    ]);
  } catch (e) {}

  // Load contract data with details
  const { data: contract, error } = await getContractWithDetails(id);
  if (error) {
    root.innerHTML = `<div class="p-4 text-red-600">Chyba při načítání smlouvy: ${error.message || JSON.stringify(error)}</div>`;
    return;
  }
  if (!contract) {
    root.innerHTML = `<div class="p-4 text-red-600">Smlouva nenalezena.</div>`;
    return;
  }

  // Prepare main container
  root.innerHTML = '';
  const mainContainer = document.createElement('div');
  mainContainer.className = 'p-4';
  
  // Contract header summary
  const headerDiv = document.createElement('div');
  headerDiv.className = 'bg-white shadow rounded-lg p-6 mb-6';
  
  const statusLabels = {
    'koncept': '📝 Koncept',
    'cekajici_podepsani': '⏳ Čeká na podpis',
    'aktivni': '✅ Aktivní',
    'ukoncena': '❌ Ukončená',
    'zrusena': '🚫 Zrušená',
    'propadla': '⚠️ Propadlá'
  };
  
  headerDiv.innerHTML = `
    <div class="flex justify-between items-start mb-4">
      <div>
        <h2 class="text-2xl font-bold">${escapeHtml(contract.cislo_smlouvy || 'Bez čísla')}</h2>
        <p class="text-gray-600">${escapeHtml(contract.nazev || '')}</p>
      </div>
      <div class="text-right">
        <span class="text-2xl">${statusLabels[contract.stav] || contract.stav}</span>
      </div>
    </div>
    <div class="grid grid-cols-3 gap-4">
      <div>
        <h3 class="font-semibold text-sm text-gray-600">Pronajímatel</h3>
        <p class="text-lg">${escapeHtml(contract.landlord?.display_name || '-')}</p>
      </div>
      <div>
        <h3 class="font-semibold text-sm text-gray-600">Nájemník</h3>
        <p class="text-lg">${escapeHtml(contract.tenant?.display_name || '-')}</p>
      </div>
      <div>
        <h3 class="font-semibold text-sm text-gray-600">Jednotka</h3>
        <p class="text-lg">${escapeHtml(contract.unit?.oznaceni || '-')}</p>
        <p class="text-sm text-gray-500">${escapeHtml(contract.property?.nazev || '')}</p>
      </div>
    </div>
    <div class="grid grid-cols-3 gap-4 mt-4 pt-4 border-t">
      <div>
        <h3 class="font-semibold text-sm text-gray-600">Nájem</h3>
        <p class="text-xl font-bold text-green-600">${formatCurrency(contract.najem_vyse)}</p>
      </div>
      <div>
        <h3 class="font-semibold text-sm text-gray-600">Období</h3>
        <p class="text-lg">${formatCzechDate(contract.datum_zacatek)} - ${contract.datum_konec ? formatCzechDate(contract.datum_konec) : 'neurčito'}</p>
      </div>
      <div>
        <h3 class="font-semibold text-sm text-gray-600">Kauce</h3>
        <p class="text-lg">${contract.kauce_potreba ? formatCurrency(contract.kauce_castka) : 'Nevyžadována'}</p>
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
      label: tabsConfig.labels.smlouva,
      icon: tabsConfig.icons.smlouva,
      content: (container) => {
        // Show contract detail as form
        const contractDiv = document.createElement('div');
        contractDiv.className = 'bg-white rounded-lg p-4';
        
        const fields = [
          { key: 'cislo_smlouvy', label: 'Číslo smlouvy', type: 'text', readOnly: true },
          { key: 'nazev', label: 'Název', type: 'text', readOnly: true },
          { key: 'stav', label: 'Stav', type: 'text', readOnly: true },
          { key: 'datum_zacatek', label: 'Datum začátku', type: 'date', readOnly: true },
          { key: 'datum_konec', label: 'Datum konce', type: 'date', readOnly: true },
          { key: 'najem_vyse', label: 'Výše nájmu', type: 'number', readOnly: true },
          { key: 'kauce_potreba', label: 'Kauce požadována', type: 'checkbox', readOnly: true },
          { key: 'kauce_castka', label: 'Výše kauce', type: 'number', readOnly: true }
        ];
        
        renderForm(contractDiv, fields, contract, null, {
          readOnly: true,
          showSubmit: false,
          layout: { columns: { base: 1, md: 2 }, density: 'compact' }
        });
        
        container.appendChild(contractDiv);
        
        // Add system metadata
        const metadataDiv = document.createElement('div');
        metadataDiv.className = 'bg-gray-50 rounded-lg p-4 mt-4';
        metadataDiv.innerHTML = `
          <h4 class="font-semibold mb-2">Systémové informace</h4>
          <div class="grid grid-cols-2 gap-2 text-sm">
            <div><strong>Vytvořeno:</strong> ${formatCzechDate(contract.created_at) || '-'}</div>
            <div><strong>Upraveno:</strong> ${formatCzechDate(contract.updated_at) || '-'}</div>
            <div><strong>Upravil:</strong> ${escapeHtml(contract.updated_by || '-')}</div>
            <div><strong>Archivováno:</strong> ${contract.archived ? 'Ano' : 'Ne'}</div>
          </div>
        `;
        container.appendChild(metadataDiv);
      }
    },
    {
      label: tabsConfig.labels.sluzba,
      icon: tabsConfig.icons.sluzba,
      content: async (container) => {
        container.innerHTML = '<div class="text-center py-4">Načítání služeb...</div>';
        
        try {
          const services = contract.services || [];
          
          const tableDetail = createTableWithDetail({
            data: services,
            columns: [
              { 
                label: 'Služba', 
                field: 'service_definition',
                render: (v) => v ? `<strong>${escapeHtml(v.nazev || '-')}</strong>` : '-'
              },
              { 
                label: 'Typ účtování', 
                field: 'typ_uctovani',
                render: (v) => {
                  const types = {
                    'pevna_sazba': 'Pevná sazba',
                    'merena_spotreba': 'Měřená spotřeba',
                    'na_pocet_osob': 'Na počet osob',
                    'na_m2': 'Na m²'
                  };
                  return types[v] || v || '-';
                }
              },
              { 
                label: 'Cena', 
                field: 'cena_za_jednotku',
                render: (v, row) => formatCurrency(v)
              },
              { 
                label: 'Platí', 
                field: 'plati',
                render: (v) => {
                  const payers = {
                    'najemnik': '👤 Nájemník',
                    'pronajimatel': '🏦 Pronajímatel',
                    'sdilene': '🤝 Sdílené'
                  };
                  return payers[v] || v || '-';
                }
              }
            ],
            emptyMessage: 'Není přiřazeno',
            detailFields: [
              { key: 'typ_uctovani', label: 'Typ účtování', type: 'text' },
              { key: 'cena_za_jednotku', label: 'Cena za jednotku', type: 'number' },
              { key: 'plati', label: 'Platí', type: 'text' },
              { key: 'odhadovane_mesicni_naklady', label: 'Měsíční náklady', type: 'number' }
            ],
            formatDetailData: (row) => ({
              ...row,
              typ_uctovani: row.typ_uctovani,
              cena_za_jednotku: formatCurrency(row.cena_za_jednotku),
              odhadovane_mesicni_naklady: formatCurrency(row.odhadovane_mesicni_naklady)
            }),
            moduleLink: (row) => `#/m/070-sluzby/f/detail?id=${row.service_definition_id}`
          });
          
          container.innerHTML = '';
          container.appendChild(tableDetail);
        } catch (e) {
          container.innerHTML = `<div class="text-red-600 p-4">${escapeHtml(e.message)}</div>`;
        }
      }
    },
    {
      label: tabsConfig.labels.platba,
      icon: tabsConfig.icons.platba,
      content: async (container) => {
        container.innerHTML = '<div class="text-center py-4">Načítání plateb...</div>';
        
        try {
          const payments = contract.recent_payments || [];
          let allPayments = payments;
          
          // If we have less than 10, fetch more
          if (payments.length < 10) {
            const { data: morePayments } = await listPayments({ contractId: id });
            allPayments = morePayments || payments;
          }
          
          const tableDetail = createTableWithDetail({
            data: allPayments,
            columns: [
              { 
                label: 'Datum platby', 
                field: 'payment_date',
                render: (v) => formatCzechDate(v)
              },
              { 
                label: 'Částka', 
                field: 'amount',
                render: (v) => `<strong>${formatCurrency(v)}</strong>`,
                className: 'text-right'
              },
              { 
                label: 'Typ', 
                field: 'payment_type',
                render: (v) => {
                  const types = {
                    'najem': '🏠 Nájem',
                    'sluzba': '⚡ Služby',
                    'kauce': '💎 Kauce',
                    'poplatek': '💵 Poplatek'
                  };
                  return types[v] || v || '-';
                }
              },
              { 
                label: 'Stav', 
                field: 'status',
                render: (v) => {
                  const statuses = {
                    'cekajici': '⏳ Čeká',
                    'potvrzeno': '✓ Potvrzeno',
                    'uspesne_rekoncilovano': '✅ Zaplaceno',
                    'selhalo': '❌ Selhalo'
                  };
                  return statuses[v] || v || '-';
                }
              }
            ],
            emptyMessage: 'Není přiřazeno',
            detailFields: [
              { key: 'payment_date', label: 'Datum platby', type: 'date' },
              { key: 'amount', label: 'Částka', type: 'number' },
              { key: 'payment_type', label: 'Typ platby', type: 'text' },
              { key: 'status', label: 'Stav', type: 'text' },
              { key: 'payment_method', label: 'Způsob platby', type: 'text' }
            ],
            formatDetailData: (row) => ({
              ...row,
              amount: formatCurrency(row.amount),
              payment_date: formatCzechDate(row.payment_date)
            }),
            moduleLink: '#/m/080-platby/f/detail?id=:id'
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
              <div>${formatCzechDate(contract.created_at) || '-'}</div>
              
              <div><strong class="text-gray-600">Poslední úprava:</strong></div>
              <div>${formatCzechDate(contract.updated_at) || '-'}</div>
              
              <div><strong class="text-gray-600">Upravil:</strong></div>
              <div>${escapeHtml(contract.updated_by || '-')}</div>
              
              <div><strong class="text-gray-600">Archivováno:</strong></div>
              <div>${contract.archived ? 'Ano' : 'Ne'}</div>
            </div>
          </div>
        </div>
      `
    }
  ];

  // Render tabs
  renderTabs(tabsContainer, tabs, { defaultTab: 0 });

  // Render common actions
  const myRole = window.currentUserRole || 'admin';
  const handlers = {
    onEdit: () => navigateTo(`#/m/060-smlouva/f/edit?id=${id}`),
    onAttach: () => window.showAttachmentsModal && window.showAttachmentsModal({ entity: 'contracts', entityId: id }),
    onHistory: () => {
      alert('Historie změn bude doplněna.');
    },
    onArchive: async () => {
      if (!id) { alert('Chyba: ID smlouvy není k dispozici'); return; }
      const confirmed = confirm('Opravdu chcete archivovat tuto smlouvu?');
      if (!confirmed) return;
      const { error } = await (await import('/src/modules/060-smlouva/db.js')).archiveContract(id);
      if (error) alert('Chyba: ' + (error.message || JSON.stringify(error))); 
      else { alert('Smlouva byla archivována'); navigateTo('#/m/060-smlouva/t/prehled'); }
    }
  };

  renderCommonActions(document.getElementById('commonactions'), {
    moduleActions: ['edit','attach','history','archive'],
    userRole: myRole,
    handlers
  });
}
