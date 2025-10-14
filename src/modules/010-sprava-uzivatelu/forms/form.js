// src/modules/010-sprava-uzivatelu/forms/form.js
import { setBreadcrumb } from '../../../ui/breadcrumb.js';
import { renderForm } from '../../../ui/form.js';
import { renderCommonActions } from '../../../ui/commonActions.js';
import { navigateTo, route } from '../../../app.js';

// TODO: Později přidat kontrolu existence uživatele podle emailu a možnost odeslat pozvánku pokud uživatel ještě není pozván (invited = false)

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
  { key: 'role',          label: 'Role',         type: 'select', options: [
      { value: 'admin',        label: 'Administrátor' },
      { value: 'pronajimatel', label: 'Pronajímatel' },
      { value: 'najemnik',     label: 'Nájemník' },
      { value: 'user',         label: 'Uživatel' }
    ], required: true
  },
  { key: 'active',        label: 'Aktivní',      type: 'checkbox' },
  { key: 'birth_number',  label: 'Rodné číslo',  type: 'text' }, // GDPR - nepovinné!
  { key: 'note',          label: 'Poznámka',     type: 'textarea', fullWidth: true },
  { key: 'last_login',    label: 'Poslední přihlášení', type: 'date', readOnly: true },
  { key: 'updated_at',    label: 'Poslední úprava',     type: 'date', readOnly: true },
  { key: 'updated_by',    label: 'Upravil',             type: 'text', readOnly: true },
  { key: 'created_at',    label: 'Vytvořen',            type: 'date', readOnly: true }
];

export async function render(root) {
  const { id, mode: modeParam } = getHashParams();
  const mode = (modeParam === 'read') ? 'read' : 'edit';

  setBreadcrumb(document.getElementById('crumb'), [
    { icon: 'home',  label: 'Domů',      href: '#/' },
    { icon: 'users', label: 'Uživatelé', href: '#/m/010-sprava-uzivatelu' },
    { icon: 'form',  label: 'Formulář' }
  ]);

  // TODO: načíst reálná data z DB podle id
  const data = id ? {
    id,
    display_name: '',
    email: '',
    phone: '',
    street: '',
    house_number: '',
    city: '',
    zip: '',
    role: '',
    active: true,
    birth_number: '',
    note: '',
    last_login: '', // načíst z DB
    updated_at: '', // načíst z DB
    updated_by: '', // načíst z DB
    created_at: '', // načíst z DB
  } : {};

  // Akce podle režimu
  const actionsByMode = {
    read: ['edit', 'reject', 'invite'],                      // Detail: Upravit + Zpět + Pozvat (TODO)
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

        // TODO: Kontrola existence emailu v databázi a případné nabídnutí pozvánky, pokud uživatel ještě neexistuje

        const ok = await handleSave(values, { stay: true });
        if (ok) alert('Uloženo (demo) – zůstávám ve formuláři.');
      },
      onInvite: () => {
        // TODO: Implementovat odeslání pozvánky na email, pokud uživatel není pozván
        alert('Pozvánka bude odeslána (TODO)');
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
