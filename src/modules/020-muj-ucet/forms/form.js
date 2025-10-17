// modules/020/f/form.js
// Compat fix v2: default export je DOM form element (má addEventListener),
// zároveň exportujeme render jako named export a přiřazujeme jej i do form.render
// aby byly pokryté různé způsoby importu/volání v appce.

import { setBreadcrumb } from '../../../ui/breadcrumb.js';
import { renderCommonActions } from '../../../ui/commonActions.js';
import { navigateTo } from '../../../app.js';
import { useUnsavedHelper } from '../../../ui/unsaved-helper.js';

function escapeHtml(s) { return String(s ?? '').replace(/[&<>"']/g, m => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[m])); }
function isUuid(v) { return typeof v === 'string' && /^[0-9a-fA-F]{8}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{12}$/.test(v); }

// create actual DOM form element so legacy callers can call .addEventListener on default import
const form = document.createElement('form');
form.className = 'module-020-form-root';
form.style.display = 'none'; // module renders into provided root, keep this hidden

export async function render(root) {
  setBreadcrumb(document.getElementById('crumb'), [
    { icon: 'home', label: 'Domů', href: '#/' },
    { icon: 'account', label: 'Můj účet' }
  ]);

  // load core services with safe fallbacks
  let db = null;
  let payments = null;
  let accountMemberships = null;
  let supabase = null;

  try { db = await import('/src/db.js'); } catch(e){ db = null; }
  try { payments = await import('/src/services/payments.js'); payments = payments.default || payments; } catch(e){ payments = null; }
  try { accountMemberships = await import('/src/services/accountMemberships.js'); accountMemberships = accountMemberships.default || accountMemberships; } catch(e){ accountMemberships = null; }
  try { supabase = (await import('/src/supabase.js')).supabase; } catch(e){ supabase = null; }

  const getMyProfile = (db && (db.getMyProfile || db.getProfile)) ? (db.getMyProfile || db.getProfile) : (async () => ({ data: null, error: new Error('getMyProfile not available') }));
  const updateProfile = (db && (db.updateProfile || db.upsertProfile)) ? (db.updateProfile || db.upsertProfile) : (async () => ({ data: null, error: new Error('updateProfile not available') }));
  const listPaymentAccounts = payments && payments.listPaymentAccounts ? payments.listPaymentAccounts : (async () => ({ data: [], error: null }));
  const upsertPaymentAccount = payments && payments.upsertPaymentAccount ? payments.upsertPaymentAccount : (async () => ({ data: null, error: new Error('upsertPaymentAccount not implemented') }));
  const deletePaymentAccount = payments && payments.deletePaymentAccount ? payments.deletePaymentAccount : (async () => ({ data: null, error: new Error('deletePaymentAccount not implemented') }));

  // container
  root.innerHTML = '';
  const container = document.createElement('div');
  container.className = 'max-w-5xl mx-auto';
  root.appendChild(container);

  // header card with tabs
  const card = document.createElement('div');
  card.className = 'bg-white rounded-2xl border p-4 md:p-6';
  container.appendChild(card);

  const tabs = document.createElement('div');
  tabs.className = 'flex gap-2 mb-4';
  const btnProfile = document.createElement('button'); btnProfile.type='button'; btnProfile.textContent='Profil'; btnProfile.className='px-3 py-1 border rounded bg-slate-50';
  const btnAccounts = document.createElement('button'); btnAccounts.type='button'; btnAccounts.textContent='Účty'; btnAccounts.className='px-3 py-1 border rounded';
  tabs.appendChild(btnProfile); tabs.appendChild(btnAccounts);
  card.appendChild(tabs);

  const contentArea = document.createElement('div'); card.appendChild(contentArea);

  // load profile
  const { data: profileData } = await getMyProfile();
  const profile = profileData || {};
  const globalRole = profile.role || window.currentUserRole || (window.currentUser && window.currentUser.role) || 'user';

  // render profile tab (with role badge above name fields)
  function renderProfile() {
    contentArea.innerHTML = '';

    // role badge on top
    const roleRow = document.createElement('div');
    roleRow.className = 'mb-4';
    roleRow.innerHTML = `<div class="text-sm text-slate-600">Role</div><div class="mt-1 inline-block px-3 py-1 rounded-md bg-indigo-50 text-indigo-700 font-medium">${escapeHtml(String(globalRole))}</div>`;
    contentArea.appendChild(roleRow);

    // form grid (two columns)
    const formGrid = document.createElement('div');
    formGrid.className = 'grid grid-cols-1 md:grid-cols-2 gap-4';
    contentArea.appendChild(formGrid);

    const fields = [
      { key: 'first_name', label: 'Jméno *', value: profile.first_name || '' },
      { key: 'last_name', label: 'Příjmení *', value: profile.last_name || '' },
      { key: 'display_name', label: 'Uživatelské jméno *', value: profile.display_name || '' },
      { key: 'email', label: 'E-mail *', value: profile.email || '' },
      { key: 'phone', label: 'Telefon', value: profile.phone || '' },
      { key: 'street', label: 'Ulice', value: profile.street || '' },
      { key: 'house_number', label: 'Číslo popisné', value: profile.house_number || '' },
      { key: 'city', label: 'Město', value: profile.city || '' },
      { key: 'zip', label: 'PSČ', value: profile.zip || '' }
    ];

    fields.forEach(f => {
      const wrap = document.createElement('div');
      wrap.className = 'flex flex-col';
      wrap.innerHTML = `<label class="text-xs text-slate-600 mb-1">${escapeHtml(f.label)}</label>
        <input name="${escapeHtml(f.key)}" value="${escapeHtml(f.value)}" class="border rounded px-3 py-2 bg-white" />`;
      formGrid.appendChild(wrap);
    });

    renderCommonActions(document.getElementById('commonactions'), {
      moduleActions: ['save','reject'],
      userRole: window.currentUserRole || 'user',
      handlers: {
        onSave: async () => {
          const vals = {};
          fields.forEach(f => {
            const el = contentArea.querySelector(`[name="${f.key}"]`);
            if (el) vals[f.key] = el.value;
          });
          if (!vals.first_name || !vals.last_name || !vals.email) return alert('Vyplňte jméno, příjmení a e-mail.');
          const { data, error } = await updateProfile(profile.id, vals);
          if (error) return alert('Chyba při ukládání: ' + (error.message || error));
          alert('Profil uložen.');
        },
        onReject: () => navigateTo('#/')
      }
    });

    useUnsavedHelper(contentArea.querySelectorAll('input'));
  }

  // ACCOUNTS tab rendering
  let bankCodes = [];
  async function loadBankCodes() {
    if (payments && typeof payments.listBankCodes === 'function') {
      try {
        const res = await payments.listBankCodes();
        bankCodes = res.data || [];
        return;
      } catch(e){}
    }
    if (supabase) {
      try {
        const { data, error } = await supabase.from('bank_codes').select('code,name').order('name', { ascending: true });
        if (!error) bankCodes = data || [];
      } catch(e){}
    }
  }

  let accounts = [];
  let selectedAccount = null;

  async function loadAccounts() {
    const { data, error } = await listPaymentAccounts({ profileId: profile.id });
    accounts = (data && Array.isArray(data)) ? data : [];
    renderAccounts();
  }

  function renderAccounts() {
    contentArea.innerHTML = '';
    const wrap = document.createElement('div');
    wrap.className = 'grid md:grid-cols-2 gap-4';
    contentArea.appendChild(wrap);

    // Left: list of accounts (box)
    const left = document.createElement('div');
    left.className = 'border rounded p-3 bg-slate-50 min-h-[220px]';
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

        row.querySelector('.btn-edit').addEventListener('click', (ev) => {
          ev.stopPropagation();
          selectedAccount = a;
          renderAccountForm(a);
        });
      });
      left.appendChild(listEl);
    }
    wrap.appendChild(left);

    // Right: account form (two-row horizontal form)
    const right = document.createElement('div'); right.className='bg-white border rounded p-3';
    wrap.appendChild(right);
    renderAccountForm(selectedAccount, right);
  }

  function renderAccountForm(account = null, host = null) {
    const container = host || contentArea.querySelector('.bg-white.border.rounded.p-3');
    if (!container) return;
    container.innerHTML = '';

    const acc = account ? { ...account } : { label: '', bank_code: '', account_number: '', iban: '', currency: 'CZK', is_primary: false };

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
              ${bankCodes.map(b => `<option value="${escapeHtml(b.code)}" ${b.code === acc.bank_code ? 'selected' : ''}>${escapeHtml(b.code)} — ${escapeHtml(b.name)}</option>`).join('')}
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

    useUnsavedHelper(container.querySelectorAll('input, select'));

    const btnSave = container.querySelector('.btn-save');
    const btnAdd = container.querySelector('.btn-add');
    const btnDelete = container.querySelector('.btn-delete');

    btnAdd.addEventListener('click', (e) => {
      e.preventDefault();
      selectedAccount = null;
      renderAccountForm(null, container);
    });

    btnSave.addEventListener('click', async (e) => {
      e.preventDefault();
      const payload = {
        label: container.querySelector('[name="acc_label"]').value.trim(),
        bank_code: container.querySelector('[name="acc_bank"]').value,
        account_number: container.querySelector('[name="acc_number"]').value.trim(),
        iban: container.querySelector('[name="acc_iban"]').value.trim() || null,
        currency: container.querySelector('[name="acc_currency"]').value,
        is_primary: !!container.querySelector('[name="acc_primary"]').checked,
        profile_id: profile.id
      };
      if (!payload.label || !payload.account_number || !payload.bank_code || !payload.currency) {
        return alert('Vyplňte prosím povinná pole: Popisek, Banka, Číslo účtu a Měna.');
      }
      if (account && account.id) payload.id = account.id;

      const { data, error } = await upsertPaymentAccount(payload, window.currentUser);
      if (error) return alert('Chyba při ukládání účtu: ' + (error.message || error));
      await loadAccounts();
      alert('Účet uložen.');
    });

    if (btnDelete) {
      btnDelete.addEventListener('click', async (e) => {
        e.preventDefault();
        if (!account || !account.id) return alert('Vyberte účet k odstranění.');
        if (!confirm('Opravdu smazat účet?')) return;
        const { data, error } = await deletePaymentAccount(account.id, window.currentUser);
        if (error) return alert('Chyba při mazání: ' + (error.message || error));
        selectedAccount = null;
        await loadAccounts();
      });
    }
  }

  async function setPreferredAccount(accountId) {
    if (!profile.id) return alert('Profil neznámý');
    const payload = { preferred_payment_account_id: accountId };
    const { data, error } = await updateProfile(profile.id, payload);
    if (error) return alert('Chyba při nastavování preferovaného účtu: ' + (error.message || error));
    profile.preferred_payment_account_id = accountId;
    alert('Preferovaný účet nastaven.');
    await loadAccounts();
  }

  await loadBankCodes();
  await loadAccounts();

  btnProfile.addEventListener('click', () => { btnProfile.classList.add('bg-slate-50'); btnAccounts.classList.remove('bg-slate-50'); renderProfile(); });
  btnAccounts.addEventListener('click', () => { btnAccounts.classList.add('bg-slate-50'); btnProfile.classList.remove('bg-slate-50'); renderAccounts(); });

  renderProfile();
}

// attach render to the form element for backward compatibility with code that expects default export to have render
form.render = render;

// export default as the DOM element so legacy imports like `const form = await import('...')` or default import return an object with addEventListener
export default form;
