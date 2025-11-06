// Upravený form.js - 050 Nájemník (přidána sekce Účty shodná s Můj účet)
// Opraveno: přidán helper escapeHtml a payments integration

import { setBreadcrumb } from '/src/ui/breadcrumb.js';
import { renderForm } from '/src/ui/form.js';
import { renderCommonActions } from '/src/ui/commonActions.js';
import { navigateTo } from '/src/app.js';
import { getSubject, upsertSubject } from '/src/modules/050-najemnik/db.js';
import { showHistoryModal } from '/src/ui/history.js';
import TYPE_SCHEMAS from '/src/modules/050-najemnik/type-schemas.js';
import { lookupIco } from '/src/lib/ares.js';
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

// escapeHtml helper (same as used in Můj účet)
function escapeHtml(s = '') {
  return String(s ?? '').replace(/[&<>"']/g, m => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[m]));
}

/**
 * Payments/account helpers (same approach as Můj účet)
 */
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
  const type = qtype || 'firma';
  const mode = (modeParam === 'read') ? 'read' : 'edit';

  try {
    setBreadcrumb(document.getElementById('crumb'), [
      { icon: 'home',  label: 'Domů', href: '#/' },
      { icon: 'users', label: 'Nájemník', href: '#/m/050-najemnik' },
      { icon: 'form',  label: 'Formulář' },
      { icon: 'account', label: id ? 'Editace' : `Nový ${type.charAt(0).toUpperCase() + type.slice(1)}` }
    ]);
  } catch (e) {}

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
  const sections = [
    { id: 'profil', label: 'Profil', fields: fields.map(f => f.key) },
    { id: 'system', label: 'Systém', fields: ['archived','created_at','updated_at','updated_by'] }
  ];

  // Render main form
  root.innerHTML = '<div id="tenant-form-root"></div><div id="tenant-accounts-root" class="mt-6"></div>';
  const formHost = root.querySelector('#tenant-form-root');
  const accountsHost = root.querySelector('#tenant-accounts-root');

  renderForm(formHost, fields, data, async (values) => {
    try {
      const curUser = window.currentUser || null;
      const { data: saved, error } = await upsertSubject(values, curUser);
      if (error) {
        alert('Chyba při ukládání: ' + (error.message || JSON.stringify(error)));
        return false;
      }
      alert('Uloženo.');
      setUnsaved(false);
      navigateTo('#/m/050-najemnik/t/prehled');
      return true;
    } catch (e) {
      alert('Chyba při ukládání: ' + e.message);
      return false;
    }
  }, {
    readOnly: mode === 'read',
    showSubmit: false,
    layout: { columns: { base: 1, md: 2, xl: 2 }, density: 'compact' },
    sections
  });

  const formEl = formHost.querySelector('form');
  if (formEl) useUnsavedHelper(formEl);

  // === Accounts UI (same UX as Můj účet) ===
  const paymentsHelpers = await initPaymentsHelpers();
  const { listPaymentAccounts, upsertPaymentAccount, deletePaymentAccount, loadBankCodes } = paymentsHelpers;

  const subjectId = id; // lock the current subject id to avoid closure leaks
  let bankCodes = [];
  let accounts = [];
  let selectedAccount = null;

  async function loadAccounts() {
    if (!subjectId) {
      accounts = [];
      renderAccounts();
      return;
    }
    const { data: accData, error } = await listPaymentAccounts({ profileId: subjectId });
    accounts = (accData && Array.isArray(accData)) ? accData : [];
    renderAccounts();
  }

  async function ensureBankCodes() {
    if (!bankCodes || bankCodes.length === 0) bankCodes = await loadBankCodes();
  }

  async function renderAccounts() {
    // Only render into the dedicated accountsHost; do not clear parent containers
    accountsHost.innerHTML = '';
    await ensureBankCodes();

    const wrap = document.createElement('div');
    wrap.className = 'bg-white border rounded p-4 grid md:grid-cols-2 gap-4';
    accountsHost.appendChild(wrap);

    const left = document.createElement('div');
    left.className = 'min-h-[220px]';
    wrap.appendChild(left);

    const right = document.createElement('div');
    right.className = 'bg-white border rounded p-3';
    wrap.appendChild(right);

    if (!accounts.length) {
      left.innerHTML = '<div class="text-slate-500 p-3">Žádné účty.</div>';
    } else {
      const listEl = document.createElement('div'); listEl.className = 'space-y-2';
      accounts.forEach(a => {
        const bankName = (bankCodes.find(b => b.code === a.bank_code)?.name) || '';
        const labelHtml = `<div class="font-medium">${escapeHtml(a.label || '')} ${a.is_primary ? '<span class="text-xs text-slate-500">• primární</span>' : ''}</div>`;
        const acctHtml = `<div class="text-xs text-slate-500">${escapeHtml(a.account_number || '')}${a.bank_code ? ' / ' + escapeHtml(a.bank_code) : ''}${bankName ? ' — ' + escapeHtml(bankName) : ''}</div>`;
        const row = document.createElement('div');
        row.className = 'p-2 bg-white border rounded cursor-pointer hover:bg-slate-50 flex justify-between items-center';
        row.innerHTML = `<div>${labelHtml}${acctHtml}</div><div><button data-id="${a.id}" class="btn-edit text-xs px-2 py-1 border rounded">Upravit</button></div>`;
        listEl.appendChild(row);

        const editBtn = row.querySelector('.btn-edit');
        if (editBtn) {
          editBtn.addEventListener('click', (ev) => {
            ev.stopPropagation();
            selectedAccount = a;
            renderAccountForm(a, right); // render into the right panel only
          });
        }
      });
      left.appendChild(listEl);
    }

    // initial right form (empty)
    renderAccountForm(null, right);
  }

  function renderAccountForm(account = null, host = null) {
    const container = host || accountsHost.querySelector('.bg-white.border.rounded.p-3');
    if (!container) return;
    const acc = account ? { ...account } : { label: '', bank_code: '', account_number: '', iban: '', currency: 'CZK', is_primary: false };

    const bankOptions = (bankCodes || []).map(b => `<option value="${escapeHtml(b.code)}" ${b.code === acc.bank_code ? 'selected' : ''}>${escapeHtml(b.code)} — ${escapeHtml(b.name)}</option>`).join('');

    container.innerHTML = `
      <div class="space-y-4">
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="text-xs text-slate-600 mb-1 block">Popisek *</label>
            <input name="acc_label" value="${escapeHtml(acc.label)}" class="border rounded px-3 py-2 w-full" />
          </div>
          <div>
            <label class="text-xs text-slate-600 mb-1 block">Banka *</label>
            <select name="acc_bank" class="border rounded px-3 py-2 w-full">
              <option value="">— vyber —</option>
              ${bankOptions}
            </select>
          </div>
        </div>

        <div class="grid grid-cols-3 gap-3">
          <div>
            <label class="text-xs text-slate-600 mb-1 block">Číslo účtu *</label>
            <input name="acc_number" value="${escapeHtml(acc.account_number)}" class="border rounded px-3 py-2 w-full" />
          </div>
          <div>
            <label class="text-xs text-slate-600 mb-1 block">Měna *</label>
            <select name="acc_currency" class="border rounded px-3 py-2 w-full">
              <option value="CZK" ${acc.currency === 'CZK' ? 'selected' : ''}>CZK</option>
              <option value="EUR" ${acc.currency === 'EUR' ? 'selected' : ''}>EUR</option>
              <option value="USD" ${acc.currency === 'USD' ? 'selected' : ''}>USD</option>
            </select>
          </div>
          <div>
            <label class="text-xs text-slate-600 mb-1 block">IBAN (nepovinné)</label>
            <input name="acc_iban" value="${escapeHtml(acc.iban)}" class="border rounded px-3 py-2 w-full" />
          </div>
        </div>

        <div class="flex items-center gap-4">
          <label class="inline-flex items-center gap-2"><input type="checkbox" name="acc_primary" ${acc.is_primary ? 'checked' : ''}/> Hlavní</label>
          <button class="btn-save ml-auto px-3 py-1 border rounded bg-indigo-50 text-indigo-700">Uložit</button>
          ${account ? '<button class="btn-delete px-3 py-1 border rounded text-red-600">Smazat</button>' : ''}
          <button class="btn-add px-3 py-1 border rounded">Nový</button>
        </div>

        <div class="pt-3 border-t text-xs text-slate-500">Seznam účtů najdeš vlevo. Klikni na "Upravit" pro editaci.</div>
      </div>
    `;

    try { useUnsavedHelper(container); } catch (e) { /* ignore */ }

    const btnSave = container.querySelector('.btn-save');
    const btnAdd = container.querySelector('.btn-add');
    const btnDelete = container.querySelector('.btn-delete');

    if (btnAdd) {
      btnAdd.addEventListener('click', (e) => {
        e.preventDefault();
        selectedAccount = null;
        renderAccountForm(null, container);
      });
    }

    if (btnSave) {
      btnSave.addEventListener('click', async (e) => {
        e.preventDefault();
        const payload = {
          label: container.querySelector('[name="acc_label"]').value.trim(),
          bank_code: container.querySelector('[name="acc_bank"]').value,
          account_number: container.querySelector('[name="acc_number"]').value.trim(),
          iban: container.querySelector('[name="acc_iban"]').value.trim() || null,
          currency: container.querySelector('[name="acc_currency"]').value,
          is_primary: !!container.querySelector('[name="acc_primary"]').checked,
          profile_id: subjectId
        };
        if (!payload.label || !payload.account_number || !payload.bank_code || !payload.currency) {
          return alert('Vyplňte prosím povinná pole: Popisek, Banka, Číslo účtu a Měna.');
        }
        if (selectedAccount && selectedAccount.id) payload.id = selectedAccount.id;

        const { data: d, error: err } = await upsertPaymentAccount(payload, window.currentUser);
        if (err) return alert('Chyba při ukládání účtu: ' + (err.message || JSON.stringify(err)));
        // Refresh accounts safely (do not re-render parent tabs)
        await loadAccounts();
        alert('Účet uložen.');
      });
    }

    if (btnDelete) {
      btnDelete.addEventListener('click', async (e) => {
        e.preventDefault();
        if (!selectedAccount || !selectedAccount.id) return alert('Vyberte účet k odstranění.');
        if (!confirm('Opravdu smazat účet?')) return;
        const { data: d, error: err } = await deletePaymentAccount(selectedAccount.id, window.currentUser);
        if (err) return alert('Chyba při mazání: ' + (err.message || JSON.stringify(err)));
        selectedAccount = null;
        await loadAccounts();
      });
    }
  }

  async function setPreferredAccount(accountId) {
    if (!id) return alert('Profil neznámý');
    const payload = { preferred_payment_account_id: accountId };
    const { data, error } = await upsertSubject({ id, ...payload }, window.currentUser);
    if (error) return alert('Chyba při nastavování preferovaného účtu: ' + (error.message || error));
    alert('Preferovaný účet nastaven.');
    await loadAccounts();
  }

  // initial load for accounts area
  bankCodes = await loadBankCodes();
  await loadAccounts();

  // place a small header/tab-like switch above accounts area to mimic Můj účet UX
  const smallTabs = document.createElement('div');
  smallTabs.className = 'flex gap-2 mb-3';
  const btnAccs = document.createElement('button'); btnAccs.type='button'; btnAccs.textContent='Účty'; btnAccs.className='px-3 py-1 border rounded bg-slate-50';
  smallTabs.appendChild(btnAccs);
  accountsHost.prepend(smallTabs);

  // default show accounts list
  // (renderAccounts already called by loadAccounts)
  const myRole = window.currentUserRole || 'admin';
  const handlers = {
    onSave: () => formEl ? formEl.requestSubmit() : null,
    onAttach: () => id && window.showAttachmentsModal && window.showAttachmentsModal({ entity: 'subjects', entityId: id }),
    onHistory: () => {
      if (!id) { alert('Historie dostupná po uložení'); return; }
      showHistoryModal(async (subjectId) => {
        return await (await import('/src/modules/050-najemnik/db.js')).getSubjectHistory(subjectId);
      }, id);
    },
    onArchive: async () => {
      if (!id) { alert('Uložte nejprve záznam.'); return; }
      const { data: d, error: err } = await (await import('/src/modules/050-najemnik/db.js')).archiveSubject(id, window.currentUser);
      if (err) alert('Chyba: ' + (err.message || JSON.stringify(err))); else { alert('Archivováno'); navigateTo('#/m/050-najemnik/t/prehled'); }
    }
  };

  renderCommonActions(document.getElementById('commonactions'), {
    moduleActions: mode === 'read' ? ['edit','attach','history'] : ['save','attach','archive','history'],
    userRole: myRole,
    handlers
  });
}

export default { render };
