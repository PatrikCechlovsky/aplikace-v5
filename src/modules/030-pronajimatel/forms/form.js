// Univerzální formulář pro pronajímatele (a použitelný také pro nájemníka).
// Používá renderForm z /src/ui/form.js a db helpery z /src/db/subjects.js

import { renderForm } from '/src/ui/form.js';
import { useUnsavedHelper } from '/src/ui/unsaved-helper.js';
import { getSubject, upsertSubject } from '/src/db/subjects.js';
import { toast } from '/src/ui/commonActions.js';

const TYPE_SCHEMAS = {
  osoba: [
    { key: 'display_name', label: 'Jméno a příjmení', type: 'text', required: true },
    { key: 'typ_subjektu', label: 'Typ', type: 'select', options: [{ value: 'osoba', label: 'Osoba' }], hidden: true },
    { key: 'telefon', label: 'Telefon', type: 'text' },
    { key: 'email', label: 'E-mail', type: 'email' },
    { key: 'country', label: 'Stát', type: 'text' },
    { key: 'city', label: 'Město', type: 'text' },
    { key: 'zip', label: 'PSČ', type: 'text' },
    { key: 'street', label: 'Ulice', type: 'text' },
    { key: 'cislo_popisne', label: 'Číslo popisné', type: 'text' }
  ],
  osvč: [
    { key: 'display_name', label: 'Jméno a příjmení / Firma', type: 'text', required: true },
    { key: 'ico', label: 'IČO', type: 'text' },
    { key: 'dic', label: 'DIČ', type: 'text' },
    { key: 'email', label: 'E-mail', type: 'email' },
  ],
  firma: [
    { key: 'display_name', label: 'Název firmy', type: 'text', required: true },
    { key: 'ico', label: 'IČO', type: 'text' },
    { key: 'dic', label: 'DIČ', type: 'text' },
    { key: 'primary_phone', label: 'Telefon', type: 'text' },
    { key: 'primary_email', label: 'E-mail', type: 'email' },
  ],
  spolek: [
    { key: 'display_name', label: 'Název spolku', type: 'text', required: true },
    { key: 'primary_email', label: 'E-mail', type: 'email' }
  ],
  stat: [
    { key: 'display_name', label: 'Organizace', type: 'text', required: true },
    { key: 'primary_email', label: 'E-mail', type: 'email' }
  ],
  zastupce: [
    { key: 'display_name', label: 'Jméno zástupce', type: 'text', required: true },
    { key: 'zastupuje_id', label: 'Zastupuje (ID subjektu)', type: 'text' }
  ]
};

export async function render(root, params = {}) {
  root.innerHTML = '';
  const type = params.type || 'osoba';
  const schema = TYPE_SCHEMAS[type] || TYPE_SCHEMAS.osoba;

  // načti data pokud editujeme
  let initial = {};
  if (params.id) {
    const { data, error } = await getSubject(params.id);
    if (error) {
      root.innerHTML = `<div class="error">Chyba při načtení: ${error.message || error}</div>`;
      return;
    }
    initial = data || {};
  } else {
    initial = { typ_subjektu: type, role: params.role || 'pronajimatel' };
  }

  renderForm(root, schema, initial, async (values) => {
    // normalizace polí (mapování na sloupce)
    const payload = {
      ...values,
      typ_subjektu: type,
      role: params.role || 'pronajimatel',
      display_name: values.display_name || values.nazev || values.email
    };

    const { data, error } = await upsertSubject(payload);
    if (error) {
      toast('Chyba při ukládání: ' + (error.message || JSON.stringify(error)), 'error');
      return false;
    }
    toast('Uloženo', 'success');
    return true;
  });

  const formEl = root.querySelector('form');
  if (formEl) useUnsavedHelper(formEl);
}
