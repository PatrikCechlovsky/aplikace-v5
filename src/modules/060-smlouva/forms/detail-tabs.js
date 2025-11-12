/**
 * Module 060 - Smlouva - Detail with tabs
 * Shows overview of contract's related entities
 */

import { renderDetailTabsPanel } from '/src/ui/detailTabsPanel.js';
import { getContract } from '/src/modules/060-smlouva/db.js';
import { listPayments } from '/src/modules/080-platby/db.js';

export async function render(root) {
  const q = (location.hash.split('?')[1] || '');
  const params = Object.fromEntries(new URLSearchParams(q));
  const id = params.id;
  
  if (!id) {
    root.innerHTML = `<div class="p-4 text-red-600">Chybí ID smlouvy.</div>`;
    return;
  }

  // Get contract details
  const { data: contract, error: contractError } = await getContract(id);
  
  if (contractError) {
    root.innerHTML = `<div class="p-4 text-red-600">Chyba při načítání smlouvy: ${contractError.message}</div>`;
    return;
  }
  
  if (!contract) {
    root.innerHTML = `<div class="p-4 text-red-600">Smlouva nenalezena.</div>`;
    return;
  }

  // Configure tabs for module 060
  const tabs = [
    {
      key: 'pronajimatel',
      label: 'Pronajímatel',
      icon: '🏦',
      fetchData: async () => {
        // Return landlord from contract
        if (contract.landlord) {
          return { data: [contract.landlord], error: null };
        }
        return { data: [], error: null };
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
      label: 'Nemovitost',
      icon: '🏢',
      fetchData: async () => {
        // Return property from contract
        if (contract.property) {
          return { data: [contract.property], error: null };
        }
        return { data: [], error: null };
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
      label: 'Jednotka',
      icon: '📦',
      fetchData: async () => {
        // Return unit from contract
        if (contract.unit) {
          const unit = {
            ...contract.unit,
            property_name: contract.property?.nazev || ''
          };
          return { data: [unit], error: null };
        }
        return { data: [], error: null };
      },
      columns: [
        { key: 'oznaceni', label: 'Označení', field: 'oznaceni' },
        { key: 'typ_jednotky', label: 'Typ', field: 'typ_jednotky' },
        { key: 'property_name', label: 'Nemovitost', field: 'property_name' },
        { key: 'plocha', label: 'Plocha (m²)', field: 'plocha' }
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
      key: 'najemnik',
      label: 'Nájemník',
      icon: '👤',
      fetchData: async () => {
        // Return tenant from contract
        if (contract.tenant) {
          return { data: [contract.tenant], error: null };
        }
        return { data: [], error: null };
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
      key: 'platba',
      label: 'Platby',
      icon: '💰',
      fetchData: async () => {
        // Fetch payments for this contract
        const result = await listPayments({ 
          contractId: id,
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
    moduleId: '060-smlouva',
    moduleLabel: 'Smlouva',
    entityId: contract.id,
    entityLabel: contract.cislo_smlouvy || 'Smlouva',
    breadcrumbs: [
      { icon: 'home', label: 'Domů', href: '#/' },
      { icon: 'document', label: 'Smlouva', href: '#/m/060-smlouva' },
      { icon: 'view', label: 'Přehled' }
    ],
    tabs: tabs,
    activeTab: 'najemnik'
  });
}

export default { render };
