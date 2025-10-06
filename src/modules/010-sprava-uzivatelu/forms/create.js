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
  // Breadcrumb
  setBreadcrumb(document.getElementById('crumb'), [
    { icon: 'home',  label: 'Domů',      href: '#/' },
    { icon: 'users', label: 'Uživatelé', href: '#/m/010-sprava-uzivatelu' },
    { icon: 'add',   label: 'Nový / Pozvat' }
  ]);

  // Všechny akce jen v CommonActions (žádná tlačítka dole ve formu)
  renderCommonActions(document.getElementById('commonactions'), {
    moduleActions: ['approve', 'invite', 'reject'], // Uložit(zůstat), Pozvat, Zpět
    userRole: 'admin',
    handlers: {
      onApprove: async () => {
        const values = grabValues(root);
        // TODO: uložení do DB (zůstat ve formu)
        console.log('[CREATE SAVE]', values);
        alert('Uloženo (demo) – zůstávám ve formuláři.');
      },
      onInvite: async () => {
        const values = grabValues(root);
        // TODO: odeslat pozvánku e-mailem
        console.log('[INVITE]', values);
        alert('Pozvánka odeslána (demo).');
        navigateTo('#/m/010-sprava-uzivatelu/t/prehled');
      },
      onReject: () => navigateTo('#/m/010-sprava-uzivatelu/t/prehled')
    }
  });

  // Výchozí hodnoty
  const initial = { role: 'user' };

  // Formulář – BEZ spodních tlačítek (showSubmit:false)
  renderForm(root, FIELDS, initial, async () => true, {
    layout: { columns: { base: 1, md: 2, xl: 2 }, density: 'compact' },
    sections: [{ id: 'zaklad', label: 'Základ', fields: FIELDS.map(f => f.key) }],
    showSubmit: false
  });
}

// Helper: sebrat hodnoty z polí (pro akce v headeru)
function grabValues(scopeEl) {
  const obj = {};
  for (const f of FIELDS) {
    const el = scopeEl.querySelector(`[name="${f.key}"]`);
    if (!el) continue;
    obj[f.key] = (el.type === 'checkbox') ? !!el.checked : el.value;
  }
  return obj;
}

export default { render };
