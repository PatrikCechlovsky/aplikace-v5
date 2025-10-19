// src/modules/030-pronajimatel/forms/form.js
// Sdílený univerzální formulář pro všechny typy subjektů.
// - Dynamické schéma podle TYPE_SCHEMAS
// - Form nemá vlastní "Uložit" tlačítko (showSubmit: false) — ukládá se přes commonActions (onSave)
// - Po uložení volá upsertSubject (který už automaticky přiřadí subjekt k profilu)

import { renderForm } from '/src/ui/form.js';
import { useUnsavedHelper } from '/src/ui/unsaved-helper.js';
import { renderCommonActions } from '/src/ui/commonActions.js';
import { getSubject, upsertSubject } from '/src/db/subjects.js';
import { toast } from '/src/ui/commonActions.js';
import { icon } from '/src/ui/icons.js';
import { setUnsaved } from '/src/app.js';
import { navigateTo } from '/src/app.js';

// TYPE_SCHEMAS — upraveno podle tvého spreadsheetu (základní verze)
const TYPE_SCHEMAS = {
  osoba: [
    { key: 'display_name', label: 'Tituly / Jméno', type: 'text', required: true },
    { key: 'jmeno', label: 'Křestní jméno', type: 'text' },
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

const TYPE_LABELS = {
  osoba: 'Osoba',
  osvc: 'OSVČ',
  firma: 'Firma',
  spolek: 'Spolek / Skupina',
  stat: 'Státní instituce',
  zastupce: 'Zástupce'
};

function getModuleIdFromHash() {
  try {
    const m = (location.hash || '').match(/#\/m\/([^\/]+)/);
    return m ? m[1] : null;
  } catch (e) { return null; }
}

// získat parametry z hashe (type, id, role)
function getHashParams() {
  const q = (location.hash.split('?')[1] || '');
  return Object.fromEntries(new URLSearchParams(q));
}

// čtení hodnot z formuláře (podobné grabValues v profil form)
function grabValues(root, schema) {
  const obj = {};
  for (const f of schema) {
    if (f.type === 'label') continue; // readonly label
    const el = root.querySelector(`[name="${f.key}"]`);
    if (!el) continue;
    obj[f.key] = (el.type === 'checkbox') ? !!el.checked : el.value;
  }
  return obj;
}

export async function render(root, params = {}) {
  root.innerHTML = '';
  const hash = getHashParams();
  const type = params?.type || hash.type || 'osoba';
  const id = params?.id || hash.id || null;
  const moduleId = params?.module || getModuleIdFromHash() || (hash.role === 'najemnik' ? '050-najemnik' : '030-pronajimatel');
  const schema = TYPE_SCHEMAS[type] || TYPE_SCHEMAS['osoba'];
  const typeLabel = TYPE_LABELS[type] || type;

  // header (typ nad formulářem)
  const header = document.createElement('div');
  header.className = 'mb-4';
  header.innerHTML = `<div class="flex items-center gap-3"><span style="font-size:20px">${icon('tile')}</span><div><h2 class="text-lg font-semibold">Nový subjekt — ${typeLabel}</h2><div class="text-sm text-slate-500">Modul: ${moduleId}</div></div></div>`;
  root.appendChild(header);

  // area for common actions
  const actionsWrap = document.createElement('div');
  actionsWrap.id = 'commonactions';
  root.appendChild(actionsWrap);

  // načíst existující data pokud máme id (edit)
  let initial = {};
  if (id) {
    const { data, error } = await getSubject(id);
    if (error) {
      root.innerHTML += `<div class="p-2 text-red-600">Chyba při načtení záznamu: ${error.message || error}</div>`;
      return;
    }
    initial = data || {};
  } else {
    initial = { typ_subjektu: type, role: params?.role || (moduleId?.startsWith('050') ? 'najemnik' : 'pronajimatel') };
  }

  // commonActions handlers (save handled here)
  const handlers = {};

  handlers.onSave = async () => {
    // set unsaved state from app
    setUnsaved(true);
    // přečíst aktuální hodnoty z DOM podle schema
    const values = grabValues(root, schema);
    // doplnit metainformace
    const payload = {
      ...values,
      typ_subjektu: type,
      role: initial.role || (moduleId?.startsWith('050') ? 'najemnik' : 'pronajimatel'),
      source_module: moduleId || null,
      // při editaci předej id
      ...(id ? { id } : {})
    };

    // volání DB helperu
    const { data: saved, error } = await upsertSubject(payload);
    if (error) {
      toast('Chyba při ukládání: ' + (error.message || JSON.stringify(error)), 'error');
      setUnsaved(false);
      return;
    }
    toast('Uloženo', 'success');
    setUnsaved(false);
    // po ulozeni naviguj do přehledu modulu
    if (moduleId) {
      if (typeof navigateTo === 'function') navigateTo(`#/m/${moduleId}/t/prehled`);
      else location.hash = `#/m/${moduleId}/t/prehled`;
    }
  };

  handlers.onReject = () => {
    if (moduleId) {
      if (typeof navigateTo === 'function') navigateTo(`#/m/${moduleId}/t/prehled`);
      else location.hash = `#/m/${moduleId}/t/prehled`;
    } else history.back();
  };

  handlers.onAttach = () => {
    // TODO: implement attachments modal for subjects
    alert('Přílohy (zatím neimplementováno)');
  };

  handlers.onHistory = () => {
    // TODO: pokud existuje historie subjektu, otevřít modal
    alert('Historie (zatím neimplementováno)');
  };

  // akce: přizpůsobit, které ikony/akce ukázat
  const moduleActions = id ? ['save', 'reject', 'attach', 'history'] : ['save', 'reject'];

  // render common actions
  renderCommonActions(document.getElementById('commonactions'), {
    moduleActions,
    userRole: window.currentUserRole || 'admin',
    handlers
  });

  // render samotného formuláře (bez submitu)
  renderForm(root, schema, initial, async () => true, {
    readOnly: false,
    showSubmit: false,
    layout: { columns: { base: 1, md: 2, xl: 2 }, density: 'compact' }
  });

  // use unsaved helper for the form
  const formEl = root.querySelector('form');
  if (formEl) useUnsavedHelper(formEl);
}
