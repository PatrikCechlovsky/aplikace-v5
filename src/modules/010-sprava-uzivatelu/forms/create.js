// modules/010/f/create.js
import { setBreadcrumb } from '../../../ui/breadcrumb.js';
import { renderForm } from '../../../ui/form.js';
import { renderCommonActions } from '../../../ui/commonActions.js';
import { navigateTo } from '../../../app.js';
import { listRoles, inviteUserByEmail } from '../../../db.js';
import { useUnsavedHelper } from '../../../ui/unsaved-helper.js';

/**
 * Create / Invite page
 * Ensures an icon-only common actions toolbar is visible (positioned top-right like form.js).
 * If the page template doesn't provide #commonactions, we create one and position it so it's visible.
 */

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
    f.key === 'role' ? { ...f, options: roleOptions } : f
  );

  // Ensure root is positioned so absolute toolbar can anchor to it
  if (root && getComputedStyle(root).position === 'static') {
    root.style.position = 'relative';
  }

  // Ensure commonactions container exists and is visible top-right (icon-only toolbar)
  let commonEl = document.getElementById('commonactions');
  if (!commonEl) {
    commonEl = document.createElement('div');
    commonEl.id = 'commonactions';
    // inline positioning so toolbar appears in top-right (matches form.js layout)
    commonEl.style.position = 'absolute';
    commonEl.style.top = '12px';
    commonEl.style.right = '12px';
    commonEl.style.zIndex = '60';
    // keep layout flow: prepend to root so it's visually near page header
    root.prepend(commonEl);
  } else {
    // make sure it's visible / positioned similarly
    commonEl.style.position = commonEl.style.position || 'absolute';
    commonEl.style.top = commonEl.style.top || '12px';
    commonEl.style.right = commonEl.style.right || '12px';
    commonEl.style.zIndex = commonEl.style.zIndex || '60';
  }

  // --- Handlers: onInvite will make the invite icon active (commonActions enables button when handler present) ---
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

  // Render icon-only toolbar (commonActions will render icons; no text)
  renderCommonActions(commonEl, {
    moduleActions: ['invite', 'reject'],
    userRole: window.currentUserRole || 'admin', // for testing, default to admin so icon shows
    handlers
  });

  // Render the form (no submit button; actions live in toolbar)
  const initial = { role: 'user' };
  renderForm(root, fieldsWithRoles, initial, async () => true, {
    layout: { columns: { base: 1, md: 2, xl: 2 }, density: 'compact' },
    sections: [{ id: 'pozvanka', label: 'Pozvánka', fields: fieldsWithRoles.map(f => f.key) }],
    showSubmit: false
  });

  const formEl = root.querySelector('form');
  if (formEl) useUnsavedHelper(formEl);
}

// Helper: collect form values
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
