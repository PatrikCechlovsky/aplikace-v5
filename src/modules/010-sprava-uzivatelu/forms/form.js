import { setBreadcrumb } from '../../../ui/breadcrumb.js';
import { renderForm } from '../../../ui/form.js';
import { renderCommonActions } from '../../../ui/commonActions.js';
import { navigateTo, route } from '../../../app.js';
import { getProfile, listRoles } from '../../../db.js';
import { useUnsavedHelper } from '../../../ui/unsaved-helper.js';

function getHashParams() {
  const q = (location.hash.split('?')[1] || '');
  return Object.fromEntries(new URLSearchParams(q));
}

const FIELDS = [
  { key: 'display_name',  label: 'Jméno',        type: 'text',     required: true },
  { key: 'email',         label: 'E-mail',       type: 'email',    required: true },
  { key: 'phone',         label: 'Telefon',      type: 'text' },
  { key: 'street',        label: 'Ulice',        type: 'text' },
  { key: 'house_number',  label: 'Číslo popisné',type: 'text' },
  { key: 'city',          label: 'Město',        type: 'text' },
  { key: 'zip',           label: 'PSČ',          type: 'text' },
  { key: 'role',          label: 'Role',         type: 'select', options: [], required: true }, // options budou dynamicky
  { key: 'active',        label: 'Aktivní',      type: 'checkbox' },
  { key: 'birth_number',  label: 'Rodné číslo',  type: 'text' },
  { key: 'note',          label: 'Poznámka',     type: 'textarea', fullWidth: true },
  { key: 'last_login',    label: 'Poslední přihlášení', type: 'date', readOnly: true },
  { key: 'updated_at',    label: 'Poslední úprava',     type: 'date', readOnly: true },
  { key: 'updated_by',    label: 'Upravil',             type: 'text', readOnly: true },
  { key: 'created_at',    label: 'Vytvořen',            type: 'date', readOnly: true }
];

export async function render(root) {
  const { id, mode: modeParam } = getHashParams();
  const mode = (modeParam === 'read') ? 'read' : 'edit';

  // Načtení dat uživatele z DB, pokud máme id
  let data = {};
  if (id) {
    const { data: userData, error } = await getProfile(id);
    if (error) {
      root.innerHTML = `<div class="p-4 text-red-600">Chyba při načítání uživatele: ${error.message}</div>`;
      return;
    }
    data = userData || {};
  }

  // Načti seznam rolí z DB
  let roleOptions = [];
  try {
    const { data: roleList, error } = await listRoles();
    if (!error && Array.isArray(roleList)) {
      roleOptions = roleList.map(r => ({ value: r.slug, label: r.label }));
    }
  } catch (e) {
    roleOptions = [];
  }
  // Doplň možnosti do FIELDS
  const fieldsWithRoles = FIELDS.map(f =>
    f.key === "role" ? { ...f, options: roleOptions } : f
  );

  // Jméno do breadcrumbu
  const jmeno = data.display_name || data.email || id || 'Uživatel';

  setBreadcrumb(document.getElementById('crumb'), [
    { icon: 'home',  label: 'Domů',      href: '#/' },
    { icon: 'users', label: 'Uživatelé', href: '#/m/010-sprava-uzivatelu' },
    { icon: 'form',  label: 'Formulář' },
    { icon: 'account', label: jmeno }
  ]);

  // Akce podle režimu
  const actionsByMode = {
    read: ['edit', 'reject', 'invite'],
    edit: ['approve', 'attach', 'delete', 'reject']
  };
  const moduleActions = actionsByMode[mode];

  renderCommonActions(document.getElementById('commonactions'), {
    moduleActions,
    userRole: 'admin',
    handlers: {
      onEdit:   () => navigateTo(`#/m/010-sprava-uzivatelu/f/form?id=${id||''}&mode=edit`),
      onApprove: async () => {
        const values = grabValues(root);
        const ok = await handleSave(values, { stay: true });
        if (ok) alert('Uloženo (demo) – zůstávám ve formuláři.');
      },
      onInvite: () => alert('Pozvánka bude odeslána (TODO)'),
      onAttach: () => alert('Přílohy (demo)'),
      onDelete: async () => {
        if (!id) return alert('Chybí ID.');
        if (confirm('Opravdu smazat?')) {
          alert('Smazáno (demo).');
          navigateTo('#/m/010-sprava-uzivatelu/t/prehled');
        }
      },
      onReject: () => navigateTo('#/m/010-sprava-uzivatelu/t/prehled'),
      onRefresh: () => route()
    }
  });

  renderForm(root, fieldsWithRoles, data, async () => true, {
    readOnly: (mode === 'read'),
    showSubmit: false,
    layout: { columns: { base: 1, md: 2, xl: 3 }, density: 'compact' },
    sections: [
      { id: 'profil', label: 'Profil', fields: [
        'display_name', 'email', 'phone',
        'street', 'house_number', 'city', 'zip', 'birth_number'
      ] },
      { id: 'system', label: 'Systém', fields: [
        'role', 'active', 'note', 'last_login', 'updated_at', 'updated_by', 'created_at'
      ] },
    ]
  });

  // --- Hlídání rozdělané práce ---
  const formEl = root.querySelector("form");
  if (formEl) useUnsavedHelper(formEl);
}

// helpers
function grabValues(scopeEl) {
  const obj = {};
  for (const f of FIELDS) {
    const el = scopeEl.querySelector(`[name="${f.key}"]`);
    if (!el) continue;
    obj[f.key] = (el.type === 'checkbox') ? !!el.checked : el.value;
  }
  return obj;
}
async function handleSave(values, { stay } = { stay: true }) {
  console.log('[FORM SAVE]', values);
  // TODO: uložit do DB
  return true;
}

export default { render };
