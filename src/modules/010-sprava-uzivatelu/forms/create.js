import { setBreadcrumb } from '../../../ui/breadcrumb.js';
import { renderForm } from '../../../ui/form.js';
import { renderCommonActions } from '../../../ui/commonActions.js';
import { navigateTo } from '../../../app.js';
import { listRoles, inviteUserByEmail } from '../../../db.js';
import { useUnsavedHelper } from '../../../ui/unsaved-helper.js';

const FIELDS = [
  { key: 'display_name', label: 'Display name', type: 'text', required: true },
  { key: 'email',        label: 'E-mail',      type: 'email', required: true, placeholder: 'user@example.com' },
  { key: 'phone',        label: 'Telefon',     type: 'text' },
  { key: 'role',         label: 'Role',        type: 'select', options: [], required: true },
  // Checkbox: archived => checked = archivováno (inaktivní). If unchecked => user active.
  { key: 'archived',     label: 'Archivní',    type: 'checkbox' }
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

  // --- Common actions: pouze Pozvat (odeslat email) a Zpět (reject/nav)
  renderCommonActions(document.getElementById('commonactions'), {
    moduleActions: ['invite', 'reject'],
    userRole: 'admin',
    handlers: {
      // Odeslat pozvánku emailem (volá server-side funkci / db helper)
      onInvite: async () => {
        const values = grabValues(root);
        // výchozí role 'user' pokud není vyplněna
        const role = values.role || 'user';

        // validace
        if (!values.display_name || !values.display_name.trim()) {
          alert('Vyplňte prosím Display name.');
          return;
        }
        if (!values.email || !values.email.trim()) {
          alert('Vyplňte prosím e-mail.');
          return;
        }

        try {
          // inviteUserByEmail očekává { email, display_name, role }
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
      // Zpět / zrušit -> přehled
      onReject: () => navigateTo('#/m/010-sprava-uzivatelu/t/prehled')
    }
  });

  // Výchozí hodnoty: role user, archived false (uživatel aktivní)
  const initial = { role: 'user', archived: false };
  renderForm(root, fieldsWithRoles, initial, async () => true, {
    layout: { columns: { base: 1, md: 2, xl: 2 }, density: 'compact' },
    sections: [{ id: 'pozvanka', label: 'Pozvánka', fields: fieldsWithRoles.map(f => f.key) }],
    showSubmit: false // formulář nemá vlastní submit - akce jsou v common actions (Pozvat / Zpět)
  });

  // --- Hlídání rozdělané práce ---
  const formEl = root.querySelector("form");
  if (formEl) useUnsavedHelper(formEl);
}

// Helper: sebrat hodnoty z polí (pro akce v headeru)
function grabValues(scopeEl) {
  const obj = {};
  for (const f of FIELDS) {
    const el = scopeEl.querySelector(`[name="${f.key}"]`);
    if (!el) continue;
    if (el.type === 'checkbox') obj[f.key] = !!el.checked;
    else obj[f.key] = el.value;
  }
  return obj;
}

export default { render };
