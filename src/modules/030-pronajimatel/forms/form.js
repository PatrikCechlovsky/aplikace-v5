// Upravený form.js - 030 Pronajímatel
// Horní sekce (zelená): Detail (edit), Účty (edit), Systém (readonly)
// Spodní sekce (žlutá): Nemovitosti, Jednotky, Nájemníci (readonly tables)

import { setBreadcrumb } from '/src/ui/breadcrumb.js';
import { renderForm } from '/src/ui/form.js';
import { renderCommonActions } from '/src/ui/commonActions.js';
import { renderTabs, createRelatedEntitiesTable } from '/src/ui/tabs.js';
import { navigateTo } from '/src/app.js';
import { getSubject, upsertSubject } from '/src/modules/030-pronajimatel/db.js';
import { listProperties } from '/src/modules/040-nemovitost/db.js';
import { showHistoryModal } from '/src/ui/history.js';
import TYPE_SCHEMAS from '/src/modules/030-pronajimatel/type-schemas.js';
import { fetchFromARES } from '/src/services/ares.js';
import { useUnsavedHelper } from '/src/ui/unsaved-helper.js';
import { setUnsaved } from '/src/app.js';

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

// Small helper to render accounts list and add/remove
function createAccountsUI(subjectData, container, subjectId, onSaved) {
  container.innerHTML = '';
  const accounts = Array.isArray(subjectData?.bank_accounts) ? subjectData.bank_accounts.slice() : [];

  const header = document.createElement('div');
  header.className = 'flex items-center justify-between mb-3';
  header.innerHTML = `<h3 class="text-lg font-semibold">Bankovní účty</h3>`;
  const addBtn = document.createElement('button');
  addBtn.type = 'button';
  addBtn.className = 'ml-2 inline-flex items-center px-3 py-1 border rounded text-sm bg-white hover:bg-gray-50';
  addBtn.textContent = 'Přidat účet';
  header.appendChild(addBtn);
  container.appendChild(header);

  const listEl = document.createElement('div');
  listEl.className = 'space-y-2';
  container.appendChild(listEl);

  function renderList() {
    listEl.innerHTML = '';
    if (accounts.length === 0) {
      listEl.innerHTML = '<div class="text-gray-500 p-2">Žádné účty</div>';
      return;
    }
    accounts.forEach((acc, idx) => {
      const row = document.createElement('div');
      row.className = 'flex items-center justify-between p-2 border rounded';
      row.innerHTML = `
        <div>
          <div class="font-medium">${acc.name || acc.label || 'Bankovní účet'}</div>
          <div class="text-sm text-gray-600">${acc.iban || acc.number || ''}</div>
        </div>
      `;
      const actions = document.createElement('div');
      const del = document.createElement('button');
      del.type = 'button';
      del.className = 'ml-2 inline-flex items-center px-2 py-1 border rounded text-sm bg-red-50 text-red-700';
      del.textContent = 'Smazat';
      del.addEventListener('click', async () => {
        if (!confirm('Opravdu smazat tento účet?')) return;
        accounts.splice(idx, 1);
        // persist change
        try {
          const payload = { id: subjectId, bank_accounts: accounts };
          const { data, error } = await upsertSubject(payload, window.currentUser || null);
          if (error) { alert('Chyba při mazání účtu: ' + (error.message || JSON.stringify(error))); return; }
          onSaved && onSaved(data);
        } catch (e) {
          alert('Chyba: ' + e.message);
        }
      });
      actions.appendChild(del);
      row.appendChild(actions);
      listEl.appendChild(row);
    });
  }

  addBtn.addEventListener('click', async () => {
    // simple prompt-based add; you can replace with modal/form
    const name = prompt('Název účtu (např. KB / Běžný účet):');
    if (name === null) return;
    const number = prompt('IBAN / číslo účtu:');
    if (number === null) return;
    const newAcc = { name: name.trim(), iban: number.trim() };
    accounts.push(newAcc);
    try {
      const payload = { id: subjectId, bank_accounts: accounts };
      const { data, error } = await upsertSubject(payload, window.currentUser || null);
      if (error) { alert('Chyba při ukládání účtu: ' + (error.message || JSON.stringify(error))); return; }
      onSaved && onSaved(data);
    } catch (e) {
      alert('Chyba: ' + e.message);
    }
  });

  renderList();
}

