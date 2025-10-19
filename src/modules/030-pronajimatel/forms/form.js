// src/modules/030-pronajimatel/forms/form.js
// Shared dynamic form — krok1 + krok2 (guard + tlačítko "Vyplnit z mého účtu")
// Pozn.: automatické naplnění profilovými daty bylo odstraněno; uživatel musí stisknout tlačítko.

import { renderForm } from '/src/ui/form.js';
import { useUnsavedHelper } from '/src/ui/unsaved-helper.js';
import { renderCommonActions, toast } from '/src/ui/commonActions.js';
import { getSubject, upsertSubject } from '/src/db/subjects.js';
import { getProfile } from '/src/db.js';
import { icon } from '/src/ui/icons.js';
import { setUnsaved } from '/src/app.js';
import { navigateTo } from '/src/app.js';
import { setBreadcrumb } from '/src/ui/breadcrumb.js';
import { supabase } from '/src/supabase.js';

// Minimální TYPE_SCHEMAS (plné schéma doplníme v dalším kroku)
const TYPE_SCHEMAS = {
  osoba: [
    { key: 'display_name', label: 'Tituly / Jméno', type: 'text', required: true },
    { key: 'jmeno', label: 'Křestní jméno', type: 'text' },
    { key: 'prijmeni', label: 'Příjmení', type: 'text' },
    { key: 'typ_dokladu', label: 'Typ dokladu', type: 'select', options: [{value:'op',label:'Občanský průkaz'},{value:'pas',label:'Pas'},{value:'rid',label:'ŘP'}] },
    { key: 'cislo_dokladu', label: 'Číslo dokladu', type: 'text' },
    { key: 'telefon', label: 'Telefon', type: 'text' },
    { key: 'primary_email', label: 'E-mail', type: 'email' },
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
    { key: 'primary_email', label: 'E-mail', type: 'email' },
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
    { key: 'primary_email', label: 'E-mail', type: 'email' }
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
function getHashParams() {
  const q = (location.hash.split('?')[1] || '');
  return Object.fromEntries(new URLSearchParams(q));
}

function grabValues(root, schema) {
  const obj = {};
  for (const f of schema) {
    if (f.type === 'label') continue;
    const el = root.querySelector(`[name="${f.key}"]`);
    if (!el) continue;
    obj[f.key] = (el.type === 'checkbox') ? !!el.checked : el.value;
  }
  return obj;
}

// mapování profilových dat na pole formuláře (pouze pro tlačítko Fill)
function mapProfileToValues(profile = {}) {
  return {
    display_name: profile.display_name || ((profile.first_name || profile.last_name) ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() : '') || '',
    jmeno: profile.first_name || '',
    prijmeni: profile.last_name || '',
    primary_email: profile.email || profile.primary_email || '',
    primary_phone: profile.phone || profile.primary_phone || '',
    street: profile.street || '',
    cislo_popisne: profile.house_number || profile.cislo_popisne || '',
    city: profile.city || '',
    zip: profile.zip || '',
    ico: profile.ico || ''
  };
}

// safe setter do polí formuláře (najde input/select/textarea a nastaví hodnotu)
function setFormValues(root, values) {
  for (const key of Object.keys(values)) {
    const el = root.querySelector(`[name="${key}"]`);
    if (!el) continue;
    if (el.type === 'checkbox') el.checked = !!values[key];
    else el.value = values[key] ?? '';
    // dispatch input event to trigger form internals
    el.dispatchEvent(new Event('input', { bubbles: true }));
  }
}

export async function render(root, params = {}) {
  root.innerHTML = '';
  const hash = getHashParams();
  const type = params?.type || hash.type || null;
  const id = params?.id || hash.id || null;
  const moduleId = params?.module || getModuleIdFromHash() || (hash.role === 'najemnik' ? '050-najemnik' : '030-pronajimatel');

  // Guard: pokud není ani type ani id → přesměruj na chooser (nový subjekt)
  if (!id && !type) {
    if (typeof navigateTo === 'function') {
      navigateTo(`#/m/${moduleId}/f/chooser`);
    } else {
      location.hash = `#/m/${moduleId}/f/chooser`;
    }
    return;
  }

  const schema = TYPE_SCHEMAS[type] || TYPE_SCHEMAS['osoba'];
  const typeLabel = TYPE_LABELS[type] || type || 'Osoba';

  // breadcrumb: Domů › Modul › Formulář › (Nový <typ> | jméno)
  try {
    const nameForCrumb = id ? (params?.title || 'Záznam') : `Nový ${typeLabel}`;
    setBreadcrumb(document.getElementById('crumb'), [
      { icon: 'home', label: 'Domů', href: '#/' },
      { icon: (moduleId.startsWith('050') ? 'users' : 'users'), label: (moduleId.startsWith('050') ? 'Nájemník' : 'Pronajímatel'), href: `#/m/${moduleId}` },
      { icon: 'form', label: 'Formulář' },
      { icon: 'account', label: nameForCrumb }
    ]);
  } catch (e) { /* ignore if crumb missing */ }

  // header + actions container (přidáme tlačítko "Vyplnit z mého účtu")
  const header = document.createElement('div');
  header.className = 'mb-4 flex items-center justify-between';
  header.innerHTML = `<div class="flex items-center gap-3"><span style="font-size:20px">${icon('form')}</span><div><h2 class="text-lg font-semibold">Formulář — ${typeLabel}</h2><div class="text-sm text-slate-500">Modul: ${moduleId}</div></div></div><div id="form-actions-extra" class="flex items-center gap-2"></div>`;
  root.appendChild(header);

  // extra actions area (tlačítko pro načtení z profilu)
  const extraActions = header.querySelector('#form-actions-extra');
  const fillBtn = document.createElement('button');
  fillBtn.type = 'button';
  fillBtn.className = 'inline-flex items-center gap-2 px-3 py-2 rounded-md border text-sm';
  fillBtn.innerHTML = `${icon('user')} Vyplnit z mého účtu`;
  extraActions.appendChild(fillBtn);

  const actionsWrap = document.createElement('div');
  actionsWrap.id = 'commonactions';
  root.appendChild(actionsWrap);

  // načíst existující data pokud editujeme
  let initial = {};
  if (id) {
    const { data, error } = await getSubject(id);
    if (error) {
      root.innerHTML += `<div class="p-2 text-red-600">Chyba při načtení záznamu: ${error.message || error}</div>`;
      return;
    }
    initial = data || {};
  } else {
    // new record - nezaplníme automaticky (uživatel použije tlačítko)
    initial = { typ_subjektu: type, role: params?.role || (moduleId?.startsWith('050') ? 'najemnik' : 'pronajimatel'), ...(params?.preserved || {}) };
  }

  // commonActions handlers
  const handlers = {};
  handlers.onSave = async () => {
    setUnsaved(true);
    const values = grabValues(root, schema);
    const payload = {
      ...values,
      typ_subjektu: type,
      role: initial.role || (moduleId?.startsWith('050') ? 'najemnik' : 'pronajimatel'),
      source_module: moduleId || null,
      ...(id ? { id } : {})
    };
    const { data: saved, error } = await upsertSubject(payload);
    if (error) {
      toast('Chyba při ukládání: ' + (error.message || JSON.stringify(error)), 'error');
      setUnsaved(false);
      return;
    }
    toast('Uloženo', 'success');
    setUnsaved(false);
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
  handlers.onAttach = () => alert('Přílohy zatím neimplementováno');
  handlers.onHistory = () => alert('Historie zatím neimplementováno');

  const moduleActions = id ? ['save', 'reject', 'attach', 'history'] : ['save', 'reject'];

  renderCommonActions(document.getElementById('commonactions'), {
    moduleActions,
    userRole: window.currentUserRole || 'admin',
    handlers
  });

  // render samotného formuláře (bez submit tlačítka)
  renderForm(root, schema, initial, async () => true, {
    readOnly: false,
    showSubmit: false,
    layout: { columns: { base: 1, md: 2, xl: 2 }, density: 'compact' }
  });

  // implementace tlačítka "Vyplnit z mého účtu"
  fillBtn.addEventListener('click', async () => {
    fillBtn.disabled = true;
    fillBtn.textContent = 'Načítám…';
    try {
      // zkus získat uid
      let uid = window.currentUser?.id;
      if (!uid) {
        try {
          const { data: userResp } = await supabase.auth.getUser();
          uid = userResp?.data?.user?.id || userResp?.user?.id || null;
        } catch (e) {
          // ignore
        }
      }
      if (!uid) {
        alert('Nelze zjistit přihlášeného uživatele.');
        return;
      }
      const { data: profile, error } = await getProfile(uid);
      if (error || !profile) {
        alert('Nelze načíst profil uživatele: ' + (error?.message || 'žádná data'));
        return;
      }
      const mapped = mapProfileToValues(profile);
      setFormValues(root, mapped);
      toast('Formulář naplněn z mého účtu', 'success');
    } catch (e) {
      console.error(e);
      alert('Chyba při načítání profilu.');
    } finally {
      fillBtn.disabled = false;
      fillBtn.innerHTML = `${icon('user')} Vyplnit z mého účtu`;
    }
  });

  const formEl = root.querySelector('form');
  if (formEl) useUnsavedHelper(formEl);
}
