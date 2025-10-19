// Sdílený univerzální formulář (pronajímatel). Použijeme ho i pro nájemník (proxy export).
import { renderForm } from '/src/ui/form.js';
import { useUnsavedHelper } from '/src/ui/unsaved-helper.js';
import { getSubject, upsertSubject } from '/src/db/subjects.js';
import { toast } from '/src/ui/commonActions.js';

// Schemas per type — rozšiřuj podle tvého spreadsheetu
const TYPE_SCHEMAS = {
  osoba: [
    { key: 'display_name', label: 'Tituly / Jméno', type: 'text', required: true },
    { key: 'jmeno', label: 'Křestní', type: 'text' },
    { key: 'prijmeni', label: 'Příjmení', type: 'text' },
    { key: 'typ_dokladu', label: 'Typ dokladu', type: 'select', options: [{value:'op',label:'Občanský průkaz'},{value:'pas',label:'Pas'},{value:'rid',label:'ŘP'}] },
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
    { key: 'email', label: 'E-mail', type: 'email' }
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
    { key: 'zip', label: 'PSČ', type: 'text' }
  ],
  spolek: [
    { key: 'display_name', label: 'Název spolku', type: 'text', required: true },
    { key: 'primary_email', label: 'Kontakt (e-mail)', type: 'email' },
    { key: 'telefon', label: 'Telefon', type: 'text' }
  ],
  stat: [
    { key: 'display_name', label: 'Organizace', type: 'text', required: true },
    { key: 'primary_email', label: 'Kontakt (e-mail)', type: 'email' }
  ],
  zastupce: [
    { key: 'display_name', label: 'Jméno zástupce', type: 'text', required: true },
    { key: 'zastupuje_id', label: 'Zastupuje (ID subjektu)', type: 'text' },
    { key: 'telefon', label: 'Telefon', type: 'text' },
    { key: 'email', label: 'E-mail', type: 'email' }
  ]
};

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
    initial = { typ_subjektu: type, role: params?.role || 'pronajimatel' };
  }

  renderForm(root, schema, initial, async (values) => {
    const payload = {
      ...values,
      typ_subjektu: type,
      role: params?.role || 'pronajimatel',
      display_name: values.display_name || values.jmeno ? `${values.jmeno || ''} ${values.prijmeni || ''}`.trim() : values.primary_email
    };

    const { data, error } = await upsertSubject(payload);
    if (error) {
      toast('Chyba při ukládání: ' + (error.message || JSON.stringify(error)), 'error');
      return false;
    }
    toast('Uloženo', 'success');
    // navigate back to list
    window.navigateTo(`#/m/${params?.module || getModuleIdFromHash()}/t/prehled`);
    return true;
  });

  const formEl = root.querySelector('form');
  if (formEl) useUnsavedHelper(formEl);
}

// helper to find current module from hash (used for navigation)
function getModuleIdFromHash() {
  try {
    const m = (location.hash || '').match(/#\/m\/([^\/]+)/);
    return m ? m[1] : null;
  } catch (e) { return null; }
}
