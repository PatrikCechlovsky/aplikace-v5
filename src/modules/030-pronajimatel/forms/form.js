// src/modules/030-pronajimatel/forms/form.js
// Upravený form.js - 030 Pronajímatel
// Účty nyní používají payments integration stejnou jako Můj účet / 050
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

function escapeHtml(s = '') {
  return String(s ?? '').replace(/[&<>"']/g, m => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[m]));
}

async function initPaymentsHelpers() {
  let payments = null;
  let supabase = null;
  try { payments = await import('/src/services/payments.js'); payments = payments.default || payments; } catch (e) { payments = null; }
  try { supabase = (await import('/src/supabase.js')).supabase; } catch (e) { supabase = null; }

  const listPaymentAccounts = payments && payments.listPaymentAccounts ? payments.listPaymentAccounts : (async () => ({ data: [], error: null }));
  const upsertPaymentAccount = payments && payments.upsertPaymentAccount ? payments.upsertPaymentAccount : (async () => ({ data: null, error: new Error('upsertPaymentAccount not implemented') }));
  const deletePaymentAccount = payments && payments.deletePaymentAccount ? payments.deletePaymentAccount : (async () => ({ data: null, error: new Error('deletePaymentAccount not implemented') }));

  async function loadBankCodes() {
    let bankCodes = [];
    if (payments && typeof payments.listBankCodes === 'function') {
      try {
        const res = await payments.listBankCodes();
        bankCodes = (res && res.data) ? res.data : [];
        return bankCodes;
      } catch (e) { /* ignore */ }
    }
    if (supabase) {
      try {
        const { data, error } = await supabase.from('bank_codes').select('code,name').order('name', { ascending: true });
        if (!error && Array.isArray(data)) bankCodes = data;
      } catch (e) { /* ignore */ }
    }
    return bankCodes;
  }

  return { listPaymentAccounts, upsertPaymentAccount, deletePaymentAccount, loadBankCodes };
}

export async function render(root) {
  const { id, type: qtype, mode: modeParam } = getHashParams();
  const type = qtype || 'spolek';
  const mode = (modeParam === 'read') ? 'read' : 'edit';

  // set breadcrumb...
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

  const schema = TYPE_SCHEMAS[type] || [];
  const fields = schema.map(f => ({ ...f }));

  root.innerHTML = `
    <div id="commonactions" class="mb-4"></div>
    <div id="green-section" class="p-4 rounded bg-green-50"></div>
    <div id="yellow-section" class="mt-6 p-4 rounded bg-yellow-50"></div>
  `;

  const greenRoot = root.querySelector('#green-section');
  const yellowRoot = root.querySelector('#yellow-section');

  // Top tabs (Detail, Účty, Systém) - detail includes editable form
  const paymentsHelpers = await initPaymentsHelpers();
  const { listPaymentAccounts, upsertPaymentAccount, deletePaymentAccount, loadBankCodes } = paymentsHelpers;

  // lock subjectId for closures
  const subjectId = id;

  const topTabs = [
    {
      label: 'Detail pronajímatele',
      icon: '👤',
      content: (container) => {
        const sections = [
          { id: 'profil', label: 'Profil', fields: fields.map(f => f.key) },
          { id: 'system', label: 'Systém', fields: ['archived','created_at','updated_at','updated_by'] }
        ];
        container.innerHTML = '<div id="profile-form-root"></div>';
        const formContainer = container.querySelector('#profile-form-root');
        renderForm(formContainer, fields, data, async (values) => {
          try {
            const curUser = window.currentUser || null;
            const payload = { ...values, id: subjectId || undefined };
            const { data: saved, error } = await upsertSubject(payload, curUser);
            if (error) { alert('Chyba při ukládání: ' + (error.message || JSON.stringify(error))); return false; }
            alert('Uloženo.');
            if (subjectId) {
              const refreshed = await getSubject(subjectId);
              if (refreshed?.data) data = refreshed.data;
            }
            setUnsaved(false);
            return true;
          } catch (e) { alert('Chyba při ukládání: ' + e.message); return false; }
        }, { readOnly: mode === 'read', showSubmit: false, layout: { columns: { base: 1, md: 2, xl: 2 }, density: 'compact' }, sections });
        const formEl = formContainer.querySelector('form');
        if (formEl) useUnsavedHelper(formEl);
      }
    },
    {
      label: 'Účty',
      icon: '💳',
      content: (container) => {
        // safe accounts UI: local load/refresh, no parent container rewrites
        (async () => {
          container.innerHTML = '<div class="text-center py-4">Načítání účtů...</div>';
          try {
            const bankCodes = await loadBankCodes();
            let accounts = [];
            let selected = null;

            async function loadAccountsLocal() {
              if (!subjectId) return [];
              const { data: accData } = await listPaymentAccounts({ profileId: subjectId });
              return Array.isArray(accData) ? accData : [];
            }

            async function refresh() {
              accounts = await loadAccountsLocal();
              render();
            }

            function render() {
              container.innerHTML = '';
              const wrap = document.createElement('div'); wrap.className = 'grid md:grid-cols-2 gap-4';
              const left = document.createElement('div'); left.className = 'min-h-[200px] border rounded p-3 bg-slate-50';
              const right = document.createElement('div'); right.className = 'bg-white border rounded p-3';
              wrap.appendChild(left); wrap.appendChild(right);
              container.appendChild(wrap);

              if (!accounts.length) {
                left.innerHTML = '<div class="text-slate-500 p-3">Žádné účty.</div>';
              } else {
                const listEl = document.createElement('div'); listEl.className = 'space-y-2';
                accounts.forEach(a => {
                  const bankName = (bankCodes.find(b => b.code === a.bank_code)?.name) || '';
                  const row = document.createElement('div');
                  row.className = 'p-2 bg-white border rounded cursor-pointer hover:bg-slate-50 flex justify-between items-center';
                  row.innerHTML = `<div><div class="font-medium">${escapeHtml(a.label || '')} ${a.is_primary ? '<span class="text-xs text-slate-500">• primární</span>' : ''}</div><div class="text-xs text-slate-500">${escapeHtml(a.account_number || '')}${a.bank_code ? ' / ' + escapeHtml(a.bank_code) : ''}${bankName ? ' — ' + escapeHtml(bankName) : ''}</div></div><div><button data-id="${a.id}" class="btn-edit text-xs px-2 py-1 border rounded">Upravit</button></div>`;
                  listEl.appendChild(row);
                  row.querySelector('.btn-edit')?.addEventListener('click', (ev) => {
                    ev.stopPropagation();
                    renderRightForm(a, right);
                  });
                });
                left.appendChild(listEl);
              }
              // initial empty right form
              renderRightForm(null, right);
            }

            function renderRightForm(account = null, host = null) {
              selected = account;
              const acc = account ? { ...account } : { label: '', bank_code: '', account_number: '', iban: '', currency: 'CZK', is_primary: false };
              const containerRight = host;
              containerRight.innerHTML = `
                <div class="space-y-4">
                  <div class="grid grid-cols-2 gap-3">
                    <div><label class="text-xs text-slate-600 mb-1 block">Popisek *</label><input name="acc_label" value="${escapeHtml(acc.label)}" class="border rounded px-3 py-2 w-full" /></div>
                    <div><label class="text-xs text-slate-600 mb-1 block">Banka *</label><select name="acc_bank" class="border rounded px-3 py-2 w-full"><option value="">— vyber —</option>${(bankCodes||[]).map(b=>`<option value="${escapeHtml(b.code)}" ${b.code===acc.bank_code?'selected':''}>${escapeHtml(b.code)} — ${escapeHtml(b.name)}</option>`).join('')}</select></div>
                  </div>
                  <div class="grid grid-cols-3 gap-3">
                    <div><label class="text-xs text-slate-600 mb-1 block">Číslo účtu *</label><input name="acc_number" value="${escapeHtml(acc.account_number)}" class="border rounded px-3 py-2 w-full" /></div>
                    <div><label class="text-xs text-slate-600 mb-1 block">Měna *</label><select name="acc_currency" class="border rounded px-3 py-2 w-full"><option value="CZK" ${acc.currency==='CZK'?'selected':''}>CZK</option><option value="EUR" ${acc.currency==='EUR'?'selected':''}>EUR</option><option value="USD" ${acc.currency==='USD'?'selected':''}>USD</option></select></div>
                    <div><label class="text-xs text-slate-600 mb-1 block">IBAN (nepovinné)</label><input name="acc_iban" value="${escapeHtml(acc.iban)}" class="border rounded px-3 py-2 w-full" /></div>
                  </div>
                  <div class="flex items-center gap-4">
                    <label class="inline-flex items-center gap-2"><input type="checkbox" name="acc_primary" ${acc.is_primary ? 'checked' : ''}/> Hlavní</label>
                    <button class="btn-save ml-auto px-3 py-1 border rounded bg-indigo-50 text-indigo-700">Uložit</button>
                    ${account ? '<button class="btn-delete px-3 py-1 border rounded text-red-600">Smazat</button>' : ''}
                    <button class="btn-add px-3 py-1 border rounded">Nový</button>
                  </div>
                </div>
              `;
              try { useUnsavedHelper(containerRight); } catch (e) {}
              const btnSave = containerRight.querySelector('.btn-save');
              const btnAdd = containerRight.querySelector('.btn-add');
              const btnDelete = containerRight.querySelector('.btn-delete');

              if (btnAdd) btnAdd.addEventListener('click', (e) => { e.preventDefault(); renderRightForm(null, containerRight); });
              if (btnSave) btnSave.addEventListener('click', async (e) => {
                e.preventDefault();
                const payload = {
                  label: containerRight.querySelector('[name="acc_label"]').value.trim(),
                  bank_code: containerRight.querySelector('[name="acc_bank"]').value,
                  account_number: containerRight.querySelector('[name="acc_number"]').value.trim(),
                  iban: containerRight.querySelector('[name="acc_iban"]').value.trim() || null,
                  currency: containerRight.querySelector('[name="acc_currency"]').value,
                  is_primary: !!containerRight.querySelector('[name="acc_primary"]').checked,
                  profile_id: subjectId
                };
                if (!payload.label || !payload.account_number || !payload.bank_code || !payload.currency) {
                  return alert('Vyplňte prosím povinná pole: Popisek, Banka, Číslo účtu a Měna.');
                }
                if (selected && selected.id) payload.id = selected.id;
                const { data: d, error: err } = await upsertPaymentAccount(payload, window.currentUser);
                if (err) return alert('Chyba při ukládání účtu: ' + (err.message || JSON.stringify(err)));
                await refresh();
                alert('Účet uložen.');
              });
              if (btnDelete) btnDelete.addEventListener('click', async (e) => {
                e.preventDefault();
                if (!selected || !selected.id) return alert('Vyberte účet k odstranění.');
                if (!confirm('Opravdu smazat účet?')) return;
                const { data: d, error: err } = await deletePaymentAccount(selected.id, window.currentUser);
                if (err) return alert('Chyba při mazání: ' + (err.message || JSON.stringify(err)));
                await refresh();
              });
            }

            // initial load & render
            await refresh();
          } catch (e) {
            container.innerHTML = `<div class="text-red-600 p-4">Chyba při načítání účtů: ${escapeHtml(e?.message || String(e))}</div>`;
          }
        })();
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

  // Bottom tabs (readonly related entities) left unchanged (Nemovitosti, Jednotky)...
  const bottomTabs = [
    {
      label: 'Nemovitosti',
      icon: '🏢',
      content: async (container) => {
        container.innerHTML = '<div class="text-center py-4">Načítání nemovitostí...</div>';
        try {
          const { data: properties, error: propError } = await listProperties({ landlordId: subjectId, showArchived: false, limit: 1000 });
          if (propError) { container.innerHTML = `<div class="text-red-600 p-4">Chyba při načítání nemovitostí: ${propError.message}</div>`; return; }
          container.innerHTML = '';
          if (!properties || properties.length === 0) { container.innerHTML = '<div class="text-gray-500 p-4">Žádné nemovitosti</div>'; return; }
          const table = createRelatedEntitiesTable(
            properties,
            [
              { label: 'Název', field: 'nazev', render: (v) => `<strong>${v || 'Bez názvu'}</strong>` },
              { label: 'Adresa', field: 'ulice', render: (val,row) => `${[val, row.cislo_popisne].filter(Boolean).join(' ')}${row.mesto ? ', ' + row.mesto : ''}` },
              { label: 'Typ', field: 'typ_nemovitosti' },
              { label: 'Vytvořeno', field: 'created_at', render: v => v ? new Date(v).toLocaleDateString('cs-CZ') : '-' }
            ],
            { emptyMessage: 'Žádné nemovitosti', onRowClick: (row) => { navigateTo(`#/m/040-nemovitost/f/detail?id=${row.id}`); }, className: 'cursor-pointer' }
          );
          container.appendChild(table);
        } catch (e) { container.innerHTML = `<div class="text-red-600 p-4">Chyba: ${escapeHtml(e?.message || String(e))}</div>`; }
      }
    },
    {
      label: 'Jednotky',
      icon: '📦',
      content: async (container) => {
        container.innerHTML = '<div class="text-center py-4">Načítání jednotek...</div>';
        try {
          const { data: properties } = await listProperties({ landlordId: subjectId });
          if (!properties || properties.length === 0) { container.innerHTML = '<div class="text-gray-500 p-4">Žádné jednotky</div>'; return; }
          const allUnits = [];
          for (const prop of properties) {
            const mod040 = await import('/src/modules/040-nemovitost/db.js');
            const { data: units } = await mod040.listUnits(prop.id, { showArchived: false });
            if (units && units.length) units.forEach(u => { u.property_name = prop.nazev; allUnits.push(u); });
          }
          if (allUnits.length === 0) { container.innerHTML = '<div class="text-gray-500 p-4">Žádné jednotky</div>'; return; }
          const table = createRelatedEntitiesTable(
            allUnits,
            [
              { label: 'Označení', field: 'oznaceni', render: v => `<strong>${v || '-'}</strong>` },
              { label: 'Nemovitost', field: 'property_name' },
              { label: 'Typ', field: 'typ_jednotky' },
              { label: 'Stav', field: 'stav' }
            ],
            { emptyMessage: 'Žádné jednotky', onRowClick: (row) => { navigateTo(`#/m/040-nemovitost/f/unit-detail?id=${row.id}`); }, className: 'cursor-pointer' }
          );
          container.innerHTML = '';
          container.appendChild(table);
        } catch (e) { container.innerHTML = `<div class="text-red-600 p-4">Chyba: ${escapeHtml(e?.message || String(e))}</div>`; }
      }
    }
  ];

  renderTabs(yellowRoot, bottomTabs, { defaultTab: 0 });

  // Common actions (unchanged)
  renderCommonActions(document.getElementById('commonactions'), {
    moduleActions: ['save','attach','archive','history'],
    userRole: window.currentUserRole || 'admin',
    handlers: {
      onSave: () => {
        const profileForm = greenRoot.querySelector('form');
        if (profileForm) profileForm.requestSubmit();
        else alert('Není nic k uložení');
      },
      onAttach: () => subjectId && window.showAttachmentsModal && window.showAttachmentsModal({ entity: 'subjects', entityId: subjectId }),
      onHistory: () => {
        if (!subjectId) { alert('Historie dostupná po uložení'); return; }
        showHistoryModal(async (subjectId) => {
          return await (await import('/src/modules/030-pronajimatel/db.js')).getSubjectHistory(subjectId);
        }, subjectId);
      },
      onArchive: async () => {
        if (!subjectId) { alert('Uložte nejprve záznam.'); return; }
        const { data, error } = await (await import('/src/modules/030-pronajimatel/db.js')).archiveSubject(subjectId, window.currentUser);
        if (error) alert('Chyba: ' + (error.message || JSON.stringify(error))); else { alert('Archivováno'); navigateTo('#/m/030-pronajimatel/t/prehled'); }
      }
    }
  });
}

export default { render };
