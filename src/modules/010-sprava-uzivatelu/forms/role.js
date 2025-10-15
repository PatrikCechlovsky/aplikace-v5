import { setBreadcrumb } from '../../../ui/breadcrumb.js';
import { renderForm } from '../../../ui/form.js';
import { renderCommonActions } from '../../../ui/commonActions.js';
import { navigateTo } from '../../../app.js';
// import { useUnsavedHelper } from '../../../ui/unsaved-helper.js';

// paleta ~40 barev (střední tóny)
const PALETTE = [
  '#ef4444','#f97316','#f59e0b','#eab308','#84cc16','#22c55e','#10b981','#14b8a6',
  '#06b6d4','#0ea5e9','#3b82f6','#6366f1','#8b5cf6','#a855f7','#d946ef','#ec4899',
  '#f43f5e','#fb7185','#fda4af','#fca5a5','#fbbf24','#fde047','#a3e635','#86efac',
  '#6ee7b7','#5eead4','#67e8f9','#7dd3fc','#93c5fd','#a5b4fc','#c4b5fd','#d8b4fe',
  '#f0abfc','#f9a8d4','#fecdd3','#fcd34d','#facc15','#cbd5e1','#94a3b8','#64748b'
];

const FIELDS = [
  { key: 'slug',  label: 'Kód role',   type: 'text',  required: true,  placeholder: 'např. admin, user' },
  { key: 'label', label: 'Název',      type: 'text',  required: true,  placeholder: 'Administrátor' },
  { key: 'color', label: 'Barva',      type: 'text',  required: true,  placeholder: '#f59e0b' },
];

export async function render(root) {
  setBreadcrumb(document.getElementById('crumb'), [
    { icon: 'home',  label: 'Domů',      href: '#/' },
    { icon: 'users', label: 'Uživatelé', href: '#/m/010-sprava-uzivatelu' },
    { icon: 'settings', label: 'Role & barvy' }
  ]);

  // --- SAFE lazy import DB API (fallback pokud není připravené) ---
  let listRoles, upsertRole, deleteRole;
  try {
    ({ listRoles, upsertRole, deleteRole } = await import('../../../db.js'));
  } catch (e) {
    console.warn('[roles] DB API not available yet – using fallbacks', e);
  }
  listRoles  ||= async () => ({ data: [], error: null });
  upsertRole ||= async () => ({ error: null });
  deleteRole ||= async () => ({ error: null });

  // CommonActions (jen nahoře) – Uložit a Zpět
  renderCommonActions(document.getElementById('commonactions'), {
    moduleActions: ['approve','reject'],
    userRole: 'admin',
    handlers: {
      onApprove: async () => {
        const v = grabValues(root);
        if (!valid(v)) return;
        const { error } = await upsertRole(v);
        if (error) return alert('Uložení selhalo: ' + error.message);
        alert('Uloženo.');
        await loadList();
      },
      onReject: () => navigateTo('#/m/010-sprava-uzivatelu/t/prehled')
    }
  });

  // Form – kompaktní, bez spodních tlačítek
  renderForm(root, FIELDS, { color: '#64748b' }, async () => true, {
    layout: { columns: { base: 1, md: 2, xl: 3 }, density: 'compact' },
    sections: [{ id: 'main', label: 'Role', fields: FIELDS.map(f => f.key) }],
    showSubmit: false
  });

  // --- Hlídání rozdělané práce ---
  const formEl = root.querySelector("form");
  if (formEl) useUnsavedHelper(formEl);

  // Paleta barev
  attachPalette(root);

  // Seznam existujících rolí
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
    if (error) { host.innerHTML = `<div class="p-3 text-red-600">${error.message}</div>`; return; }
    if (!data?.length) { host.innerHTML = '<div class="p-3 text-slate-500">Žádné role.</div>'; return; }

    host.innerHTML = `
      <table class="min-w-full text-sm">
        <thead class="bg-slate-50">
          <tr>
            <th class="px-3 py-2 text-left">Kód</th>
            <th class="px-3 py-2 text-left">Název</th>
            <th class="px-3 py-2 text-left">Barva</th>
            <th class="px-3 py-2"></th>
          </tr>
        </thead>
        <tbody>
          ${data.map(r => `
            <tr class="border-t">
              <td class="px-3 py-2">${escapeHtml(r.slug)}</td>
              <td class="px-3 py-2">${escapeHtml(r.label)}</td>
              <td class="px-3 py-2">
                <span class="inline-flex items-center gap-2">
                  <span class="inline-block w-4 h-4 rounded" style="background:${r.color}"></span>
                  <code>${r.color}</code>
                </span>
              </td>
              <td class="px-3 py-2 text-right">
                <button class="px-2 py-1 border rounded mr-2" data-edit="${r.slug}">Upravit</button>
                <button class="px-2 py-1 border rounded text-red-600" data-del="${r.slug}">Smazat</button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;

    host.querySelectorAll('[data-edit]').forEach(btn => {
      btn.addEventListener('click', () => {
        const slug = btn.getAttribute('data-edit');
        const row = data.find(x => x.slug === slug);
        if (!row) return;
        setValue(root, 'slug', row.slug);
        setValue(root, 'label', row.label);
        setValue(root, 'color', row.color);
        pickColor(root, row.color);
      });
    });
    host.querySelectorAll('[data-del]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const slug = btn.getAttribute('data-del');
        if (confirm(`Smazat roli "${slug}"?`)) {
          const { error } = await deleteRole(slug);
          if (error) alert('Mazání selhalo: ' + error.message);
          await loadList();
        }
      });
    });
  }

  await loadList();
}

// ===== helpers =====
function attachPalette(root) {
  const host = root.querySelector('[name="color"]');
  if (!host) return;
  const grid = document.createElement('div');
  grid.className = 'mt-2 grid grid-cols-8 gap-2';
  grid.innerHTML = PALETTE.map(hex => `
    <button type="button" class="w-7 h-7 rounded border" title="${hex}" data-hex="${hex}"
      style="background:${hex}"></button>
  `).join('');
  host.parentElement.appendChild(grid);
  grid.addEventListener('click', (e) => {
    const b = e.target.closest('button[data-hex]'); if (!b) return;
    const hex = b.getAttribute('data-hex');
    setValue(root, 'color', hex);
    pickColor(root, hex);
  });
  pickColor(root, host.value || '#64748b');
}
function pickColor(root, hex) {
  root.querySelectorAll('[data-hex]').forEach(b => {
    b.style.outline = (b.getAttribute('data-hex') === hex) ? '2px solid #111827' : 'none';
  });
}
function grabValues(root) {
  const obj = {};
  ['slug','label','color'].forEach(k => {
    const el = root.querySelector(`[name="${k}"]`);
    obj[k] = el ? el.value.trim() : '';
  });
  return obj;
}
function setValue(root, key, val) {
  const el = root.querySelector(`[name="${key}"]`);
  if (el) el.value = val || '';
}
function valid(v) {
  if (!v.slug)  return alert('Vyplň kód role.'), false;
  if (!v.label) return alert('Vyplň název role.'), false;
  if (!/^#[0-9A-Fa-f]{6}$/.test(v.color)) return alert('Barva musí být ve formátu #RRGGBB.'), false;
  return true;
}
function escapeHtml(s) {
  return String(s ?? '').replace(/[&<>"']/g, m => (
    { '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]
  ));
}

export default { render };
