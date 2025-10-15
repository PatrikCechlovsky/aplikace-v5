import { setBreadcrumb } from '../../../ui/breadcrumb.js';
import { renderForm } from '../../../ui/form.js';
import { renderCommonActions } from '../../../ui/commonActions.js';
import { navigateTo } from '../../../app.js';
import { listRoles } from '../../../db.js';
import { useUnsavedHelper } from '../../../ui/unsaved-helper.js';

const FIELDS = [
  { key: 'display_name', label: 'Jméno',   type: 'text',  required: true },
  { key: 'email',        label: 'E-mail',  type: 'email', required: true, placeholder: 'user@example.com' },
  { key: 'phone',        label: 'Telefon', type: 'text' },
  { key: 'role',         label: 'Role',    type: 'select', options: [], required: true }
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

  renderCommonActions(document.getElementById('commonactions'), {
    moduleActions: ['approve', 'invite', 'reject'],
    userRole: 'admin',
    handlers: {
      onApprove: async () => {
        const values = grabValues(root);
        console.log('[CREATE SAVE]', values);
        alert('Uloženo (demo) – zůstávám ve formuláři.');
      },
      onInvite: async () => {
        const values = grabValues(root);
        console.log('[INVITE]', values);
        alert('Pozvánka odeslána (demo).');
        navigateTo('#/m/010-sprava-uzivatelu/t/prehled');
      },
      onReject: () => navigateTo('#/m/010-sprava-uzivatelu/t/prehled')
    }
  });

  const initial = { role: 'user' };
  renderForm(root, fieldsWithRoles, initial, async () => true, {
    layout: { columns: { base: 1, md: 2, xl: 2 }, density: 'compact' },
    sections: [{ id: 'zaklad', label: 'Základ', fields: fieldsWithRoles.map(f => f.key) }],
    showSubmit: false
  });

  // --- Hlídání rozdělané práce ---
  const formEl = root.querySelector("form");
  if (formEl) useUnsavedHelper(formEl);
}

// Helper: sebrat hodnoty z polí
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
