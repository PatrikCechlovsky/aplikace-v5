// Upravený detail.js - 030 Pronajímatel (read-only top tabs + readonly bottom related lists)
import { setBreadcrumb } from '/src/ui/breadcrumb.js';
import { renderForm } from '/src/ui/form.js';
import { renderCommonActions } from '/src/ui/commonActions.js';
import { renderTabs, createRelatedEntitiesTable } from '/src/ui/tabs.js';
import { navigateTo } from '/src/app.js';
import { getSubject } from '/src/modules/030-pronajimatel/db.js';
import { listProperties, listUnits } from '/src/modules/040-nemovitost/db.js';
import { showHistoryModal } from '/src/ui/history.js';
import TYPE_SCHEMAS from '/src/modules/030-pronajimatel/type-schemas.js';

function formatCzechDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d)) return '';
  return d.toLocaleDateString('cs-CZ') + ' ' + d.toLocaleTimeString('cs-CZ');
}

export async function render(root) {
  const q = (location.hash.split('?')[1] || '');
  const params = Object.fromEntries(new URLSearchParams(q));
  const id = params.id;
  const type = params.type || 'spolek';

  if (!id) {
    root.innerHTML = `<div class="p-4 text-red-600">Chybí ID pronajímatele.</div>`;
    return;
  }

  try {
    setBreadcrumb(document.getElementById('crumb'), [
      { icon: 'home',  label: 'Domů', href: '#/' },
      { icon: 'users', label: 'Pronajímatel', href: '#/m/030-pronajimatel' },
      { icon: 'account', label: 'Detail' }
    ]);
  } catch (e) {}

  const { data, error } = await getSubject(id);
  if (error) {
    root.innerHTML = `<div class="p-4 text-red-600">Chyba při načítání: ${error.message || JSON.stringify(error)}</div>`;
    return;
  }
  if (!data) {
    root.innerHTML = `<div class="p-4 text-red-600">Pronajímatel nenalezen.</div>`;
    return;
  }

  data.updated_at = formatCzechDate(data.updated_at);
  data.created_at = formatCzechDate(data.created_at);

  const schema = TYPE_SCHEMAS[type] || [];
  const fields = schema.map(f => ({ ...f, readOnly: true }));

  root.innerHTML = `
    <div id="commonactions" class="mb-4"></div>
    <div id="green-section" class="p-4 rounded bg-green-50"></div>
    <div id="yellow-section" class="mt-6 p-4 rounded bg-yellow-50"></div>
  `;
  const greenRoot = root.querySelector('#green-section');
  const yellowRoot = root.querySelector('#yellow-section');

  // Top tabs
  const topTabs = [
    {
      label: 'Detail pronajímatele',
      icon: '👤',
      content: (container) => {
        const sections = [
          { id: 'profil', label: 'Profil', fields: fields.map(f => f.key) },
          { id: 'system', label: 'Systém', fields: ['archived','created_at','updated_at','updated_by'] }
        ];
        renderForm(container, fields, data, null, { readOnly: true, showSubmit: false, layout: { columns: { base:1, md:2 }, density: 'compact' }, sections});
      }
    },
    {
      label: 'Účty',
      icon: '💳',
      content: (container) => {
        container.innerHTML = '<div class="p-2">';
        const accounts = Array.isArray(data?.bank_accounts) ? data.bank_accounts : [];
        if (accounts.length === 0) {
          container.innerHTML += '<div class="text-gray-500 p-2">Žádné účty</div>';
        } else {
          accounts.forEach(acc => {
            container.innerHTML += `<div class="p-2 border rounded mb-2"><div class="font-medium">${acc.name || acc.label || 'Bankovní účet'}</div><div class="text-sm text-gray-600">${acc.iban || acc.number || ''}</div></div>`;
          });
        }
        container.innerHTML += '</div>';
      }
    },
    {
      label: 'Systém',
      icon: '⚙️',
      content: (container) => {
        container.innerHTML = `
          <div class="p-4">
            <h3 class="text-lg font-semibold mb-2">Systémové informace</h3>
            <div class="space-y-2">
              <div><strong>Vytvořeno:</strong> ${data.created_at || '-'}</div>
              <div><strong>Poslední úprava:</strong> ${data.updated_at || '-'}</div>
              <div><strong>Upravil:</strong> ${data.updated_by || '-'}</div>
              <div><strong>Archivní:</strong> ${data.archived ? 'Ano' : 'Ne'}</div>
            </div>
          </div>
        `;
      }
    }
  ];

  renderTabs(greenRoot, topTabs, { defaultTab: 0 });

  // bottom tabs
  const bottomTabs = [
    {
      label: 'Nemovitosti',
      icon: '🏢',
      content: async (container) => {
        container.innerHTML = '<div class="text-center py-4">Načítání nemovitostí...</div>';
        const { data: properties, error: propError } = await listProperties({ landlordId: id, showArchived: false, limit: 1000 });
        if (propError) {
          container.innerHTML = `<div class="text-red-600 p-4">Chyba při načítání nemovitostí: ${propError.message}</div>`;
          return;
        }
        if (!properties || properties.length === 0) {
          container.innerHTML = '<div class="text-gray-500 p-4">Žádné nemovitosti</div>';
          return;
        }
        const table = createRelatedEntitiesTable(properties, [
          { label: 'Název', field: 'nazev', render: v=> `<strong>${v || 'Bez názvu'}</strong>` },
          { label: 'Adresa', field: 'ulice', render: (val,row) => `${[val, row.cislo_popisne].filter(Boolean).join(' ')}${row.mesto ? ', ' + row.mesto : ''}` },
          { label: 'Typ', field: 'typ_nemovitosti' },
          { label: 'Vytvořeno', field: 'created_at', render: v => v ? new Date(v).toLocaleDateString('cs-CZ') : '-' }
        ], { emptyMessage: 'Žádné nemovitosti', onRowClick: row => navigateTo(`#/m/040-nemovitost/f/detail?id=${row.id}`), className: 'cursor-pointer' });
        container.innerHTML = '';
        container.appendChild(table);
      }
    },
    {
      label: 'Jednotky',
      icon: '📦',
      content: async (container) => {
        container.innerHTML = '<div class="text-center py-4">Načítání jednotek...</div>';
        const { data: properties } = await listProperties({ landlordId: id });
        if (!properties || properties.length === 0) {
          container.innerHTML = '<div class="text-gray-500 p-4">Žádné jednotky</div>';
          return;
        }
        const allUnits = [];
        for (const prop of properties) {
          const { data: units } = await listUnits(prop.id, { showArchived: false });
          if (units && units.length) units.forEach(u => { u.property_name = prop.nazev; allUnits.push(u); });
        }
        if (allUnits.length === 0) {
          container.innerHTML = '<div class="text-gray-500 p-4">Žádné jednotky</div>';
          return;
        }
        const table = createRelatedEntitiesTable(allUnits, [
          { label: 'Označení', field: 'oznaceni', render: v=> `<strong>${v || '-'}</strong>` },
          { label: 'Nemovitost', field: 'property_name' },
          { label: 'Typ', field: 'typ_jednotky' },
          { label: 'Stav', field: 'stav' }
        ], { emptyMessage: 'Žádné jednotky', onRowClick: row => navigateTo(`#/m/040-nemovitost/f/unit-detail?id=${row.id}`), className: 'cursor-pointer' });
        container.innerHTML = '';
        container.appendChild(table);
      }
    },
    {
      label: 'Nájemníci',
      icon: '👥',
      content: (container) => { container.innerHTML = '<div class="text-gray-500 p-4">Funkce pro zobrazení nájemníků bude doplněna.</div>'; }
    }
  ];

  renderTabs(yellowRoot, bottomTabs, { defaultTab: 0 });

  const handlers = {
    onAttach: () => id && window.showAttachmentsModal && window.showAttachmentsModal({ entity: 'subjects', entityId: id }),
    onWizard: () => alert('Průvodce zatím není k dispozici.'),
    onHistory: () => {
      if (!id) { alert('Historie dostupná po uložení'); return; }
      showHistoryModal(async (subjectId) => {
        return await (await import('/src/modules/030-pronajimatel/db.js')).getSubjectHistory(subjectId);
      }, id);
    }
  };

  renderCommonActions(document.getElementById('commonactions'), {
    moduleActions: ['attach','wizard','history'],
    userRole: window.currentUserRole || 'admin',
    handlers
  });
}

export default { render };
