/**
 * Module 080 - Platby - Detail with tabs
 * Shows overview of payment's related entities
 */

import { renderDetailTabsPanel } from '/src/ui/detailTabsPanel.js';
import { getPayment } from '/src/modules/080-platby/db.js';
import { getContract } from '/src/modules/060-smlouva/db.js';

export async function render(root) {
  const q = (location.hash.split('?')[1] || '');
  const params = Object.fromEntries(new URLSearchParams(q));
  const id = params.id;
  
  if (!id) {
    root.innerHTML = `<div class="p-4 text-red-600">Chybí ID platby.</div>`;
    return;
  }

  // Get payment details
  const { data: payment, error: paymentError } = await getPayment(id);
  
  if (paymentError) {
    root.innerHTML = `<div class="p-4 text-red-600">Chyba při načítání platby: ${paymentError.message}</div>`;
    return;
  }
  
  if (!payment) {
    root.innerHTML = `<div class="p-4 text-red-600">Platba nenalezena.</div>`;
    return;
  }

  // Get contract details if available
  let contractDetails = null;
  if (payment.contract?.id) {
    const { data: contract } = await getContract(payment.contract.id);
    contractDetails = contract;
  }

  // Configure tabs for module 080
  const tabs = [
    {
      key: 'smlouva',
      label: 'Smlouva',
      icon: '📄',
      fetchData: async () => {
        // Return contract from payment
        if (contractDetails) {
          return { data: [contractDetails], error: null };
        }
        return { data: [], error: null };
      },
      columns: [
        { key: 'cislo_smlouvy', label: 'Číslo smlouvy', field: 'cislo_smlouvy' },
        { key: 'datum_zacatek', label: 'Začátek', field: 'datum_zacatek' },
        { key: 'datum_konec', label: 'Konec', field: 'datum_konec' },
        { key: 'najem_vyse', label: 'Výše nájmu', field: 'najem_vyse' }
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
      key: 'pronajimatel',
      label: 'Pronajímatel',
      icon: '🏦',
      fetchData: async () => {
        // Return landlord from contract
        if (contractDetails?.landlord) {
          return { data: [contractDetails.landlord], error: null };
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
      key: 'najemnik',
      label: 'Nájemník',
      icon: '👤',
      fetchData: async () => {
        // Return tenant from contract
        if (contractDetails?.tenant) {
          return { data: [contractDetails.tenant], error: null };
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
      key: 'nemovitost',
      label: 'Nemovitost',
      icon: '🏢',
      fetchData: async () => {
        // Return property from contract
        if (contractDetails?.property) {
          return { data: [contractDetails.property], error: null };
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
        if (contractDetails?.unit) {
          const unit = {
            ...contractDetails.unit,
            property_name: contractDetails.property?.nazev || ''
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
    }
  ];

  // Render the detail tabs panel
  await renderDetailTabsPanel(root, {
    moduleId: '080-platby',
    moduleLabel: 'Platby',
    entityId: payment.id,
    entityLabel: `Platba ${payment.payment_date || ''}`,
    breadcrumbs: [
      { icon: 'home', label: 'Domů', href: '#/' },
      { icon: 'payment', label: 'Platby', href: '#/m/080-platby' },
      { icon: 'view', label: 'Přehled' }
    ],
    tabs: tabs,
    activeTab: 'smlouva'
  });
}

export default { render };
