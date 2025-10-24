import { setBreadcrumb } from '/src/ui/breadcrumb.js';
import { renderForm } from '/src/ui/form.js';
import { renderCommonActions } from '/src/ui/commonActions.js';
import { navigateTo } from '/src/app.js';
import { getProperty, upsertProperty, archiveProperty } from '/src/modules/040-nemovitost/db.js';
import { useUnsavedHelper } from '/src/ui/unsaved-helper.js';
import { showAttachmentsModal } from '/src/ui/attachments.js';
import { setUnsaved } from '/src/app.js';
import { FIELDS } from '/src/modules/040-nemovitost/forms/fields.js';

// ... (getHashParams, formatCzechDate) zůstávají stejné

export async function render(root, params) {
  const { id, type } = params || getHashParams();
  let data = {};
  if (id) {
    const { data: propertyData, error } = await getProperty(id);
    if (error) { root.innerHTML = `<div class="p-4 text-red-600">Chyba: ${error.message}</div>`; return;}
    data = { ...propertyData };
  } else if (type) {
    data.typ_nemovitosti = type;
  }

  const nazev = data.nazev || id || 'Nová nemovitost';
  try {
    setBreadcrumb(document.getElementById('crumb'), [
      { icon: 'home', label: 'Domů', href: '#/' },
      { icon: 'building', label: 'Nemovitosti', href: '#/m/040-nemovitost' },
      { icon: 'form', label: 'Formulář' },
      { icon: 'edit', label: nazev }
    ]);
  } catch (e) {}

  root.innerHTML = `<div id="commonactions" class="mb-4"></div><div id="property-form"></div>`;

  const myRole = window.currentUserRole || 'admin';
  // přidáno 'units' do moduleActions
  const moduleActions = ['save', 'units', 'attach', 'archive', 'reject', 'history'];
  const handlers = {};

  handlers.onSave = async () => {
    const values = grabValues(root);
    if (window.currentUser) {
      values.updated_by = window.currentUser.display_name || window.currentUser.username || window.currentUser.email;
    }
    if (!id) {
      values.id = crypto.randomUUID ? crypto.randomUUID() : Date.now().toString();
    } else {
      values.id = id;
    }

    const { data: updated, error } = await upsertProperty(values);
    if (error) {
      alert('Chyba při ukládání: ' + error.message);
      return;
    }
    alert('Uloženo.');
    setUnsaved(false);

    // po uložení: pokud vznikl nový záznam, navigujeme na edit/detail tak, aby tlačítko Jednotky fungovalo
    const propertyId = updated?.id || values.id;
    // obnovíme formulář s novým id (zůstává v edit modu)
    navigateTo(`#/m/040-nemovitost/f/edit?id=${propertyId}`);
  };

  handlers.onReject = () => navigateTo('#/m/040-nemovitost/t/prehled');

  if (id && !data.archived) {
    handlers.onArchive = async () => {
      await archiveProperty(id);
      alert('Nemovitost byla archivována.');
      navigateTo('#/m/040-nemovitost/t/prehled');
    };
  }

  handlers.onAttach = () => id && showAttachmentsModal({ entity: 'properties', entityId: id });
  handlers.onHistory = () => id && alert('Historie - implementovat');

  // NOVÉ: handler pro Jednotky (pracuje i pokud id undefined, můžete nasměrovat na chooser)
  handlers.onUnits = () => {
    const propertyId = id || (document.querySelector('[name="id"]') && document.querySelector('[name="id"]').value) || '';
    if (propertyId) {
      navigateTo(`#/m/040-nemovitost/t/jednotky?propertyId=${propertyId}`);
    } else {
      // pokud nemáme id (je to nové), uživatel musí nejdřív uložit; můžeme otevřít chooser
      navigateTo(`#/m/040-nemovitost/f/unit-chooser`);
    }
  };

  renderCommonActions(document.getElementById('commonactions'), {
    moduleActions,
    userRole: myRole,
    handlers
  });

  // renderForm - readOnly:false
  renderForm(root.querySelector('#property-form'), FIELDS, data, async () => true, {
    readOnly: false,
    showSubmit: false,
    layout: { columns: { base: 1, md: 2, xl: 3 }, density: 'compact' },
    sections: [
      { id: 'zakladni', label: 'Základní údaje', fields: ['nazev','typ_nemovitosti','ulice','cislo_popisne','cislo_orientacni','mesto','psc','kraj','stat','pocet_podlazi','rok_vystavby','rok_rekonstrukce','celkova_plocha','pocet_jednotek'] },
      { id: 'system', label: 'Systém', fields: ['archived','poznamky','vybaveni','pronajimatel','updated_at','updated_by','created_at'] }
    ]
  });

  const formEl = root.querySelector("form");
  if (formEl) useUnsavedHelper(formEl);
}

function grabValues(scopeEl) {
  const obj = {};
  for (const f of FIELDS) {
    if (f.readOnly) continue;
    const el = scopeEl.querySelector(`[name="${f.key}"]`);
    if (!el) continue;
    obj[f.key] = (el.type === 'checkbox') ? !!el.checked : el.value;
  }
  return obj;
}

export default { render };
