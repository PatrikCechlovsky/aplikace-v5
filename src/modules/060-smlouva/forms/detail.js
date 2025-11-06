/**
 * ============================================================================
 * Contract Detail View with Services, Payment Schedule, and Status
 * ============================================================================
 * Shows contract details with related services, payment calendar, and payment status
 * ============================================================================
 */

import { setBreadcrumb } from '/src/ui/breadcrumb.js';
import { renderCommonActions } from '/src/ui/commonActions.js';
import { renderTabs, createRelatedEntitiesTable } from '/src/ui/tabs.js';
import { navigateTo } from '/src/app.js';
import { getContractWithDetails } from '/src/modules/060-smlouva/db.js';
import { listContractServices } from '/src/modules/070-sluzby/db.js';
import { getPaymentSchedule, listPayments } from '/src/modules/080-platby/db.js';
import { showPaymentConfirmationDialog } from '/src/services/paymentActions.js';

// Helper to parse hash params
function getHashParams() {
  const q = (location.hash.split('?')[1] || '');
  return Object.fromEntries(new URLSearchParams(q));
}

function formatCzechDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d)) return '';
  return d.toLocaleDateString('cs-CZ');
}

function formatCurrency(amount) {
  if (!amount) return '-';
  return new Intl.NumberFormat('cs-CZ', { style: 'currency', currency: 'CZK' }).format(amount);
}

