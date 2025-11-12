/**
 * Module 040 - Nemovitost - Detail with tabs
 * Shows overview of property's related entities
 */

import { renderDetailTabsPanel } from '/src/ui/detailTabsPanel.js';
import { getProperty, listUnits } from '/src/modules/040-nemovitost/db.js';
import { listSubjects } from '/src/db/subjects.js';
import { listContracts } from '/src/modules/060-smlouva/db.js';
import { listPayments } from '/src/modules/080-platby/db.js';

export async function render(root) {
  const q = (location.hash.split('?')[1] || '');
  const params = Object.fromEntries(new URLSearchParams(q));
  const id = params.id;
  
  if (!id) {
    root.innerHTML = `<div class="p-4 text-red-600">Chybí ID nemovitosti.</div>`;
    return;
  }

  // Get property details
  const { data: property, error: propertyError } = await getProperty(id);
  
  if (propertyError) {
    root.innerHTML = `<div class="p-4 text-red-600">Chyba při načítání nemovitosti: ${propertyError.message}</div>`;
    return;
  }
  
  if (!property) {
    root.innerHTML = `<div class="p-4 text-red-600">Nemovitost nenalezena.</div>`;
    return;
  }

  // Configure tabs for module 040
  const tabs = [
    {
      key: 'pronajimatel',
      label: 'Pronajímatelé',
      icon: '🏦',
      fetchData: async () => {
        // Fetch landlords who own this property
        const result = await listSubjects({ 
          role: 'pronajimatel',
          showArchived: false,
          limit: 10
        });
        return result;
      },
      columns: [
        { 
          key: 'typ_subjektu', 
          label: 'Typ', 
          field: 'typ_subjektu',
          render: (value) => {
            const badges = {
              'osoba': { color: '#3B82F6', label: 'FO' },
              'osvc': { color: '#8B5CF6', label: 'OSVČ' },
              'firma': { color: '#10B981', label: 'PO' },
              'spolek': { color: '#F59E0B', label: 'Spolek' },
              'stat': { color: '#EF4444', label: 'Stát' }
            };
            const badge = badges[value] || { color: '#6B7280', label: value };
            return `<span style="background:${badge.color};color:#fff;padding:2px 12px;border-radius:14px;font-size:0.9em;font-weight:600;display:inline-block;min-width:60px;text-align:center;">${badge.label}</span>`;
          }
        },
        { key: 'display_name', label: 'Název', field: 'display_name' },
        { key: 'ico', label: 'IČO', field: 'ico' },
        { key: 'city', label: 'Město', field: 'city' }
      ],
      detailFields: [
        { key: 'display_name', label: 'Název', type: 'text', readOnly: true },
        { key: 'typ_subjektu', label: 'Typ subjektu', type: 'text', readOnly: true },
        { key: 'ico', label: 'IČO', type: 'text', readOnly: true },
        { key: 'primary_email', label: 'Email', type: 'text', readOnly: true }
      ],
      detailRoute: (row) => `#/m/030-pronajimatel/f/detail?id=${row.id}&type=${row.typ_subjektu}`
    },
    {
      key: 'jednotka',
      label: 'Jednotky',
      icon: '📦',
      fetchData: async () => {
        const result = await listUnits(id, { 
          showArchived: false,
          limit: 10
        });
        return result;
      },
      columns: [
        { key: 'nazev', label: 'Název', field: 'nazev' },
        { key: 'typ', label: 'Typ', field: 'typ' },
        { key: 'plocha', label: 'Plocha (m²)', field: 'plocha' },
        { key: 'oznaceni', label: 'Označení', field: 'oznaceni' }
      ],
      detailFields: [
        { key: 'nazev', label: 'Název', type: 'text', readOnly: true },
        { key: 'typ', label: 'Typ jednotky', type: 'text', readOnly: true },
        { key: 'plocha', label: 'Plocha (m²)', type: 'number', readOnly: true },
        { key: 'oznaceni', label: 'Označení', type: 'text', readOnly: true }
      ],
      detailRoute: (row) => `#/m/040-nemovitost/f/unit-detail?id=${row.id}`
    },
    {
      key: 'najemnik',
      label: 'Nájemníci',
      icon: '👤',
      fetchData: async () => {
        // Fetch tenants from contracts for this property
        const contractsResult = await listContracts({ 
          showArchived: false,
          limit: 50
        });
        
        if (contractsResult.error || !contractsResult.data) {
          return { data: [], error: contractsResult.error };
        }
        
        // Filter contracts for this property and extract unique tenants
        const tenantsMap = new Map();
        contractsResult.data
          .filter(contract => contract.property?.id === id)
          .forEach(contract => {
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
        const contractsResult = await listContracts({ 
          showArchived: false,
          limit: 50
        });
        
        if (contractsResult.error || !contractsResult.data) {
          return { data: [], error: contractsResult.error };
        }
        
        // Filter contracts for this property
        const propertyContracts = contractsResult.data.filter(
          contract => contract.property?.id === id
        ).slice(0, 10);
        
        return { data: propertyContracts, error: null };
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
        // Fetch payments related to this property's contracts
        const contractsResult = await listContracts({ 
          showArchived: false,
          limit: 50
        });
        
        if (contractsResult.error || !contractsResult.data) {
          return { data: [], error: contractsResult.error };
        }
        
        // Filter contracts for this property
        const propertyContracts = contractsResult.data.filter(
          contract => contract.property?.id === id
        );
        
        // Fetch payments for these contracts
        const allPayments = [];
        for (const contract of propertyContracts.slice(0, 10)) {
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
    moduleId: '040-nemovitost',
    moduleLabel: 'Nemovitost',
    entityId: property.id,
    entityLabel: property.nazev || 'Nemovitost',
    breadcrumbs: [
      { icon: 'home', label: 'Domů', href: '#/' },
      { icon: 'building', label: 'Nemovitost', href: '#/m/040-nemovitost' },
      { icon: 'view', label: 'Přehled' }
    ],
    tabs: tabs,
    activeTab: 'jednotka'
  });
}

export default { render };
