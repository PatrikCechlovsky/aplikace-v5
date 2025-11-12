//040-nemovitost/forms/detail.js
import { setBreadcrumb } from '/src/ui/breadcrumb.js';
import { renderForm } from '/src/ui/form.js';
import { renderCommonActions, toast } from '/src/ui/commonActions.js';
import { renderTabs, createRelatedEntitiesTable } from '/src/ui/tabs.js';
import { navigateTo } from '/src/app.js';
import { getPropertyWithOwner, listUnits, archiveProperty } from '/src/modules/040-nemovitost/db.js';
import { showAttachmentsModal } from '/src/ui/attachments.js';
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
  const { id } = params || getHashParams();
  
  if (!id) {
    root.innerHTML = `<div class="p-4 text-red-600">Chybí ID nemovitosti.</div>`;
    return;
  }

  const { data, error } = await getPropertyWithOwner(id);
  if (error) {
    root.innerHTML = `<div class="p-4 text-red-600">Chyba při načítání nemovitosti: ${error.message}</div>`;
    return;
  }
  if (!data) {
    root.innerHTML = `<div class="p-4 text-red-600">Nemovitost nenalezena.</div>`;
    return;
  }
  
  data.pronajimatel = data.pronajimatel_nazev || data.pronajimatel_name || data.pronajimatel_id || null;
  if (data.prilohy && typeof data.prilohy !== 'string') {
    try { data.prilohy = JSON.stringify(data.prilohy); } catch(e){ }
  }
  if (data.vybaveni && typeof data.vybaveni !== 'string') {
    try { data.vybaveni = Array.isArray(data.vybaveni) ? data.vybaveni.join(', ') : JSON.stringify(data.vybaveni); } catch(e){ }
  }

  for (const f of FIELDS) {
    if (f.readOnly || f.format) {
      if (f.format && data[f.key]) {
        data[f.key] = f.format ? f.format(data[f.key]) : data[f.key];
      }
      if (!data[f.key]) {
        data[f.key] = '--';
      }
    } else {
      if (data[f.key] === undefined || data[f.key] === null) data[f.key] = '';
    }
  }
  
  data.archivedLabel = data.archived ? 'Ano' : 'Ne';
  
  try {
    setBreadcrumb(document.getElementById('crumb'), [
      { icon: 'home', label: 'Domů', href: '#/' },
      { icon: 'building', label: 'Nemovitosti', href: '#/m/040-nemovitost' },
      { icon: 'eye', label: 'Detail nemovitosti' },
      { icon: 'building', label: data.nazev || id }
    ]);
  } catch (e) {}

  root.innerHTML = '';
  const commonActionsDiv = document.createElement('div');
  commonActionsDiv.id = 'commonactions';
  commonActionsDiv.className = 'mb-4';
  root.appendChild(commonActionsDiv);
  
  const mainContainer = document.createElement('div');
  mainContainer.className = 'p-4';
  const tabsContainer = document.createElement('div');
  tabsContainer.className = 'mt-6';
  mainContainer.appendChild(tabsContainer);
  root.appendChild(mainContainer);

  const tabs = [
    {
      label: 'Základní údaje',
      icon: '🏢',
      content: (container) => {
        const sections = [
          { id: 'zakladni', label: 'Základní údaje', fields: [
            'nazev', 'typ_nemovitosti', 'ulice', 'cislo_popisne', 'cislo_orientacni', 'mesto', 'psc',
            'kraj', 'stat', 'pocet_podlazi', 'rok_vystavby', 'rok_rekonstrukce', 'celkova_plocha', 'pocet_jednotek'
          ] },
          { id: 'system', label: 'Systém', fields: [
            'archivedLabel', 'poznamky', 'vybaveni', 'prilohy', 'pronajimatel', 'updated_at', 'updated_by', 'created_at'
          ] },
        ];
        renderForm(container, FIELDS, data, async () => true, { readOnly: true, showSubmit: false, layout: { columns: { base:1, md:2, xl:3 }, density: 'compact' }, sections });
      }
    },
    {
      label: 'Vlastník',
      icon: '👤',
      content: (() => {
        if (!data.owner) {
          return '<div class="p-4 text-gray-500">Vlastník není přiřazen</div>';
        }
        return `
          <div class="p-4">
            <h3 class="text-lg font-semibold mb-4">Informace o vlastníkovi</h3>
            <div class="bg-white shadow rounded-lg p-4 space-y-2">
              <div class="grid grid-cols-2 gap-4">
                <div><strong>Název:</strong> ${data.owner.display_name || '-'}</div>
                <div><strong>Role:</strong> ${data.owner.role || '-'}</div>
                <div><strong>Email:</strong> ${data.owner.primary_email || '-'}</div>
                <div><strong>Telefon:</strong> ${data.owner.primary_phone || '-'}</div>
              </div>
              <div class="mt-4">
                <button 
                  onclick="location.hash='#/m/030-pronajimatel/f/detail?id=${data.owner.id}'"
                  class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                  Zobrazit detail vlastníka
                </button>
              </div>
            </div>
          </div>
        `;
      })()
    },
    {
      label: 'Jednotky',
      icon: '🏠',
      badge: null,
      content: async (container) => {
        container.innerHTML = '<div class="text-center py-4">Načítání jednotek...</div>';
        try {
          const { data: units, error: unitsError } = await listUnits(id);
          if (unitsError) {
            container.innerHTML = `<div class="text-red-600 p-4">Chyba při načítání jednotek: ${unitsError.message}</div>`;
            return;
          }
          container.innerHTML = '';
          if (!units || units.length === 0) {
            container.innerHTML = '<div class="text-gray-500 p-4">Žádné jednotky</div>';
            return;
          }
          const table = createRelatedEntitiesTable(units, [
            { label: 'Označení', field: 'oznaceni', render: (val) => `<strong>${val || 'Bez označení'}</strong>` },
            { label: 'Typ', field: 'typ_jednotky', render: (val) => ({ 'byt':'Byt','kancelar':'Kancelář' }[val] || val || '-') },
            { label: 'Stav', field: 'stav', render: (val) => ({ 'volna':'🟢 Volná','obsazena':'🔴 Obsazená' }[val] || val || '-') },
            { label: 'Plocha', field: 'plocha', render: (val) => val ? `${val} m²` : '-' },
            { label: 'Nájem', field: 'mesicni_najem', render: (val) => val ? `${val} Kč` : '-' }
          ], { emptyMessage: 'Žádné jednotky', onRowClick: (row) => navigateTo(`#/m/040-nemovitost/f/unit-detail?id=${row.id}`), className: 'cursor-pointer' });
          container.appendChild(table);
        } catch (error) {
          container.innerHTML = `<div class="text-red-600 p-4">Chyba při načítání jednotek: ${error.message}</div>`;
        }
      }
    },
    {
      label: 'Dokumenty',
      icon: '📄',
      content: (container) => {
        container.innerHTML = `
          <div class="p-4">
            <h3 class="text-lg font-semibold mb-2">Dokumenty a přílohy</h3>
            <button id="property-attachments-btn" class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">Spravovat přílohy</button>
          </div>
        `;
        const btn = container.querySelector('#property-attachments-btn');
        if (btn) {
          btn.addEventListener('click', () => {
            if (window.showAttachmentsModal) {
              window.showAttachmentsModal({ entity: 'properties', entityId: id });
            }
          });
        }
      }
    },
    {
      label: 'Systém',
      icon: '⚙️',
      content: `
        <div class="p-4">
          <h3 class="text-lg font-semibold mb-2">Systémové informace</h3>
          <div class="space-y-2">
            <div><strong>Vytvořeno:</strong> ${formatCzechDate(data.created_at) || '-'}</div>
            <div><strong>Poslední úprava:</strong> ${formatCzechDate(data.updated_at) || '-'}</div>
            <div><strong>Upravil:</strong> ${data.updated_by || '-'}</div>
            <div><strong>Archivní:</strong> ${data.archived ? 'Ano' : 'Ne'}</div>
          </div>
        </div>
      `
    }
  ];

  renderTabs(tabsContainer, tabs, { defaultTab: 0 });

  const myRole = window.currentUserRole || 'admin';
  const handlers = {
    onEdit: () => navigateTo(`#/m/040-nemovitost/f/edit?id=${id}`),
    onAttach: () => showAttachmentsModal({ entity: 'properties', entityId: id }),
    onWizard: () => { toast('Průvodce zatím není k dispozici. Tato funkce bude doplněna.', 'info'); },
    onUnits: () => navigateTo(`#/m/040-nemovitost/t/jednotky?propertyId=${id}`),
    onHistory: () => toast('Historie - implementovat', 'info'),
    onDetail: () => navigateTo(`#/m/040-nemovitost/f/detail-tabs?id=${id}`)
  };

  if (!data.archived) {
    handlers.onArchive = async () => {
      await archiveProperty(id);
      toast('Nemovitost byla archivována.', 'info');
      navigateTo('#/m/040-nemovitost/t/prehled');
    };
  }

  renderCommonActions(document.getElementById('commonactions'), {
    moduleActions: ['detail', 'edit', 'units', 'attach', 'wizard', 'archive', 'history'],
    userRole: myRole,
    handlers
  });
}

export default { render };
