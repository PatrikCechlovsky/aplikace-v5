// src/modules/010-sprava-uzivatelu/forms/form.js
import { setBreadcrumb } from '../../../ui/breadcrumb.js';
import { renderForm } from '../../../ui/form.js';
import { renderCommonActions } from '../../../ui/commonActions.js';
import { navigateTo, route } from '../../../app.js';

// Pomocná: čtení query z hash
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
  const mode = (modeParam === 'read') ? 'read' : 'edit';

  setBreadcrumb(document.getElementById('crumb'), [
    { icon: 'home',  label: 'Domů',      href: '#/' },
    { icon: 'users', label: 'Uživatelé', href: '#/m/010-sprava-uzivatelu' },
    { icon: 'form',  label: 'Formulář' }
  ]);

  // DEMO data – napojení na DB doděláme později
  const data = id ? {
    id,
    display_name: '',
    email: '',
    phone: '',
    mesto: '',
    role: 'user',
    note: ''
  } : {};

  // Header akce (ikony nahoře)
  const userRole = 'admin'; // zatím natvrdo
  renderCommonActions(document.getElementById('commonactions'), {
    moduleActions: ['detail','edit','approve','reject','refresh','delete'],
    userRole,
    handlers: {
      onDetail: () => navigateTo(`#/m/010-sprava-uzivatelu/f/form?id=${id||''}&mode=read`),
      onEdit:   () => navigateTo(`#/m/010-sprava-uzivatelu/f/form?id=${id||''}&mode=edit`),
      onApprove: async () => {
        // Uložit a zůstat
        console.log('[SAVE STAY] (demo)');
        alert('Uloženo (demo) – zůstávám ve formuláři.');
      },
      onReject: () => navigateTo('#/m/010-sprava-uzivatelu/t/prehled'),
      onRefresh: () => route(),
      onDelete: () => alert('Smazání (demo)')
    }
  });

  // Vykreslení formuláře – kompaktní grid + záložky
  renderForm(root, FIELDS, data, async (values) => {
    if (mode === 'read') {
      alert('Formulář je jen pro čtení.');
      return false;
    }
    console.log('[SAVE CLOSE]', values);
    alert('Uloženo (demo) – návrat na přehled.');
    navigateTo('#/m/010-sprava-uzivatelu/t/prehled');
    return true;
  }, {
    readOnly: (mode === 'read'),
    showSubmit: false, // tlačítka máme v headeru
    layout: { columns: { base: 1, md: 2, xl: 3 }, density: 'compact' },
    sections: [
      { id: 'profil', label: 'Profil', fields: ['display_name','email','phone','mesto'] },
      { id: 'system', label: 'Systém', fields: ['role','note'] },
    ]
  });
}

export default { render };