export default async function render(root) {
  const { id } = getHashParams();

  if (!id) {
    root.innerHTML = `<div class="p-4 text-red-600">Chybí ID smlouvy.</div>`;
    return;
  }

  // set breadcrumb
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

  // Create main container
  root.innerHTML = `
    <div id="commonactions" class="mb-4"></div>
    <div id="contract-info" class="p-4"></div>
    <div id="contract-tabs" class="mt-6"></div>
  `;

  // Render contract basic info
  const infoContainer = root.querySelector('#contract-info');
  const statusLabels = {
    'koncept': '📝 Koncept',
    'cekajici_podepsani': '⏳ Čeká na podpis',
    'aktivni': '✅ Aktivní',
    'ukoncena': '❌ Ukončená',
    'zrusena': '🚫 Zrušená',
    'propadla': '⚠️ Propadlá'
  };
  
  infoContainer.innerHTML = `
    <div class="bg-white shadow rounded-lg p-6">
      <div class="flex justify-between items-start mb-4">
        <div>
          <h2 class="text-2xl font-bold">${contract.cislo_smlouvy || 'Bez čísla'}</h2>
          <p class="text-gray-600">${contract.nazev || ''}</p>
        </div>
        <div class="text-right">
          <span class="text-2xl">${statusLabels[contract.stav] || contract.stav}</span>
        </div>
      </div>
      <div class="grid grid-cols-3 gap-4">
        <div>
          <h3 class="font-semibold text-sm text-gray-600">Pronajímatel</h3>
          <p class="text-lg">${contract.landlord?.display_name || '-'}</p>
          <p class="text-sm text-gray-500">${contract.landlord?.primary_email || ''}</p>
        </div>
        <div>
          <h3 class="font-semibold text-sm text-gray-600">Nájemník</h3>
          <p class="text-lg">${contract.tenant?.display_name || '-'}</p>
          <p class="text-sm text-gray-500">${contract.tenant?.primary_email || ''}</p>
        </div>
        <div>
          <h3 class="font-semibold text-sm text-gray-600">Jednotka</h3>
          <p class="text-lg">${contract.unit?.oznaceni || '-'}</p>
          <p class="text-sm text-gray-500">${contract.property?.nazev || ''}</p>
        </div>
      </div>
      <div class="grid grid-cols-3 gap-4 mt-4 pt-4 border-t">
        <div>
          <h3 class="font-semibold text-sm text-gray-600">Nájem</h3>
          <p class="text-xl font-bold text-green-600">${formatCurrency(contract.najem_vyse)}</p>
          <p class="text-sm text-gray-500">${contract.periodicita_najmu || 'měsíční'}</p>
        </div>
        <div>
          <h3 class="font-semibold text-sm text-gray-600">Období</h3>
          <p class="text-lg">${formatCzechDate(contract.datum_zacatek)} - ${contract.datum_konec ? formatCzechDate(contract.datum_konec) : 'neurčito'}</p>
        </div>
        <div>
          <h3 class="font-semibold text-sm text-gray-600">Kauce</h3>
          <p class="text-lg">${contract.kauce_potreba ? formatCurrency(contract.kauce_castka) : 'Nevyžadována'}</p>
          <p class="text-sm text-gray-500">${contract.stav_kauce || ''}</p>
        </div>
      </div>
    </div>
  `;

  // Define tabs
  const tabs = [
    {
      label: 'Služby',
      icon: '⚡',
      badge: null,
      content: async (container) => {
        container.innerHTML = '<div class="text-center py-4">Načítání služeb...</div>';
        
        const services = contract.services || [];
        
        container.innerHTML = '';
        
        if (!services || services.length === 0) {
          container.innerHTML = '<div class="text-gray-500 p-4">Žádné služby nejsou přiřazeny ke smlouvě</div>';
          return;
        }

        // Calculate totals
        const totalByPayer = {
          najemnik: 0,
          pronajimatel: 0,
          sdilene: 0
        };
        
        services.forEach(service => {
          const monthly = service.odhadovane_mesicni_naklady || 0;
          totalByPayer[service.plati] = (totalByPayer[service.plati] || 0) + monthly;
        });

        // Create services table
        const table = createRelatedEntitiesTable(
          services,
          [
            { 
              label: 'Služba', 
              field: 'nazev',
              render: (val) => `<strong>${val || '-'}</strong>`
            },
            { 
              label: 'Typ účtování', 
              field: 'typ_uctovani',
              render: (val) => {
                const types = {
                  'pevna_sazba': 'Pevná sazba',
                  'merena_spotreba': 'Měřená spotřeba',
                  'na_pocet_osob': 'Na počet osob',
                  'na_m2': 'Na m²',
                  'procento_z_najmu': '% z nájmu'
                };
                return types[val] || val || '-';
              }
            },
            { 
              label: 'Cena', 
              field: 'cena_za_jednotku',
              render: (val, row) => `${formatCurrency(val)} / ${row.jednotka || 'měsíc'}`
            },
            { 
              label: 'Platí', 
              field: 'plati',
              render: (val) => {
                const payers = {
                  'najemnik': '👤 Nájemník',
                  'pronajimatel': '🏦 Pronajímatel',
                  'sdilene': '🤝 Sdílené'
                };
                return payers[val] || val || '-';
              }
            },
            { 
              label: 'Měsíční náklady', 
              field: 'odhadovane_mesicni_naklady',
              render: (val) => formatCurrency(val)
            }
          ],
          {
            emptyMessage: 'Žádné služby'
          }
        );

        const summaryHtml = `
          <div class="bg-blue-50 p-4 rounded-lg mb-4">
            <h3 class="font-semibold mb-2">Sumář měsíčních nákladů</h3>
            <div class="grid grid-cols-3 gap-4">
              <div>
                <p class="text-sm text-gray-600">Nájemník platí</p>
                <p class="text-xl font-bold text-blue-600">${formatCurrency(totalByPayer.najemnik)}</p>
              </div>
              <div>
                <p class="text-sm text-gray-600">Pronajímatel platí</p>
                <p class="text-xl font-bold text-green-600">${formatCurrency(totalByPayer.pronajimatel)}</p>
              </div>
              <div>
                <p class="text-sm text-gray-600">Sdílené</p>
                <p class="text-xl font-bold text-purple-600">${formatCurrency(totalByPayer.sdilene)}</p>
              </div>
            </div>
          </div>
        `;

        container.innerHTML = `<div class="p-4">${summaryHtml}</div>`;
        container.appendChild(table);
      }
    },
    {
      label: 'Platební kalendář',
      icon: '📅',
      content: async (container) => {
        container.innerHTML = '<div class="text-center py-4">Načítání platebního kalendáře...</div>';
        
        const { data: schedule, error: scheduleError } = await getPaymentSchedule(id);
        
        if (scheduleError) {
          container.innerHTML = `<div class="text-red-600 p-4">Chyba při načítání: ${scheduleError.message}</div>`;
          return;
        }

        container.innerHTML = '';
        
        if (!schedule || schedule.length === 0) {
          container.innerHTML = '<div class="text-gray-500 p-4">Platební kalendář nelze vytvořit</div>';
          return;
        }

        // Get actual payments
        const { data: payments } = await listPayments({ contractId: id });
        const paymentMap = {};
        (payments || []).forEach(p => {
          const date = new Date(p.payment_date).toLocaleDateString('cs-CZ');
          paymentMap[date] = p;
        });

        // Create payment schedule table
        const scheduleHtml = schedule.map((item, index) => {
          const dueDate = formatCzechDate(item.due_date);
          const payment = paymentMap[dueDate];
          const isPaid = payment && payment.status === 'uspesne_rekoncilovano';
          
          return `
            <tr class="${isPaid ? 'bg-green-50' : ''}">
              <td class="px-4 py-2 border">${index + 1}</td>
              <td class="px-4 py-2 border">${dueDate}</td>
              <td class="px-4 py-2 border text-right">${formatCurrency(item.amount)}</td>
              <td class="px-4 py-2 border text-center">
                ${isPaid ? '✅ Zaplaceno' : '⏳ Čeká na platbu'}
              </td>
              <td class="px-4 py-2 border text-right">
                ${payment ? formatCurrency(payment.amount) : '-'}
              </td>
            </tr>
          `;
        }).join('');

        container.innerHTML = `
          <div class="p-4">
            <table class="w-full border-collapse">
              <thead>
                <tr class="bg-gray-100">
                  <th class="px-4 py-2 border text-left">#</th>
                  <th class="px-4 py-2 border text-left">Datum splatnosti</th>
                  <th class="px-4 py-2 border text-right">Částka</th>
                  <th class="px-4 py-2 border text-center">Stav</th>
                  <th class="px-4 py-2 border text-right">Zaplaceno</th>
                </tr>
              </thead>
              <tbody>
                ${scheduleHtml}
              </tbody>
            </table>
          </div>
        `;
      }
    },
    {
      label: 'Platby',
      icon: '💰',
      badge: null,
      content: async (container) => {
        container.innerHTML = '<div class="text-center py-4">Načítání plateb...</div>';
        
        const payments = contract.recent_payments || [];
        
        container.innerHTML = '';
        
        if (!payments || payments.length === 0) {
          container.innerHTML = '<div class="text-gray-500 p-4">Žádné platby</div>';
          return;
        }

        // Create payments table with action column
        const table = createRelatedEntitiesTable(
          payments,
          [
            { 
              label: 'Datum platby', 
              field: 'payment_date',
              render: (val) => formatCzechDate(val)
            },
            { 
              label: 'Částka', 
              field: 'amount',
              render: (val) => `<strong>${formatCurrency(val)}</strong>`
            },
            { 
              label: 'Typ', 
              field: 'payment_type',
              render: (val) => {
                const types = {
                  'najem': '🏠 Nájem',
                  'sluzba': '⚡ Služby',
                  'kauce': '💎 Kauce',
                  'poplatek': '💵 Poplatek',
                  'vratka': '↩️ Vratka'
                };
                return types[val] || val || '-';
              }
            },
            { 
              label: 'Stav', 
              field: 'status',
              render: (val) => {
                const statuses = {
                  'cekajici': '⏳ Čeká',
                  'potvrzeno': '✓ Potvrzeno',
                  'uspesne_rekoncilovano': '✅ Zaplaceno',
                  'selhalo': '❌ Selhalo',
                  'vraceno': '↩️ Vráceno'
                };
                return statuses[val] || val || '-';
              }
            },
            { 
              label: 'Potvrzení', 
              field: 'auto_odeslano_potvrzeni',
              render: (val, row) => {
                const confirmationStatuses = {
                  'neodeslano': '📧 Neodeslán',
                  'fronta': '⏳ Ve frontě',
                  'odeslano': '✅ Odesláno',
                  'selhalo': '❌ Selhalo'
                };
                const status = confirmationStatuses[val] || '📧 Neodeslán';
                
                // Add button to send confirmation
                const buttonId = `confirm-btn-${row.id}`;
                setTimeout(() => {
                  const btn = document.getElementById(buttonId);
                  if (btn) {
                    btn.addEventListener('click', (e) => {
                      e.stopPropagation();
                      showPaymentConfirmationDialog(row.id, {
                        onSuccess: () => {
                          // Refresh the tab
                          alert('Potvrzení bylo odesláno');
                        }
                      });
                    });
                  }
                }, 100);
                
                return `
                  <div>
                    <div class="mb-1">${status}</div>
                    ${val !== 'odeslano' ? `
                      <button 
                        id="${buttonId}"
                        class="text-xs px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600">
                        Odeslat
                      </button>
                    ` : ''}
                  </div>
                `;
              }
            }
          ],
          {
            emptyMessage: 'Žádné platby'
          }
        );

        container.innerHTML = '<div class="p-4"></div>';
        container.querySelector('div').appendChild(table);
      }
    },
    {
      label: 'Strany',
      icon: '👥',
      content: `
        <div class="p-4">
          <div class="grid grid-cols-2 gap-4">
            <div class="bg-white shadow rounded-lg p-4">
              <h3 class="font-semibold text-lg mb-2">Pronajímatel</h3>
              <div class="space-y-2">
                <div><strong>Jméno:</strong> ${contract.landlord?.display_name || '-'}</div>
                <div><strong>Email:</strong> ${contract.landlord?.primary_email || '-'}</div>
                <div><strong>Telefon:</strong> ${contract.landlord?.primary_phone || '-'}</div>
              </div>
              <button 
                onclick="location.hash='#/m/030-pronajimatel/f/detail?id=${contract.landlord?.id}'"
                class="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                Zobrazit detail
              </button>
            </div>
            <div class="bg-white shadow rounded-lg p-4">
              <h3 class="font-semibold text-lg mb-2">Nájemník</h3>
              <div class="space-y-2">
                <div><strong>Jméno:</strong> ${contract.tenant?.display_name || '-'}</div>
                <div><strong>Email:</strong> ${contract.tenant?.primary_email || '-'}</div>
                <div><strong>Telefon:</strong> ${contract.tenant?.primary_phone || '-'}</div>
              </div>
              <button 
                onclick="location.hash='#/m/050-najemnik/f/detail?id=${contract.tenant?.id}'"
                class="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                Zobrazit detail
              </button>
            </div>
          </div>
        </div>
      `
    }
  ];

  renderTabs(root.querySelector('#contract-tabs'), tabs, { defaultTab: 0 });

  // common actions
  const myRole = window.currentUserRole || 'admin';
  const handlers = {
    onEdit: () => navigateTo(`#/m/060-smlouva/f/edit?id=${id}`),
    onAttach: () => window.showAttachmentsModal && window.showAttachmentsModal({ entity: 'contracts', entityId: id }),
    onWizard: () => {
      alert('Průvodce zatím není k dispozici. Tato funkce bude doplněna.');
    },
    onArchive: async () => {
      if (!id) { alert('Chyba: ID smlouvy není k dispozici'); return; }
      const { error } = await (await import('/src/modules/060-smlouva/db.js')).archiveContract(id);
      if (error) alert('Chyba: ' + (error.message || JSON.stringify(error))); 
      else { alert('Smlouva byla archivována'); navigateTo('#/m/060-smlouva/t/prehled'); }
    },
    onHistory: () => {
      alert('Historie změn bude doplněna.');
    }
  };

  renderCommonActions(document.getElementById('commonactions'), {
    moduleActions: ['edit','attach','wizard','archive','history'],
    userRole: myRole,
    handlers
  });
}
