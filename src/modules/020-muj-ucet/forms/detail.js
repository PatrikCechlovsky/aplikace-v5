/**
 * Module 020 - Můj účet - Detail with tabs
 * Shows overview of user's entities as landlord
 */

import { renderDetailTabsPanel } from '/src/ui/detailTabsPanel.js';
import { getMyProfile } from '/src/db.js';
import { listSubjects } from '/src/db/subjects.js';
import { listProperties, listUnits } from '/src/modules/040-nemovitost/db.js';

export async function render(root) {
  // Get current user profile
  const { data: profile, error: profileError } = await getMyProfile();
  
  if (profileError) {
    root.innerHTML = `<div class="p-4 text-red-600">Chyba při načítání profilu: ${profileError.message}</div>`;
    return;
  }
  
  if (!profile) {
    root.innerHTML = `<div class="p-4 text-red-600">Profil nenalezen.</div>`;
    return;
  }

  // Configure tabs for module 020
  const tabs = [
    {
      key: 'pronajimatel',
      label: 'Pronajímatelé',
      icon: '🏦',
      fetchData: async (userId) => {
        // Fetch subjects where current user is owner/manager
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
        { key: 'primary_email', label: 'Email', type: 'text', readOnly: true },
        { key: 'primary_phone', label: 'Telefon', type: 'text', readOnly: true },
        { key: 'city', label: 'Město', type: 'text', readOnly: true }
      ],
      detailRoute: (row) => `#/m/030-pronajimatel/f/detail?id=${row.id}&type=${row.typ_subjektu}`
    },
    {
      key: 'nemovitost',
      label: 'Nemovitosti',
      icon: '🏢',
      fetchData: async (userId) => {
        // Fetch properties for current user
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
      fetchData: async (userId) => {
        // Fetch units for current user's properties
        const result = await listUnits({ 
          showArchived: false,
          limit: 10
        });
        return result;
      },
      columns: [
        { key: 'nazev', label: 'Název', field: 'nazev' },
        { key: 'typ_jednotky', label: 'Typ', field: 'typ_jednotky' },
        { key: 'plocha', label: 'Plocha (m²)', field: 'plocha' },
        { key: 'najem_mesicni', label: 'Nájem', field: 'najem_mesicni' }
      ],
      detailFields: [
        { key: 'nazev', label: 'Název', type: 'text', readOnly: true },
        { key: 'typ_jednotky', label: 'Typ jednotky', type: 'text', readOnly: true },
        { key: 'plocha', label: 'Plocha (m²)', type: 'number', readOnly: true },
        { key: 'najem_mesicni', label: 'Nájem měsíční', type: 'number', readOnly: true }
      ],
      detailRoute: (row) => `#/m/040-nemovitost/f/unit-detail?id=${row.id}`
    }
  ];

  // Render the detail tabs panel
  await renderDetailTabsPanel(root, {
    moduleId: '020-muj-ucet',
    moduleLabel: 'Můj účet',
    entityId: profile.id,
    entityLabel: profile.display_name || profile.email || 'Můj účet',
    breadcrumbs: [
      { icon: 'home', label: 'Domů', href: '#/' },
      { icon: 'account', label: 'Můj účet', href: '#/m/020-muj-ucet' },
      { icon: 'view', label: 'Přehled' }
    ],
    tabs: tabs,
    activeTab: 'pronajimatel'
  });
}

export default { render };
