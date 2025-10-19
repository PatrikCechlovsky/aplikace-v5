// src/modules/030-pronajimatel/forms/form.js
// Sdílený univerzální formulář pro všechny typy subjektů.
// Dynamicky vykreslí pole podle TYPE_SCHEMAS a po uložení zavolá upsertSubject,
// který nově automaticky přiřadí subjekt k přihlášenému uživateli.

import { renderForm } from '/src/ui/form.js';
import { useUnsavedHelper } from '/src/ui/unsaved-helper.js';
import { getSubject, upsertSubject } from '/src/db/subjects.js';
import { toast } from '/src/ui/commonActions.js';

// TYPE_SCHEMAS tvořeny podle excelu / tvého návrhu
const TYPE_SCHEMAS = {
  osoba: [
    { key: 'display_name', label: 'Tituly / Jméno', type: 'text', required: true },
    { key: 'jmeno', label: 'Křestní jméno', type: 'text' },
    { key: 'prijmeni', label: 'Příjmení', type: 'text' },
    { key: 'typ_dokladu', label: 'Typ dokladu', type: 'select', options: [{value:'op',label:'OP'},{value:'pas',label:'Pas'},{value:'rid',label:'ŘP'}] },
    { key: 'cislo_dokladu', label: 'Číslo dokladu', type: 'text' },
    { key: 'telefon', label: 'Telefon', type: 'text' },
    { key: 'email', label: 'E-mail', type: 'email' },
    { key: 'street', label: 'Ulice', type: 'text' },
    { key: 'cislo_popisne', label: 'Číslo popisné', type: 'text' },
    { key: 'city', label: 'Město', type: 'text' },
    { key: 'zip', label: 'PSČ', type: 'text' }
  ],
  osvc: [
    { key: 'display_name', label: 'Jméno / Firma', type: 'text', required: true },
    { key: 'ico', label: 'IČO', type: 'text' },
    { key: 'dic', label: 'DIČ', type: 'text' },
    { key: 'telefon', label: 'Telefon', type: 'text' },
    { key: 'email', label: 'E-mail', type: 'email' },
    { key: 'street', label: 'Ulice', type: 'text' },
    { key: 'city', label: 'Město', type: 'text' },
    { key: 'zip', label: 'PSČ', type: 'text' }
  ],
  firma: [
    { key: 'display_name', label: 'Název firmy', type: 'text', required: true },
    { key: 'ico', label: 'IČO', type: 'text' },
    { key: 'dic', label: 'DIČ', type: 'text' },
    { key: 'primary_phone', label: 'Telefon', type: 'text' },
    { key: 'primary_email', label: 'E-mail', type: 'email' },
    { key: 'street', label: 'Ulice', type: 'text' },
    { key: 'cislo_popisne', label: 'Číslo popisné', type: 'text' },
    { key: 'city', label: 'Město', type: 'text' },
    { key: 'zip', label: 'PSČ', type: 'text' },
    { key: 'bankovni_ucet', label: 'Bankovní účet / číslo', type: 'text' }
  ],
  spolek: [
    { key: 'display_name', label: 'Název spolku', type: 'text', required: true },
    { key: 'primary_email', label: 'Kontakt (e-mail)', type: 'email' },
    { key: 'telefon', label: 'Telefon', type: 'text' }
  ],
  stat: [
    { key: 'display_name', label: 'Organizace', type: 'text', required: true },
    { key: 'primary_email', label: 'Kontakt (e-mail)', type: 'email' },
    { key: 'street', label: 'Ulice', type: 'text' },
    { key: 'city', label: 'Město', type: 'text' }
  ],
  zastupce: [
    { key: 'display_name', label: 'Jméno zástupce', type: 'text', required: true },
    { key: 'zastupuje_id', label: 'Zastupuje (ID subjektu)', type: 'text' },
    { key: 'telefon', label: 'Telefon', type: 'text' },
    { key: 'email', label: 'E-mail', type: 'email' }
  ]
};

function getModuleIdFromHash() {
  try {
    const m = (location.hash || '').match(/#\/m\/([^\/]+)/);
    return m ? m[1] : null;
  } catch (e) { return null; }
}

export async function render(root, params = {}) {
  root.innerHTML = '';
  const type = params?.type || 'osoba';
  const schema = TYPE_SCHEMAS[type] || TYPE_SCHEMAS['osoba'];

  // načíst existující data pokud editujeme
  let initial = {};
  if (params?.id) {
    const { data, error } = await getSubject(params.id);
    if (error) {
      root.innerHTML = `<div class="error">Chyba při načtení: ${error.message || error}</div>`;
      return;
    }
    initial = data || {};
  } else {
    initial = { typ_subjektu: type, role: params?.role || (getModuleIdFromHash()?.startsWith('050') ? 'najemnik' : 'pronajimatel') };
  }

  renderForm(root, schema, initial, async (values) => {
    const inferredRole = params?.role || (getModuleIdFromHash()?.startsWith('050') ? 'najemnik' : 'pronajimatel');
    const payload = {
      ...values,
      typ_subjektu: type,
      role: inferredRole,
      display_name: (values.display_name && values.display_name.trim()) ||
                    ((values.jmeno || values.prijmeni) ? `${values.jmeno || ''} ${values.prijmeni || ''}`.trim() : values.primary_email || '')
    };

    // Po uložení upsertSubject nyní automaticky přiřadí subjekt k profilu (pokud není payload.skipAssign = true)
    const { data, error } = await upsertSubject(payload);
    if (error) {
      toast('Chyba při ukládání: ' + (error.message || JSON.stringify(error)), 'error');
      return false;
    }
    toast('Uloženo', 'success');
    const moduleId = params?.module || getModuleIdFromHash();
    if (moduleId) window.navigateTo?.(`#/m/${moduleId}/t/prehled`);
    return true;
  });

  const formEl = root.querySelector('form');
  if (formEl) useUnsavedHelper(formEl);
}
