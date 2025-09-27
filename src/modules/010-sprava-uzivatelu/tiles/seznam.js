import { icon } from '../../../ui/icons.js';
import { renderActions, ACTIONS } from '../../../ui/actionButtons.js';
import { listProfiles, isAdmin } from '../../../db.js';

export default async function renderSeznam(root) {
  // Akční ikonky do breadcrumb lišty (vpravo)
  const actionsHost = document.getElementById('crumb-actions');
  renderActions(actionsHost, [
    ACTIONS.add({ onClick(){ alert('Přidat – placeholder'); } }),
    ACTIONS.edit({ disabled:true, reason:'Vyberte řádek' }),
    ACTIONS.archive({ disabled:true, reason:'Vyberte řádek' }),
    ACTIONS.refresh({ onClick(){ refresh(); } }),
  ], { iconOnly:true });

  root.innerHTML = `
    <div class="p-0">
      <div id="tile-notice" class="mb-3 text-sm text-slate-500"></div>
      <div class="border rounded-lg overflow-hidden">
        <table class="w-full text-sm">
          <thead class="bg-slate-50 text-slate-600">
            <tr>
              <th class="text-left p-2">Jméno</th>
              <th class="text-left p-2">Email</th>
              <th class="text-left p-2">Role</th>
              <th class="text-right p-2">Akce</th>
            </tr>
          </thead>
          <tbody id="u-rows"></tbody>
        </table>
      </div>
      <div id="empty" class="hidden mt-6 text-slate-500 text-sm">Žádná data k zobrazení.</div>
      <div id="error" class="hidden mt-6 text-rose-600 text-sm"></div>
    </div>
  `;

  const $ = (sel) => root.querySelector(sel);
  const rowsEl   = $('#u-rows');
  const noticeEl = $('#tile-notice');
  const emptyEl  = $('#empty');
  const errorEl  = $('#error');

  const amIAdmin = await isAdmin();
  noticeEl.textContent = amIAdmin
    ? 'Máte roli admin – vidíte všechny profily.'
    : 'Máte roli user – vidíte jen svůj profil.';

  await refresh();

  async function refresh() {
    rowsEl.innerHTML = `<tr><td colspan="4" class="p-3 text-slate-500">Načítám…</td></tr>`;
    emptyEl.classList.add('hidden'); errorEl.classList.add('hidden');

    const { data, error } = await listProfiles();
    if (error) {
      rowsEl.innerHTML = '';
      errorEl.textContent = 'Chyba při načtení dat: ' + (error.message || error);
      errorEl.classList.remove('hidden');
      return;
    }
    if (!data.length) {
      rowsEl.innerHTML = '';
      emptyEl.classList.remove('hidden');
      return;
    }

    rowsEl.innerHTML = data.map(u => rowHtml(u)).join('');
    // aktivace „Upravit/Archivovat“ po výběru
    const actionsHost = document.getElementById('crumb-actions');
    rowsEl.querySelectorAll('tr[data-id]').forEach(tr => {
      tr.addEventListener('click', () => {
        rowsEl.querySelectorAll('tr[data-id]').forEach(x => x.classList.remove('bg-slate-100'));
        tr.classList.add('bg-slate-100');

        renderActions(actionsHost, [
          ACTIONS.add({ onClick(){ alert('Přidat – placeholder'); } }),
          ACTIONS.edit({ onClick(){ alert('Upravit – ' + tr.dataset.id); } }),
          ACTIONS.archive({ onClick(){ alert('Archivovat – ' + tr.dataset.id); } }),
          ACTIONS.refresh({ onClick(){ refresh(); } }),
        ], { iconOnly:true });
      });
    });
  }
}

function rowHtml(u) {
  const badge =
    u.role === 'admin'
      ? `<span class="inline-flex items-center px-2 py-0.5 rounded text-xs bg-emerald-100 text-emerald-700 border border-emerald-200">${u.role}</span>`
      : `<span class="inline-flex items-center px-2 py-0.5 rounded text-xs bg-slate-100 text-slate-700 border border-slate-200">${u.role}</span>`;

  return `
    <tr class="border-t hover:bg-slate-50 cursor-pointer" data-id="${u.id}">
      <td class="p-2">${escapeHtml(u.display_name || '')}</td>
      <td class="p-2">${escapeHtml(u.email || '')}</td>
      <td class="p-2">${badge}</td>
      <td class="p-2 text-right">
        <button class="px-2 py-1 text-sm border rounded hover:bg-slate-50">${icon('detail')} Zobrazit</button>
      </td>
    </tr>
  `;
}

function escapeHtml(s='') {
  return String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;')
    .replaceAll('"','&quot;').replaceAll("'",'&#039;');
}
