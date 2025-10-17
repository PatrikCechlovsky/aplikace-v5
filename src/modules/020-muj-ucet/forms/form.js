// modules/020/f/form.js
// "Můj účet" — formulář pro upravení profilu přihlášeného uživatele.
// Form používá renderForm (showSubmit: false) a všechny akce jsou v commonActions.
// Ukládání volá updateProfile() z db (pokud existuje) — updateProfile v db.js už zapisuje historii (logProfileHistory).
// Pokud historie není dostupná jako samostatný modal v jiném modulu, tento soubor zobrazí jednoduché modal okno s historií.

import { setBreadcrumb } from '../../../ui/breadcrumb.js';
import { renderForm } from '../../../ui/form.js';
import { renderCommonActions } from '../../../ui/commonActions.js';
import { navigateTo, setUnsaved } from '../../../app.js';
import { useUnsavedHelper } from '../../../ui/unsaved-helper.js';

// Definice polí (rozšířené o další vlastní поля, které si přál)
// POZOR: DB musí mít odpovídající sloupce, jinak se data buď ignorují nebo update selže.
const FIELDS = [
  { key: 'first_name', label: 'Jméno', type: 'text', required: true },
  { key: 'last_name',  label: 'Příjmení', type: 'text', required: true },
  { key: 'display_name', label: 'Uživatelské jméno', type: 'text', required: true },
  { key: 'email', label: 'E-mail', type: 'email', required: true },
  { key: 'phone', label: 'Telefon', type: 'text' },
  { key: 'street', label: 'Ulice', type: 'text' },
  { key: 'house_number', label: 'Číslo popisné', type: 'text' },
  { key: 'city', label: 'Město', type: 'text' },
  { key: 'zip', label: 'PSČ', type: 'text' },
  { key: 'birth_number', label: 'Rodné číslo', type: 'text' },

  // Rozšířené / vlastní pole pro "Můj účet"
  { key: 'company_name', label: 'Firma / organizace', type: 'text' },
  { key: 'tax_id', label: 'IČ / DIČ', type: 'text' },
  { key: 'bank_account', label: 'Preferovaný účet (IBAN / číslo)', type: 'text' },
  { key: 'is_landlord', label: 'Pronajímatel / zástupce', type: 'checkbox' },

  { key: 'note', label: 'Poznámka', type: 'textarea', fullWidth: true },

  // readonly audit fields (rendered as labels)
  { key: 'last_login',    label: 'Poslední přihlášení', type: 'label', readOnly: true },
  { key: 'updated_at',    label: 'Poslední úprava',     type: 'label', readOnly: true },
  { key: 'updated_by',    label: 'Upravil',             type: 'label', readOnly: true },
  { key: 'created_at',    label: 'Vytvořen',            type: 'label', readOnly: true }
];

