import { setBreadcrumb } from '/src/ui/breadcrumb.js';
import { renderForm } from '/src/ui/form.js';
import { renderCommonActions } from '/src/ui/commonActions.js';
import { renderTable } from '/src/ui/table.js';
import { navigateTo } from '/src/app.js';
import { listUnitTypes, upsertUnitType } from '/src/modules/040-nemovitost/db.js';

let selectedRow = null;

function escapeHtml(s = '') {
  return ('' + s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

const PALETTE = [
  '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899',
  '#ef4444', '#06b6d4', '#84cc16', '#f97316', '#6366f1'
];

const FIELDS = [
  { key: 'slug', label: 'Slug (ID)', type: 'text', required: true, readOnly: true, placeholder: 'byt' },
  { key: 'label', label: 'Název', type: 'text', required: true, placeholder: 'Byt' },
  { key: 'color', label: 'Barva', type: 'text', required: true, placeholder: '#f59e0b' },
  { key: 'icon', label: 'Ikona', type: 'text', placeholder: 'home' }
];

export async function render(root) {
  setBreadcrumb(document.getElementById('crumb'), [
    { icon: 'home', label: 'Domů', href: '#/' },
    { icon: 'building', label: 'Nemovitosti', href: '#/m/040-nemovitost' },
    { icon: 'settings', label: 'Správa typů jednotek' }
  ]);

  root.innerHTML = `
    <div id="commonactions" class="mb-4"></div>
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div id="type-list"></div>
      <div id="type-form"></div>
    </div>
  `;

  const formRoot = root.querySelector('#type-form');
  const listRoot = root.querySelector('#type-list');

  async function loadList() {
    const { data, error } = await listUnitTypes();
    if (error) {
      listRoot.innerHTML = `<div class="p-4 text-red-600">Chyba: ${error.message || JSON.stringify(error)}</div>`;
      return;
    }

    const rows = data || [];
    const columns = [
      { key: 'slug', label: 'Slug', width: '30%' },
      { key: 'label', label: 'Název', width: '40%' },
      {
        key: 'color',
        label: 'Barva',
        width: '30%',
        render: (r) => `
          <div class="flex items-center gap-2">
            <span class="inline-block w-4 h-4 rounded" style="background:${escapeHtml(r.color || '#ddd')}"></span>
            <code>${escapeHtml(r.color || '')}</code>
          </div>
        `
      }
    ];

    renderTable(listRoot, {
      columns,
      rows,
      options: {
        moduleId: '040-nemovitost-unit-types',
        onRowSelect: (row) => {
          selectedRow = (selectedRow && selectedRow.slug === row.slug) ? null : row;
          drawForm();
        },
        onRowDblClick: (row) => {
          selectedRow = row;
          drawForm();
        }
      }
    });
  }

  function drawForm() {
    if (!selectedRow) {
      renderForm(formRoot, FIELDS, { color: PALETTE[0] }, async () => true, {
        readOnly: false,
        showSubmit: false,
        layout: { columns: { base: 1 }, density: 'normal' }
      });
      pickColor(formRoot, PALETTE[0]);
    } else {
      renderForm(formRoot, FIELDS, selectedRow, async () => true, {
        readOnly: false,
        showSubmit: false,
        layout: { columns: { base: 1 }, density: 'normal' }
      });
      pickColor(formRoot, selectedRow.color);
    }
  }

  async function handleSave() {
    const v = grabValues(formRoot);
    ['slug', 'label', 'color'].forEach(k => {
      if (!v[k]) { alert(`Pole ${k} je povinné.`); throw new Error('Missing field'); }
    });
    if (!/^#[0-9A-Fa-f]{6}$/.test(v.color)) {
      alert('Barva musí být ve formátu #RRGGBB.');
      return false;
    }

    const { data, error } = await upsertUnitType({
      slug: v.slug,
      label: v.label,
      color: v.color,
      icon: v.icon || null
    });

    if (error) {
      alert('Chyba při ukládání: ' + error.message);
      return false;
    }

    alert('Uloženo.');
    selectedRow = null;
    await loadList();
    drawForm();
    return true;
  }

  function handleNew() {
    selectedRow = null;
    drawForm();
  }

  // Common actions
  renderCommonActions(document.getElementById('commonactions'), {
    moduleActions: ['add', 'save', 'refresh'],
    userRole: window.currentUserRole || 'admin',
    handlers: {
      onAdd: handleNew,
      onSave: handleSave,
      onRefresh: () => {
        selectedRow = null;
        loadList();
        drawForm();
      }
    }
  });

  await loadList();
  drawForm();
}

function grabValues(scopeEl) {
  const obj = {};
  for (const f of FIELDS) {
    if (f.readOnly && !selectedRow) continue;
    const el = scopeEl.querySelector(`[name="${f.key}"]`);
    if (!el) continue;
    obj[f.key] = (el.type === 'checkbox') ? !!el.checked : el.value;
  }
  return obj;
}

function pickColor(scopeEl, initialColor) {
  const host = scopeEl.querySelector('[name="color"]');
  if (!host) return;

  let pickerEl = scopeEl.querySelector('.color-picker-palette');
  if (pickerEl) pickerEl.remove();

  pickerEl = document.createElement('div');
  pickerEl.className = 'color-picker-palette flex flex-wrap gap-2 mt-2';
  PALETTE.forEach(hex => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'w-8 h-8 rounded border-2 hover:scale-110 transition';
    btn.style.backgroundColor = hex;
    btn.style.borderColor = (hex === initialColor) ? '#000' : 'transparent';
    btn.addEventListener('click', () => {
      setValue(scopeEl, 'color', hex);
      pickerEl.querySelectorAll('button').forEach(b => (b.style.borderColor = 'transparent'));
      btn.style.borderColor = '#000';
    });
    pickerEl.appendChild(btn);
  });

  host.parentElement.appendChild(pickerEl);
}

function setValue(scopeEl, key, val) {
  const el = scopeEl.querySelector(`[name="${key}"]`);
  if (el) el.value = val;
}

export default { render };
