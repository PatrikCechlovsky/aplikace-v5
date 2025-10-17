// modules/020/f/form.js
// Můj účet — formulář + účty (rozšíření: zobrazit roli uživatele pro každý účet a nastavit preferovaný účet)

import { setBreadcrumb } from '../../../ui/breadcrumb.js';
import { renderForm } from '../../../ui/form.js';
import { renderCommonActions } from '../../../ui/commonActions.js';
import { navigateTo } from '../../../app.js';
import { useUnsavedHelper } from '../../../ui/unsaved-helper.js';

const PROFILE_FIELDS = [
  { key: 'first_name', label: 'Jméno', type: 'text', required: true },
  { key: 'last_name',  label: 'Příjmení', type: 'text', required: true },
  { key: 'display_name', label: 'Uživatelské jméno', type: 'text', required: true },
  { key: 'email', label: 'E-mail', type: 'email', required: true },
  { key: 'phone', label: 'Telefon', type: 'text' },
  { key: 'street', label: 'Ulice', type: 'text' },
  { key: 'house_number', label: 'Číslo popisné', type: 'text' },
  { key: 'city', label: 'Město', type: 'text' },
  { key: 'zip', label: 'PSČ', type: 'text' }
];

const PAYMENT_FIELDS = [
  { key: 'label', label: 'Popisek', type: 'text', required: true },
  { key: 'bank_name', label: 'Banka', type: 'text' },
  { key: 'account_number', label: 'Číslo účtu / IBAN', type: 'text', required: true },
  { key: 'currency', label: 'Měna', type: 'text', placeholder: 'CZK' },
  { key: 'is_primary', label: 'Hlavní', type: 'checkbox' }
];

