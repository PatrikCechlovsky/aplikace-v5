/**
 * Module 030 - Pronajímatel - Detail with tabs
 * Shows overview of landlord's related entities
 */

import { renderDetailTabsPanel } from '/src/ui/detailTabsPanel.js';
import { getSubject, listSubjects } from '/src/modules/030-pronajimatel/db.js';
import { listProperties, listUnits } from '/src/modules/040-nemovitost/db.js';
import { listContracts } from '/src/modules/060-smlouva/db.js';
import { listPayments } from '/src/modules/080-platby/db.js';

export async function render(root) {
  const q = (location.hash.split('?')[1] || '');
  const params = Object.fromEntries(new URLSearchParams(q));
  const id = params.id;
  
  if (!id) {
    root.innerHTML = `<div class="p-4 text-red-600">Chybí ID pronajímatele.</div>`;
    return;
  }

  // Get landlord details
  const { data: landlord, error: landlordError } = await getSubject(id);
  
  if (landlordError) {
    root.innerHTML = `<div class="p-4 text-red-600">Chyba při načítání pronajímatele: ${landlordError.message}</div>`;
    return;
  }
  
  if (!landlord) {
    root.innerHTML = `<div class="p-4 text-red-600">Pronajímatel nenalezen.</div>`;
    return;
  }

  // Configure tabs for module 030
  const tabs = [
    {
      key: 'nemovitost',
      label: 'Nemovitosti',
      icon: '🏢',
      fetchData: async () => {
        // Fetch properties for this landlord
        const result = await listProperties({ 
          showArchived: false,
          limit: 10
        });
        return result;
      },
      columns: [
        { key: 'nazev', label: 'Název', field: 'nazev' },
        { key: 'typ_nemovitosti', label: 'Typ', field: 'typ_nemovitosti' },
        { key: 'mesto', label: 'Město', field: 'mesto' },
        { key: 'ulice', label: 'Ulice', field: 'ulice' }
      ],
      detailFields: [
        { key: 'nazev', label: 'Název', type: 'text', readOnly: true },
        { key: 'typ_nemovitosti', label: 'Typ nemovitosti', type: 'text', readOnly: true },
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
        // Fetch properties first, then units
        const propertiesResult = await listProperties({ 
          showArchived: false,
          limit: 50
        });
        
        if (propertiesResult.error || !propertiesResult.data || propertiesResult.data.length === 0) {
          return { data: [], error: propertiesResult.error };
        }
        
        // Fetch units for all properties
        const allUnits = [];
        for (const property of propertiesResult.data) {
          const unitsResult = await listUnits(property.id, { 
            showArchived: false,
            limit: 20
          });
          
          if (unitsResult.data && unitsResult.data.length > 0) {
            const unitsWithProperty = unitsResult.data.map(unit => ({
              ...unit,
              property_name: property.nazev,
              property_id: property.id
            }));
            allUnits.push(...unitsWithProperty);
          }
        }
        
        return { data: allUnits.slice(0, 10), error: null };
      },
      columns: [
        { key: 'nazev', label: 'Název', field: 'nazev' },
        { key: 'typ', label: 'Typ', field: 'typ' },
        { key: 'property_name', label: 'Nemovitost', field: 'property_name' },
        { key: 'plocha', label: 'Plocha (m²)', field: 'plocha' }
      ],
      detailFields: [
        { key: 'nazev', label: 'Název', type: 'text', readOnly: true },
        { key: 'typ', label: 'Typ jednotky', type: 'text', readOnly: true },
        { key: 'property_name', label: 'Nemovitost', type: 'text', readOnly: true },
        { key: 'plocha', label: 'Plocha (m²)', type: 'number', readOnly: true }
      ],
      detailRoute: (row) => `#/m/040-nemovitost/f/unit-detail?id=${row.id}`
    },
    {
      key: 'najemnik',
      label: 'Nájemníci',
      icon: '👤',
      fetchData: async () => {
        // Fetch tenants from contracts
        const contractsResult = await listContracts({ 
          landlordId: id,
          showArchived: false,
          limit: 50
        });
        
        if (contractsResult.error || !contractsResult.data) {
          return { data: [], error: contractsResult.error };
        }
        
        // Extract unique tenants
        const tenantsMap = new Map();
        contractsResult.data.forEach(contract => {
          if (contract.tenant) {
            tenantsMap.set(contract.tenant.id, contract.tenant);
          }
        });
        
        return { data: Array.from(tenantsMap.values()).slice(0, 10), error: null };
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
      detailRoute: (row) => `#/m/050-najemnik/f/detail?id=${row.id}`
    },
    {
      key: 'smlouva',
      label: 'Smlouvy',
      icon: '📄',
      fetchData: async () => {
        const result = await listContracts({ 
          landlordId: id,
          showArchived: false,
          limit: 10
        });
        return result;
      },
      columns: [
        { key: 'cislo_smlouvy', label: 'Číslo smlouvy', field: 'cislo_smlouvy' },
        { 
          key: 'tenant_name', 
          label: 'Nájemník', 
          field: 'tenant.display_name',
          render: (value, row) => row.tenant?.display_name || ''
        },
        { 
          key: 'property_name', 
          label: 'Nemovitost', 
          field: 'property.nazev',
          render: (value, row) => row.property?.nazev || ''
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
        // Fetch payments related to this landlord's contracts
        const contractsResult = await listContracts({ 
          landlordId: id,
          showArchived: false,
          limit: 50
        });
        
        if (contractsResult.error || !contractsResult.data) {
          return { data: [], error: contractsResult.error };
        }
        
        // Fetch payments for all contracts
        const allPayments = [];
        for (const contract of contractsResult.data.slice(0, 10)) {
          const paymentsResult = await listPayments({ 
            contractId: contract.id,
            limit: 10
          });
          
          if (paymentsResult.data) {
            allPayments.push(...paymentsResult.data);
          }
        }
        
        return { data: allPayments.slice(0, 10), error: null };
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
    moduleId: '030-pronajimatel',
    moduleLabel: 'Pronajímatel',
    entityId: landlord.id,
    entityLabel: landlord.display_name || 'Pronajímatel',
    breadcrumbs: [
      { icon: 'home', label: 'Domů', href: '#/' },
      { icon: 'users', label: 'Pronajímatel', href: '#/m/030-pronajimatel' },
      { icon: 'view', label: 'Přehled' }
    ],
    tabs: tabs,
    activeTab: 'nemovitost'
  });
}

export default { render };
