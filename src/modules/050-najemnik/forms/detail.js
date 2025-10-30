/**
 * ============================================================================
 * Nájemník Detail View with Tabs
 * ============================================================================
 * Shows tenant details with active contracts, units, and landlords
 * ============================================================================
 */

import { setBreadcrumb } from '/src/ui/breadcrumb.js';
import { renderForm } from '/src/ui/form.js';
import { renderCommonActions } from '/src/ui/commonActions.js';
import { renderTabs, createRelatedEntitiesTable } from '/src/ui/tabs.js';
import { navigateTo } from '/src/app.js';
import { getSubject } from '/src/modules/050-najemnik/db.js';
import { listContracts } from '/src/modules/060-smlouva/db.js';
import { showHistoryModal } from '/src/ui/history.js';
import TYPE_SCHEMAS from '/src/modules/050-najemnik/type-schemas.js';

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
  const type = qtype || 'osoba';

  if (!id) {
    root.innerHTML = `<div class="p-4 text-red-600">Chybí ID nájemníka.</div>`;
    return;
  }

  // set breadcrumb
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

  // Create form container
  const formContainer = document.createElement('div');
  formContainer.className = 'mb-6';
  mainContainer.appendChild(formContainer);

  // Create tabs container
  const tabsContainer = document.createElement('div');
  tabsContainer.className = 'mt-6';
  mainContainer.appendChild(tabsContainer);

  root.appendChild(mainContainer);

  // Render form (readonly)
  const sections = [
    { id: 'profil', label: 'Profil', fields: fields.map(f => f.key) },
    { id: 'system', label: 'Systém', fields: ['archived','created_at','updated_at','updated_by'] }
  ];

  renderForm(formContainer, fields, data, null, {
    readOnly: true,
    showSubmit: false,
    layout: { columns: { base: 1, md: 2, xl: 2 }, density: 'compact' },
    sections
  });

  // Define tabs
  const tabs = [
    {
      label: 'Přehled',
      icon: '📋',
      content: `
        <div class="p-4">
          <h3 class="text-lg font-semibold mb-2">Základní informace</h3>
          <div class="grid grid-cols-2 gap-4">
            <div><strong>Jméno:</strong> ${data.display_name || '-'}</div>
            <div><strong>Email:</strong> ${data.primary_email || '-'}</div>
            <div><strong>Telefon:</strong> ${data.primary_phone || '-'}</div>
            <div><strong>Adresa:</strong> ${data.ulice || ''} ${data.cislo_popisne || ''}, ${data.mesto || ''} ${data.psc || ''}</div>
          </div>
        </div>
      `
    },
    {
      label: 'Smlouvy',
      icon: '📄',
      badge: null,
      content: async (container) => {
        container.innerHTML = '<div class="text-center py-4">Načítání smluv...</div>';
        
        // Load contracts for this tenant
        const { data: contracts, error: contractsError } = await listContracts({ tenantId: id });
        
        if (contractsError) {
          container.innerHTML = `<div class="text-red-600 p-4">Chyba při načítání smluv: ${contractsError.message}</div>`;
          return;
        }

        container.innerHTML = '';
        
        if (!contracts || contracts.length === 0) {
          container.innerHTML = '<div class="text-gray-500 p-4">Žádné smlouvy</div>';
          return;
        }

        // Create table with contracts
        const table = createRelatedEntitiesTable(
          contracts,
          [
            { 
              label: 'Číslo smlouvy', 
              field: 'cislo_smlouvy',
              render: (val) => `<strong>${val || 'Bez čísla'}</strong>`
            },
            { 
              label: 'Jednotka', 
              field: 'unit',
              render: (val) => val ? `${val.oznaceni || '-'} (${val.typ_jednotky || '-'})` : '-'
            },
            { 
              label: 'Nemovitost', 
              field: 'property',
              render: (val) => val ? `${val.nazev || '-'}, ${val.mesto || '-'}` : '-'
            },
            { 
              label: 'Stav', 
              field: 'stav',
              render: (val) => {
                const statusLabels = {
                  'koncept': '📝 Koncept',
                  'cekajici_podepsani': '⏳ Čeká na podpis',
                  'aktivni': '✅ Aktivní',
                  'ukoncena': '❌ Ukončená',
                  'zrusena': '🚫 Zrušená'
                };
                return statusLabels[val] || val || '-';
              }
            },
            { 
              label: 'Nájem', 
              field: 'najem_vyse',
              render: (val) => val ? `${val} Kč/měsíc` : '-'
            },
            { 
              label: 'Začátek', 
              field: 'datum_zacatek',
              render: (val) => val ? new Date(val).toLocaleDateString('cs-CZ') : '-'
            }
          ],
          {
            emptyMessage: 'Žádné smlouvy',
            onRowClick: (row) => {
              navigateTo(`#/m/060-smlouva/f/detail?id=${row.id}`);
            },
            className: 'cursor-pointer'
          }
        );

        container.appendChild(table);
      }
    },
    {
      label: 'Bydliště',
      icon: '🏠',
      content: async (container) => {
        container.innerHTML = '<div class="text-center py-4">Načítání aktivních bydlišť...</div>';
        
        // Load active contracts
        const { data: contracts, error: contractsError } = await listContracts({ 
          tenantId: id,
          status: 'aktivni'
        });
        
        if (contractsError) {
          container.innerHTML = `<div class="text-red-600 p-4">Chyba při načítání: ${contractsError.message}</div>`;
          return;
        }

        container.innerHTML = '';
        
        if (!contracts || contracts.length === 0) {
          container.innerHTML = '<div class="text-gray-500 p-4">Žádné aktivní bydliště</div>';
          return;
        }

        // Show active residences
        const residencesHtml = contracts.map(contract => {
          const unit = contract.unit || {};
          const property = contract.property || {};
          const landlord = contract.landlord || {};
          
          return `
            <div class="bg-white shadow rounded-lg p-4 mb-4">
              <h4 class="font-semibold text-lg mb-2">${property.nazev || 'Nemovitost bez názvu'}</h4>
              <div class="grid grid-cols-2 gap-2 text-sm">
                <div><strong>Adresa:</strong> ${property.ulice || ''} ${property.mesto || ''}</div>
                <div><strong>Jednotka:</strong> ${unit.oznaceni || '-'}</div>
                <div><strong>Typ:</strong> ${unit.typ_jednotky || '-'}</div>
                <div><strong>Plocha:</strong> ${unit.plocha ? unit.plocha + ' m²' : '-'}</div>
                <div><strong>Nájem:</strong> ${contract.najem_vyse ? contract.najem_vyse + ' Kč/měsíc' : '-'}</div>
                <div><strong>Smlouva:</strong> ${contract.cislo_smlouvy || '-'}</div>
                <div><strong>Pronajímatel:</strong> ${landlord.display_name || '-'}</div>
                <div><strong>Od:</strong> ${contract.datum_zacatek ? new Date(contract.datum_zacatek).toLocaleDateString('cs-CZ') : '-'}</div>
              </div>
              <div class="mt-4 space-x-2">
                <button 
                  onclick="location.hash='#/m/040-nemovitost/f/unit-detail?id=${unit.id}'"
                  class="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600">
                  Detail jednotky
                </button>
                <button 
                  onclick="location.hash='#/m/060-smlouva/f/detail?id=${contract.id}'"
                  class="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600">
                  Detail smlouvy
                </button>
              </div>
            </div>
          `;
        }).join('');

        container.innerHTML = `<div class="p-4">${residencesHtml}</div>`;
      }
    },
    {
      label: 'Kontakty',
      icon: '📞',
      content: `
        <div class="p-4">
          <h3 class="text-lg font-semibold mb-2">Kontaktní údaje</h3>
          <div class="space-y-2">
            <div><strong>Email:</strong> ${data.primary_email || '-'}</div>
            <div><strong>Telefon:</strong> ${data.primary_phone || '-'}</div>
            <div><strong>Trvalá adresa:</strong> ${data.ulice || ''} ${data.cislo_popisne || ''}, ${data.mesto || ''} ${data.psc || ''}</div>
          </div>
        </div>
      `
    }
  ];

  // Render tabs
  renderTabs(tabsContainer, tabs, { defaultTab: 0 });

  // common actions
  const myRole = window.currentUserRole || 'admin';
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
      const { data, error } = await (await import('/src/modules/050-najemnik/db.js')).archiveSubject(id, window.currentUser);
      if (error) alert('Chyba: ' + (error.message || JSON.stringify(error))); else { alert('Archivováno'); navigateTo('#/m/050-najemnik/t/prehled'); }
    }
  };

  // render common actions in header area
  renderCommonActions(document.getElementById('commonactions'), {
    moduleActions: ['edit','attach','archive','history'],
    userRole: myRole,
    handlers
  });
}

export default { render };