function escapeHtml(s) { return String(s ?? '').replace(/[&<>"']/g, m => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[m])); }

export async function render(root) {
  setBreadcrumb(document.getElementById('crumb'), [
    { icon: 'home', label: 'Domů', href: '#/' },
    { icon: 'account', label: 'Můj účet' }
  ]);

  // lazy services
  let getMyProfile, updateProfile, listPaymentAccounts, upsertPaymentAccount, deletePaymentAccount;
  let accountMemberships;
  try {
    const svc = await import('../../../db.js'); // fallback to central db
    getMyProfile = svc.getMyProfile || svc.getProfile;
    updateProfile = svc.updateProfile || svc.upsertProfile;
    listPaymentAccounts = svc.listPaymentAccounts;
    upsertPaymentAccount = svc.upsertPaymentAccount;
    deletePaymentAccount = svc.deletePaymentAccount;
    // try to load per-module services if present
    accountMemberships = (await import('/src/services/accountMemberships.js')).default || (await import('../../../services/accountMemberships.js')).default;
  } catch (e) {
    // try other path
    try {
      accountMemberships = (await import('/src/services/accountMemberships.js')).default;
    } catch (e2) {
      accountMemberships = null;
    }
  }

  // safe fallbacks
  listPaymentAccounts ||= async () => ({ data: [], error: null });
  upsertPaymentAccount ||= async () => ({ data: null, error: new Error('upsertPaymentAccount not implemented') });
  deletePaymentAccount ||= async () => ({ data: null, error: new Error('deletePaymentAccount not implemented') });
  getMyProfile ||= async () => ({ data: null, error: new Error('getMyProfile not implemented') });
  updateProfile ||= async () => ({ data: null, error: new Error('updateProfile not implemented') });

  // container
  root.innerHTML = '';
  const container = document.createElement('div');
  container.className = 'max-w-5xl mx-auto';
  root.appendChild(container);

  // load profile
  const { data: profileData, error: profErr } = await getMyProfile();
  const profile = profileData || {};
  const initialProfile = {
    first_name: profile.first_name || '',
    last_name: profile.last_name || '',
    display_name: profile.display_name || '',
    email: profile.email || '',
    phone: profile.phone || '',
    street: profile.street || '',
    house_number: profile.house_number || '',
    city: profile.city || '',
    zip: profile.zip || ''
  };

  // top UI: tabs
  const topCard = document.createElement('div');
  topCard.className = 'bg-white rounded-2xl border p-4 md:p-6';
  container.appendChild(topCard);
  const tabs = document.createElement('div'); tabs.className = 'flex gap-2 mb-4';
  const btnProfile = document.createElement('button'); btnProfile.type='button'; btnProfile.textContent='Profil'; btnProfile.className='px-3 py-1 border rounded bg-slate-50';
  const btnAccounts = document.createElement('button'); btnAccounts.type='button'; btnAccounts.textContent='Účty'; btnAccounts.className='px-3 py-1 border rounded';
  tabs.appendChild(btnProfile); tabs.appendChild(btnAccounts); topCard.appendChild(tabs);

  const contentArea = document.createElement('div'); topCard.appendChild(contentArea);

  // render profile form
  async function renderProfile() {
    contentArea.innerHTML = '';
    const rootProfile = document.createElement('div');
    contentArea.appendChild(rootProfile);

    renderForm(rootProfile, PROFILE_FIELDS, initialProfile, async () => true, { showSubmit: false, layout: { columns: { base:1, md:2 }, density: 'compact' } });
    const formEl = rootProfile.querySelector('form'); if (formEl) useUnsavedHelper(formEl);

    renderCommonActions(document.getElementById('commonactions'), {
      moduleActions: ['save','reject'],
      userRole: window.currentUserRole || 'user',
      handlers: {
        onSave: async () => {
          const vals = grabValues(rootProfile, PROFILE_FIELDS);
          if (!vals.first_name || !vals.last_name || !vals.email) return alert('Vyplňte jméno, příjmení a e-mail.');
          const { data, error } = await updateProfile(profile.id, vals);
          if (error) return alert('Chyba při ukládání: ' + (error.message || error));
          alert('Profil uložen.');
        },
        onReject: () => navigateTo('#/')
      }
    });
  }

  // render accounts area
  let accounts = [], selectedAccount = null;
  async function loadAccounts() {
    const { data, error } = await listPaymentAccounts({ profileId: profile.id });
    accounts = data || [];
    renderAccounts();
  }

  async function renderAccounts() {
    contentArea.innerHTML = '';
    const wrap = document.createElement('div'); wrap.className = 'grid md:grid-cols-2 gap-4';
    contentArea.appendChild(wrap);

    // left: list
    const left = document.createElement('div'); left.className = 'border rounded p-3 bg-slate-50'; wrap.appendChild(left);
    if (!accounts.length) {
      left.innerHTML = '<div class="text-slate-500 p-3">Žádné účty.</div>';
    } else {
      const table = document.createElement('table'); table.className='min-w-full text-sm';
      table.innerHTML = `
        <thead class="bg-white"><tr><th class="px-3 py-2">Popisek</th><th class="px-3 py-2">Účet</th><th class="px-3 py-2">Role</th><th class="px-3 py-2">Preferovaný</th></tr></thead>
        <tbody>
          ${accounts.map(a => `
            <tr class="border-t row-acc" data-id="${a.id}">
              <td class="px-3 py-2">${escapeHtml(a.label || '')}</td>
              <td class="px-3 py-2">${escapeHtml(a.account_number || '')}${a.is_primary ? ' • primární' : ''}</td>
              <td class="px-3 py-2" data-role-for="${a.id}">—</td>
              <td class="px-3 py-2">${profile.preferred_payment_account_id === a.id ? '<strong>✓</strong>' : '<button class="set-pref">Nastavit</button>'}</td>
            </tr>
          `).join('')}
        </tbody>`;
      left.appendChild(table);

      // bind events
      table.querySelectorAll('tr.row-acc').forEach(tr => {
        tr.addEventListener('click', async () => {
          const id = tr.getAttribute('data-id');
          const acc = accounts.find(x => x.id === id);
          selectedAccount = acc;
          renderAccountForm(acc);
        });
      });

      // bind set preferred buttons
      table.querySelectorAll('button.set-pref').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          e.stopPropagation();
          const tr = btn.closest('tr');
          const id = tr.getAttribute('data-id');
          await setPreferredAccount(id);
          await reloadProfile();
          await loadAccounts(); // re-render to show checkmark
        });
      });

      // load role badges for each account (call service)
      if (accountMemberships && typeof accountMemberships.getRoleForProfileOnAccount === 'function') {
        for (const a of accounts) {
          try {
            const res = await accountMemberships.getRoleForProfileOnAccount(a.id, profile.id);
            const role = res?.role ?? null;
            const td = table.querySelector(`td[data-role-for="${a.id}"]`);
            td.innerHTML = role ? `<span class="px-2 py-1 rounded text-xs bg-slate-100">${escapeHtml(role)}</span>` : '<span class="text-slate-400">—</span>';
          } catch (e) {
            // ignore
          }
        }
      }
    }

    // right: new/edit account form (default empty)
    const right = document.createElement('div'); right.className='bg-white border rounded p-3'; wrap.appendChild(right);
    renderAccountForm(null, right);
  }

  function renderAccountForm(account = null, container = null) {
    const host = container || contentArea.querySelector('.bg-white.border.rounded.p-3') || document.createElement('div');
    if (!container) host.innerHTML = '';
    const initial = account ? { ...account } : { label: '', bank_name: '', account_number: '', currency: 'CZK', is_primary: false };
    renderForm(host, PAYMENT_FIELDS, initial, async () => true, { showSubmit: false, layout: { columns: { base:1 }, density: 'compact' } });
    const formEl = host.querySelector('form'); if (formEl) useUnsavedHelper(formEl);

    renderCommonActions(document.getElementById('commonactions'), {
      moduleActions: ['add','save','delete','reject'],
      userRole: window.currentUserRole || 'user',
      handlers: {
        onAdd: () => {
          renderAccountForm(null, host);
        },
        onSave: async () => {
          const vals = grabValues(host, PAYMENT_FIELDS);
          if (!vals.label || !vals.account_number) return alert('Vyplňte popisek a číslo účtu.');
          const payload = { ...vals, profile_id: profile.id };
          if (account && account.id) payload.id = account.id;
          const { data, error } = await upsertPaymentAccount(payload, window.currentUser);
          if (error) return alert('Chyba při ukládání účtu: ' + (error.message || error));
          // pokud uživatel označil is_primary, můžeme nabídnout nastavit jako preferovaný
          await loadAccounts();
          alert('Účet uložen.');
        },
        onDelete: async () => {
          if (!account || !account.id) return alert('Vyber účet ke smazání.');
          if (!confirm('Smazat účet?')) return;
          const { data, error } = await deletePaymentAccount(account.id, window.currentUser);
          if (error) return alert('Chyba při mazání: ' + (error.message || error));
          selectedAccount = null;
          await loadAccounts();
        },
        onReject: () => navigateTo('#/')
      }
    });
  }

  async function setPreferredAccount(accountId) {
    if (!profile.id) return alert('Profil neznámý');
    const payload = { preferred_payment_account_id: accountId };
    const { data, error } = await updateProfile(profile.id, payload);
    if (error) return alert('Chyba při nastavování preferovaného účtu: ' + (error.message || error));
    alert('Preferovaný účet nastaven.');
    // update local profile variable
    profile.preferred_payment_account_id = accountId;
  }

  async function reloadProfile() {
    const { data } = await getMyProfile();
    if (data) Object.assign(profile, data);
  }

  // helpers
  function grabValues(root, fields) {
    const out = {};
    fields.forEach(f => {
      const el = root.querySelector(`[name="${f.key}"]`);
      if (!el) return;
      out[f.key] = (el.type === 'checkbox') ? !!el.checked : el.value;
    });
    return out;
  }

  // initial render: profile tab
  btnProfile.addEventListener('click', () => { btnProfile.classList.add('bg-slate-50'); btnAccounts.classList.remove('bg-slate-50'); renderProfile(); });
  btnAccounts.addEventListener('click', () => { btnAccounts.classList.add('bg-slate-50'); btnProfile.classList.remove('bg-slate-50'); loadAccounts(); });

  await renderProfile();
}

export default { render };
