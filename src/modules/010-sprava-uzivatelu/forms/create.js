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

  // --- Načti role do selectu ---
  let roleOptions = [];
  try {
    const { data: roleList, error } = await listRoles();
    if (!error && Array.isArray(roleList)) {
      roleOptions = roleList.map(r => ({ value: r.slug, label: r.label }));
    }
  } catch (e) {
    roleOptions = [];
  }
  const fieldsWithRoles = FIELDS.map(f =>
    f.key === "role" ? { ...f, options: roleOptions } : f
  );

  // Ujistíme se, že container pro common actions existuje (layout používá ikonový toolbar)
  let commonEl = document.getElementById('commonactions');
  if (!commonEl) {
    commonEl = document.createElement('div');
    commonEl.id = 'commonactions';
    // vložíme nad root, aby toolbar byl nahoře a zarovnaný jako na ostatních stránkách
    root.prepend(commonEl);
  }

  // --- Handlery (onInvite aktivuje ikonové tlačítko v commonActions) ---
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

  // Vykreslíme ikonový toolbar (bez textových tlačítek) - stejně jako ve form.js
  renderCommonActions(commonEl, {
    moduleActions: ['invite', 'reject'],
    // pro testovací zobrazení můžeš mít window.currentUserRole = 'admin'
    userRole: window.currentUserRole || 'admin',
    handlers
  });

  // Render the form (no submit)
  const initial = { role: 'user' };
  renderForm(root, fieldsWithRoles, initial, async () => true, {
    layout: { columns: { base: 1, md: 2, xl: 2 }, density: 'compact' },
    sections: [{ id: 'pozvanka', label: 'Pozvánka', fields: fieldsWithRoles.map(f => f.key) }],
    showSubmit: false
  });

  const formEl = root.querySelector("form");
  if (formEl) useUnsavedHelper(formEl);
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
