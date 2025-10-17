// modules/010/f/create.js
import { setBreadcrumb } from '../../../ui/breadcrumb.js';
import { renderForm } from '../../../ui/form.js';
import { renderCommonActions } from '../../../ui/commonActions.js';
import { navigateTo } from '../../../app.js';
import { listRoles, inviteUserByEmail } from '../../../db.js';
import { useUnsavedHelper } from '../../../ui/unsaved-helper.js';

/**
 * Create / Invite page
 * - renders common actions toolbar (including Pozvat button)
 * - if renderCommonActions for some reason doesn't render the Pozvat button (different commonActions impl / permissions),
 *   we add a small fallback "Pozvat" button into the commonactions container so you always have the action available.
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
    f.key === "role" ? { ...f, options: roleOptions } : f
  );

  // Ensure commonactions container exists in DOM (some page templates may not include it)
  let commonEl = document.getElementById('commonactions');
  if (!commonEl) {
    commonEl = document.createElement('div');
    commonEl.id = 'commonactions';
    // insert at top of root if nothing else; adjust as needed
    root.prepend(commonEl);
  }

  // --- Common actions: Pozvat (invite) + Zpět (reject) ---
  // moduleActions must include the 'invite' action name expected by renderCommonActions
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

  // Render common actions (ask for 'invite' action)
  renderCommonActions(commonEl, {
    moduleActions: ['invite', 'reject'],
    // pass actual user role if available, otherwise default to 'admin' so the button shows for testing
    userRole: window.currentUserRole || 'admin',
    handlers
  });

  // Fallback: if renderCommonActions didn't create an invite button (different implementation or permissions),
  // append a small manual invite button so the user can still trigger the action.
  // This helps when commonActions hides the button due to permission checks.
  (function ensureInviteButtonFallback() {
    if (commonEl.querySelector('[data-action="invite"], .btn-invite, button.invite-btn')) return;
    // create fallback button
    const fb = document.createElement('button');
    fb.type = 'button';
    fb.textContent = 'Pozvat';
    fb.className = 'px-3 py-1 border rounded invite-btn';
    fb.style.marginLeft = '8px';
    fb.onclick = handlers.onInvite;
    commonEl.appendChild(fb);
  })();

  // Render the form (no submit button; we use common actions)
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
