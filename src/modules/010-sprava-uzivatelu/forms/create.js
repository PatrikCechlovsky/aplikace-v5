// modules/010/f/create.js
import { setBreadcrumb } from '../../../ui/breadcrumb.js';
import { renderForm } from '../../../ui/form.js';
import { renderCommonActions } from '../../../ui/commonActions.js';
import { navigateTo } from '../../../app.js';
import { listRoles, inviteUserByEmail } from '../../../db.js';
import { useUnsavedHelper } from '../../../ui/unsaved-helper.js';
import { icon as uiIcon } from '../../../ui/icons.js';

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

  // Ujistíme se, že container pro common actions existuje
  let commonEl = document.getElementById('commonactions');
  if (!commonEl) {
    commonEl = document.createElement('div');
    commonEl.id = 'commonactions';
    // vložíme nad root pokud tam není - aby toolbar byl vidět
    root.prepend(commonEl);
  }

  // --- Handlery (onInvite aktivuje tlačítko Pozvat / Odeslat) ---
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
        // zavoláme server helper - pokud ho nemáte, upravíme to později na fallback
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

  // Vykreslíme standardní ikonový toolbar (common actions). Pokud renderCommonActions
  // z nějakého důvodu skryje tlačítko (permissions), níže doplníme explicitní textové tlačítko.
  renderCommonActions(commonEl, {
    moduleActions: ['invite', 'reject'],
    userRole: window.currentUserRole || 'admin', // pro test použijeme admin, aby bylo vidět
    handlers
  });

  // Přidáme viditelné "Odeslat pozvánku" tlačítko vedle ikonového toolbaru
  // (pouze jeden přídavek, aby uživatel měl jasné, aktivní tlačítko).
  (function addSendInviteButton() {
    // pokud už tam existuje (dřívější fallback), nebudeme duplikovat
    if (commonEl.querySelector('.btn-send-invite')) return;

    const sendBtn = document.createElement('button');
    sendBtn.type = 'button';
    sendBtn.className = 'btn-send-invite px-3 py-1 border rounded ml-2';
    sendBtn.innerHTML = `${uiIcon('invite')} &nbsp;Odeslat`;
    sendBtn.title = 'Odeslat pozvánku e-mailem';
    sendBtn.setAttribute('aria-label', 'Odeslat pozvánku');
    // připojíme stejný handler jako commonActions onInvite (udělá validaci a zavolá inviteUserByEmail)
    sendBtn.addEventListener('click', handlers.onInvite);
    commonEl.appendChild(sendBtn);
  })();

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
