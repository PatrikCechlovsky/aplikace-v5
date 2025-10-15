import { setBreadcrumb } from '../../../ui/breadcrumb.js';
import { renderForm } from '../../../ui/form.js';
import { renderCommonActions } from '../../../ui/commonActions.js';
import { navigateTo } from '../../../app.js';
import { useUnsavedHelper } from '../../../ui/unsaved-helper.js';

const PALETTE = [ /* ... */ ];

const FIELDS = [
  { key: 'slug',  label: 'Kód role',   type: 'text',  required: true,  placeholder: 'např. admin, user' },
  { key: 'label', label: 'Název',      type: 'text',  required: true,  placeholder: 'Administrátor' },
  { key: 'color', label: 'Barva',      type: 'text',  required: true,  placeholder: '#f59e0b' },
];

export async function render(root) {
  setBreadcrumb(document.getElementById('crumb'), [
    { icon: 'home',  label: 'Domů',      href: '#/' },
    { icon: 'users', label: 'Uživatelé', href: '#/m/010-sprava-uzivatelu' },
    { icon: 'settings', label: 'Role & barvy' }
  ]);

  let listRoles, upsertRole, deleteRole;
  try {
    ({ listRoles, upsertRole, deleteRole } = await import('../../../db.js'));
  } catch (e) {
    console.warn('[roles] DB API not available yet – using fallbacks', e);
  }
  listRoles  ||= async () => ({ data: [], error: null });
  upsertRole ||= async () => ({ error: null });
  deleteRole ||= async () => ({ error: null });

  renderCommonActions(document.getElementById('commonactions'), {
    moduleActions: ['approve','reject'],
    userRole: 'admin',
    handlers: {
      onApprove: async () => {
        const v = grabValues(root);
        if (!valid(v)) return;
        const { error } = await upsertRole(v);
        if (error) return alert('Uložení selhalo: ' + error.message);
        alert('Uloženo.');
        await loadList();
      },
      onReject: () => navigateTo('#/m/010-sprava-uzivatelu/t/prehled')
    }
  });

  renderForm(root, FIELDS, { color: '#64748b' }, async () => true, {
    layout: { columns: { base: 1, md: 2, xl: 3 }, density: 'compact' },
    sections: [{ id: 'main', label: 'Role', fields: FIELDS.map(f => f.key) }],
    showSubmit: false
  });

  // --- Hlídání rozdělané práce ---
  const formEl = root.querySelector("form");
  if (formEl) useUnsavedHelper(formEl);

  // (dále zůstává - paleta, seznam rolí, atd...)
  // ...
}

function grabValues(root) { /* ... */ }
function setValue(root, key, val) { /* ... */ }
function valid(v) { /* ... */ }
function escapeHtml(s) { /* ... */ }

export default { render };
