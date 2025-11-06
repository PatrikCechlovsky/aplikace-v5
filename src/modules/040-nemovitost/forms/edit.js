// 040-nemovitost/forms/edit.js
import { setBreadcrumb } from '/src/ui/breadcrumb.js';
import { renderForm } from '/src/ui/form.js';
import { renderCommonActions } from '/src/ui/commonActions.js';
import { navigateTo } from '/src/app.js';
import { getProperty, upsertProperty, archiveProperty } from '/src/modules/040-nemovitost/db.js';
import { useUnsavedHelper } from '/src/ui/unsaved-helper.js';
import { showAttachmentsModal } from '/src/ui/attachments.js';
import { setUnsaved } from '/src/app.js';
import { FIELDS } from '/src/modules/040-nemovitost/forms/fields.js';

function getHashParams() {
  const q = (location.hash.split('?')[1] || '');
  return Object.fromEntries(new URLSearchParams(q));
}

function formatCzechDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d)) return '';
  return d.toLocaleDateString('cs-CZ') + ' ' + d.toLocaleTimeString('cs-CZ');
}

export async function render(root, params) {
  const { id, type } = params || getHashParams();
  
  let data = {};
  if (id) {
    const { data: propertyData, error } = await getProperty(id);
    if (error) {
      root.innerHTML = `<div class="p-4 text-red-600">Chyba při načítání nemovitosti: ${error.message}</div>`;
      return;
    }
    if (!propertyData) {
      root.innerHTML = `<div class="p-4 text-red-600">Nemovitost nenalezena.</div>`;
      return;
    }
    data = { ...propertyData };
    for (const f of FIELDS) {
      if (f.readOnly) {
        if (f.format && data[f.key]) {
          data[f.key] = f.format(data[f.key]);
        }
        if (!data[f.key]) {
          data[f.key] = '--';
        }
      }
    }
    if (typeof data.archived === 'undefined') data.archived = false;
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
  const moduleActions = ['save', 'units', 'attach', 'archive', 'reject', 'history'];
  const handlers = {};

  handlers.onSave = async () => {
    const values = grabValues(root);
    if (window.currentUser) {
      values.updated_by =
        window.currentUser.display_name ||
        window.currentUser.username ||
        window.currentUser.email;
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
    
    if (!id) {
      navigateTo(`#/m/040-nemovitost/f/detail?id=${updated.id}`);
    } else {
      const { data: refreshed } = await getProperty(id);
      if (refreshed) {
        for (const f of FIELDS) {
          if (f.readOnly) {
            if (f.format && refreshed[f.key]) {
              refreshed[f.key] = f.format(refreshed[f.key]);
            }
            if (!refreshed[f.key]) {
              refreshed[f.key] = '--';
            }
          }
        }
        renderForm(root.querySelector('#property-form'), FIELDS, refreshed, async () => true, {
          readOnly: false,
          showSubmit: false,
          layout: { columns: { base: 1, md: 2, xl: 3 }, density: 'compact' },
          sections: [
            { id: 'zakladni', label: 'Základní údaje', fields: [
              'nazev', 'typ_nemovitosti', 'ulice', 'cislo_popisne', 'mesto', 'psc',
              'pocet_podlazi', 'rok_vystavby', 'pocet_jednotek'
            ] },
            { id: 'system', label: 'Systém', fields: [
              'archived', 'poznamka', 'updated_at', 'updated_by', 'created_at'
            ] },
          ]
        });
      }
    }
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

  handlers.onUnits = () => {
    const propertyId = id || (document.querySelector('[name="id"]') && document.querySelector('[name="id"]').value) || '';
    if (propertyId) {
      navigateTo(`#/m/040-nemovitost/t/jednotky?propertyId=${propertyId}`);
    } else {
      navigateTo(`#/m/040-nemovitost/f/unit-chooser`);
    }
  };

  renderCommonActions(document.getElementById('commonactions'), {
    moduleActions,
    userRole: myRole,
    handlers
  });

  renderForm(root.querySelector('#property-form'), FIELDS, data, async () => true, {
    readOnly: false,
    showSubmit: false,
    layout: { columns: { base: 1, md: 2, xl: 3 }, density: 'compact' },
    sections: [
      { id: 'zakladni', label: 'Základní údaje', fields: [
        'nazev', 'typ_nemovitosti', 'ulice', 'cislo_popisne', 'mesto', 'psc',
        'pocet_podlazi', 'rok_vystavby', 'pocet_jednotek'
      ] },
      { id: 'system', label: 'Systém', fields: [
        'archived', 'poznamka', 'updated_at', 'updated_by', 'created_at'
      ] },
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
