// src/modules/010-sprava-uzivatelu/forms/create.js
// "Nový / Pozvat" – čistý create formulář bez závislosti na žádném `func`

import { setBreadcrumb } from '../../../ui/breadcrumb.js';
import { renderCommonActions } from '../../../ui/commonActions.js';
import { navigateTo } from '../../../app.js';
import { renderForm } from '../../../ui/form.js';

// pole pro create (můžeš přizpůsobit)
const FIELDS = [
  { key: 'display_name', label: 'Jméno',   type: 'text',  required: true },
  { key: 'email',        label: 'E-mail',  type: 'email', required: true },
  { key: 'phone',        label: 'Telefon', type: 'text' },
  { key: 'role',         label: 'Role',    type: 'text' }
];

// akce dostupné v této obrazovce (Save&Close, Cancel)
const MODULE_ACTIONS = ['approve', 'reject'];

export async function render(root) {
  // breadcrumbs
  setBreadcrumb(document.getElementById('crumb'), [
    { icon: 'home',  label: 'Domů',      href: '#/' },
    { icon: 'users', label: 'Uživatelé', href: '#/m/010-sprava-uzivatelu' },
    { icon: 'add',   label: 'Nový / Pozvat' }
  ]);

  // role zatím natvrdo (později z profilu)
  const userRole = 'admin';

  // CommonActions: Uložit (approve) a Zrušit (reject)
  renderCommonActions(document.getElementById('commonactions'), {
    moduleActions: MODULE_ACTIONS,
    userRole,
    handlers: {
      // approve = uložit a ZŮSTAT (disketa). zde po úspěchu zůstáváme na stránce.
      onApprove: async () => {
        const ok = await saveCurrentForm(root);
        if (ok) console.log('[CREATE] uložené, zůstávám na formuláři');
      },
      // reject = zrušit a zpět na přehled
      onReject: () => navigateTo('#/m/010-sprava-uzivatelu/t/prehled')
    }
  });

  // vykresli vlastní formulář
  root.innerHTML = `<div id="form-area"></div>`;
  const target = root.querySelector('#form-area');

  renderForm(target, FIELDS, {}, async (values) => {
    // Submit uvnitř formuláře = Save&Close (na přání to klidně vypneme)
    const ok = await fakeSave(values);
    if (ok) navigateTo('#/m/010-sprava-uzivatelu/t/prehled');
    return ok;
  }, { mode: 'edit' });

  // ---- helpers ----

  async function saveCurrentForm(container) {
    const formEl = container.querySelector('form') || container;
    const values = grabValuesFrom(formEl);
    const ok = await fakeSave(values);
    return ok;
  }

  function grabValuesFrom(scopeEl) {
    const obj = {};
    for (const f of FIELDS) {
      const el = scopeEl.querySelector(`[name="${f.key}"]`);
      if (!el) continue;
      obj[f.key] = (el.type === 'checkbox') ? !!el.checked : el.value;
    }
    return obj;
  }

  async function fakeSave(values) {
    console.log('[CREATE SAVE]', values);
    alert('Uloženo (demo). Později napojíme na Supabase.');
    return true;
  }
}

export default { render };
