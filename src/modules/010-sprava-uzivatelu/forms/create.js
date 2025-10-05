// src/modules/010-sprava-uzivatelu/forms/create.js
import { setBreadcrumb } from '../../../ui/breadcrumb.js';
import { renderForm } from '../../../ui/form.js';
import { navigateTo } from '../../../app.js';

const FIELDS = [
  { key: 'email',        label: 'E-mail (pro pozvánku)', type: 'email', required: true, placeholder: 'user@example.com' },
  { key: 'display_name', label: 'Jméno (volitelné)',      type: 'text' },
  { key: 'role',         label: 'Role',                   type: 'select', options: ['user','admin'], required: true }
];

export async function render(root) {
  setBreadcrumb(document.getElementById('crumb'), [
    { icon: 'home',  label: 'Domů',      href: '#/' },
    { icon: 'users', label: 'Uživatelé', href: '#/m/010-sprava-uzivatelu' },
    { icon: 'add',   label: 'Nový / Pozvat' }
  ]);

  const initial = { role: 'user' };

  renderForm(root, FIELDS, initial, async (values) => {
    // DEMO: sem přijde logika pozvánky (e-mail). Teď jen náhled UI.
    console.log('[INVITE]', values);
    alert('Pozvánka odeslána (demo).');
    navigateTo('#/m/010-sprava-uzivatelu/t/prehled');
    return true;
  }, {
    layout: { columns: { base: 1, md: 2, xl: 2 }, density: 'compact' },
    sections: [
      { id: 'zaklad', label: 'Základ', fields: ['email','display_name','role'] }
    ],
    showSubmit: true,
    submitLabel: 'Odeslat pozvánku'
  });
}

export default { render };
