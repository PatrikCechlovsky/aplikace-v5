// src/modules/010-sprava-uzivatelu/forms/create.js
import { setBreadcrumb } from '../../../ui/breadcrumb.js';
import { renderForm } from '../../../ui/form.js';
import { renderCommonActions } from '../../../ui/commonActions.js';
import { navigateTo } from '../../../app.js';

const FIELDS = [
  { key: 'display_name', label: 'Jméno',   type: 'text',  required: true },
  { key: 'email',        label: 'E-mail',  type: 'email', required: true, placeholder: 'user@example.com' },
  { key: 'phone',        label: 'Telefon', type: 'text' },
  { key: 'role',         label: 'Role',    type: 'select', options: ['user', 'admin'], required: true }
];

export async function render(root) {
  setBreadcrumb(document.getElementById('crumb'), [
    { icon: 'home',  label: 'Domů',      href: '#/' },
    { icon: 'users', label: 'Uživatelé', href: '#/m/010-sprava-uzivatelu' },
    { icon: 'add',   label: 'Nový / Pozvat' }
  ]);

  // Všechny akce jen v CommonActions (žádná tlačítka dole ve formu)
  renderCommonActions(document.getElementById('commonactions'), {
    moduleActions: ['approve', 'invite', 'reject'],   // Uložit (zůstat), Pozvat, Zpět
    userRole: 'admin',
    handlers: {
      onApprove: async () => {
        const values = grabValues(root);
        const ok = await handleSave(values, { stay: true });
        if (ok) alert('Uloženo (demo) – zůstávám ve formuláři.');
      },
      onInvite: async () => {
        const values = grabValues(root);
        const ok = await handleInvite(values);
        if (ok) navigateTo('#/m/010-sprava-uzivatelu/t/prehled');
      },
      onReject: () => navigateTo('#/m/010-sprava-uzivatelu/t/prehled')
    }
  });

  const initial = { role: 'user' };

  renderForm(root, FIELDS, initial, async () => true, {
    layout: { columns: { base: 1, md: 2, xl: 2 }, density: 'compact' },
    sections: [{ id: 'zaklad', label: 'Základ', fields: FIELDS.map(f => f.key) }],
    showSubmit: false // ← žádná tlačítka dole
  });
}

// ---- helpers ----

function grabValues(scopeEl) {
  const obj = {};
  for (const f of FIELDS) {
    const el = scopeEl.querySelector(`[name="${f.key}"]`);
    if (!el) continue;
    obj[f.key] = (el.type === 'checkbox') ? !!el.checked : el.value;
  }
  return obj;
}

async function handleSave(values, { stay } = { stay: true }) {
  console.log('[CREATE SAVE]', values);
  // TODO: napojit na DB
  return true;
}

async function handleInvite(values) {
  console.log('[INVITE]', values);
  // TODO: odeslat pozvánku (e-mail / Supabase)
  alert('Pozvánka odeslána (demo).');
  return true;
}

export default { render };
