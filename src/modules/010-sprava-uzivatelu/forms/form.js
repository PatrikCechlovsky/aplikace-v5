// src/modules/010-sprava-uzivatelu/forms/form.js
import { setBreadcrumb } from '../../../ui/breadcrumb.js';
import { renderForm } from '../../../ui/form.js';
import { renderCommonActions } from '../../../ui/commonActions.js';
import { navigateTo, route } from '../../../app.js';

function getHashParams() {
  const q = (location.hash.split('?')[1] || '');
  return Object.fromEntries(new URLSearchParams(q));
}

const FIELDS = [
  { key: 'display_name', label: 'Jméno',        type: 'text',  required: true },
  { key: 'email',        label: 'E-mail',       type: 'email', required: true },
  { key: 'phone',        label: 'Telefon',      type: 'text'  },
  { key: 'mesto',        label: 'Město',        type: 'text'  },
  { key: 'role',         label: 'Role',         type: 'select', options: ['user','admin'] },
  { key: 'note',         label: 'Poznámka',     type: 'textarea', fullWidth: true }
];

export async function render(root) {
  const { id, mode: modeParam } = getHashParams();
  const mode = (modeParam === 'read') ? 'read' : 'edit'; // default edit

  setBreadcrumb(document.getElementById('crumb'), [
    { icon: 'home',  label: 'Domů',      href: '#/' },
    { icon: 'users', label: 'Uživatelé', href: '#/m/010-sprava-uzivatelu' },
    { icon: 'form',  label: 'Formulář' }
  ]);

  // DEMO data – reálné natažení/uložení doplníme
  const data = id ? {
    id,
    display_name: '',
    email: '',
    phone: '',
    mesto: '',
    role: 'user',
    note: ''
  } : {};

  // Akce podle režimu
  const actionsByMode = {
    read: ['edit', 'reject'],                      // Detail: jen Upravit + Zpět
    edit: ['approve', 'attach', 'delete', 'reject'] // Edit: Uložit(zůstat), Přílohy, Smazat, Zpět
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
      onAttach: () => alert('Přílohy (demo)'),
      onDelete: async () => {
        if (!id) return alert('Chybí ID.');
        if (confirm('Opravdu smazat?')) {
          // TODO: delete v DB
          alert('Smazáno (demo).');
          navigateTo('#/m/010-sprava-uzivatelu/t/prehled');
        }
      },
      onReject: () => navigateTo('#/m/010-sprava-uzivatelu/t/prehled'),
      onRefresh: () => route()
    }
  });

  renderForm(root, FIELDS, data, async () => true, {
    readOnly: (mode === 'read'),
    showSubmit: false, // ← žádné tlačítko dole
    layout: { columns: { base: 1, md: 2, xl: 3 }, density: 'compact' },
    sections: [
      { id: 'profil', label: 'Profil', fields: ['display_name','email','phone','mesto'] },
      { id: 'system', label: 'Systém', fields: ['role','note'] },
    ]
  });
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
