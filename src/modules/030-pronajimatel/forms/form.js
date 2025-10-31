import { setBreadcrumb } from '/src/ui/breadcrumb.js';
import { renderForm } from '/src/ui/form.js';
import { renderCommonActions } from '/src/ui/commonActions.js';
import { renderTabs, createRelatedEntitiesTable } from '/src/ui/tabs.js';
import { navigateTo } from '/src/app.js';
import { getSubject, upsertSubject } from '/src/modules/030-pronajimatel/db.js';
import { listProperties } from '/src/modules/040-nemovitost/db.js';
import { showHistoryModal } from '/src/ui/history.js';
import TYPE_SCHEMAS from '/src/modules/030-pronajimatel/type-schemas.js';
import { fetchFromARES } from '/src/services/ares.js';
import { useUnsavedHelper } from '/src/ui/unsaved-helper.js';
import { setUnsaved } from '/src/app.js';

// Přidané importy (non-destructive doplnění)
import { renderTabs, createRelatedEntitiesTable } from '/src/ui/tabs.js';
import { listProperties } from '/src/modules/040-nemovitost/db.js';

// Helper to parse hash params
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

export async function render(root) {
  const { id, type: qtype, mode: modeParam } = getHashParams();
  const type = qtype || 'spolek';
  const mode = (modeParam === 'read') ? 'read' : 'edit';

  // set breadcrumb
  try {
    setBreadcrumb(document.getElementById('crumb'), [
      { icon: 'home',  label: 'Domů', href: '#/' },
      { icon: 'users', label: 'Pronajímatel', href: '#/m/030-pronajimatel' },
      { icon: 'form',  label: 'Formulář' },
      { icon: 'account', label: id ? 'Editace' : `Nový ${type.charAt(0).toUpperCase() + type.slice(1)}` }
    ]);
  } catch (e) {}

  // Load existing data if editing
  let data = {};
  if (id) {
    const { data: sub, error } = await getSubject(id);
    if (error) {
      root.innerHTML = `<div class="p-4 text-red-600">Chyba při načítání: ${error.message || JSON.stringify(error)}</div>`;
      return;
    }
    data = sub || {};
    // format some readonly date fields
    data.updated_at = formatCzechDate(data.updated_at);
    data.created_at = formatCzechDate(data.created_at);
  }

  // build fields from TYPE_SCHEMAS for the given type
  const schema = TYPE_SCHEMAS[type] || [];
  const fields = schema.map(f => ({ ...f }));

  const sections = [
    { id: 'profil', label: 'Profil', fields: fields.map(f => f.key) },
    { id: 'system', label: 'Systém', fields: ['archived','created_at','updated_at','updated_by'] }
  ];

  // Render form (hide internal submit buttons - commonActions will render Save)
  renderForm(root, fields, data, async (values) => {
    // submit handler
    try {
      // pass current user if available
      const curUser = window.currentUser || null;
      const { data: saved, error } = await upsertSubject(values, curUser);
      if (error) {
        alert('Chyba při ukládání: ' + (error.message || JSON.stringify(error)));
        return false;
      }
      alert('Uloženo.');
      setUnsaved(false);
      // navigate to overview or keep editing
      navigateTo('#/m/030-pronajimatel/t/prehled');
      return true;
    } catch (e) {
      alert('Chyba při ukládání: ' + e.message);
      return false;
    }
  }, {
    readOnly: mode === 'read',
    showSubmit: false, // submit moved to commonActions
    layout: { columns: { base: 1, md: 2, xl: 2 }, density: 'compact' },
    sections
  });

  // attach unsaved helper
  const formEl = root.querySelector('form');
  if (formEl) useUnsavedHelper(formEl);

  // add ARES lookup button if schema contains ico
  const icoInput = root.querySelector('input[name="ico"]');
  if (icoInput) {
    const wrapper = icoInput.parentElement || icoInput;
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.title = 'Načíst z ARES';
    btn.className = 'ml-2 inline-flex items-center px-2 py-1 border rounded text-sm';
    btn.innerHTML = '🔍';
    btn.disabled = !icoInput.value;
    icoInput.addEventListener('input', () => { btn.disabled = !icoInput.value.trim(); });
    btn.addEventListener('click', async () => {
      const val = (icoInput.value || '').trim();
      if (!val) { alert('Zadejte IČO'); return; }
      try {
        const aresData = await fetchFromARES(val);
        if (!aresData) { alert('ARES: nic nenalezeno'); return; }
        
        // Map ARES data to form fields
        const fieldMapping = {
          'display_name': aresData.display_name,
          'nazev': aresData.nazev,
          'ico': aresData.ico,
          'dic': aresData.dic,
          'ulice': aresData.ulice,
          'cislo_popisne': aresData.cislo_popisne,
          'cislo_orientacni': aresData.cislo_orientacni,
          'mesto': aresData.mesto || aresData.city,
          'city': aresData.city || aresData.mesto,
          'psc': aresData.psc,
          'kraj': aresData.kraj,
          'stat': aresData.stat,
          'street': aresData.ulice,
          'zip': aresData.psc,
          'primary_email': aresData.primary_email,
          'primary_phone': aresData.primary_phone,
          'pravni_forma_kod': aresData.pravni_forma_kod,
          'pravni_forma_nazev': aresData.pravni_forma_nazev,
          'datum_vzniku': aresData.datum_vzniku,
          'datum_zaniku': aresData.datum_zaniku
        };
        
        // Set values into inputs and dispatch input events
        Object.entries(fieldMapping).forEach(([fieldName, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            const el = root.querySelector(`[name="${fieldName}"]`);
            if (el) {
              el.value = value;
              el.dispatchEvent(new Event('input', { bubbles: true }));
            }
          }
        });
        
        alert('Data byla úspěšně načtena z ARES.');
      } catch (e) {
        alert('Chyba ARES: ' + (e.message || e));
      }
    });
    // place button after the input
    wrapper.appendChild(btn);
  }

  // ------- START: Přidané vykreslení záložky Nemovitosti (non-destructive) -------
  try {
    // vytvoříme kontejner pro tabs pod formulářem (neodstraníme nic)
    const tabsContainer = document.createElement('div');
    tabsContainer.className = 'mt-6';
    // přidáme tabs container pod root (form je vykreslen v root)
    root.appendChild(tabsContainer);

    const tabs = [
      {
        label: 'Nemovitosti',
        icon: '🏢',
        badge: null,
        content: async (container) => {
          container.innerHTML = '<div class="text-center py-4">Načítání nemovitostí...</div>';

          // defend: pokud chybí id, nepokoušet se načítat
          if (!id) {
            container.innerHTML = '<div class="p-4 text-gray-500">Nemovitosti jsou dostupné po uložení záznamu.</div>';
            return;
          }

          try {
            const { data: properties, error: propError } = await listProperties({ landlordId: id, showArchived: false, limit: 1000 });

            if (propError) {
              container.innerHTML = `<div class="text-red-600 p-4">Chyba při načítání nemovitostí: ${propError.message || JSON.stringify(propError)}</div>`;
              return;
            }

            if (!properties || properties.length === 0) {
              container.innerHTML = '<div class="text-gray-500 p-4">Žádné nemovitosti</div>';
              return;
            }

            const table = createRelatedEntitiesTable(
              properties,
              [
                { 
                  label: 'Název', 
                  field: 'nazev',
                  render: (val, row) => `<strong>${val || 'Bez názvu'}</strong>`
                },
                { 
                  label: 'Adresa', 
                  field: 'ulice',
                  render: (val, row) => `${val || ''} ${row.cislo_popisne || ''}, ${row.mesto || ''}`
                },
                { 
                  label: 'Typ', 
                  field: 'typ_nemovitosti',
                  render: (val) => {
                    const typeLabels = {
                      'bytovy_dum': 'Bytový dům',
                      'rodinny_dum': 'Rodinný dům',
                      'kancelar': 'Kancelář',
                      'obchod': 'Obchod',
                      'sklad': 'Sklad',
                      'jina_nemovitost': 'Jiná nemovitost'
                    };
                    return typeLabels[val] || val || '-';
                  }
                },
                { 
                  label: 'Vytvořeno', 
                  field: 'created_at',
                  render: (val) => val ? new Date(val).toLocaleDateString('cs-CZ') : '-'
                }
              ],
              {
                emptyMessage: 'Žádné nemovitosti',
                onRowClick: (row) => {
                  navigateTo(`#/m/040-nemovitost/f/detail?id=${row.id}`);
                },
                className: 'cursor-pointer'
              }
            );

            container.innerHTML = '';
            container.appendChild(table);
          } catch (e) {
            container.innerHTML = `<div class="text-red-600 p-4">Výjimka při načítání: ${e.message || e}</div>`;
          }
        }
      }
    ];

    // vykreslíme tabs (ponecháme ostatní chování bez změn)
    renderTabs(tabsContainer, tabs, { defaultTab: 0 });
  } catch (e) {
    // ticho v případě chyb vykreslení tabů (nepřepisujeme UI)
    console.error('Chyba při přidávání Nemovitosti záložky:', e);
  }
  // ------- END: Přidané vykreslení záložky Nemovitosti -------

  // common actions (save, archive, history etc.)
  const myRole = window.currentUserRole || 'admin';
  const handlers = {
    onSave: () => formEl ? formEl.requestSubmit() : null,
    onAttach: () => id && window.showAttachmentsModal && window.showAttachmentsModal({ entity: 'subjects', entityId: id }),
    onHistory: () => {
      if (!id) { alert('Historie dostupná po uložení'); return; }
      showHistoryModal(async (subjectId) => {
        return await (await import('/src/modules/030-pronajimatel/db.js')).getSubjectHistory(subjectId);
      }, id);
    },
    onArchive: async () => {
      if (!id) { alert('Uložte nejprve záznam.'); return; }
      const { data, error } = await (await import('/src/modules/030-pronajimatel/db.js')).archiveSubject(id, window.currentUser);
      if (error) alert('Chyba: ' + (error.message || JSON.stringify(error))); else { alert('Archivováno'); navigateTo('#/m/030-pronajimatel/t/prehled'); }
    }
  };

  // render common actions in header area
  renderCommonActions(document.getElementById('commonactions'), {
    moduleActions: mode === 'read' ? ['edit','attach','history'] : ['save','attach','archive','history'],
    userRole: myRole,
    handlers
  });

  // Add tabs container for related entities (only when editing existing record)
  if (id) {
    const tabsContainer = document.createElement('div');
    tabsContainer.className = 'mt-6';
    root.appendChild(tabsContainer);

    // Define tabs with Nemovitosti tab
    const tabs = [
      {
        label: 'Nemovitosti',
        icon: '🏢',
        badge: null,
        content: async (container) => {
          container.innerHTML = '<div class="text-center py-4">Načítání nemovitostí...</div>';
          
          try {
            // Load properties for this landlord
            const { data: properties, error: propError } = await listProperties({ landlordId: id, showArchived: false, limit: 1000 });
            
            if (propError) {
              container.innerHTML = `<div class="text-red-600 p-4">Chyba při načítání nemovitostí: ${propError.message}</div>`;
              return;
            }

            container.innerHTML = '';
            
            if (!properties || properties.length === 0) {
              container.innerHTML = '<div class="text-gray-500 p-4">Žádné nemovitosti</div>';
              return;
            }

            // Create table with properties
            const table = createRelatedEntitiesTable(
              properties,
              [
                { 
                  label: 'Název', 
                  field: 'nazev',
                  render: (val, row) => `<strong>${val || 'Bez názvu'}</strong>`
                },
                { 
                  label: 'Adresa', 
                  field: 'ulice',
                  render: (val, row) => {
                    const parts = [val, row.cislo_popisne].filter(Boolean).join(' ');
                    const mesto = row.mesto || '';
                    return [parts, mesto].filter(Boolean).join(', ');
                  }
                },
                { 
                  label: 'Typ', 
                  field: 'typ_nemovitosti',
                  render: (val) => {
                    const typeLabels = {
                      'bytovy_dum': 'Bytový dům',
                      'rodinny_dum': 'Rodinný dům',
                      'kancelar': 'Kancelář',
                      'obchod': 'Obchod',
                      'sklad': 'Sklad',
                      'jina_nemovitost': 'Jiná nemovitost'
                    };
                    return typeLabels[val] || val || '-';
                  }
                },
                { 
                  label: 'Vytvořeno', 
                  field: 'created_at',
                  render: (val) => val ? new Date(val).toLocaleDateString('cs-CZ') : '-'
                }
              ],
              {
                emptyMessage: 'Žádné nemovitosti',
                onRowClick: (row) => {
                  navigateTo(`#/m/040-nemovitost/f/detail?id=${row.id}`);
                },
                className: 'cursor-pointer'
              }
            );

            container.appendChild(table);
          } catch (e) {
            container.innerHTML = `<div class="text-red-600 p-4">Chyba: ${e.message || 'Neznámá chyba'}</div>`;
          }
        }
      }
    ];

    // Render tabs
    renderTabs(tabsContainer, tabs, { defaultTab: 0 });
  }
}

export default { render };
