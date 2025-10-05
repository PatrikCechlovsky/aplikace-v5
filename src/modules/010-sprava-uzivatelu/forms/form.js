// Formulář uživatele – režimy read/edit, akce v CommonActions včetně „uložit a zůstat“

import { setBreadcrumb } from '../../../ui/breadcrumb.js';
import { renderCommonActions } from '../../../ui/commonActions.js';
import { navigateTo, route } from '../../../app.js';
import { getProfile } from '../../../db.js'; // musí existovat v db.js (máš ho)
import { renderForm } from '../../../ui/form.js';
import { canPerform } from '../../../security/permissions.js';

// ---- Pomocné: čtení query paramu z hash části URL
function getHashParams() {
  const hash = location.hash || '';
  const q = hash.split('?')[1] || '';
  return Object.fromEntries(new URLSearchParams(q));
}

// ---- Pole políček formuláře (můžeš si je později rozšířit)
const FIELDS = [
  { key: 'display_name', label: 'Jméno',   type: 'text',   required: true },
  { key: 'email',        label: 'E-mail',  type: 'email',  required: true },
  { key: 'phone',        label: 'Telefon', type: 'text' },
  { key: 'mesto',        label: 'Město',   type: 'text' },
  { key: 'role',         label: 'Role',    type: 'text' },
  { key: 'note',         label: 'Poznámka',type: 'textarea' },
];

// ---- Akce, které tato obrazovka podporuje (vyfiltrují se podle role)
const MODULE_ACTIONS = ['detail', 'edit', 'approve', 'reject', 'refresh', 'delete'];

export async function render(root) {
  // --- Breadcrumbs
  setBreadcrumb(document.getElementById('crumb'), [
    { icon: 'home',  label: 'Domů',      href: '#/' },
    { icon: 'users', label: 'Uživatelé', href: '#/m/010-sprava-uzivatelu' },
    { icon: 'form',  label: 'Formulář' }
  ]);

  // --- Z URL
  const { id, mode: modeParam } = getHashParams();
  let mode = (modeParam === 'read' ? 'read' : 'edit'); // default: edit

  // --- Dočasně natvrdo role admin (ať fungujeme). Později načteme z profilu.
  const userRole = 'admin';

  // --- Načti data, pokud máme id (jinak prázdný objekt)
  let data = {};
  if (id) {
    const { data: item, error } = await getProfile(id);
    if (error) {
      root.innerHTML = `<div class="p-4 text-red-600">Chyba načtení záznamu: ${error.message}</div>`;
      return;
    }
    data = item || {};
  }

  // --- Renderer akčních tlačítek (CommonActions)
  renderCommonActions(document.getElementById('commonactions'), {
    moduleActions: MODULE_ACTIONS,
    userRole,
    handlers: {
      // Detail = přepnout do read-only režimu
      onDetail: () => {
        mode = 'read';
        render(root);
      },
      // Edit = přepnout do edit režimu
      onEdit: () => {
        if (!canPerform(userRole, 'edit')) {
          alert('Na editaci nemáte oprávnění.');
          return;
        }
        mode = 'edit';
        render(root);
      },
      // Approve = ULOŽIT, ale zůstat ve formuláři
      onApprove: async () => {
        const ok = await saveCurrentForm(root);
        if (ok) {
          // zůstaň ve formuláři (žádná navigace)
          // lze dát i malý „toast“
          console.log('[FORM] uložené (zůstávám ve formuláři)');
        }
      },
      // Reject = ZRUŠIT a vrátit se na přehled
      onReject: () => {
        navigateTo('#/m/010-sprava-uzivatelu/t/prehled');
      },
      // Refresh = znovu načíst data (bez odchodu)
      onRefresh: () => route(),
      // Delete = smazat záznam (zatím demo)
      onDelete: () => {
        if (!id) return alert('Nejprve vyberte záznam k odstranění.');
        if (!confirm('Opravdu smazat tento záznam?')) return;
        alert('Smazání není zatím implementováno.');
      }
    }
  });

  // --- Vykresli samotný formulář
  // renderForm očekává (root, fields, initialData, onSubmit)
  // onSubmit vrací true/false podle úspěchu
  root.innerHTML = `<div id="form-area"></div>`;
  const target = root.querySelector('#form-area');

  // read-only: zakážeme editaci (form renderer by měl respektovat "disabled" v options)
  const readOnly = (mode === 'read');

  renderForm(target, FIELDS, data, async (values) => {
    if (readOnly) {
      alert('Formulář je jen pro čtení.');
      return false;
    }
    // Defaultní chování – uložit a odejít (Save&Close)
    const ok = await fakeSave(values); // TODO: napojíme na Supabase update/insert
    if (ok) {
      navigateTo('#/m/010-sprava-uzivatelu/t/prehled'); // Save&Close
      return true;
    }
    return false;
  }, { readOnly }); // pokud tvůj renderForm má options; pokud ne, ignoruje

  // --- Pomocná funkce: „uložit a zůstat“ (disketa)
  async function saveCurrentForm(container) {
    // Pokud tvůj renderForm vrací nějaký getValues / submit API, použij ho.
    // V minimální verzi jen vezmeme aktuální hodnoty z inputů:
    const formEl = container.querySelector('form') || container;
    const values = grabValuesFrom(formEl);

    if (mode === 'read') {
      alert('Formulář je jen pro čtení.');
      return false;
    }

    const ok = await fakeSave(values); // TODO: nahradíme voláním Supabase
    return ok;
  }

  // --- Získání hodnot z formuláře (minimální utilita pro tento form)
  function grabValuesFrom(scopeEl) {
    const obj = {};
    for (const f of FIELDS) {
      const el = scopeEl.querySelector(`[name="${f.key}"]`);
      if (!el) continue;
      obj[f.key] = (el.type === 'checkbox') ? !!el.checked : el.value;
    }
    if (id) obj.id = id;
    return obj;
  }

  // --- Falešné uložení (pro zatímní funkčnost UI)
  async function fakeSave(values) {
    console.log('[FORM SAVE] values:', values);
    alert('Uloženo (demo). Napojíme na Supabase v další fázi.');
    return true;
  }
}

export default { render };
