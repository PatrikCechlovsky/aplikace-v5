// modules/010/f/role.js
import { setBreadcrumb } from '../../../ui/breadcrumb.js';
import { renderForm } from '../../../ui/form.js';
import { renderCommonActions } from '../../../ui/commonActions.js';
import { navigateTo } from '../../../app.js';
import { useUnsavedHelper } from '../../../ui/unsaved-helper.js';
import { getUserPermissions } from '../../../security/permissions.js';

// 24 pastelových barev (světle -> tmavě), bez bílé
const PALETTE = [
  '#ffe6f0', '#ffd6e8', '#ffccd9', '#ffc4d3', // very light pinks
  '#ffdeda', '#ffe8cc', '#fff3cc', '#fff6d6', // light warm
  '#e6f7d9', '#dff7e8', '#dff7f6', '#ddefef', // light greens / aqua
  '#dfe7ff', '#e9e0ff', '#f0d9ff', '#f8d2ff', // light purples
  '#ffd6f0', '#fcd5e1', '#f9d6a5', '#e6f7b3', // pastels mixed
  '#a5d8ff', '#84c6f4', '#6fb3e8', '#5aa0dd'  // mid -> darker pastels
];

export async function render(root) {
  setBreadcrumb(document.getElementById('crumb'), [
    { icon: 'home',  label: 'Domů',      href: '#/' },
    { icon: 'users', label: 'Uživatelé', href: '#/m/010-sprava-uzivatelu' },
    { icon: 'settings', label: 'Role & barvy' }
  ]);

  // SAFE lazy import DB API
  let listRoles, upsertRole, deleteRole;
  try {
    ({ listRoles, upsertRole, deleteRole } = await import('../../../db.js'));
  } catch (e) {
    console.warn('[roles] DB API not available yet – using fallbacks', e);
  }
  listRoles  ||= async () => ({ data: [], error: null });
  upsertRole ||= async () => ({ data: null, error: null });
  deleteRole ||= async () => ({ error: null });

  // Render form
  const FIELDS = [
    { key: 'slug',  label: 'Kód role',   type: 'text',  required: true,  placeholder: 'např. admin, user' },
    { key: 'label', label: 'Název',      type: 'text',  required: true,  placeholder: 'Administrátor' },
    { key: 'color', label: 'Barva',      type: 'text',  required: true,  placeholder: '#f59e0b' },
  ];

  renderForm(root, FIELDS, { color: PALETTE[0] }, async () => true, {
    layout: { columns: { base: 1, md: 2, xl: 3 }, density: 'compact' },
    sections: [{ id: 'main', label: 'Role', fields: FIELDS.map(f => f.key) }],
    showSubmit: false
  });

  const formEl = root.querySelector('form');
  if (formEl) useUnsavedHelper(formEl);
  attachPalette(root);

  // Permissions
  const myRole = window.currentUserRole || 'user';
  const perms = getUserPermissions(myRole);
  const canEdit = perms.includes('add') || perms.includes('edit') || perms.includes('save') || perms.includes('approve');
  const canDelete = perms.includes('delete') || perms.includes('archive') || perms.includes('approve');

  // State
  let roles = [];
  let selectedSlug = null;

  // CommonActions (save, delete, back)
  renderCommonActions(document.getElementById('commonactions'), {
    moduleActions: ['save', 'delete', 'reject'],
    userRole: window.currentUserRole || 'user',
    handlers: {
      onSave: async () => {
        if (!canEdit) return alert('Nemáte oprávnění upravovat role.');
        const v = grabValues(root);
        if (!valid(v)) return;
        const { data, error } = await upsertRole({ slug: v.slug, label: v.label, color: v.color });
        if (error) {
          console.error('upsertRole error', error);
          return alert('Ukládání selhalo: ' + (error.message || error));
        }
        selectedSlug = v.slug;
        await loadList();
        alert('Uloženo.');
      },
      onDelete: async () => {
        if (!canDelete) return alert('Nemáte oprávnění mazat role.');
        if (!selectedSlug) return alert('Vyberte prosím roli kliknutím na řádek.');
        if (!confirm(`Smazat roli "${selectedSlug}"?`)) return;
        const { error } = await deleteRole(selectedSlug);
        if (error) {
          alert('Mazání selhalo: ' + (error.message || error));
        } else {
          selectedSlug = null;
          await loadList();
        }
      },
      onReject: () => navigateTo('#/m/010-sprava-uzivatelu/t/prehled')
    }
  });

  // List area
  const listWrap = document.createElement('div');
  listWrap.className = 'mt-6';
  listWrap.innerHTML = `
    <div class="text-sm font-semibold mb-2">Existující role</div>
    <div id="role-table" class="overflow-auto border rounded-2xl bg-white"></div>
  `;
  root.appendChild(listWrap);

  async function loadList() {
    const host = listWrap.querySelector('#role-table');
    host.innerHTML = '<div class="p-3 text-slate-500">Načítám…</div>';
    const { data, error } = await listRoles();
    if (error) { host.innerHTML = `<div class="p-3 text-red-600">${escapeHtml(error.message || String(error))}</div>`; return; }
    roles = data || [];
    if (!roles.length) { host.innerHTML = '<div class="p-3 text-slate-500">Žádné role.</div>'; return; }

    host.innerHTML = `
      <table class="min-w-full text-sm">
        <thead class="bg-slate-50">
          <tr>
            <th class="px-3 py-2 text-left">Kód</th>
            <th class="px-3 py-2 text-left">Název</th>
            <th class="px-3 py-2 text-left">Barva</th>
          </tr>
        </thead>
        <tbody>
          ${roles.map(r => `
            <tr class="border-t row-item ${selectedSlug === r.slug ? 'row-selected' : ''}" data-slug="${r.slug}">
              <td class="px-3 py-2">${escapeHtml(r.slug)}</td>
              <td class="px-3 py-2">${escapeHtml(r.label)}</td>
              <td class="px-3 py-2">
                <span class="inline-flex items-center gap-2">
                  <span class="inline-block w-4 h-4 rounded" style="background:${escapeHtml(r.color || '#ddd')}"></span>
                  <code>${escapeHtml(r.color || '')}</code>
                </span>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;

    // Bind events: click = select, dblclick = edit
    host.querySelectorAll('tr.row-item').forEach(tr => {
      tr.addEventListener('click', () => {
        const slug = tr.getAttribute('data-slug');
        selectedSlug = slug;
        // highlight
        host.querySelectorAll('tr.row-item').forEach(x => x.classList.remove('row-selected'));
        tr.classList.add('row-selected');
      });
      tr.addEventListener('dblclick', () => {
        const slug = tr.getAttribute('data-slug');
        const row = roles.find(x => x.slug === slug);
        if (!row) return;
        setValue(root, 'slug', row.slug);
        setValue(root, 'label', row.label);
        setValue(root, 'color', row.color);
        pickColor(root, row.color);
        // mark selected
        selectedSlug = slug;
        host.querySelectorAll('tr.row-item').forEach(x => x.classList.remove('row-selected'));
        tr.classList.add('row-selected');
        // focus first input
        const inp = root.querySelector('[name="label"]');
        if (inp) inp.focus();
      });
    });

    // update selected highlight if exists
    if (selectedSlug) {
      const sel = host.querySelector(`tr[data-slug="${selectedSlug}"]`);
      if (sel) {
        host.querySelectorAll('tr.row-item').forEach(x => x.classList.remove('row-selected'));
        sel.classList.add('row-selected');
      } else {
        selectedSlug = null;
      }
    }
  }

  await loadList();
}