export async function render(root) {
  const { id, type: qtype, mode: modeParam } = getHashParams();
  const type = qtype || 'spolek';
  const mode = (modeParam === 'read') ? 'read' : 'edit';

  // set breadcrumb
  try {
    setBreadcrumb(document.getElementById('crumb'), [
      { icon: 'home',  label: 'Domů', href: '#/' },
      { icon: 'users', label: 'Pronajímatel', href: '#/m/030-pronajimatel' },
      { icon: 'form',  label: 'Formulář' },
      { icon: 'account', label: id ? 'Editace' : `Nový ${type.charAt(0).toUpperCase() + type.slice(1)}` }
    ]);
  } catch (e) {}

  // Load existing data if editing
  let data = {};
  if (id) {
    const { data: sub, error } = await getSubject(id);
    if (error) {
      root.innerHTML = `<div class="p-4 text-red-600">Chyba při načítání: ${error.message || JSON.stringify(error)}</div>`;
      return;
    }
    data = sub || {};
    data.updated_at = formatCzechDate(data.updated_at);
    data.created_at = formatCzechDate(data.created_at);
  }

  // build fields from TYPE_SCHEMAS for the given type
  const schema = TYPE_SCHEMAS[type] || [];
  const fields = schema.map(f => ({ ...f }));

  // layout: top green area (editable tabs), bottom yellow area (readonly related tables)
  root.innerHTML = `
    <div id="commonactions" class="mb-4"></div>
    <div id="green-section" class="p-4 rounded bg-green-50"></div>
    <div id="yellow-section" class="mt-6 p-4 rounded bg-yellow-50"></div>
  `;

  const greenRoot = root.querySelector('#green-section');
  const yellowRoot = root.querySelector('#yellow-section');

  // Top tabs (editable group)
  const topTabs = [
    {
      label: 'Detail pronajímatele',
      icon: '👤',
      content: (container) => {
        // render editable form inside this tab
        const sections = [
          { id: 'profil', label: 'Profil', fields: fields.map(f => f.key) },
          { id: 'system', label: 'Systém', fields: ['archived','created_at','updated_at','updated_by'] }
        ];

        // create a container to render form into
        container.innerHTML = '<div id="profile-form-root"></div>';
        const formContainer = container.querySelector('#profile-form-root');

        renderForm(formContainer, fields, data, async (values) => {
          // submit handler: reuse existing upsertSubject logic
          try {
            const curUser = window.currentUser || null;
            const payload = { ...values, id: id || undefined };
            const { data: saved, error } = await upsertSubject(payload, curUser);
            if (error) {
              alert('Chyba při ukládání: ' + (error.message || JSON.stringify(error)));
              return false;
            }
            alert('Uloženo.');
            // refresh local data & notify
            if (id) {
              const refreshed = await getSubject(id);
              if (refreshed?.data) data = refreshed.data;
            }
            setUnsaved(false);
            return true;
          } catch (e) {
            alert('Chyba při ukládání: ' + e.message);
            return false;
          }
        }, {
          readOnly: mode === 'read' ? true : false,
          showSubmit: false,
          layout: { columns: { base: 1, md: 2, xl: 2 }, density: 'compact' },
          sections
        });

        // attach unsaved helper to the form (if present)
        const formEl = formContainer.querySelector('form');
        if (formEl) useUnsavedHelper(formEl);
      }
    },
    {
      label: 'Účty',
      icon: '💳',
      content: (container) => {
        // Accounts UI - editable; uses upsertSubject to persist bank_accounts
        container.innerHTML = '<div id="accounts-root">Načítání...</div>';
        const accountsRoot = container.querySelector('#accounts-root');
        createAccountsUI(data, accountsRoot, id, (fresh) => {
          // refresh local data after saving accounts
          if (fresh) data = fresh;
        });
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

  // Bottom tabs (readonly group: related entities)
  const bottomTabs = [
    {
      label: 'Nemovitosti',
      icon: '🏢',
      content: async (container) => {
        container.innerHTML = '<div class="text-center py-4">Načítání nemovitostí...</div>';
        try {
          const { data: properties, error: propError } = await listProperties({ landlordId: id, showArchived: false, limit: 1000 });
          if (propError) {
            container.innerHTML = `<div class="text-red-600 p-4">Chyba při načítání nemovitostí: ${propError.message}</div>`;
            return;
          }
          container.innerHTML = '';
          if (!properties || properties.length === 0) {
            container.innerHTML = '<div class="text-gray-500 p-4">Žádné nemovitosti</div>';
            return;
          }
          const table = createRelatedEntitiesTable(
            properties,
            [
              { label: 'Název', field: 'nazev', render: (v) => `<strong>${v || 'Bez názvu'}</strong>` },
              { label: 'Adresa', field: 'ulice', render: (val,row) => `${[val, row.cislo_popisne].filter(Boolean).join(' ')}${row.mesto ? ', ' + row.mesto : ''}` },
              { label: 'Typ', field: 'typ_nemovitosti' },
              { label: 'Vytvořeno', field: 'created_at', render: v => v ? new Date(v).toLocaleDateString('cs-CZ') : '-' }
            ],
            {
              emptyMessage: 'Žádné nemovitosti',
              onRowClick: (row) => { navigateTo(`#/m/040-nemovitost/f/detail?id=${row.id}`); },
              className: 'cursor-pointer'
            }
          );
          container.appendChild(table);
        } catch (e) {
          container.innerHTML = `<div class="text-red-600 p-4">Chyba: ${e.message || 'Neznámá chyba'}</div>`;
        }
      }
    },
    {
      label: 'Jednotky',
      icon: '📦',
      content: async (container) => {
        container.innerHTML = '<div class="text-center py-4">Načítání jednotek...</div>';
        try {
          const { data: properties } = await listProperties({ landlordId: id });
          if (!properties || properties.length === 0) {
            container.innerHTML = '<div class="text-gray-500 p-4">Žádné jednotky</div>';
            return;
          }
          const allUnits = [];
          for (const prop of properties) {
            const mod040 = await import('/src/modules/040-nemovitost/db.js');
            const { data: units } = await mod040.listUnits(prop.id, { showArchived: false });
            if (units && units.length) {
              units.forEach(u => { u.property_name = prop.nazev; allUnits.push(u); });
            }
          }
          if (allUnits.length === 0) {
            container.innerHTML = '<div class="text-gray-500 p-4">Žádné jednotky</div>';
            return;
          }
          const table = createRelatedEntitiesTable(
            allUnits,
            [
              { label: 'Označení', field: 'oznaceni', render: v => `<strong>${v || '-'}</strong>` },
              { label: 'Nemovitost', field: 'property_name' },
              { label: 'Typ', field: 'typ_jednotky' },
              { label: 'Stav', field: 'stav' }
            ],
            {
              emptyMessage: 'Žádné jednotky',
              onRowClick: (row) => { navigateTo(`#/m/040-nemovitost/f/unit-detail?id=${row.id}`); },
              className: 'cursor-pointer'
            }
          );
          container.innerHTML = '';
          container.appendChild(table);
        } catch (e) {
          container.innerHTML = `<div class="text-red-600 p-4">Chyba: ${e.message || 'Neznámá chyba'}</div>`;
        }
      }
    },
    {
      label: 'Nájemníci',
      icon: '👥',
      content: async (container) => {
        container.innerHTML = '<div class="text-center py-4">Načítání nájemníků...</div>';
        // placeholder - lze doplnit dotazem na contracts/tenants
        container.innerHTML = '<div class="text-gray-500 p-4">Funkce pro zobrazení nájemníků bude doplněna.</div>';
      }
    }
  ];

  renderTabs(yellowRoot, bottomTabs, { defaultTab: 0 });

  // common actions (save is form-submission in detail tab)
  const myRole = window.currentUserRole || 'admin';
  const handlers = {
    onSave: () => {
      // if detail tab shows form, submit it by triggering its form element
      const profileForm = greenRoot.querySelector('form');
      if (profileForm) profileForm.requestSubmit();
      else alert('Není nic k uložení');
    },
    onAttach: () => id && window.showAttachmentsModal && window.showAttachmentsModal({ entity: 'subjects', entityId: id }),
    onHistory: () => {
      if (!id) { alert('Historie dostupná po uložení'); return; }
      showHistoryModal(async (subjectId) => {
        return await (await import('/src/modules/030-pronajimatel/db.js')).getSubjectHistory(subjectId);
      }, id);
    },
    onArchive: async () => {
      if (!id) { alert('Uložte nejprve záznam.'); return; }
      const { data, error } = await (await import('/src/modules/030-pronajimatel/db.js')).archiveSubject(id, window.currentUser);
      if (error) alert('Chyba: ' + (error.message || JSON.stringify(error))); else { alert('Archivováno'); navigateTo('#/m/030-pronajimatel/t/prehled'); }
    }
  };

  renderCommonActions(document.getElementById('commonactions'), {
    moduleActions: mode === 'read' ? ['edit','attach','history'] : ['save','attach','archive','history'],
    userRole: myRole,
    handlers
  });
}

export default { render };
