/**
 * Module 050 - Nájemník - Detail with tabs
 * Shows overview of tenant's related entities
 */

import { renderDetailTabsPanel } from '/src/ui/detailTabsPanel.js';
import { getSubject } from '/src/modules/050-najemnik/db.js';
import { listSubjects } from '/src/db/subjects.js';
import { listProperties, listUnits } from '/src/modules/040-nemovitost/db.js';
import { listContracts } from '/src/modules/060-smlouva/db.js';
import { listPayments } from '/src/modules/080-platby/db.js';

export async function render(root) {
  const q = (location.hash.split('?')[1] || '');
  const params = Object.fromEntries(new URLSearchParams(q));
  const id = params.id;
  
  if (!id) {
    root.innerHTML = `<div class="p-4 text-red-600">Chybí ID nájemníka.</div>`;
    return;
  }

  // Get tenant details
  const { data: tenant, error: tenantError } = await getSubject(id);
  
  if (tenantError) {
    root.innerHTML = `<div class="p-4 text-red-600">Chyba při načítání nájemníka: ${tenantError.message}</div>`;
    return;
  }
  
  if (!tenant) {
    root.innerHTML = `<div class="p-4 text-red-600">Nájemník nenalezen.</div>`;
    return;
  }

  // Configure tabs for module 050
  const tabs = [
    {
      key: 'pronajimatel',
      label: 'Pronajímatelé',
      icon: '🏦',
      fetchData: async () => {
        // Fetch landlords from tenant's contracts
        const contractsResult = await listContracts({ 
          tenantId: id,
          showArchived: false,
          limit: 50
        });
        
        if (contractsResult.error || !contractsResult.data) {
          return { data: [], error: contractsResult.error };
        }
        
        // Extract unique landlords
        const landlordsMap = new Map();
        contractsResult.data.forEach(contract => {
          if (contract.landlord) {
            landlordsMap.set(contract.landlord.id, contract.landlord);
          }
        });
        
        return { data: Array.from(landlordsMap.values()).slice(0, 10), error: null };
      },
      columns: [
        { key: 'display_name', label: 'Název', field: 'display_name' },
        { key: 'primary_email', label: 'Email', field: 'primary_email' },
        { key: 'primary_phone', label: 'Telefon', field: 'primary_phone' }
      ],
      detailFields: [
        { key: 'display_name', label: 'Název', type: 'text', readOnly: true },
        { key: 'primary_email', label: 'Email', type: 'text', readOnly: true },
        { key: 'primary_phone', label: 'Telefon', type: 'text', readOnly: true }
      ],
      detailRoute: (row) => `#/m/030-pronajimatel/f/detail?id=${row.id}`
    },
    {
      key: 'nemovitost',
      label: 'Nemovitosti',
      icon: '🏢',
      fetchData: async () => {
        // Fetch properties from tenant's contracts
        const contractsResult = await listContracts({ 
          tenantId: id,
          showArchived: false,
          limit: 50
        });
        
        if (contractsResult.error || !contractsResult.data) {
          return { data: [], error: contractsResult.error };
        }
        
        // Extract unique properties
        const propertiesMap = new Map();
        contractsResult.data.forEach(contract => {
          if (contract.property) {
            propertiesMap.set(contract.property.id, contract.property);
          }
        });
        
        return { data: Array.from(propertiesMap.values()).slice(0, 10), error: null };
      },
      columns: [
        { key: 'nazev', label: 'Název', field: 'nazev' },
        { key: 'mesto', label: 'Město', field: 'mesto' },
        { key: 'ulice', label: 'Ulice', field: 'ulice' }
      ],
      detailFields: [
        { key: 'nazev', label: 'Název', type: 'text', readOnly: true },
        { key: 'ulice', label: 'Ulice', type: 'text', readOnly: true },
        { key: 'mesto', label: 'Město', type: 'text', readOnly: true },
        { key: 'psc', label: 'PSČ', type: 'text', readOnly: true }
      ],
      detailRoute: (row) => `#/m/040-nemovitost/f/detail?id=${row.id}`
    },
    {
      key: 'jednotka',
      label: 'Jednotky',
      icon: '📦',
      fetchData: async () => {
        // Fetch units from tenant's contracts
        const contractsResult = await listContracts({ 
          tenantId: id,
          showArchived: false,
          limit: 50
        });
        
        if (contractsResult.error || !contractsResult.data) {
          return { data: [], error: contractsResult.error };
        }
        
        // Extract unique units with property info
        const unitsMap = new Map();
        contractsResult.data.forEach(contract => {
          if (contract.unit) {
            const unit = {
              ...contract.unit,
              property_name: contract.property?.nazev || '',
              property_id: contract.property?.id || ''
            };
            unitsMap.set(contract.unit.id, unit);
          }
        });
        
        return { data: Array.from(unitsMap.values()).slice(0, 10), error: null };
      },
      columns: [
        { key: 'oznaceni', label: 'Označení', field: 'oznaceni' },
        { key: 'typ_jednotky', label: 'Typ', field: 'typ_jednotky' },
        { key: 'property_name', label: 'Nemovitost', field: 'property_name' }
      ],
      detailFields: [
        { key: 'oznaceni', label: 'Označení', type: 'text', readOnly: true },
        { key: 'typ_jednotky', label: 'Typ jednotky', type: 'text', readOnly: true },
        { key: 'property_name', label: 'Nemovitost', type: 'text', readOnly: true },
        { key: 'plocha', label: 'Plocha (m²)', type: 'number', readOnly: true }
      ],
      detailRoute: (row) => `#/m/040-nemovitost/f/unit-detail?id=${row.id}`
    },
    {
      key: 'smlouva',
      label: 'Smlouvy',
      icon: '📄',
      fetchData: async () => {
        const result = await listContracts({ 
          tenantId: id,
          showArchived: false,
          limit: 10
        });
        return result;
      },
      columns: [
        { key: 'cislo_smlouvy', label: 'Číslo smlouvy', field: 'cislo_smlouvy' },
        { 
          key: 'property_name', 
          label: 'Nemovitost', 
          field: 'property.nazev',
          render: (value, row) => row.property?.nazev || ''
        },
        { 
          key: 'unit_oznaceni', 
          label: 'Jednotka', 
          field: 'unit.oznaceni',
          render: (value, row) => row.unit?.oznaceni || ''
        },
        { key: 'datum_zacatek', label: 'Začátek', field: 'datum_zacatek' }
      ],
      detailFields: [
        { key: 'cislo_smlouvy', label: 'Číslo smlouvy', type: 'text', readOnly: true },
        { key: 'datum_zacatek', label: 'Začátek', type: 'date', readOnly: true },
        { key: 'datum_konec', label: 'Konec', type: 'date', readOnly: true },
        { key: 'najem_vyse', label: 'Výše nájmu', type: 'number', readOnly: true }
      ],
      detailRoute: (row) => `#/m/060-smlouva/f/detail?id=${row.id}`
    },
    {
      key: 'platba',
      label: 'Platby',
      icon: '💰',
      fetchData: async () => {
        // Fetch payments for this tenant
        const result = await listPayments({ 
          partyId: id,
          limit: 10
        });
        return result;
      },
      columns: [
        { key: 'payment_date', label: 'Datum', field: 'payment_date' },
        { key: 'amount', label: 'Částka', field: 'amount' },
        { key: 'status', label: 'Stav', field: 'status' },
        { key: 'payment_type', label: 'Typ', field: 'payment_type' }
      ],
      detailFields: [
        { key: 'payment_date', label: 'Datum platby', type: 'date', readOnly: true },
        { key: 'amount', label: 'Částka', type: 'number', readOnly: true },
        { key: 'status', label: 'Stav', type: 'text', readOnly: true },
        { key: 'payment_type', label: 'Typ platby', type: 'text', readOnly: true }
      ],
      detailRoute: (row) => `#/m/080-platby/f/detail?id=${row.id}`
    }
  ];

  // Render the detail tabs panel
  await renderDetailTabsPanel(root, {
    moduleId: '050-najemnik',
    moduleLabel: 'Nájemník',
    entityId: tenant.id,
    entityLabel: tenant.display_name || 'Nájemník',
    breadcrumbs: [
      { icon: 'home', label: 'Domů', href: '#/' },
      { icon: 'user', label: 'Nájemník', href: '#/m/050-najemnik' },
      { icon: 'view', label: 'Přehled' }
    ],
    tabs: tabs,
    activeTab: 'smlouva'
  });
}

export default { render };
