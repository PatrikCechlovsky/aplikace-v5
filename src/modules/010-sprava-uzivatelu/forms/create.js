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

  // Header akce – pouze tady (formální tlačítka v těle vypínáme)
  renderCommonActions(document.getElementById('commonactions'), {
    moduleActions: ['invite', 'reject'],   // ← NOVÁ akce „invite“
    userRole: 'admin',                     // (zatím natvrdo)
    handlers: {
      onInvite: async () => {
        const values = grabValues(root);
        const ok = await handleInvite(values);
        if (ok) navigateTo('#/m/010-sprava-uzivatelu/t/prehled');
      },
      onReject: () => navigateTo('#/m/010-sprava-uzivatelu/t/prehled')
    }
  });

  // Výchozí hodnoty
  const initial = { role: 'user' };

  // Vykresli formulář – BEZ submit buttonů (showSubmit:false)
  renderForm(root, FIELDS, initial, async () => true, {
    layout: { columns: { base: 1, md: 2, xl: 2 }, density: 'compact' },
    sections: [{ id: 'zaklad', label: 'Základ', fields: FIELDS.map(f => f.key) }],
    showSubmit: false
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

// Tady bude reálná logika pozvánky (e-mail/Supabase). Zatím demo.
async function handleInvite(values) {
  console.log('[INVITE]', values);
  alert('Pozvánka odeslána (demo).');
  return true;
}

export default { render };