// Helpers: palette attach, selection highlight, contrast for outline
function attachPalette(root) {
  const host = root.querySelector('[name="color"]');
  if (!host) return;
  const grid = document.createElement('div');
  grid.className = 'mt-2 grid grid-cols-8 gap-2';
  grid.innerHTML = PALETTE.map(hex => `
    <button type="button" class="w-7 h-7 rounded border palette-swatch" title="${hex}" data-hex="${hex}"
      style="background:${hex}"></button>
  `).join('');
  host.parentElement.appendChild(grid);

  grid.addEventListener('click', (e) => {
    const b = e.target.closest('button[data-hex]'); if (!b) return;
    const hex = b.getAttribute('data-hex');
    setValue(root, 'color', hex);
    pickColor(root, hex);
  });

  pickColor(root, host.value || PALETTE[0]);
}

function hexToRgb(hex) {
  if (!hex) return null;
  const h = hex.replace('#','');
  if (h.length === 3) {
    return [
      parseInt(h[0]+h[0],16),
      parseInt(h[1]+h[1],16),
      parseInt(h[2]+h[2],16)
    ];
  }
  return [parseInt(h.slice(0,2),16), parseInt(h.slice(2,4),16), parseInt(h.slice(4,6),16)];
}
function luminance(hex) {
  const rgb = hexToRgb(hex) || [255,255,255];
  const srgb = rgb.map(v => v / 255).map(v => {
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055)/1.055, 2.4);
  });
  return 0.2126 * srgb[0] + 0.7152 * srgb[1] + 0.0722 * srgb[2];
}
function contrastColor(hex) {
  // return white for dark colors, black for light colors
  const L = luminance(hex);
  return (L > 0.5) ? '#111827' : '#ffffff';
}

function pickColor(root, hex) {
  root.querySelectorAll('.palette-swatch').forEach(b => {
    const h = b.getAttribute('data-hex');
    if (h === hex) {
      const outline = contrastColor(hex);
      b.style.outline = `3px solid ${outline}`;
      b.style.boxShadow = `0 0 0 2px rgba(0,0,0,0.06) inset`;
    } else {
      b.style.outline = 'none';
      b.style.boxShadow = 'none';
    }
  });
}

function grabValues(root) {
  const obj = {};
  ['slug','label','color'].forEach(k => {
    const el = root.querySelector(`[name="${k}"]`);
    obj[k] = el ? String(el.value || '').trim() : '';
  });
  return obj;
}
function setValue(root, key, val) {
  const el = root.querySelector(`[name="${key}"]`);
  if (el) el.value = val || '';
}
function valid(v) {
  if (!v.slug)  { alert('Vyplň kód role.'); return false; }
  if (!v.label) { alert('Vyplň název role.'); return false; }
  if (!/^#[0-9A-Fa-f]{6}$/.test(v.color)) { alert('Barva musí být ve formátu #RRGGBB.'); return false; }
  return true;
}
function escapeHtml(s) {
  return String(s ?? '').replace(/[&<>"']/g, m => (
    { '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]
  ));
}

export default { render };