function escapeHtml(s) {
  return String(s ?? '').replace(/[&<>"']/g, m => (
    { '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[m]
  ));
}

export async function render(root) {
  if (!root) return;

  setBreadcrumb(document.getElementById('crumb'), [
    { icon: 'home', label: 'Domů', href: '#/' },
    { icon: 'account', label: 'Můj účet' }
  ]);

  // Lazy load DB API (fallback pattern)
  let getMyProfile, updateProfile, getProfileHistory;
  try {
    const db = await import('../../../db.js');
    getMyProfile = db.getMyProfile || db.getProfile || null;
    updateProfile = db.updateProfile || db.upsertProfile || null;
    getProfileHistory = db.getProfileHistory || null;
  } catch (e) {
    console.warn('[myaccount] db API not available', e);
  }

  if (!getMyProfile) {
    root.innerHTML = `<div class="p-4 text-red-600">DB API není dostupné (getMyProfile).</div>`;
    return;
  }

  // načti profil přihlášeného uživatele
  const { data: profileData, error: profErr } = await getMyProfile();
  if (profErr) {
    root.innerHTML = `<div class="p-4 text-red-600">Chyba při načítání profilu: ${escapeHtml(profErr.message || String(profErr))}</div>`;
    return;
  }
  const profile = profileData || {};

  // Předvyplnit hodnoty (včetně nových polí pokud existují v DB)
  const initial = {
    first_name: profile.first_name || '',
    last_name: profile.last_name || '',
    display_name: profile.display_name || profile.email || '',
    email: profile.email || '',
    phone: profile.phone || '',
    street: profile.street || '',
    house_number: profile.house_number || '',
    city: profile.city || '',
    zip: profile.zip || '',
    birth_number: profile.birth_number || '',
    company_name: profile.company_name || '',
    tax_id: profile.tax_id || '',
    bank_account: profile.bank_account || '',
    is_landlord: !!profile.is_landlord,
    note: profile.note || '',
    last_login: profile.last_login ? new Date(profile.last_login).toLocaleString() : '--',
    updated_at: profile.updated_at ? new Date(profile.updated_at).toLocaleString() : '--',
    updated_by: profile.updated_by || '--',
    created_at: profile.created_at ? new Date(profile.created_at).toLocaleString() : '--'
  };

  // Render form (no bottom submit)
  root.innerHTML = '';
  const card = document.createElement('div');
  card.className = 'bg-white rounded-2xl border p-4 md:p-6 max-w-5xl mx-auto';
  root.appendChild(card);

  // Tabs (Profil / Systém) - simple tabs using sections in renderForm
  renderForm(card, FIELDS, initial, async () => true, {
    showSubmit: false,
    layout: { columns: { base: 1, md: 2, xl: 2 }, density: 'compact' },
    sections: [
      { id: 'profil', label: 'Profil', fields: [
        'first_name','last_name','display_name','email','phone',
        'street','house_number','city','zip','birth_number',
        'company_name','tax_id','bank_account','is_landlord','note'
      ] },
      { id: 'system', label: 'Systém', fields: [
        'last_login','updated_at','updated_by','created_at'
      ] }
    ]
  });

  // unsaved helper for form
  const formEl = card.querySelector('form');
  if (formEl) useUnsavedHelper(formEl);

  // CommonActions: uložit, historie, odhlásit/zpět
  renderCommonActions(document.getElementById('commonactions'), {
    moduleActions: ['save','history','reject'],
    userRole: window.currentUserRole || 'user',
    handlers: {
      onSave: async () => {
        if (!updateProfile) return alert('Ukládání není dostupné (updateProfile).');
        // získat hodnoty
        const values = grabValues(card);
        // minimalní validace
        if (!values.first_name || !values.last_name || !values.email) {
          return alert('Vyplňte prosím Jméno, Příjmení a E-mail.');
        }
        // prepare payload: neukládej readonly pole
        const payload = { ...values };
        delete payload.last_login;
        delete payload.updated_at;
        delete payload.updated_by;
        delete payload.created_at;

        // volání updateProfile; db.updateProfile by měl logovat historii (logProfileHistory)
        const { data, error } = await updateProfile(profile.id, payload, window.currentUser || null);
        if (error) {
          console.error('updateProfile error', error);
          return alert('Chyba při ukládání: ' + (error.message || String(error)));
        }
        alert('Uloženo.');
        // zrušení stavu unsaved a přenačtení formuláře z DB
        setUnsaved(false);
        // reload current data (refresh labels)
        const { data: refreshed } = await getMyProfile();
        if (refreshed) {
          // update readonly fields
          for (const k of ['last_login','updated_at','updated_by','created_at']) {
            const el = card.querySelector(`[name="${k}"], label[for="f_${k}"]`);
            // renderForm renders labels as divs not inputs; easiest is to re-render full form
          }
          // re-render whole form to keep data in sync
          await render(root);
        }
      },

      onHistory: async () => {
        if (!getProfileHistory) {
          // fallback: try to lazy import from 010 module's history.js (if exists)
          try {
            const histMod = await import('../../../010-sprava-uzivatelu/f/history.js');
            if (histMod && typeof histMod.showHistoryModal === 'function') {
              return histMod.showHistoryModal(profile.id);
            }
          } catch (e) { /* ignore */ }
          // fallback to simple modal implemented here
          return showHistoryLocal(profile.id);
        }
        return showHistoryLocal(profile.id);
      },

      onReject: () => {
        // navigate back to dashboard
        navigateTo('#/');
      }
    }
  });

  // local simple history modal (used when no shared history modal is available)
  async function showHistoryLocal(profileId) {
    // fetch history if function available in db
    let hist = [];
    try {
      if (getProfileHistory) {
        const { data, error } = await getProfileHistory(profileId);
        if (error) throw error;
        hist = data || [];
      } else {
        // try to import from db and call
        const db = await import('../../../db.js');
        if (db.getProfileHistory) {
          const { data, error } = await db.getProfileHistory(profileId);
          if (!error) hist = data || [];
        }
      }
    } catch (e) {
      console.warn('history fetch failed', e);
      alert('Nelze načíst historii: ' + (e?.message || e));
      return;
    }

    // render modal
    const overlay = document.createElement('div');
    overlay.className = 'fixed inset-0 bg-black/40 flex items-start justify-center z-50 p-4';
    const box = document.createElement('div');
    box.className = 'bg-white rounded-lg shadow-lg max-w-3xl w-full overflow-auto';
    overlay.appendChild(box);

    const head = document.createElement('div');
    head.className = 'flex items-center justify-between p-4 border-b';
    head.innerHTML = `<div class="font-medium">Historie změn</div>`;
    const closeBtn = document.createElement('button');
    closeBtn.className = 'px-3 py-1 border rounded';
    closeBtn.textContent = 'Zavřít';
    closeBtn.addEventListener('click', () => document.body.removeChild(overlay));
    head.appendChild(closeBtn);
    box.appendChild(head);

    const body = document.createElement('div');
    body.className = 'p-4';
    if (!hist.length) {
      body.innerHTML = `<div class="text-slate-500">Žádná historie.</div>`;
    } else {
      const rows = hist.map(h => {
        const when = h.changed_at ? new Date(h.changed_at).toLocaleString() : '';
        const by = escapeHtml(h.changed_by || '');
        const field = escapeHtml(h.field || '');
        const oldv = escapeHtml(h.old_value || '');
        const newv = escapeHtml(h.new_value || '');
        return `<tr class="border-t">
          <td class="px-3 py-2 text-xs whitespace-nowrap">${when}</td>
          <td class="px-3 py-2 text-xs">${by}</td>
          <td class="px-3 py-2 text-xs">${field}</td>
          <td class="px-3 py-2 text-xs">${oldv}</td>
          <td class="px-3 py-2 text-xs">${newv}</td>
        </tr>`;
      }).join('');
      body.innerHTML = `
      <div class="overflow-auto">
        <table class="min-w-full text-xs">
          <thead class="bg-slate-50"><tr>
            <th class="px-3 py-2 text-left">Kdy</th>
            <th class="px-3 py-2 text-left">Kdo</th>
            <th class="px-3 py-2 text-left">Pole</th>
            <th class="px-3 py-2 text-left">Původní</th>
            <th class="px-3 py-2 text-left">Nové</th>
          </tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>`;
    }
    box.appendChild(body);
    document.body.appendChild(overlay);
  }

} // end render

// helpers: read values from rendered form
function grabValues(root) {
  const out = {};
  for (const f of FIELDS) {
    const el = root.querySelector(`[name="${f.key}"]`);
    if (!el) continue;
    if (el.type === 'checkbox') out[f.key] = !!el.checked;
    else out[f.key] = el.value;
  }
  return out;
}

export default { render };
