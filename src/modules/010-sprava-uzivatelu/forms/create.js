// modules/010/f/create.js
import { setBreadcrumb } from '../../../ui/breadcrumb.js';
import { renderForm } from '../../../ui/form.js';
import { renderCommonActions } from '../../../ui/commonActions.js';
import { navigateTo } from '../../../app.js';
import { listRoles, inviteUserByEmail } from '../../../db.js';
import { useUnsavedHelper } from '../../../ui/unsaved-helper.js';

// Pozvánka — volá renderCommonActions stejně jako form.js/tiles.js
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

  // --- načti role pro select ---
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

  // --- definice handlerů pro commonActions (onInvite aktivuje ikonku invite) ---
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

  // --- jaké akce chceme v toolbaru (stejně jako form.js) ---
  const moduleActions = ['invite', 'reject'];

  // Debug: vypiš do konzole, co se posílá do renderCommonActions (pomůže zjistit, proč něco chybí)
  console.log('create.render: moduleActions=', moduleActions, 'userRole=', window.currentUserRole, 'handlersKeys=', Object.keys(handlers));

  // Kontrola existence containeru (neměnit ho, jen varování pro debug)
  const commonEl = document.getElementById('commonactions');
  if (!commonEl) {
    console.warn('create.render: element #commonactions nenalezen. CommonActions nebude vykreslen. Přidejte <div id="commonactions"></div> do layoutu.');
  } else {
    // Volání renderCommonActions bez jakýchkoliv DOM hacků — necháme commonActions dělat svoji práci
    renderCommonActions(commonEl, {
      moduleActions,
      userRole: window.currentUserRole || 'admin', // pro rychlý test použij admin, v produkci použij reálnou roli
      handlers
    });
  }

  // --- vykreslení formuláře ---
  const initial = { role: 'user' };
  renderForm(root, fieldsWithRoles, initial, async () => true, {
    layout: { columns: { base: 1, md: 2, xl: 2 }, density: 'compact' },
    sections: [{ id: 'pozvanka', label: 'Pozvánka', fields: fieldsWithRoles.map(f => f.key) }],
    showSubmit: false
  });

  const formEl = root.querySelector('form');
  if (formEl) useUnsavedHelper(formEl);
}

// Pomocná funkce pro čtení hodnot z formuláře
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
