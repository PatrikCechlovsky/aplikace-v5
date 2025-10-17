// modules/010/f/role.js
import { setBreadcrumb } from '../../../ui/breadcrumb.js';
import { renderForm } from '../../../ui/form.js';
import { renderCommonActions } from '../../../ui/commonActions.js';
import { navigateTo } from '../../../app.js';
import { useUnsavedHelper } from '../../../ui/unsaved-helper.js';
import { getUserPermissions } from '../../../security/permissions.js';

// 24 tmavších pastelových barev (bez bílé), výrazněji rozlišitelné
const PALETTE = [
  '#e05570', // dark pink
  '#f35b1a', // orange
  '#f0a500', // golden
  '#ffd166', // mustard
  '#7cc058', // lime green
  '#1fb086', // teal green
  '#0b9d8f', // sea green
  '#0b84b5', // cyan
  '#1e6fff', // bright blue
  '#2d4ed8', // indigo
  '#6b46c1', // violet
  '#8b5cf6', // purple
  '#d63ea5', // magenta
  '#ff6b8a', // rose
  '#ff8a65', // salmon
  '#ffb86b', // apricot
  '#f4d35e', // warm yellow
  '#9fdc97', // soft green
  '#55c2a0', // mint
  '#3fb0b0', // turquoise
  '#4da6ff', // sky blue
  '#2f6f9f', // steel blue
  '#6b7280', // slate gray
  '#4b5563'  // dark slate
];

export async function render(root) {
  setBreadcrumb(document.getElementById('crumb'), [
    { icon: 'home',  label: 'Domů',      href: '#/' },
    { icon: 'users', label: 'Uživatelé', href: '#/m/010-sprava-uzivatelu' },
    { icon: 'settings', label: 'Role & barvy' }
  ]);

  // SAFE lazy import DB API
  let listRoles, upsertRole, deleteRole, countProfilesByRole;
  try {
    ({ listRoles, upsertRole, deleteRole, countProfilesByRole } = await import('../../../db.js'));
  } catch (e) {
    console.warn('[roles] DB API not available yet – using fallbacks', e);
  }
  listRoles  ||= async () => ({ data: [], error: null });
  upsertRole ||= async () => ({ data: null, error: null });
  deleteRole ||= async () => ({ error: null });
  countProfilesByRole ||= async () => ({ count: 0, error: null });

  // Form
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
  let selectedInUse = false; // true pokud vybraná role má uživatele

  // CommonActions (save, delete, back)
  renderCommonActions(document.getElementById('commonactions'), {
    moduleActions: ['save', 'delete', 'reject'],
    userRole: window.currentUserRole || 'user',
    handlers: {
      onSave: async () => {
        if (!canEdit) return alert('Nemáte oprávnění upravovat role.');
        const v = grabValues(root);
        if (!valid(v)) return;
        // Pokud se mění slug a role je používána -> zakázat
        if (selectedInUse && selectedSlug && selectedSlug !== v.slug) {
          return alert('Kód role nelze změnit, protože je role používána v uživatelských účtech.');
        }
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
        if (selectedInUse) return alert('Tuto roli nelze smazat, protože je používána v uživatelských účtech.');
        if (!confirm(`Smazat roli "${selectedSlug}"?`)) return;
        const { error } = await deleteRole(selectedSlug);
        if (error) {
          alert('Mazání selhalo: ' + (error.message || error));
        } else {
          selectedSlug = null;
          selectedInUse = false;
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
      tr.addEventListener('click', async () => {
        const slug = tr.getAttribute('data-slug');
        selectedSlug = slug;
        // highlight
        host.querySelectorAll('tr.row-item').forEach(x => x.classList.remove('row-selected'));
        tr.classList.add('row-selected');

        // check if role used
        try {
          const { count, error: cntErr } = await countProfilesByRole(slug);
          selectedInUse = !!(count && count > 0);
        } catch (e) {
          selectedInUse = false;
        }

        // disable slug input if in use
        const slugInput = root.querySelector('[name="slug"]');
        if (slugInput) slugInput.disabled = selectedInUse;
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

        // force check usage and possibly disable slug input
        (async () => {
          try {
            const { count } = await countProfilesByRole(slug);
            selectedInUse = !!(count && count > 0);
          } catch (e) {
            selectedInUse = false;
          }
          const slugInput = root.querySelector('[name="slug"]');
          if (slugInput) slugInput.disabled = selectedInUse;
        })();

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
        selectedInUse = false;
      }
    }
  }

  await loadList();
}

// Helpers: palette attach, contrast for outline, etc.
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
