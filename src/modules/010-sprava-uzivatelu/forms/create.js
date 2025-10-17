// modules/010/f/create.js
import { setBreadcrumb } from '../../../ui/breadcrumb.js';
import { renderForm } from '../../../ui/form.js';
import { renderCommonActions } from '../../../ui/commonActions.js';
import { navigateTo } from '../../../app.js';
import { listRoles, inviteUserByEmail } from '../../../db.js';
import { useUnsavedHelper } from '../../../ui/unsaved-helper.js';

const FIELDS = [
  { key: 'display_name', label: 'Uživatelské jméno', type: 'text', required: true },
  { key: 'email',        label: 'E-mail',           type: 'email', required: true, placeholder: 'user@example.com' },
  { key: 'phone',        label: 'Telefon',          type: 'text' },
  { key: 'role',         label: 'Role',             type: 'select', options: [], required: true }
];

export async function render(root) {
  setBreadcrumb(document.getElementById('crumb'), [
    { icon: 'home',  label: 'Domů',      href: '#/' },
    { icon: 'users', label: 'Uživatelé', href: '#/m/010-sprava-uzivatelu' },
    { icon: 'add',   label: 'Nový / Pozvat' }
  ]);

  // načti role pro select
  let roleOptions = [];
  try {
    const { data: roleList, error } = await listRoles();
    if (!error && Array.isArray(roleList)) {
      roleOptions = roleList.map(r => ({ value: r.slug, label: r.label }));
    }
  } catch (e) {
    roleOptions = [];
  }
  const fieldsWithRoles = FIELDS.map(f => f.key === 'role' ? { ...f, options: roleOptions } : f);

  // Handlery pro commonActions (nutné pro aktivní tlačítka)
  const handlers = {
    onInvite: async () => {
      const values = grabValues(root);
      const role = values.role || 'user';
      if (!values.display_name || !values.display_name.trim()) {
        alert('Vyplňte prosím Uživatelské jméno.');
        return;
      }
      if (!values.email || !values.email.trim()) {
        alert('Vyplňte prosím e-mail.');
        return;
      }
      try {
        const { data, error } = await inviteUserByEmail({
          email: values.email.trim(),
          display_name: values.display_name.trim(),
          role
        });
        if (error) {
          console.error('Invite error', error);
          alert('Chyba při odesílání pozvánky: ' + (error.message || String(error)));
          return;
        }
        alert('Pozvánka odeslána.');
        navigateTo('#/m/010-sprava-uzivatelu/t/prehled');
      } catch (err) {
        console.error('Invite exception', err);
        alert('Chyba při odesílání pozvánky: ' + (err.message || String(err)));
      }
    },
    onReject: () => navigateTo('#/m/010-sprava-uzivatelu/t/prehled')
  };

  const moduleActions = ['invite', 'reject'];

  // debug info — pomůže rychle zjistit, proč se něco nezobrazuje
  console.log('create.render: moduleActions=', moduleActions, 'userRole=', window.currentUserRole, 'handlers=', Object.keys(handlers));

  // zavoláme renderer akcí — stejný vzor jako form.js/tiles.js
  const commonEl = document.getElementById('commonactions');
  if (!commonEl) {
    console.warn('create.render: #commonactions not found — add <div id="commonactions"></div> to your layout.');
  } else {
    renderCommonActions(commonEl, {
      moduleActions,
      userRole: window.currentUserRole || 'admin', // fallback pro testování; v produkci nastav window.currentUserRole po přihlášení
      handlers
    });
  }

  // vykresli form
  const initial = { role: 'user' };
  renderForm(root, fieldsWithRoles, initial, async () => true, {
    layout: { columns: { base: 1, md: 2, xl: 2 }, density: 'compact' },
    sections: [{ id: 'pozvanka', label: 'Pozvánka', fields: fieldsWithRoles.map(f => f.key) }],
    showSubmit: false
  });

  const formEl = root.querySelector('form');
  if (formEl) useUnsavedHelper(formEl);
}

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
